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
    collection: 'collectionFilterSelect',
};

const DEFAULT_ZOOM_LEVEL = 4;
const LOCATION_CHANGE_ZOOM_LEVEL = 8;
const HOVER_DEFAULT_ZOOM_LEVEL = 10;

const MARKER_HOVER_EVENT = 'markerHoverEvent';
const RETAILER_ITEM_HOVER_EVENT = 'eventItemHoverEvent';

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
        this.originalEvents = [];
        this.events = [];
        this.eventsById = {};
        this.collectionsByEventIds = {};
        this.originalFilters = {
            distance: 10,
            collection: 'All'
        };
        this.appliedFilters = {
            ...this.originalFilters
        };
        this.selectedPlace = null;
        this.markerClusterer = null;
        this.page = 1;
        this.perPage = 9;
        this.sortBy = 'distance';
        this.geocoder = new google.maps.Geocoder();
        this.autocomplete = null;
    };

    onReady = async () => {
        // TODO this might wait until they click search based on distance
        this.originalEvents = await this.getDesignerEvents();
        this.setupCollections();
        this.initMap();
        // this.addEventInfo(this.originalEvents);
        // this.addSortSelectOptions();
        this.addEventHandlers();
    };

    setupCollections = () => {
        let allCollections = [];
        for (const event of this.originalEvents) {
            const eventCollections = event.collectionsAvailable || [];
            allCollections = allCollections.concat(eventCollections);
            this.collectionsByEventIds[event.sys.id] = eventCollections;
        };
        // create the filter for the collections
        const uniqueSortedCollections = Array.from(new Set(allCollections)).sort();
        const collectionFilterList = document.getElementById('collections');
        uniqueSortedCollections.forEach((collection) => {
            const collectionItem = document.createElement('li');
            collectionItem.classList.add('collection');
            const collectionItemCheckbox = document.createElement('input');
            collectionItemCheckbox.setAttribute('type', 'checkbox');
            collectionItemCheckbox.setAttribute('id', collection);
            collectionItemCheckbox.setAttribute('name', collection);
            collectionItem.append(collectionItemCheckbox);

            const collectionItemLabel = document.createElement('label');
            collectionItemLabel.setAttribute('for', collection);
            collectionItemLabel.innerHTML = collection;
            collectionItem.append(collectionItemLabel);
            collectionFilterList.append(collectionItem);
        });
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
            'https://graphql.contentful.com/content/v1/spaces/y49u4slmhh3t/',
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
            this.filterEvents();
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
                locationTypeahead.classList.add('error');
            }
        });

        this.autocomplete = autocomplete;

        const resetBtn = document.getElementById('resetButton');
        resetBtn.addEventListener('click', this.resetFilters);

        // sort / collection toggles
        const sortToggle = document.getElementById('sortFilter');
        sortToggle.addEventListener('click', () => {
            const isOpen = sortToggle.classList.contains('open');
            if (isOpen) {
                sortToggle.classList.remove('open');
            } else {
                sortToggle.classList.add('open');
            }
        });


        // dropdown filters
        // TODO not working b/c change isnt firing on the select -.-
        const distanceFilterDropdown = document.getElementById('distanceFilterSelect');
        distanceFilterDropdown.addEventListener('change', (e) => this.applyFilters('distance', e));


        // // hover events
        // document.addEventListener(MARKER_HOVER_EVENT, (evt) => {
        //     const eventId = evt.detail;
        //     if (eventId) {
        //         const eventItem = document.getElementById(eventId);
        //         eventItem.classList.add('hovered');
        //     } else {
        //         const anyHovered = document.querySelectorAll('.event-item.hovered');
        //         anyHovered.forEach((elem) => elem.classList.remove('hovered'));
        //     }
        // });

        // document.addEventListener(RETAILER_ITEM_HOVER_EVENT, (evt) => {
        //     const event = evt.detail;
        //     if (event) {
        //         // TODO debounce if needed, doesnt seem that bad without it.
        //         this.map.setCenter({ lat: event.location.lat, lng: event.location.lon });
        //         this.map.setZoom(HOVER_DEFAULT_ZOOM_LEVEL);
        //         this.paintEventMapMarkers(this.events, event);
        //     } else {
        //         this.paintEventMapMarkers(this.events, null, true);
        //     }
        // });
    };

    createEventItem = (event) => {

        const container = document.createElement('div');
        container.classList.add('event-item');
        // set the id to allow querying when hovering on markers
        container.id = event.sys.id;
        const date = document.createElement('span');
        date.classList.add('event-date');
        date.innerText = `${new Date(event.eventStartDate).toLocaleDateString()} - ${new Date(event.eventEndDate).toLocaleDateString()}`;
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

        // TODO put behind if check of flag
        const requestBtn = document.createElement('button');
        requestBtn.setAttribute('type', 'button');
        requestBtn.classList.add('event-schedule');
        const requestBtnText = document.createElement('span');
        requestBtnText.innerText = 'REQUEST AN APPOINTMENT'
        requestBtn.append(requestBtnText);
        requestBtn.addEventListener('click', () => this.openRequestForm(event));
        container.append(requestBtn)

        // if (event.requestAppointment) {
        //     detailElement.append(requestBtn);
        // }


        // hover events
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
        console.log("showing events", eventData)
        const eventFinderResults = document.getElementById('eventResults');
        eventFinderResults.innerHTML = "";
        // eventData.sort((a, b) => (a.sort_order > b.sort_order) ? 1 : -1)
        eventData.forEach((eventData) => {
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

    applyFilters = (filterType, evt) => {
        console.log("APPLYING", filterType, evt.target.value);
        this.appliedFilters[filterType] = evt.target.value;

        // adjust zoom for convenience in distance changes  
        const distanceToZoomLevels = {
            10: 10,
            25: 10,
            50: 8,
            100: 8,
            500: 5,
        };
        if (filterType === 'distance') {
            const newZoomLevel = distanceToZoomLevels[evt.target.value];
            if (newZoomLevel) {
                this.map.setZoom(newZoomLevel);
            } else {
                this.map.setZoom(HOVER_DEFAULT_ZOOM_LEVEL);
            }
        };
    };

    filterEvents = () => {
        var self = this;
        var addr = document.getElementById("locationTypeahead");
        // Get geocoder instance
        var geocoder = new google.maps.Geocoder();

        // Geocode the address
        geocoder.geocode({
            'address': addr.value
        }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK && results.length) {
                let toRemove = [];

                self.events = [...self.originalEvents];
                self.originalEvents.forEach(
                    (event) => {
                        Object.entries(self.appliedFilters).forEach(([filterName, value]) => {
                            console.log("filter name", filterName, "value", value)
                            if (filterName === 'distance' && self.selectedPlace) {
                                const selectedLocation = {
                                    lat: self.selectedPlace.geometry.location.lat(),
                                    lon: self.selectedPlace.geometry.location.lng(),
                                };
                                console.log("selected ", selectedLocation, event);
                                // TODO FIX WHEN BAD DATA IS CLEANED UP
                                if (!event.eventAddress) {
                                    toRemove.push(event.sys.id);
                                } else {
                                    const distanceAway = self.getDistanceBtwnTwoPts(selectedLocation, event.eventAddress);
                                    event.distanceAway = distanceAway;
                                    if (distanceAway > value) {
                                        toRemove.push(event.sys.id);
                                    }
                                }

                            };
                            if (filterName === 'collection' && value !== 'All') {
                                const eventsWithSelected = self.collectionsByEventIds[value];
                                if (!eventsWithSelected.includes(event.id)) {
                                    toRemove.push(event.id);
                                }
                            }
                        });
                    }
                );

                const filteredEvents = [...self.originalEvents];
                self.events = filteredEvents.filter(
                    (event) => !toRemove.includes(event.sys.id)
                );

                console.log("EVENTS", self.events);
                // self.sortEvents();
                self.paintEventMapMarkers(self.events);
                self.updateResultsInfo();
                self.addEventInfo(self.events);
            } else {
                // show an error if it's not
                const eventInfoElem = document.getElementById('results-info');
                eventInfoElem.innerText = 'No Results found. Try widening your search.';
                const eventFinderResults = document.getElementById('eventResults');
                eventFinderResults.innerHTML = "";
            }
        });
    };

    updateResultsInfo = () => {
        const eventInfoElem = document.getElementById('results-info');
        const resultsInfoText = this.events.length ? 'PRODUCT STYLES AND AVAILABILITY VARY BY RETAILER' : 'No Results found. Try widening your search.';
        eventInfoElem.innerText = resultsInfoText;
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
    };

    createFilterElements = () => {
        // distance filter
        const distanceContainer = document.getElementById('distanceFilter');
        const distanceFilter = document.createElement('div');
        distanceFilter.classList.add('form-field');
        const distanceFilterLabel = document.createElement('div');
        distanceFilterLabel.classList.add('form-label');
        distanceFilterLabel.innerText = 'Within';
        distanceFilter.append(distanceFilterLabel);
        const distanceFilterDropdown = document.createElement('select');
        distanceFilterDropdown.id = FILTER_IDS.distance;
        distanceFilterDropdown.classList.add('form-select');
        distanceFilterDropdown.classList.add('selector-dropdown');
        [10, 25, 50, 100, 500].forEach(
            (distance) => {
                const distanceOption = document.createElement('option');
                distanceOption.setAttribute('value', distance);
                distanceOption.innerText = `${distance} Miles`;
                distanceFilterDropdown.append(
                    distanceOption
                );
            }
        );
        distanceFilter.append(distanceFilterDropdown);
        distanceFilterDropdown.value = this.appliedFilters.distance;
        distanceContainer.append(distanceFilter);

        distanceFilterDropdown.addEventListener('change', (e) => this.applyFilters('distance', e));

        // collections filter
        const collectionContainer = document.getElementById('collectionsFilter');
        const collectionFilter = document.createElement('div');
        collectionFilter.classList.add('form-field');
        const collectionFilterLabel = document.createElement('div');
        collectionFilterLabel.classList.add('form-label');
        collectionFilterLabel.innerText = 'Carrying';
        collectionFilter.append(collectionFilterLabel);
        const collectionFilterDropdown = document.createElement('select');
        collectionFilterDropdown.id = FILTER_IDS.collection;
        collectionFilterDropdown.classList.add('form-select');
        collectionFilterDropdown.classList.add('selector-dropdown');
        const collectionsSorted = [
            'All',
            ...Object.keys(this.collectionsByEventIds).sort()
        ];

        collectionsSorted.forEach(
            (collection) => {
                const collectionOption = document.createElement('option');
                collectionOption.innerText = collection;
                collectionFilterDropdown.append(
                    collectionOption
                );
            }
        );
        collectionFilter.append(collectionFilterDropdown);
        collectionContainer.append(collectionFilter);

        collectionFilterDropdown.addEventListener('change', (e) => this.applyFilters('collection', e));
    };

    setupFilterData = async (rawEvents) => {

        const collectionsByEventIds = {};
        const eventsById = {};
        rawEvents.forEach(
            (event) => {
                eventsById[event.bridalLiveEventId] = event;
                event.collectionsAvailableCollection.items.forEach((collection) => {
                    if (collection) {
                        const eventsWithCollection = collectionsByEventIds[collection.collectionName] || [];
                        eventsWithCollection.push(event.id);
                        collectionsByEventIds[collection.collectionName] = eventsWithCollection;
                    }
                });
            }
        );
        this.collectionsByEventIds = collectionsByEventIds;
        this.eventsById = eventsById;
        this.createFilterElements();
        return rawEvents;
    }

    getEventData = async () => {
        const query = `
      query {
        eventsCollection {
            items {
                id
                eventName
                eventCity
                website
                state
                bridalLiveEventId
                location {
                    lat
                    lon
                }
                collectionsAvailableCollection {
                    items {
                        collectionName
                        collectionButtonUrl
                    }
                }
                featured
                disneyPlatinumCollection
                eventStreet
                phoneNumber
                requestAppointment
            }
        }
    }`
        const results = await fetch(
            // this ought to be in config
            'https://allure-integration.azurewebsites.net/leads',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query }),
            }
        )
        const latLoc = await results.json();
        const events = latLoc.data.eventsCollection.items;
        return this.setupFilterData(events);
    };

    sortEvents = (evt, override = null) => {
        const sortBy = override || evt?.target?.value || this.sortBy;
        this.sortBy = sortBy;
        if (sortBy === 'name') {
            this.events = this.events.sort((a, b) => a.eventName.localeCompare(b.eventName));
        } else if (sortBy === 'distance') {
            this.events = this.events.sort((a, b) => parseFloat(a.distanceFromUser) - parseFloat(b.distanceFromUser));
        }
        this.paintEventMapMarkers(this.events);
    };

    addSortSelectOptions = () => {
        const sortSelect = document.getElementById('sortSelect');
        sortSelect.addEventListener('change', this.sortEvents);
        this.SORTABLES.forEach((sortable) => {
            const sortOption = document.createElement('option');
            sortOption.value = sortable.value;
            sortOption.innerText = sortable.display;
            sortSelect.append(sortOption);
        });
        // default to distance
        const initialSort = this.SORTABLES[1].value;
        sortSelect.value = initialSort;
        this.sortEvents(null, initialSort);
    };


    initMap = () => {
        this.map = new google.maps.Map(document.getElementById('map'), {
            // arbitrarily pick center of US
            zoom: DEFAULT_ZOOM_LEVEL,
            center: { lat: 39, lng: -98 }
        });
    };

    getMapMarker = (latLong, display, infoWindow, id = null, centerEvent = null) => {
        const position = {
            lat: latLong.lat,
            lng: latLong.lon,
        };
        let icon = MAP_MARKER_BLACK;
        if (id && centerEvent && id === centerEvent.id) {
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

    paintEventMapMarkers = (eventData) => {
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
            return this.getMapMarker(event.eventAddress, display, infoWindow, event.sys.id);
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

        if (event.featured) {
            const featuredElement = document.createElement('span');
            featuredElement.classList.add('featured');
            header.append(featuredElement);
        }

        if (event.disneyPlatinumCollection) {
            const dpcElement = document.createElement('span');
            dpcElement.classList.add('disney');
            header.append(dpcElement);
        }

        const nameElement = document.createElement('h2');
        nameElement.classList.add('header-title');
        nameElement.innerText = event.eventName;
        header.append(nameElement);

        const locationElement = document.createElement('span');
        locationElement.classList.add('location');
        locationElement.innerText = `${event.eventCity}, ${event.state}`;
        header.append(locationElement);
        detailElement.append(header);

        const collections = document.createElement('div');
        collections.classList.add('collections');
        const collectionsHeader = document.createElement('span');
        collectionsHeader.classList.add('event-label');
        collectionsHeader.innerText = 'COLLECTIONS';
        collections.append(collectionsHeader);

        const collectionsList = document.createElement('div');
        collectionsList.classList.add('collections-list');
        for (const collection of event.collectionsAvailableCollection.items) {
            if (collection) {
                var collectionItem = document.createElement('span');
                if (collection.collectionButtonUrl == null) {
                    //collectionItem.setAttribute("href", "#");
                } else {
                    //collectionItem.setAttribute("href", collection.collectionButtonUrl);
                    //collectionItem.setAttribute("target", "_blank");
                }
                collectionItem.classList.add('collection-item');
                collectionItem.classList.add('event-detail');
                collectionItem.innerText = collection.collectionName;
                collectionsList.append(collectionItem);
            }
        };
        collections.append(collectionsList);
        detailElement.append(collections);

        const address = document.createElement('div');
        address.classList.add('event-address');
        const addressLabel = document.createElement('span');
        addressLabel.classList.add('event-label');
        addressLabel.innerText = 'ADDRESS';
        address.append(addressLabel);
        const streetAddress = document.createElement('div');
        streetAddress.classList.add('street-address');
        streetAddress.classList.add('event-detail');
        streetAddress.innerText = event.eventStreet;
        address.append(streetAddress);
        const directions = document.createElement('a');
        directions.classList.add('directions');
        directions.innerText = 'GET DIRECTIONS'
        const destination = event.eventStreet.replaceAll(',', '').replaceAll(' ', '+');
        directions.setAttribute('href', `https://www.google.com/maps?daddr=${destination}`);
        directions.setAttribute('target', '_blank');
        directions.setAttribute('rel', 'noopener noreferrer');
        address.append(directions);
        detailElement.append(address);

        const phone = document.createElement('div');
        phone.classList.add('phone');
        const phoneLabel = document.createElement('div');
        phoneLabel.classList.add('event-label');
        phoneLabel.innerText = 'PHONE';
        phone.append(phoneLabel);
        const phoneNumber = document.createElement('a');
        phoneNumber.setAttribute("href", `tel:${event.phoneNumber}`);
        phoneNumber.classList.add('event-detail');
        phoneNumber.innerText = event.phoneNumber;
        phone.append(phoneNumber)
        detailElement.append(phone);

        var eventUrl = document.createElement('div');
        eventUrl.classList.add('event-url');
        const eventUrlLink = document.createElement('a');
        eventUrlLink.setAttribute("href", `${event.website}`);
        eventUrlLink.setAttribute("target", "_blank");
        eventUrlLink.innerText = event.website;
        eventUrl.append(eventUrlLink);
        detailElement.append(eventUrl);

        const scheduleBtn = document.createElement('button');
        scheduleBtn.setAttribute('type', 'button');
        scheduleBtn.classList.add('schedule-btn');
        scheduleBtn.classList.add('book-appt');

        const btnText = document.createElement('span');
        btnText.innerText = 'BOOK AN APPOINTMENT'
        scheduleBtn.append(btnText);
        scheduleBtn.addEventListener('click', () => this.openScheduler(event));

        detailElement.append(scheduleBtn);

        //Add Request Appointment Button
        const requestBtn = document.createElement('button');
        requestBtn.setAttribute('type', 'button');
        requestBtn.classList.add('schedule-btn');

        const requestBtnText = document.createElement('span');
        requestBtnText.innerText = 'REQUEST AN APPOINTMENT'
        requestBtn.append(requestBtnText);
        requestBtn.addEventListener('click', () => this.openRequestForm(event));

        if (event.requestAppointment) {
            detailElement.append(requestBtn);
        }


        const modal = defaultModal({ size: 'normal', skipCache: true });
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
        if (event.bridalLiveEventId) {
            window.location.href = '/request-appointment?eventId=' + event.bridalLiveEventId + '&eventName=' + event.eventName;
            //redirect to custom form appending query string

        } else {
            window.location.href = '/request-appointment?eventName=' + event.eventName;
        }

    }
};
