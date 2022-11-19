import { MarkerClusterer } from '@googlemaps/markerclusterer'
// import is required by client, not by code
import regeneratorRuntime from 'regenerator-runtime'
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
}

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
    autocomplete.bindTo("bounds", this.map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place) {

        this.selectedPlace = place;
        if (needsInitialFilter) {
          this.filterRetailers();
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
  }

  createRetailerItem = (retailer, total, idx) => {
    const mainContainer = document.createElement('div');
    mainContainer.classList.add('retailer-item-container');
    const container = document.createElement('div');
    container.classList.add('retailer-item');
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
    distance.innerText = `${retailer.distanceFromUser} miles away`;
    container.append(distance);

    const numCollections = document.createElement('span');
    numCollections.classList.add('retailer-collection-count');
    numCollections.innerText = `Carries ${retailer.collectionsAvailableCollection.items.length} collections`;
    container.append(numCollections)

    // todo evaluate featured
    if (true) {
      const featuredCollections = document.createElement('svg');
      const icon = document.createElement('use');
      icon.setAttribute('xlink:href', '#icon-retailer-featured');
      featuredCollections.append(icon);
      container.append(featuredCollections);
    }

    // TODO
    // Need to figure out pagination and map marker - what to show?
    // May set up event driven setup
    // Hover either or fire event to center it on the map?
    // Click it to filter the list? 
    //

    // todo evaluate platinum collections
    if (true) {

    }

    return mainContainer;
  };

  addRetailerInfo = (retailerData) => {
    const retailFinderResults = document.getElementById('retail-finder-results')
    retailFinderResults.innerHTML = "";
    const total = retailerData.length;
    this.retailers = retailerData;
    retailerData.forEach((retailerData, idx) => {
      const retailerItem = this.createRetailerItem(retailerData, total, idx);
      retailFinderResults.append(retailerItem)
    });
  }

  getMarker = (latLong, display, infoWindow, id = null) => {
    const position = {
      lat: latLong.lat,
      lng: latLong.lon
    };
    const marker = new google.maps.Marker({
      position,
      icon: MAP_MARKER_BLACK
    });

    // markers can only be keyboard focusable when they have click listeners
    // open info window when marker is clicked
    marker.addListener('click', () => {
      infoWindow.setContent(display);
      infoWindow.open(map, marker);
    });

    google.maps.event.addListener(marker, "mouseover", function () {
      marker.setIcon(MAP_MARKER_ORANGE);
      this.hoveredId = id;
    });
    google.maps.event.addListener(marker, "mouseout", function () {
      marker.setIcon(MAP_MARKER_BLACK);
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

  getUserLocation = async () =>
    new Promise((resolve, reject) => {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }
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
                //hopefully we have at least one of these ,if not keep going, do later
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
          resolve(location);
        },
        (err) => reject(err)
      )
    });

  applyFilters = (filterType, evt) => {
    this.appliedFilters[filterType] = evt.target.value;
  };

  filterRetailers = () => {
    const toRemove = [];
    this.retailers = [...this.originalRetailers];
    this.retailers.forEach(
      (retailer) => {
        Object.entries(this.appliedFilters).forEach(([filterName, value]) => {
          if (filterName === 'distance' && this.selectedPlace) {
            const selectedLocation = {
              lat: this.selectedPlace.geometry.location.lat(),
              lon: this.selectedPlace.geometry.location.lng(),
            }
            const distanceAway = this.getDistanceBtwnTwoPts(selectedLocation, retailer.location);
            if (distanceAway > value) {
              toRemove.push(retailer.retailerName);
            }
          };
          if (filterName === 'collection' && value !== 'All') {
            const retailersWithSelected = this.collectionsByRetailers[value];
            if (!retailersWithSelected.includes(retailer.retailerName)) {
              toRemove.push(retailer.retailerName);
            }
          };
        });
      }
    );
    this.retailers = this.retailers.filter(
      (retailer) => !toRemove.includes(retailer.retailerName)
    );
    this.sortRetailers();
    this.paintMapAndRetailers(this.retailers);
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
    this.selectedPlace = this.originalUserLocationPlace;
    this.autocomplete.set('place', this.originalUserLocationPlace);

    this.filterRetailers();
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
                state
                bridalLiveRetailerId
                location {
                    lat
                    lon
                }
                collectionsAvailableCollection {
                    items {
                        collectionName
                    }
                }
            }
        }
    }`
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
  }

  paintMapAndRetailers = async (retailerData) => {
    // TODO: filter array based on chosen mile radius
    const map = this.map || new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: { lat: this.userLocation.lat, lng: this.userLocation.lon },
    });
    if (!this.map) {
      this.map = map;
    }
    const infoWindow = new google.maps.InfoWindow({
      content: '',
      disableAutoPan: true,
    });

    // Add some markers to the map. 
    const markers = retailerData.map((loc) => {
      const display = `
        ${loc.retailerName} <br/>
        ${loc.distanceFromUser} miles away
      `
      return this.getMarker(loc.location, display, infoWindow, retailerData.bridalLiveRetailerId);
    });
    // Add a marker clusterer to manage the markers.
    const userLocationMarker = this.getMarker(this.userLocation, 'Your Location', infoWindow);
    markers.push(userLocationMarker);
    if (!this.markerClusterer) {
      this.markerClusterer = new MarkerClusterer({ markers: markers, map })
    } else {
      this.markerClusterer.clearMarkers();
      this.markerClusterer.addMarkers(markers);
    }
    this.addRetailerInfo(retailerData);
  }
};
