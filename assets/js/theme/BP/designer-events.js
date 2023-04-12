import { debounce } from 'lodash';
import { MarkerClusterer } from '@googlemaps/markerclusterer'
// import is required by client, not by code
import regeneratorRuntime, { async } from 'regenerator-runtime'


import { defaultModal } from '../global/modal';
import PageManager from '../page-manager'


const MAP_MARKER_BLACK = {
    path: 'M10 0C4.5 0 0 4.5 0 10c0 7.4 9.1 13.6 9.4 13.8.2.1.4.2.6.2s.4-.1.6-.2c.3-.2 9.4-6.4 9.4-13.8 0-5.5-4.5-10-10-10zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z',
    fillColor: '#373c3f',
    fillOpacity: 1,
    strokeWeight: 1,
};

const MAP_MARKER_ORANGE = {
    path: 'M10 0C4.5 0 0 4.5 0 10c0 7.4 9.1 13.6 9.4 13.8.2.1.4.2.6.2s.4-.1.6-.2c.3-.2 9.4-6.4 9.4-13.8 0-5.5-4.5-10-10-10zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z',
    fillColor: '#fe948a',
    fillOpacity: 1,
    strokeWeight: 1,
};

// object keys for filter ids must correspond to
// original/applied filter instance properties
const FILTER_IDS = {
    distance: 'distanceFilterSelect',
};

const DEFAULT_ZOOM_LEVEL = 2;
const LOCATION_CHANGE_ZOOM_LEVEL = 8;
const HOVER_DEFAULT_ZOOM_LEVEL = 10;

const MARKER_HOVER_EVENT = 'markerHoverEvent';
const RETAILER_ITEM_HOVER_EVENT = 'eventItemHoverEvent';

const SORT_LABELS = {
    'asc': 'A to Z',
    'desc': 'Z to A',
    'nearest': 'Distance: Nearest',
    'farthest': 'Distance: Farthest'
}


export default class DesignerEvents extends PageManager {
    SORTABLES = [
        {
            display: 'STORE NAME',
            onClick: 'sortByDisplayName',
            value: 'name',
        },
        {
            display: 'DISTANCE',
            onClick: 'sortByDistance',
            value: 'distance',
        }
    ];
    constructor(context) {
        super(context);
        this.map = null;
        this.pageContent = document.querySelector('.page-content');
        // all events pre-loaded
        this.originalEvents = [];
        // events that are filtered by sub filters (name search, collections)
        this.events = [];
        // events that are filtered by initial location / radius search
        this.eventsFilteredByLocation = [];
        this.eventsById = {};
        this.eventsByCollections = {};
        this.originalFilters = {
            distance: 10,
            collections: [],
            retailerName: '',
        };
        this.appliedFilters = {
            ...this.originalFilters
        };
        this.selectedPlace = null;
        this.markerClusterer = null;
        this.page = 1;
        this.perPage = 9;
        this.sortBy = 'asc';
        this.geocoder = new google.maps.Geocoder();
        this.autocomplete = null;
    };

    onReady = async () => {
        // TODO this might wait until they click search based on distance
        this.originalEvents = await this.getDesignerEvents();
        this.setupCollections();
        this.initMap();
        this.addEventHandlers();
    };

