import { MarkerClusterer } from '@googlemaps/markerclusterer'
// import is required by client, not by code
import regeneratorRuntime from 'regenerator-runtime'

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
const HOVER_DEFAULT_ZOOM_LEVEL = 10;

const MARKER_HOVER_EVENT = 'markerHoverEvent';
const RETAILER_ITEM_HOVER_EVENT = 'retailerItemHoverEvent';

export default class RetailFinder extends PageManager {
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
    this.originalRetailers = [];
    this.retailers = [];
    this.retailersById = {};
    this.retailersByDistance = {};
    this.collectionsByRetailers = {};
    this.originalFilters = {
      distance: 25,
      collection: 'All'
    };
    this.appliedFilters = {
      ...this.originalFilters
    };
    this.selectedPlace = null;
    this.userLocation = {};
    this.markerClusterer = null;
    this.page = 1;
    this.perPage = 9;
    this.sortBy = 'distance';
    this.geocoder = new google.maps.Geocoder();
    this.originalUserLocationName = null;
    this.originalUserLocationPlace = null;
    this.autocomplete = null;
  };

  onReady = async () => {
    const retailerData = await this.getRetailerData();
    this.originalRetailers = [...retailerData];
    this.addSortSelectOptions();
    this.addEventHandlers();
  };

  setOriginalLocation = () => {
    const placesService = new google.maps.places.PlacesService(this.map);
    placesService.textSearch({
      query: this.originalUserLocationName
    }, (places) => {
      const [place] = places;
      this.originalUserLocationPlace = place;
      this.autocomplete.set('place', place);
    });
  };

  addEventHandlers = () => {
    const locationTypeahead = document.getElementById('location-typeahead');
    const autocomplete = new google.maps.places.Autocomplete(locationTypeahead);
    const submitBtnContainer = document.getElementById('filterButton');
    const submitBtn = submitBtnContainer.querySelector('button');
    // hacking a switch to know whether or not we should filter on first page load
    // we cant put it after this call b/c the event handler is what sets the
    // the google places input look up and runs async..
    // could break this out but deadline is nearing... 
    const needsInitialFilter = !this.autocomplete;
    /*** wait for element to exist ***/
    // function waitForElement(selector, callback) {
    //   if (document.querySelector(selector) !== null) {
    //     callback();
    //   } else {
    //   setTimeout(function() {
    //     waitForElement(selector, callback);
    //     }, 100);
    //   }
    // };
    // waitForElement('#location-typeahead.pac-target-input',function() {
    //     const checkInputLength = setInterval(checkInput, 500);
    //     function checkInput() {
    //       if(document.querySelector("#location-typeahead.pac-target-input")){
    //         if(document.querySelector("#location-typeahead.pac-target-input").value.length > 0){
    //           submitBtn.click();
    //           clearInterval(checkInputLength);
    //         }
    //       }
    //     }
    // });
    autocomplete.bindTo("bounds", this.map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        const retailerInfoElem = document.getElementById('results-info');
        retailerInfoElem.innerText = 'No Results found. Try widening your search.';
        const retailFinderResults = document.getElementById('retail-finder-results');
        retailFinderResults.innerHTML = "";
        return;
      }
      if (place) {
        this.map?.setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
        this.map?.setZoom(DEFAULT_ZOOM_LEVEL);
        this.selectedPlace = place;
        if (needsInitialFilter) {
          // commenting this function to disable the results on input change
          //this.filterRetailers();
        }
        const topLevelLocationTypes = ['postal_code', 'political'];
        submitBtn.disabled = false;
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
        submitBtn.disabled = true;
        locationTypeahead.classList.add('error');
      }
    });

    this.autocomplete = autocomplete;

    // hover events
    document.addEventListener(MARKER_HOVER_EVENT, (evt) => {
      const retailerId = evt.detail;
      if (retailerId) {
        const retailerItem = document.querySelector(`[data-retailer-id=${retailerId}]`);
        retailerItem.classList.add('hovered');
      } else {
        const anyHovered = document.querySelectorAll('.retailer-item.hovered');
        anyHovered.forEach((elem) => elem.classList.remove('hovered'));
      }
    });

    document.addEventListener(RETAILER_ITEM_HOVER_EVENT, (evt) => {
      const retailer = evt.detail;
      if (retailer) {
        // TODO debounce if needed, doesnt seem that bad without it.
        this.map.setCenter({ lat: retailer.location.lat, lng: retailer.location.lon });
        this.map.setZoom(HOVER_DEFAULT_ZOOM_LEVEL);
        this.paintMapAndRetailers(this.retailers, retailer);
      }
    });
  };

  createRetailerItem = (retailer, total, idx) => {
    const mainContainer = document.createElement('div');
    const carryValue = document.getElementById("collectionFilterSelect");
    // if(carryValue.value){
    //   if(carryValue.value === "All"){
    //     const collectionNames = retailer.collectionsAvailableCollection.items;
    //     if(collectionNames){
    //       for(let i=0; i<collectionNames.length; i++) {
    //         if(collectionNames[i]){
    //           if(collectionNames[i].collectionName == "Allure Men"){
    //             mainContainer.classList.add('hide-retailer-item');
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
    mainContainer.classList.add('retailer-item-container');
    const container = document.createElement('div');
    container.classList.add('retailer-item');
    container.dataset.retailerId = retailer.bridalLiveRetailerId;
    // any of last three which would be in the last row doesnt need a border
    const rowsWithBorder = Math.floor(total / 3);
    const firstIdxWithoutBorder = rowsWithBorder * 3
    if (idx < firstIdxWithoutBorder) {
      mainContainer.classList.add('bordered');
    }
    mainContainer.append(container);
    const nameHeader = document.createElement('div');
    nameHeader.classList.add('retailer-title');
    nameHeader.innerText = retailer.retailerName;
    container.append(nameHeader);

    const locationInfo = document.createElement('div');
    locationInfo.classList.add('retailer-location');
    const cityState = document.createElement('span');
    cityState.classList.add('retailer-city-state');
    cityState.innerText = `${retailer.retailerCity}, ${retailer.state}`;
    locationInfo.append(cityState);
    container.append(locationInfo);

    const distance = document.createElement('span');
    distance.classList.add('retailer-distance');
    distance.innerText = parseInt(`${retailer.distanceAway}`) + ` miles away`;
    container.append(distance);

    const numCollections = document.createElement('span');
    numCollections.classList.add('retailer-collection-count');
    numCollections.innerText = `Carries ${retailer.collectionsAvailableCollection.items.length} collections`;
    container.append(numCollections)

    if (retailer.featured) {
      const featuredCollections = document.createElement('div');
      featuredCollections.classList.add('featured');
      container.append(featuredCollections);
    }


    if (retailer.disneyPlatinumCollection) {
      const disneyCollections = document.createElement('div');
      disneyCollections.classList.add('disney');
      container.append(disneyCollections);
    };

    // hover events
    mainContainer.addEventListener('mouseenter', () => {
      const retailerHoveredEvent = new CustomEvent(RETAILER_ITEM_HOVER_EVENT, { detail: retailer });
      document.dispatchEvent(retailerHoveredEvent);
    });

    mainContainer.addEventListener('mouseext', () => {
      const retailerExitEvent = new CustomEvent(RETAILER_ITEM_HOVER_EVENT, { detail: null });
      document.dispatchEvent(retailerExitEvent);
    });

    // click event
    mainContainer.addEventListener('click', () => this.openDetailsModal(retailer));

    return mainContainer;
  };

  addRetailerInfo = (retailerData) => {
    const retailFinderResults = document.getElementById('retail-finder-results');
    retailFinderResults.innerHTML = "";
    const total = retailerData.length;
    this.retailers = retailerData;
    retailerData.sort((a, b) => (a.sort_order > b.sort_order) ? 1 : -1)
    let i = 1;
    let first_retailer = false;
    retailerData.forEach((retailerData, idx) => {
      const retailerItem = this.createRetailerItem(retailerData, total, idx);
      retailFinderResults.append(retailerItem);
      if (retailerData && retailerData.requestAppointment && i == 1) {
        first_retailer = retailerData;
      }
      i = i + 1;
    });
    if (first_retailer) {
      this.openDetailsModal(first_retailer);
    }
  }

  getMarker = (latLong, display, infoWindow, id = null, centerRetailer = null) => {
    const position = {
      lat: latLong.lat,
      lng: latLong.lon
    };
    let icon = MAP_MARKER_BLACK;
    if (id && centerRetailer && id === centerRetailer.bridalLiveRetailerId) {
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

  setUserLocation = (location) => {
    const latLng = new google.maps.LatLng(location.lat, location.lon);
    // this is a pretty hacky putting this in here...
    // only reason is because it's in a convenient spot and the calls underneath
    // need to be called after getting user location          
    // re-evaluate putting the bottom stuff in onReady();
    if (!this.originalUserLocationName) {
      this.geocoder.geocode({
        'latLng': latLng,
      }).then((res) => {
        let userLocationName;
        // go backwards b/c it's highest to most specific and we want neighborhood before street address
        for (let i = res.results.length - 1; i >= 0; i--) {
          const component = res.results[i];
          //hopefully we have at least one of these, if not keep going, do later
          if (component.types.includes('postal_code')) {
            userLocationName = component.formatted_address;
            break;
          } else if (component.types.includes('neighborhood')) {
            userLocationName = component.formatted_address;
          }
        }
        this.originalUserLocationName = userLocationName;
        // this.setOriginalLocation();
      });
    }
  };

  getUserLocation = async () =>
    new Promise(async (resolve, reject) => {
      const accessToken = this.context.ipstackAccessToken;
      if (!accessToken) {
        alert("Unable to identify location.");
        return reject(err);
      }
      // use ipstack to get estimate with ip address      
      // TODO use https when we have a prod token
      const results = await fetch(
        `https://api.ipstack.com/check?access_key=${accessToken}`,
      )
      const ipLocationInfo = await results.json();
      const location = {
        lat: ipLocationInfo.latitude,
        lon: ipLocationInfo.longitude,
      };
      this.setUserLocation(location);
      resolve(location);
    });

  applyFilters = (filterType, evt) => {
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

  filterRetailers = () => {
    var self = this;
    var addr = document.querySelector(".location-typeahead");
    // Get geocoder instance
    var geocoder = new google.maps.Geocoder();

    // Geocode the address
    geocoder.geocode({
      'address': addr.value
    }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
        let toRemove = [];

        self.retailers = [...self.originalRetailers];
        self.originalRetailers.forEach(
          (retailer) => {
            Object.entries(self.appliedFilters).forEach(([filterName, value]) => {
              if (filterName === 'distance' && self.selectedPlace) {
                const selectedLocation = {
                  lat: self.selectedPlace.geometry.location.lat(),
                  lon: self.selectedPlace.geometry.location.lng(),
                }
                const distanceAway = self.getDistanceBtwnTwoPts(selectedLocation, retailer.location);
                retailer.distanceAway = distanceAway;
                if (distanceAway > value) {
                  toRemove.push(retailer.retailerId);
                }
              };
              if (filterName === 'collection' && value !== 'All') {
                const retailersWithSelected = self.collectionsByRetailers[value];
                if (!retailersWithSelected.includes(retailer.retailerName)) {
                  toRemove.push(retailer.retailerId);
                }
                // business case to filter retailers with Allure Men if collection is set to all
              } else if (filterName === 'collection' && value === 'All') {
                const retailersWithAllureMen = self.collectionsByRetailers['Allure Men'];
                if (retailersWithAllureMen.includes(retailer.retailerName)) {
                  toRemove.push(retailer.retailerId);
                }
              }
            });
          }
        );

        const filteredRetailers = [...self.originalRetailers];

        // this still doesnt account for retailers that for some reason have the same `retailerId` 
        // we're figuring out why that's the case, if the client can fix it to be unique
        // if not, we can run some hack on duplicate ids by appending -<count> to it i guess
        self.retailers = filteredRetailers.filter(
          (retailer) => !toRemove.includes(retailer.retailerId)
        );

        self.sortRetailers();
        self.paintMapAndRetailers(self.retailers);
        self.updateResultsInfo();
      } else {
        // show an error if it's not
        const retailerInfoElem = document.getElementById('results-info');
        retailerInfoElem.innerText = 'No Results found. Try widening your search.';
        const retailFinderResults = document.getElementById('retail-finder-results');
        retailFinderResults.innerHTML = "";
      }
    });
  };

  updateResultsInfo = () => {
    const retailerInfoElem = document.getElementById('results-info');
    const resultsInfoText = this.retailers.length ? 'PRODUCT STYLES AND AVAILABILITY VARY BY RETAILER' : 'No Results found. Try widening your search.';
    retailerInfoElem.innerText = resultsInfoText;
  };

  resetFilters = () => {
    this.appliedFilters = {
      ...this.originalFilters
    };
    for (const [filter, elementId] of Object.entries(FILTER_IDS)) {
      const element = document.getElementById(elementId);
      const value = this.appliedFilters[filter];
      element.value = value;
    };
    // this.selectedPlace = this.originalUserLocationPlace;
    // console.log(this.selectedPlace);
    // this.autocomplete.set('place', this.originalUserLocationPlace);
    // this.map.setCenter({ lat: this.userLocation.lat, lng: this.userLocation.lon });

    const latLng = new google.maps.LatLng(location.lat, location.lon);
    if (!this.originalUserLocationName) {
      this.geocoder.geocode({
        'latLng': latLng,
      }).then((res) => {
        let userLocationName;
        for (let i = res.results.length - 1; i >= 0; i--) {
          const component = res.results[i];
          if (component.types.includes('postal_code')) {
            userLocationName = component.formatted_address;
            break;
          } else if (component.types.includes('neighborhood')) {
            userLocationName = component.formatted_address;
          }
        }
        this.originalUserLocationName = userLocationName;
        this.setOriginalLocation();
      });
    }

    this.map.setZoom(DEFAULT_ZOOM_LEVEL);
    this.filterRetailers();
    const locationTypeahead = document.getElementById('location-typeahead');
    locationTypeahead.value = '';
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
      ...Object.keys(this.collectionsByRetailers).sort()
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

    //submit btn
    const submitBtnContainer = document.getElementById('filterButton');
    const submitBtn = document.createElement('button');
    submitBtn.classList.add('button');
    submitBtn.setAttribute('type', 'button');
    submitBtn.innerHTML = 'SEARCH';
    submitBtnContainer.append(submitBtn);
    submitBtn.addEventListener('click', this.filterRetailers);

    // reset btn  
    const resetBtnContainer = document.getElementById('resetButton');
    const resetBtn = document.createElement('button');
    resetBtn.classList.add('link-button');
    resetBtn.setAttribute('type', 'button');
    resetBtn.innerHTML = 'CLEAR SEARCH';
    resetBtnContainer.append(resetBtn);
    resetBtn.addEventListener('click', this.resetFilters);
  };

  setupFilterData = async (rawRetailers) => {
    const userLocation = await this.getUserLocation();
    this.userLocation = userLocation;
    // filter cuz bad data
    this.retailersByDistance = rawRetailers.filter((retailer) => !!retailer.location).map((retailer) => {
      const withDistance = { ...retailer };
      const { location: storeLocation } = retailer;
      const distance = this.getDistanceBtwnTwoPts(storeLocation, userLocation);
      withDistance.distanceFromUser = parseInt(`${distance}`);
      return withDistance;
    });
    const collectionsByRetailers = {};
    const retailersById = {};
    rawRetailers.forEach(
      (retailer) => {
        retailersById[retailer.bridalLiveRetailerId] = retailer;
        retailer.collectionsAvailableCollection.items.forEach((collection) => {
          if (collection) {
            const retailersWithCollection = collectionsByRetailers[collection.collectionName] || [];
            retailersWithCollection.push(retailer.retailerName);
            collectionsByRetailers[collection.collectionName] = retailersWithCollection;
          }
        });
      }
    );
    this.collectionsByRetailers = collectionsByRetailers;
    this.retailersById = retailersById;
    this.createFilterElements();
    // top caller needs retailer by distance
    // could use instance var but  flows better just popping it back up
    return this.retailersByDistance;
  }

  getRetailerData = async () => {
    const query = `
      query {
        retailersCollection {
            items {
                retailerName
                retailerCity
                website
                state
                bridalLiveRetailerId
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
                retailerStreet
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
    const retailers = latLoc.data.retailersCollection.items;
    return this.setupFilterData(retailers);
  };

  sortRetailers = (evt, override = null) => {
    const sortBy = override || evt?.target?.value || this.sortBy;
    this.sortBy = sortBy;
    if (sortBy === 'name') {
      this.retailers = this.retailers.sort((a, b) => a.retailerName.localeCompare(b.retailerName));
    } else if (sortBy === 'distance') {
      this.retailers = this.retailers.sort((a, b) => parseFloat(a.distanceFromUser) - parseFloat(b.distanceFromUser));
    }
    this.paintMapAndRetailers(this.retailers);
  };

  addSortSelectOptions = () => {
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', this.sortRetailers);
    this.SORTABLES.forEach((sortable) => {
      const sortOption = document.createElement('option');
      sortOption.value = sortable.value;
      sortOption.innerText = sortable.display;
      sortSelect.append(sortOption);
    });
    // default to distance
    const initialSort = this.SORTABLES[1].value;
    sortSelect.value = initialSort;
    this.sortRetailers(null, initialSort);
  };

  // google maps api has no way to reference existing markers
  // so we have to re-paint every time the data to show, retailerData, changes
  // or if we want to center a specific marker, in the case of a hover event
  // so this method is called anytime the data to show changes or when a 
  // retailer marker needs to be centered and highlighted
  paintMapAndRetailers = (retailerData, centerRetailer = null) => {
    const map = this.map || new google.maps.Map(document.getElementById('map'), {
      zoom: 2,
      // center: { lat: this.userLocation.lat, lng: this.userLocation.lon },
      center: { lat: 36, lng: -60 },
    });
    if (!this.map) {
      this.map = map;
    }
    const infoWindow = new google.maps.InfoWindow({
      content: '',
      disableAutoPan: true,
    });
    const markers = retailerData.map((retailer) => {
      const display = `
        ${retailer.retailerName} <br/>
        ${retailer.distanceAway.toFixed(2)} miles away
      `
      return this.getMarker(retailer.location, display, infoWindow, retailer.bridalLiveRetailerId, centerRetailer);
    });
    // Add a marker clusterer to manage the markers.
    // const userLocationMarker = this.getMarker(this.userLocation, 'Your Location', infoWindow);
    // markers.push(userLocationMarker);
    if (!this.markerClusterer) {
      this.markerClusterer = new MarkerClusterer({ markers: markers, map })
    } else {
      this.markerClusterer.clearMarkers();
      this.markerClusterer.addMarkers(markers);
    }
    // when we have a center retailer we are highlighting on an existing retailerInfo already
    // so no neeed to recreate - also creates infinite loop with event handling
    if (!centerRetailer) {
      this.addRetailerInfo(retailerData);
    }
  };

  openDetailsModal = (retailer) => {
    const detailElement = document.createElement('div');
    detailElement.classList.add('retailer-details');

    const header = document.createElement('div');
    header.classList.add('retailer-header');

    if (retailer.featured) {
      const featuredElement = document.createElement('span');
      featuredElement.classList.add('featured');
      header.append(featuredElement);
    }

    if (retailer.disneyPlatinumCollection) {
      const dpcElement = document.createElement('span');
      dpcElement.classList.add('disney');
      header.append(dpcElement);
    }

    const nameElement = document.createElement('h2');
    nameElement.classList.add('header-title');
    nameElement.innerText = retailer.retailerName;
    header.append(nameElement);

    const locationElement = document.createElement('span');
    locationElement.classList.add('location');
    locationElement.innerText = `${retailer.retailerCity}, ${retailer.state}`;
    header.append(locationElement);
    detailElement.append(header);

    const collections = document.createElement('div');
    collections.classList.add('collections');
    const collectionsHeader = document.createElement('span');
    collectionsHeader.classList.add('retailer-label');
    collectionsHeader.innerText = 'COLLECTIONS';
    collections.append(collectionsHeader);

    const collectionsList = document.createElement('div');
    collectionsList.classList.add('collections-list');
    for (const collection of retailer.collectionsAvailableCollection.items) {
      if (collection) {
        var collectionItem = document.createElement('span');
        if (collection.collectionButtonUrl == null) {
          //collectionItem.setAttribute("href", "#");
        } else {
          //collectionItem.setAttribute("href", collection.collectionButtonUrl);
          //collectionItem.setAttribute("target", "_blank");
        }
        collectionItem.classList.add('collection-item');
        collectionItem.classList.add('retailer-detail');
        collectionItem.innerText = collection.collectionName;
        collectionsList.append(collectionItem);
      }
    };
    collections.append(collectionsList);
    detailElement.append(collections);

    const address = document.createElement('div');
    address.classList.add('retailer-address');
    const addressLabel = document.createElement('span');
    addressLabel.classList.add('retailer-label');
    addressLabel.innerText = 'ADDRESS';
    address.append(addressLabel);
    const streetAddress = document.createElement('div');
    streetAddress.classList.add('street-address');
    streetAddress.classList.add('retailer-detail');
    streetAddress.innerText = retailer.retailerStreet;
    address.append(streetAddress);
    const directions = document.createElement('a');
    directions.classList.add('directions');
    directions.innerText = 'GET DIRECTIONS'
    const start = this.originalUserLocationName.replaceAll(',', '').replaceAll(' ', '+');
    const destination = retailer.retailerStreet.replaceAll(',', '').replaceAll(' ', '+');
    directions.setAttribute('href', `https://www.google.com/maps?saddr=${start}&daddr=${destination}`);
    directions.setAttribute('target', '_blank');
    directions.setAttribute('rel', 'noopener noreferrer');
    address.append(directions);
    detailElement.append(address);

    const phone = document.createElement('div');
    phone.classList.add('phone');
    const phoneLabel = document.createElement('div');
    phoneLabel.classList.add('retailer-label');
    phoneLabel.innerText = 'PHONE';
    phone.append(phoneLabel);
    const phoneNumber = document.createElement('a');
    phoneNumber.setAttribute("href", `tel:${retailer.phoneNumber}`);
    phoneNumber.classList.add('retailer-detail');
    phoneNumber.innerText = retailer.phoneNumber;
    phone.append(phoneNumber)
    detailElement.append(phone);

    var retailerUrl = document.createElement('div');
    retailerUrl.classList.add('retailer-url');
    const retailerUrlLink = document.createElement('a');
    retailerUrlLink.setAttribute("href", `${retailer.website}`);
    retailerUrlLink.setAttribute("target", "_blank");
    retailerUrlLink.innerText = retailer.website;
    retailerUrl.append(retailerUrlLink);
    detailElement.append(retailerUrl);

    const scheduleBtn = document.createElement('button');
    scheduleBtn.setAttribute('type', 'button');
    scheduleBtn.classList.add('schedule-btn');
    scheduleBtn.classList.add('book-appt');

    const btnText = document.createElement('span');
    btnText.innerText = 'BOOK AN APPOINTMENT'
    scheduleBtn.append(btnText);
    scheduleBtn.addEventListener('click', () => this.openScheduler(retailer));

    detailElement.append(scheduleBtn);

    //Add Request Appointment Button
    const requestBtn = document.createElement('button');
    requestBtn.setAttribute('type', 'button');
    requestBtn.classList.add('schedule-btn');

    const requestBtnText = document.createElement('span');
    requestBtnText.innerText = 'REQUEST AN APPOINTMENT'
    requestBtn.append(requestBtnText);
    requestBtn.addEventListener('click', () => this.openRequestForm(retailer));

    if (retailer.requestAppointment) {
      detailElement.append(requestBtn);
    }


    const modal = defaultModal({ size: 'normal', skipCache: true });
    modal.open();
    modal.updateContent(detailElement, { wrap: true });
  };

  getDirectBookingElem = (retailerId) => {
    const scheduler = document.createElement('iframe');
    scheduler.setAttribute('src', `https://app.bridallive.com/forms.html?formType=scheduler&retailerId=${retailerId}`);
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


  openScheduler = (retailer) => {
    const modal = defaultModal({ size: 'large', skipCache: true });
    modal.open();
    let elem;
    if (retailer.bridalLiveRetailerId) {
      elem = this.getDirectBookingElem(retailer.bridalLiveRetailerId);
    } else {
      // TODO style this form
      // should just need a scrollable modal with padding
      // like the designs
      // and figure out why the generic form-input /label etc classes
      // arent styling the inputs like they are in the side menu filters
      elem = this.getEmailBookingForm(retailer);
    }
    modal.updateContent(elem);
  }
  openRequestForm = (retailer) => {
    let elem;
    if (retailer.bridalLiveRetailerId) {
      window.location.href = '/request-appointment?retailerId=' + retailer.bridalLiveRetailerId + '&retailerName=' + retailer.retailerName;
      //redirect to custom form appending query string

    } else {
      window.location.href = '/request-appointment?retailerName=' + retailer.retailerName;
    }

  }
};