    checkEventCanRequestAppt = async (event) => {
        // if we've already called it, dont re-request
        if (event.hasOwnProperty('canRequestAppt')) {
            return event;
        }
        const checkUrl = this.context.checkRetailerAcceptsAppointmentsUrl || 'https://allure-integration.azurewebsites.net/leads/stage/verify';
        const checkReq = await fetch(
            checkUrl,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    RetailerID: event.retailerId,
                    zip: event.zipCode
                }),
            }
        );
        try {
            const res = await checkReq.json();
            let canRequestAppt = false;
            let eventId = null;
            if (!res.error) {
                // not sure why it returns an array of one item but /shrug
                canRequestAppt = res[0].optin;
                eventId=res[0].id
            }
            return {
                ...event,
                canRequestAppt,
                eventId
            }
        } catch {
            return {
                ...event,
                canRequestAppt: false,
                eventId: null
            }
        }
    }

    createCollectionListItems = (events) => {
        let allCollectionFilters = [];
        for (const event of events) {
            const eventCollections = event.collectionsAvailable || [];
            allCollectionFilters = allCollectionFilters.concat(eventCollections);
        };
        const self = this;
        // create the filter for the collections
        const uniqueSortedCollections = Array.from(new Set(allCollectionFilters)).sort();
        const collectionFilterList = document.getElementById('collections');
        collectionFilterList.innerHTML = '';
        uniqueSortedCollections.forEach((collection) => {
            const collectionItem = document.createElement('li');
            collectionItem.classList.add('collection');
            const collectionItemCheckbox = document.createElement('input');
            collectionItemCheckbox.setAttribute('type', 'checkbox');
            collectionItemCheckbox.setAttribute('id', collection);
            collectionItemCheckbox.setAttribute('name', collection);
            if (this.appliedFilters.collections.includes(collection)) {
                collectionItemCheckbox.setAttribute('checked', true);
            }
            collectionItem.append(collectionItemCheckbox);

            const collectionItemLabel = document.createElement('label');
            collectionItemLabel.setAttribute('for', collection);
            collectionItemLabel.innerHTML = collection;
            collectionItem.append(collectionItemLabel);
            collectionFilterList.append(collectionItem);
            collectionItemCheckbox.addEventListener('change', function () {
                const collections = [...self.appliedFilters.collections];
                if (this.checked && collections.indexOf(collection) < 0) {
                    collections.push(collection);
                    // we can assume it's in the list since it doesnt fire initially so it had to have been unchecked
                } else {
                    const removeIdx = collections.indexOf(collection);
                    collections.splice(removeIdx, 1);
                }
                self.applyFilters('collections', null, collections);
                self.filterEvents();
            });
        });
    }

    setupCollections = () => {
        for (const event of this.originalEvents) {
            const eventCollections = event.collectionsAvailable || [];
            for (const collection of eventCollections) {
                const eventsWithCollection = this.eventsByCollections[collection] || [];
                eventsWithCollection.push(event.sys.id);
                this.eventsByCollections[collection] = eventsWithCollection;
            }
        };
    };

    getDesignerEvents = async () => {
        const query = `
            query 
                sectionDesignerEventsCollectionQuery {
                    sectionDesignerEventsCollection {
                    items {
                        sys {
                        id
                        }
                    eventName
                    eventStartDate
                    eventEndDate
                    brandFolderImage
                    retailerId
                    retailerName
                    featured
                    phone
                    website
                    eventAddress{
                        lon
                        lat
                    }
                    collectionsAvailable
                    streetName
                    city
                    zipCode
                    state
                    country  
                    }
            }}`
        const results = await fetch(
            'https://graphql.contentful.com/content/v1/spaces/y49u4slmhh3t/environments/staging',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:
                        `Bearer ${this.context.contentfulApiToken}`,
                },
                body: JSON.stringify({ query }),
            }
        )
        const res = await results.json();
        return res.data.sectionDesignerEventsCollection.items;
    }

    addEventHandlers = () => {
        const searchButton = document.getElementById('searchButton');
        searchButton.addEventListener('click', () => {
            const storeNameFilter = document.getElementById('storeNameFilter');
            storeNameFilter.value = '';
            this.filterEventsByLocation();
        });

        const locationTypeahead = document.getElementById('locationTypeahead');
        const autocomplete = new google.maps.places.Autocomplete(locationTypeahead, { types: ['(regions)'] });
        autocomplete.bindTo("bounds", this.map);
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                const eventInfoElem = document.getElementById('results-info');
                eventInfoElem.innerText = 'No Results found. Try widening your search.';
                const eventFinderResults = document.getElementById('eventResults');
                eventFinderResults.innerHTML = "";
                return;
            }
            if (place) {
                this.map?.setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
                this.map?.setZoom(LOCATION_CHANGE_ZOOM_LEVEL);
                this.selectedPlace = place;
                const topLevelLocationTypes = ['postal_code', 'political'];
                searchButton.disabled = false;
                locationTypeahead.classList.remove('error');
                if (place.types.some((type) => topLevelLocationTypes.includes(type))) {
                    locationTypeahead.value = place.formatted_address;
                } else {
                    locationTypeahead.value = place.name;
                }
            }
        });
        locationTypeahead.addEventListener('change', (e) => {
            if (!e.target.value) {
                this.selectedPlace = null;
                searchButton.disabled = true;
            }
        });

        this.autocomplete = autocomplete;

        const resetBtn = document.getElementById('resetButton');
        resetBtn.addEventListener('click', this.resetFilters);

        // sort / collection toggles
        const sortToggle = document.getElementById('sortFilter');
        const sortOptions = document.getElementById('sortOptions');
        sortToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = sortToggle.classList.contains('open');
            if (isOpen) {
                sortToggle.classList.remove('open');
                sortOptions.style.display = 'none';
            } else {
                sortToggle.classList.add('open');
                sortOptions.style.display = 'block';
            }
        });
        // Allow closing dropdown by clicking anywhere
        document.body.addEventListener('click', () => {
            sortToggle.classList.remove('open');
            sortOptions.style.display = 'none';
        });

        const otherFiltersToggle = document.getElementById('otherFiltersToggle');
        otherFiltersToggle.addEventListener('click', () => {
            const otherFilters = document.getElementById('otherFilters');
            const otherFiltersToggleLabel = otherFiltersToggle.getElementsByClassName('filter-label')[0];
            if (otherFilters.style.display === 'none' || !otherFilters.style.display) {
                otherFilters.style.display = 'block';
                otherFiltersToggleLabel.innerHTML = 'HIDE FILTERS';
            } else {
                otherFilters.style.display = 'none';
                otherFiltersToggleLabel.innerHTML = 'SHOW FILTERS';
            }
        });

        // name filter
        const storeNameFilter = document.getElementById('storeNameFilter');
        const debounceTimeout = 500;
        const searchByStoreName = (e) => {
            this.applyFilters('retailerName', e);
            this.filterEvents();
        };
        const debouncedSearch = debounce(searchByStoreName, debounceTimeout);

        storeNameFilter.addEventListener('keyup', debouncedSearch);

        // distance filter
        const distanceFilterButtons = document.querySelectorAll('.custom-select__option:not(.custom-select__option--value)');
        const allMiles = [10, 25, 50, 100, 500];
        const distanceFilterBtnHandler = (_, idx) => {
            // this is insanely hacky
            // but the css theme modifies the button in place before the event handler triggers
            // so if user clicks 10 it actually shows 25 as miles since it got replaced    
            // so respect the array without the current value
            const allMilesCopy = [...allMiles]
            const milesWithoutCurrentIdx = allMiles.indexOf(this.appliedFilters.distance);
            allMilesCopy.splice(milesWithoutCurrentIdx, 1);
            const actualMilesClicked = allMilesCopy[idx];
            this.applyFilters('distance', null, actualMilesClicked);
        };
        for (let idx = 0; idx < distanceFilterButtons.length; idx++) {
            const btn = distanceFilterButtons[idx];
            btn.addEventListener('click', (e) => distanceFilterBtnHandler(e, idx));
        }

        //sorting
        const sortSelect = document.getElementsByName('sortBy');
        for (const sortOption of sortSelect) {
            sortOption.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                const eventsToSort = this.events.length ? this.events : this.eventsFilteredByLocation;
                this.sortEvents(eventsToSort);
            });
        }

        // // hover events
        document.addEventListener(MARKER_HOVER_EVENT, (evt) => {
            const eventId = evt.detail;
            if (eventId) {
                const eventItem = document.getElementById(eventId);
                eventItem.classList.add('hovered');
            } else {
                const anyHovered = document.querySelectorAll('.event-item.hovered');
                anyHovered.forEach((elem) => elem.classList.remove('hovered'));
            }
        });

        document.addEventListener(RETAILER_ITEM_HOVER_EVENT, (evt) => {
            const event = evt.detail;
            const newEventsToPaint = this.events.length ? this.events : this.eventsFilteredByLocation;
            if (event && event.eventAddress) {
                // TODO debounce if needed, doesnt seem that bad without it.
                this.map.setCenter({ lat: event.eventAddress.lat, lng: event.eventAddress.lon });
                this.map.setZoom(HOVER_DEFAULT_ZOOM_LEVEL);
                this.paintEventMapMarkers(newEventsToPaint, event);
            } else {
                this.paintEventMapMarkers(newEventsToPaint, null, true);
            }
        });

        // map slider
        const mapToggle = document.getElementById('mapToggle');
        const map = document.getElementById('map');
        mapToggle.addEventListener('change', function () {
            map.style.display = this.checked ? 'block' : 'none';
        });
    };

    createEventItem = (event) => {
        const container = document.createElement('div');
        container.classList.add('event-item');
        // set the id to allow querying when hovering on markers
        container.id = event.sys.id;
        const date = document.createElement('span');
        date.classList.add('event-date');
        let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let startDate = `${ monthNames[new Date(event.eventStartDate).getMonth()]} ${new Date(event.eventStartDate).getDate()}, ${new Date(event.eventStartDate).getFullYear()}`;
        let endDate = `${ monthNames[new Date(event.eventEndDate).getMonth()]} ${new Date(event.eventEndDate).getDate()}, ${new Date(event.eventEndDate).getFullYear()}`;

        date.innerText = `${startDate} - ${endDate}`;
        container.append(date);
        const nameHeader = document.createElement('div');
        nameHeader.classList.add('event-title');
        nameHeader.innerText = event.eventName;
        container.append(nameHeader);

        const retailerName = document.createElement('div');
        retailerName.classList.add('event-retailer');
        retailerName.innerText = event.retailerName;
        container.append(retailerName);

        const cityState = document.createElement('span');
        cityState.classList.add('event-city-state');
        cityState.innerText = `${event.city}, ${event.state}`;
        container.append(cityState);

        const distanceAway = document.createElement('span');
        distanceAway.classList.add('event-distance');
        distanceAway.innerHTML = `${parseFloat(event.distanceAway).toFixed(2)} miles • <a class="directions" href="https://www.google.com/maps?daddr=${event.eventAddress}" target="_blank" rel="noopener noreferrer">DIRECTIONS</a>`;
        container.append(distanceAway);

        const numCollections = document.createElement('span');
        numCollections.classList.add('event-collections');
        numCollections.innerHTML = `
            <span class="collections">COLLECTIONS:</span> ${event.collectionsAvailable.join(', ')}
        `;
        container.append(numCollections)

        if (event.canRequestAppt) {
            const requestBtn = document.createElement('button');
            requestBtn.setAttribute('type', 'button');
            requestBtn.classList.add('event-schedule');
            const requestBtnText = document.createElement('span');
            requestBtnText.innerText = 'REQUEST AN EVENT APPOINTMENT'
            requestBtn.append(requestBtnText);
            requestBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openRequestForm(event);
            });
            container.append(requestBtn)
        }

        container.addEventListener('click', () => {
            this.openDetailsModal(event);
        });

        container.addEventListener('mouseenter', () => {
            const eventHoveredEvent = new CustomEvent(RETAILER_ITEM_HOVER_EVENT, { detail: event });
            document.dispatchEvent(eventHoveredEvent);
        });

        container.addEventListener('mouseleave', () => {
            const eventExitEvent = new CustomEvent(RETAILER_ITEM_HOVER_EVENT, { detail: null });
            document.dispatchEvent(eventExitEvent);
        });

        return container;
    };

    addEventInfo = (eventData) => {
        const eventFinderResults = document.getElementById('eventResults');
        eventFinderResults.innerHTML = "";
        eventData.sort((a, b) => {
            console.log(new Date(b.eventStartDate));
            return new Date(a.eventStartDate) - new Date(b.eventStartDate);
        }).forEach((eventData) => {
            console.log("--",eventData)
            const eventItem = this.createEventItem(eventData);
            eventFinderResults.append(eventItem);
        });
    }

    getDistanceBtwnTwoPts = (mk1, mk2) => {
        var R = 3958.8 // Radius of the Earth in miles
        var radianLat1 = mk1.lat * (Math.PI / 180)
        var radianLat2 = mk2.lat * (Math.PI / 180)
        var diffLat = radianLat2 - radianLat1 // Radian difference (latitudes)
        var diffLon = (mk2.lon - mk1.lon) * (Math.PI / 180) // Radian difference (longitudes)

        var distance =
            2 *
            R *
            Math.asin(
                Math.sqrt(
                    Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
                    Math.cos(radianLat1) *
                    Math.cos(radianLat2) *
                    Math.sin(diffLon / 2) *
                    Math.sin(diffLon / 2)
                )
            )
        return distance // in miles
    };

    applyFilters = (filterType, evt, overrideValue = undefined) => {
        const value = overrideValue || evt.target.value;
        this.appliedFilters[filterType] = value;

        // adjust zoom for convenience in distance changes  
        const distanceToZoomLevels = {
            10: 10,
            25: 10,
            50: 8,
            100: 8,
            500: 5,
        };
        if (filterType === 'distance') {
            const newZoomLevel = distanceToZoomLevels[value];
            if (newZoomLevel) {
                this.map.setZoom(newZoomLevel);
            } else {
                this.map.setZoom(HOVER_DEFAULT_ZOOM_LEVEL);
            }
        };
    };

    updateEventUi = (events, updateResultText = true) => {
        this.paintEventMapMarkers(events);
        this.addEventInfo(events);
        this.updateFilters(events);
        this.createCollectionListItems(events);
        if (updateResultText) {
            this.updateResultsInfo(events);
        }
    }

    filterEventsByLocation = () => {
        const addr = document.getElementById("locationTypeahead");
        // Get geocoder instance
        const geocoder = new google.maps.Geocoder();
        // Geocode the address
        geocoder.geocode({'address': addr.value}, async (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results.length) {
                let toRemove = [];
                this.originalEvents.forEach(
                    (event) => {
                        const selectedLocation = {
                            lat: this.selectedPlace.geometry.location.lat(),
                            lon: this.selectedPlace.geometry.location.lng(),
                        };
                        // TODO FIX WHEN BAD DATA IS CLEANED UP
                        if (!event.eventAddress) {
                            toRemove.push(event.sys.id);
                        } else {
                            const distanceAway = this.getDistanceBtwnTwoPts(selectedLocation, event.eventAddress);
                            event.distanceAway = distanceAway;
                            const appliedDistance = document.getElementById('distanceFilterSelect');

                            if (distanceAway > appliedDistance.value) {
                                toRemove.push(event.sys.id);
                            }
                        }
                    }
                );
                let filteredEvents = [...this.originalEvents];
                filteredEvents = filteredEvents.filter(
                    (event) => !toRemove.includes(event.sys.id)
                );
                const withApptData = [];
                for (const evt of filteredEvents) {
                    const event = await this.checkEventCanRequestAppt(evt);
                    withApptData.push(event);
                }
                this.eventsFilteredByLocation = withApptData;
                this.sortEvents(withApptData);
                this.updateEventUi(withApptData);
                const otherFilters = document.getElementById('otherFilters');
                if (!withApptData) {
                    otherFilters.style.display = 'none';
                }
            }
        });
    }

    filterEvents = () => {
        let toRemove = [];
        this.eventsFilteredByLocation.forEach(
            (event) => {
                Object.entries(this.appliedFilters).forEach(([filterName, value]) => {
                    // could make this more extensible with an object to function mapping
                    // but need to move faster
                    if (filterName === 'collections' && value.length) {
                        let eventsWithCollections = []
                        for (const collection of value) {
                            eventsWithCollections = eventsWithCollections.concat(this.eventsByCollections[collection]);
                        }
                        if (!eventsWithCollections.includes(event.sys.id)) {
                            toRemove.push(event.sys.id);
                        }
                    };
                    if (filterName === 'retailerName' && value && event.retailerName.toLowerCase().search(value.toLowerCase()) < 0) {
                        toRemove.push(event.sys.id)
                    }
                });
            }
        );

        const filteredEvents = [...this.eventsFilteredByLocation];
        this.events = filteredEvents.filter(
            (event) => !toRemove.includes(event.sys.id)
        );
        this.sortEvents(this.events);
        this.updateEventUi(this.events);
    };

    updateFilters = (events) => {
        const otherFiltersToggle = document.getElementById('otherFiltersToggle');
        const sortBy = document.getElementById('sortFilter');
        if (events.length) {
            otherFiltersToggle.style.display = 'flex';
            sortBy.style.display = 'flex';
        } else {
            otherFiltersToggle.style.display = 'none';
            sortBy.style.display = 'none';
        }

        const sortLabelDisplay = SORT_LABELS[this.sortBy];
        const sortLabel = document.getElementById('selectedSort');
        sortLabel.innerHTML = sortLabelDisplay;
    };

    updateResultsInfo = (events) => {
        const eventInfoElem = document.getElementById('results-info');
        const collectionsFilter = document.getElementById('collectionFilter');
        if (events.length) {
            eventInfoElem.innerText = 'PRODUCT STYLES AND AVAILABILITY VARY BY RETAILER';
            collectionsFilter.style.display = 'inherit';
        } else {
            eventInfoElem.innerText = 'No Results found. Try widening your search.';
            // doesnt make sense to show a bare label
            collectionsFilter.style.display = 'none';
        }


    };

    resetFilters = () => {
        this.appliedFilters = {
            ...this.originalFilters
        };
        for (const [filter, elementId] of Object.entries(FILTER_IDS)) {
            const element = document.getElementById(elementId);
            if (element) {
                const value = this.appliedFilters[filter];
                element.value = value;

                // custom select (.form-select) requires this hack since it's not an actual select in the display
                if (element.classList.contains('form-select')) {
                    const formSelectElement = element.nextSibling;
                    const displayElement = formSelectElement.getElementsByClassName('custom-select__option--value');
                    const displayValue = element.options[element.selectedIndex].text;
                    displayElement[0].innerHTML = displayValue;
                }
            }
        };

        this.map.setZoom(DEFAULT_ZOOM_LEVEL);
        const locationTypeahead = document.getElementById('locationTypeahead');
        locationTypeahead.value = '';
        // trigger manual change event to ensure button handlers are fired 
        const changeEvent = new Event('change');
        locationTypeahead.dispatchEvent(changeEvent);
        this.events = [];
        this.eventsFilteredByLocation = [];
        this.updateEventUi([], false);
    };

    sortEvents = (events) => {
        if (this.sortBy === 'asc') {
            events = events.sort((a, b) => a.eventName.localeCompare(b.eventName));
        } else if (this.sortBy === 'desc') {
            events = events.sort((a, b) => b.eventName.localeCompare(a.eventName));
        } else if (this.sortBy === 'nearest') {
            events = events.sort((a, b) => parseFloat(a.distanceAway) - parseFloat(b.distanceAway));

        } else if (this.sortBy === 'farthest') {
            events = events.sort((a, b) => parseFloat(b.distanceAway) - parseFloat(a.distanceAway));
        }
        this.updateEventUi(events);
    };


    initMap = () => {
        this.map = new google.maps.Map(document.getElementById('map'), {
            // arbitrarily center the map
            zoom: DEFAULT_ZOOM_LEVEL,
            center: { lat: 36, lng: -60 }
        });
    };

    getMapMarker = (latLong, display, infoWindow, id = null, centerEvent = null) => {
        const position = {
            lat: latLong.lat,
            lng: latLong.lon,
        };
        let icon = MAP_MARKER_BLACK;
        if (id && centerEvent && id === centerEvent.sys.id) {
            icon = MAP_MARKER_ORANGE;
        }
        const marker = new google.maps.Marker({
            position,
            icon
        });

        // markers can only be keyboard focusable when they have click listeners
        // open info window when marker is clicked
        marker.addListener('click', () => {
            infoWindow.setContent(display);
            infoWindow.open(map, marker);
        });

        google.maps.event.addListener(marker, "mouseover", function () {
            marker.setIcon(MAP_MARKER_ORANGE);
            const hoveredMarkerEvent = new CustomEvent(MARKER_HOVER_EVENT, { detail: id });
            document.dispatchEvent(hoveredMarkerEvent);
            this.hoveredId = id;
        });
        google.maps.event.addListener(marker, "mouseout", function () {
            marker.setIcon(MAP_MARKER_BLACK);
            const hoverOutMarkerEvent = new CustomEvent(MARKER_HOVER_EVENT);
            document.dispatchEvent(hoverOutMarkerEvent, { detail: {} });
            this.hoveredId = null
        });
        return marker;
    };

    paintEventMapMarkers = (eventData, toCenter = null) => {
        const infoWindow = new google.maps.InfoWindow({
            content: '',
            disableAutoPan: true,
        });
        // TODO remove filter
        // bad data during dev
        const markers = eventData.filter((event) => !!event.eventAddress).map((event) => {
            const display = `
                ${new Date(event.eventStartDate).toLocaleDateString()} - ${new Date(event.eventEndDate).toLocaleDateString()} <br/>
                ${event.eventName}<br/>
                Collections: ${(event.collectionsAvailable || []).join(', ')}
            `
            return this.getMapMarker(event.eventAddress, display, infoWindow, event.sys.id, toCenter);
        });
        if (!this.markerClusterer) {
            this.markerClusterer = new MarkerClusterer({ markers: markers, map: this.map })
        } else {
            this.markerClusterer.clearMarkers();
            this.markerClusterer.addMarkers(markers);
        }
    };

    openDetailsModal = (event) => {
        const detailElement = document.createElement('div');
        detailElement.classList.add('event-details');

        const header = document.createElement('div');
        header.classList.add('event-header');

        const nameElement = document.createElement('h2');
        nameElement.classList.add('header-title');
        nameElement.innerText = event.eventName;
        header.append(nameElement);

        const locationElement = document.createElement('span');
        locationElement.classList.add('location');
        locationElement.innerText = `${event.retailerName} • ${event.city}, ${event.state}`;
        header.append(locationElement);
        detailElement.append(header);

        const content = document.createElement('div');
        content.classList.add('event-content');
        if (event.brandFolderImage && event.brandFolderImage.length) {

            const contentLeft = document.createElement('div');
            contentLeft.classList.add('content-left');
            const eventImg = document.createElement('img');
            eventImg.src = event.brandFolderImage[0].cdn_url;
            eventImg.classList.add('event-image');
            contentLeft.append(eventImg);
            content.append(contentLeft);
        }

        detailElement.append(content);

        const contentRight = document.createElement('div');
        contentRight.classList.add('content-right');
        content.append(contentRight);

        const eventDate = document.createElement('div');
        eventDate.classList.add('event-info');
        const eventDateLabel = document.createElement('span');
        eventDateLabel.classList.add('event-label');
        eventDateLabel.innerText = 'DATE';
        eventDate.append(eventDateLabel);

        const eventDateText = document.createElement('span');
        eventDateText.classList.add('event-detail');
        eventDateText.innerText = `${new Date(event.eventStartDate).toLocaleDateString()} - ${new Date(event.eventEndDate).toLocaleDateString()}`;
        eventDate.append(eventDateText);
        contentRight.append(eventDate);


        const collections = document.createElement('div');
        collections.classList.add('event-info');
        const collectionsHeader = document.createElement('span');
        collectionsHeader.classList.add('event-label');
        collectionsHeader.innerText = 'COLLECTIONS';
        collections.append(collectionsHeader);

        const collectionsList = document.createElement('div');
        collectionsList.classList.add('collections-list');
        const evtCollections = event.collectionsAvailable || [];
        for (const collection of evtCollections) {
            const collectionItem = document.createElement('span');
            collectionItem.classList.add('collection-item');
            collectionItem.classList.add('event-detail');
            collectionItem.innerText = collection;
            collectionsList.append(collectionItem);
        };
        collections.append(collectionsList);
        contentRight.append(collections);

        const address = document.createElement('div');
        address.classList.add('event-info');
        const addressLabel = document.createElement('span');
        addressLabel.classList.add('event-label');
        addressLabel.innerText = 'ADDRESS';
        address.append(addressLabel);
        const streetAddress = document.createElement('div');
        streetAddress.classList.add('street-address');
        streetAddress.innerHTML = `
            <div>${event.streetName}</div>
            <div>${event.city}, ${event.state} ${event.zipCode}</div>
        `;
        address.append(streetAddress);
        const directions = document.createElement('a');
        directions.classList.add('directions');
        directions.innerText = 'GET DIRECTIONS'
        let destination = event.streetName.replaceAll(',', '').replaceAll(' ', '+');
        destination += `+${event.city}+${event.state}`
        directions.setAttribute('href', `https://www.google.com/maps?daddr=${destination}`);
        directions.setAttribute('target', '_blank');
        directions.setAttribute('rel', 'noopener noreferrer');
        address.append(directions);
        contentRight.append(address);

        const phone = document.createElement('div');
        phone.classList.add('event-info');
        const phoneLabel = document.createElement('div');
        phoneLabel.classList.add('event-label');
        phoneLabel.innerText = 'PHONE';
        phone.append(phoneLabel);
        const phoneNumber = document.createElement('a');
        phoneNumber.setAttribute("href", `tel:${event.phone}`);
        phoneNumber.classList.add('event-detail');
        phoneNumber.innerText = event.phone;
        phone.append(phoneNumber)
        contentRight.append(phone);

        const eventUrl = document.createElement('div');
        eventUrl.classList.add('event-info');
        const urlLabel = document.createElement('div');
        urlLabel.classList.add('event-label');
        urlLabel.innerText = 'WEBSITE';
        eventUrl.append(urlLabel);
        const eventUrlLink = document.createElement('a');
        eventUrlLink.setAttribute("href", `${event.website}`);
        eventUrlLink.setAttribute("target", "_blank");
        eventUrlLink.innerText = 'Visit Retailer Website';
        eventUrl.append(eventUrlLink);
        contentRight.append(eventUrl);
        if (event.canRequestAppt) {
            const scheduleBtn = document.createElement('button');
            scheduleBtn.setAttribute('type', 'button');
            scheduleBtn.classList.add('button')
            scheduleBtn.classList.add('primary-button');
            const btnText = document.createElement('span');
            btnText.innerText = 'REQUEST AN EVENT APPOINTMENT'
            scheduleBtn.append(btnText);
            scheduleBtn.addEventListener('click', () => this.openRequestForm(event));
            content.append(scheduleBtn);
        }

        const modal = defaultModal({ size: 'normal', skipCache: true });
        const requestBtn = document.createElement('button');
        requestBtn.setAttribute('type', 'button');
        requestBtn.classList.add('event-schedule');

        const requestBtnText = document.createElement('span');
        requestBtnText.innerText = 'SEE MORE EVENTS';
        requestBtn.append(requestBtnText);
        requestBtn.addEventListener('click', () => modal.close());
        content.append(requestBtn);

        modal.open();

        modal.updateContent(detailElement, { wrap: true });
    };

    getDirectBookingElem = (bridalLiveEventId) => {
        const scheduler = document.createElement('iframe');
        scheduler.setAttribute('src', `https://app.bridallive.com/forms.html?formType=scheduler&eventId=${bridalLiveEventId}`);
        scheduler.setAttribute('width', '100%');
        scheduler.setAttribute('height', '100%');
        return scheduler
    }

    getEmailBookingForm = () => {
        // yes all this code has SO much room for DRY fixes
        // especially these create form input elements
        // but designers made these not easy to code (i.e. inconsistent widths, random input rows with more htan 1 field, etc)
        // and this project is super rushed since I joined so just moving as fast as possible
        const bookingForm = document.createElement('form');
        const formHeader = document.createElement('h2');
        formHeader.innerText = 'Contact Information';
        bookingForm.append(
            formHeader
        );

        const topFields = [
            {
                label: 'First Name',
                attr: 'firstName',
                type: 'text'
            },
            {
                label: 'Last Name',
                attr: 'lastName',
                type: 'text'
            },
            {
                label: 'Email',
                attr: 'email',
                type: 'email'
            },
        ];
        for (const field of topFields) {
            const fieldElem = document.createElement('div');
            fieldElem.classList.add('form-field');
            const label = document.createElement('span');
            label.classList.add('form-label');
            label.innerText = field.label;
            fieldElem.append(label);

            const inputElem = document.createElement('input');
            inputElem.classList.add('form-input');
            inputElem.setAttribute('type', field.type);
            fieldElem.append(inputElem);
            bookingForm.append(fieldElem);
        };

        const phoneFieldRow = document.createElement('div');
        phoneFieldRow.classList.add('field-row');

        const phoneNumberField = document.createElement('div');
        phoneNumberField.classList.add('form-field');
        const phoneLabel = document.createElement('span');
        phoneLabel.classList.add('form-label');
        phoneLabel.innerText = 'Phone Number';
        phoneNumberField.append(phoneLabel);
        const phoneInput = document.createElement('input');
        phoneInput.classList.add('form-input');
        phoneInput.setAttribute('type', 'phone');
        phoneNumberField.append(phoneInput);

        phoneFieldRow.append(phoneNumberField);

        const phoneTypeField = document.createElement('select');
        phoneTypeField.classList.add('form-select');
        phoneTypeField.classList.add('selector-dropdown');
        ['Mobile', 'Home', 'Work'].forEach(
            (type) => {
                const typeOption = document.createElement('option');
                typeOption.setAttribute('value', type);
                typeOption.innerText = type;
                phoneTypeField.append(
                    typeOption
                );
            }
        );
        phoneFieldRow.append(phoneTypeField);
        bookingForm.append(phoneFieldRow);

        const eventRow = document.createElement('div');
        eventRow.classList.add('field-row');

        const eventDateField = document.createElement('div');
        eventDateField.classList.add('form-field');
        const eventDateLabel = document.createElement('span');
        eventDateLabel.classList.add('form-label');
        eventDateLabel.innerText = 'Phone Number';
        eventDateField.append(eventDateLabel);
        // todo probably find a better  one
        const eventInput = document.createElement('input');
        eventInput.classList.add('form-input');
        eventInput.setAttribute('type', 'date');
        eventDateField.append(eventInput);

        eventRow.append(eventDateField);
        bookingForm.append(eventRow);

        const viaText = document.createElement('input');
        viaText.classList.add('form-checkbox');
        viaText.id = 'viaText';
        viaText.setAttribute('type', 'checkbox');
        const viaTextLabel = document.createElement('label');
        viaTextLabel.innerText = 'Receive Account Alerts via Text';
        viaTextLabel.setAttribute('for', '#viaText');
        bookingForm.append(viaText);
        bookingForm.append(viaTextLabel);

        const bottomFields = [
            {
                label: 'Address 1',
                attr: 'address1',
                type: 'text'
            },
            {
                label: 'Address 2',
                attr: 'address2',
                type: 'text'
            },
            {
                label: 'City',
                attr: 'city',
                type: 'text'
            },
            {
                label: 'State',
                attr: 'state',
                type: 'select',
                options: [
                    'AL',
                    'AK',
                    'AZ',
                    'AR',
                    'CA'
                ]
            },
            {
                label: 'Zip Code',
                attr: 'zip',
                type: 'text'
            },
            {
                label: '# of People Attending',
                attr: 'numAttendants',
                type: 'text'
            },
        ];
        for (const field of bottomFields) {
            const fieldElem = document.createElement('div');
            fieldElem.classList.add('form-field');
            const label = document.createElement('span');
            label.classList.add('form-label');
            label.innerText = field.label;
            fieldElem.append(label);
            if (field.type !== 'select') {
                const inputElem = document.createElement('input');
                inputElem.classList.add('form-input');
                inputElem.setAttribute('type', field.type);
                fieldElem.append(inputElem);
                bookingForm.append(fieldElem);
            } else {
                const typeField = document.createElement('select');
                bookingForm.append(typeField);
                typeField.classList.add('form-select');
                typeField.classList.add('selector-dropdown');
                field.options.forEach(
                    (o) => {
                        const typeOption = document.createElement('option');
                        typeOption.setAttribute('value', o);
                        typeOption.innerText = o;
                        typeField.append(
                            typeOption
                        );
                    }
                );
            }
        };
        return bookingForm;
    };


    openScheduler = (event) => {
        const modal = defaultModal({ size: 'large', skipCache: true });
        modal.open();
        let elem;
        if (event.bridalLiveEventId) {
            elem = this.getDirectBookingElem(event.bridalLiveEventId);
        } else {
            // TODO style this form
            // should just need a scrollable modal with padding
            // like the designs
            // and figure out why the generic form-input /label etc classes
            // arent styling the inputs like they are in the side menu filters
            elem = this.getEmailBookingForm(event);
        }
        modal.updateContent(elem);
    }
    openRequestForm = (event) => {
        if (event.eventId) {
            window.location.href = '/request-event-appointment/?id=' + event.eventId + '&name=' + event.eventName.replace(/&/g, '%26');
            //redirect to custom form appending query string

        } else {
            window.location.href = '/request-event-appointment/?name=' + event.eventName;
        }

    }
};
