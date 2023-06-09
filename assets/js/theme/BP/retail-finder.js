import { MarkerClusterer } from '@googlemaps/markerclusterer'
// import is required by client, not by code
import regeneratorRuntime from 'regenerator-runtime'
import { debounce } from 'lodash';
import { defaultModal } from '../global/modal';
import PageManager from '../page-manager'
import $ from 'jquery';
import 'jstree';

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
  radius: 'distanceFilterSelect',
  locationOrcode: "location-typeahead"
};

const DISTANCE_TO_ZOOMLEVELS = {
  10: 10,
  25: 10,
  50: 8,
  100: 8,
  250: 5,
};

const TEMPDATA = [
  {
    "id": "collection0", "parent": "#", "text": "Show All Collections", 'state': {
      'selected': true,
    },
  },
  {
    "id": "collection1", "parent": "#", "text": "Abella", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection2", "parent": "#", "text": "Allure Bridals", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection3", "parent": "#", "text": "Allure Couture", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection4", "parent": "#", "text": "Madison James", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection5", "parent": "#", "text": "Allure Modest", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection6", "parent": "#", "text": "Allure Romance", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection7", "parent": "#", "text": "Wilderly Bride", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection8", "parent": "#", "text": "Bridesmaids", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection9", "parent": "#", "text": "Disney Fairy Tale Weddings", 'state': {
      'selected': true
    }
  },
  {
    "id": "collection10", "parent": "#", "text": "Suits & Tuxedos", 'state': {
      'opened': true,
      'selected': true
    },
  },
  { "id": "collection11", "parent": "collection10", "text": "Ridge" },
  { "id": "collection12", "parent": "collection10", "text": "Brunswick" },
  { "id": "collection13", "parent": "collection10", "text": "Vow" },
  { "id": "collection14", "parent": "collection10", "text": "Venice Velvet" },
  { "id": "collection15", "parent": "collection10", "text": "Tuxedo" },
]

const DEFAULT_ZOOM_LEVEL = 4;
const INITIAL_MAP = {
  zoom: 2.2,
  center: { lat: 10, lng: -60 },
  styles: [
    {
        "stylers": [
            {
                "saturation": -100
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": 50
            },
            {
                "gamma": 0
            },
            {
                "hue": "#50a5d1"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#333333"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text",
        "stylers": [
            {
                "weight": 0.5
            },
            {
                "color": "#333333"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.icon",
        "stylers": [
            {
                "gamma": 1
            },
            {
                "saturation": 50
            }
        ]
    }
]
}
const HOVER_DEFAULT_ZOOM_LEVEL = 10;

const MARKER_HOVER_EVENT = 'markerHoverEvent';
const RETAILER_ITEM_HOVER_EVENT = 'retailerItemHoverEvent';
const debounceTimeOut = 1000;
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
    this.collectionsByRetailers = {};
    this.originalFilters = {
      radius: 25,
      collections: [],
      city: '',
      zip: null,
      storeName: '',
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

  onReady = () => {
    $('.on-off-map').prop('checked', true);
    this.paintMapAndRetailers(this.retailers);
    this.createFilterElements();
    this.addEventHandlers();

    const self = this;

    $('.filter-visible').click(function () {
      $(this).text(function (i, text) {
        if (text === 'HIDE FILTER') {
          $('.map-filters').animate({ maxHeight: '1050px' }, 300);
          return 'SHOW FILTER';
        } else {
          $('.map-filters').animate({ maxHeight: '1700px' }, 300);
          return 'HIDE FILTER';
        }
      })
      $('.option-filters').slideToggle(300);
    });

    $("#name-typeahead").on("input", function () {
      const searchTerm = $(this).val().toLowerCase();
      self.applyFilters('storeName', searchTerm);
    });

    $(".on-off-map").change(function () {
      let element = $('.map');
      if ($(this).is(':checked')) {
        element.show();
      } else {
        element.hide();
      }
    });

    $(document).keypress(function (event) {
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode === 13) {
        self.filterRetailers();
        $("#filterButton .button").click()
      }
    });

  };

  addEventHandlers = () => {
    const locationTypeahead = document.getElementById('location-typeahead');
    const autocomplete = new google.maps.places.Autocomplete(locationTypeahead, { types: ['(regions)'] });
    const submitBtn = document.getElementById('filterButton');
    // hacking a switch to know whether or not we should filter on first page load
    // we cant put it after this call b/c the event handler is what sets the
    // the google places input look up and runs async..
    // could break this out but deadline is nearing... 
    const needsInitialFilter = !this.autocomplete;

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
        this.selectedPlace = {
          lat: place.geometry.location.lat(),
          lon: place.geometry.location.lng(),
        }
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

    locationTypeahead.addEventListener('input', (e) => {
      if (!e.target.value) {
        this.selectedPlace = null;
        submitBtn.disabled = true;
        locationTypeahead.classList.add('error');
      } else {
        submitBtn.disabled = false;
        locationTypeahead.classList.remove('error');
      }
    });

    this.autocomplete = autocomplete;

    // hover events
    document.addEventListener(MARKER_HOVER_EVENT, (evt) => {
      const retailerId = evt.detail;
      if (retailerId) {
        const retailerItem = document.getElementById(retailerId);
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
      } else {
        this.paintMapAndRetailers(this.retailers, null, true);
      }
    });
    const self = this;
   
    $("#appointmentFilter").change(function () {
      let availableAppointment = [...self.retailers];
      if(self.retailers.length && $(this).is(':checked'))
      {
        availableAppointment = self.retailers.filter( item => item.requestAppointment === true);
      }

      self.paintMapAndRetailers(availableAppointment,null, false, true);

    });
    $('#appointmentFilterLabel').click(function(){
      $("#appointmentFilter").trigger('click');
      $("#appointmentFilter").trigger('change');

  });
  };

  createRetailerItem = (retailer, total, idx) => {
    const mainContainer = document.createElement('div');

    mainContainer.classList.add('retailer-item-container');
    const container = document.createElement('div');
    container.classList.add('retailer-item');
    // set the id to allow querying when hovering on markers
    container.id = retailer.id;
    // any of last three which would be in the last row doesnt need a border
    const rowsWithBorder = Math.floor(total / 3);
    const firstIdxWithoutBorder = rowsWithBorder * 3
    if (idx < firstIdxWithoutBorder) {
      mainContainer.classList.add('bordered');
    }

    const badgeCollectionsForFeatured = document.createElement('div');

    if (retailer.featured) {
      const featuredCollections = document.createElement('span');
      featuredCollections.classList.add('featured');
      badgeCollectionsForFeatured.append(featuredCollections);
    }

    container.append(badgeCollectionsForFeatured)
    mainContainer.append(container);

    const itemHeader = document.createElement('div');
    itemHeader.classList.add('retailer-item-header');

    const title = document.createElement('span');
    title.classList.add('retailer-title')
    title.innerText = retailer.retailerName;
    itemHeader.append(title);

    const distance = document.createElement('span');
    distance.classList.add('retailer-distance');
    distance.innerText = parseInt(`${this.getDistanceBtwnTwoPts(this.selectedPlace, retailer.location)}`) + ` miles`;

    itemHeader.append(distance);
    container.append(itemHeader);

    const location_direction = document.createElement('div');
    location_direction.classList.add('retailer-location-direction')
    const locationInfo = document.createElement('div');
    locationInfo.classList.add('retailer-location');
    const cityState = document.createElement('span');
    cityState.classList.add('retailer-city-state');
    const city = document.createElement('span');
    city.innerText = `${retailer.retailerCity}, `;
    const state = document.createElement('span');
    state.classList.add('state');
    state.innerText = `${retailer.state}`;
    cityState.append(city);
    cityState.append(state);
    locationInfo.append(cityState);
    location_direction.append(locationInfo);

    const directions = document.createElement('a');
    directions.classList.add('directions');
    directions.innerText = 'DIRECTIONS'
    const destination = retailer.retailerStreet.replaceAll(',', '').replaceAll(' ', '+');
    directions.setAttribute('href', `https://www.google.com/maps?daddr=${destination}`);
    directions.setAttribute('target', '_blank');
    directions.setAttribute('rel', 'noopener noreferrer');
    location_direction.append(directions);

    container.append(location_direction);

    const collections = document.createElement('span');
    collections.classList.add('retailer-collections');

    let collectionItems = [];
    retailer.collectionsAvailableCollection.items.forEach(item => {
      collectionItems.push(item.collectionName)
    })

    collections.innerText = `${collectionItems.join(', ')}`;
    container.append(collections);

    const badgeCollectionsForDisney = document.createElement('div');

    if (retailer.disneyPlatinumCollection) {
      const disneyCollections = document.createElement('div');
      disneyCollections.classList.add('disney');
      badgeCollectionsForDisney.append(disneyCollections);
    };

    container.append(badgeCollectionsForDisney);

    const requestBtn = document.createElement('button');
    requestBtn.setAttribute('type', 'button');
    requestBtn.classList.add('schedule-btn');

    const requestBtnText = document.createElement('span');
    requestBtnText.innerText = 'REQUEST AN APPOINTMENT'
    requestBtn.append(requestBtnText);

    //Prevent parent's onclick event.
    requestBtn.addEventListener('click', (event) => {
      this.openRequestForm(retailer);
      event.stopPropagation();
    }
    );

    if (retailer.requestAppointment) {
      container.append(requestBtn);
    }

    // hover events
    mainContainer.addEventListener('mouseenter', () => {
      const retailerHoveredEvent = new CustomEvent(RETAILER_ITEM_HOVER_EVENT, { detail: retailer });
      document.dispatchEvent(retailerHoveredEvent);
    });

    mainContainer.addEventListener('mouseleave', () => {
      const retailerExitEvent = new CustomEvent(RETAILER_ITEM_HOVER_EVENT, { detail: null });
      document.dispatchEvent(retailerExitEvent);
    });

    // click event
    mainContainer.addEventListener('click', () => this.openDetailsModal(retailer));

    return mainContainer;
  };

  addRetailerInfo = (retailerData, flag) => {
    const retailFinderResults = document.getElementById('retail-finder-results');
    retailFinderResults.innerHTML = "";
    const total = retailerData.length;

    const retailers = this.sortRetailers(retailerData, "distance");

    let first_retailer = false;
    retailers.forEach((retailer, idx) => {
      const retailerItem = this.createRetailerItem(retailer, total, idx);
      retailFinderResults.append(retailerItem);
      if (retailer && retailer.winningretailer) {
        first_retailer = retailer;
      }
    });
    if (first_retailer && !flag) {
      this.openDetailsModal(first_retailer);
    }
  }

  getMarker = (latLong, display, infoWindow, id = null, centerRetailer = null) => {
    const position = {
      lat: latLong.lat,
      lng: latLong.lon
    };
    let icon = MAP_MARKER_BLACK;
    if (id && centerRetailer && id === centerRetailer.id) {
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

  applyFilters = (filterType, evt) => {
    switch (filterType) {
      case "radius":
        // adjust zoom for convenience in distance changes 
        const newZoomLevel = DISTANCE_TO_ZOOMLEVELS[evt.target.value];
        this.appliedFilters[filterType] = Number(evt.target.value);
        if (newZoomLevel) {
          this.map.setZoom(newZoomLevel);
        } else {
          this.map.setZoom(DEFAULT_ZOOM_LEVEL);
        }
        break;
      case "collections":
        this.appliedFilters[filterType] = evt;
        break;
      case "storeName":
        this.appliedFilters[filterType] = evt;
        break;
      default:
        break;
    }
  };

  filterRetailers = debounce(() => {
    var self = this;
    var addr = document.querySelector(".location-typeahead");
    if(!addr.value.length) return;
    if (/^\d+$/.test(addr.value)) {
      this.appliedFilters['zip'] = Number(addr.value);
      this.appliedFilters['city'] = '';
    }else{
      this.appliedFilters['zip'] =null;
      this.appliedFilters['city'] = addr.value;
    }
    // Get geocoder instance
    var geocoder = new google.maps.Geocoder();
    // Geocode the address
    geocoder.geocode({address: addr.value}, async function (results, status) {
        self.retailers = [];
        if ((self.appliedFilters.zip || status === google.maps.GeocoderStatus.OK) && results.length > 0 && self.appliedFilters.collections.length){
          self.selectedPlace = {
            lat: results[0].geometry.location.lat(),
            lon: results[0].geometry.location.lng(),
          };
          const res = await self.getRetailerData(self.appliedFilters);
          if (res.flag) {
            if (self.appliedFilters.collections.length === TEMPDATA.length) {
              self.retailers = res.retailers.filter((item) => item.Product_Type === 'Bridal');
            } else {
              self.retailers = res.retailers;
            }
          }
        }
        let availableAppointment = [...self.retailers];
        if($("#appointmentFilter").is(':checked')){
          availableAppointment = [...self.retailers].filter(item => item.requestAppointment === true )
        }
        self.paintMapAndRetailers(availableAppointment);

    })}, debounceTimeOut);

  updateResultsInfo = (retailerData) => {
    const retailerInfoElem = document.getElementById('results-info');
    const resultsInfoText = retailerData.length ? 'PRODUCT STYLES AND AVAILABILITY VARY BY RETAILER' : 'No Results found. Try widening your search.';
    retailerInfoElem.innerText = resultsInfoText;
  };

  resetFilters = () => {
    $("#location-typeahead").val("");
    $("#distanceFilterSelect").val("25");
    $("#collectionFilters").jstree(true).check_all();
    $("#name-typeahead").val("");
    $('#appointmentFilter').prop('checked', false);
    $("#filterButton").attr("disabled", true);
    const selectedCollections = $('#collectionFilters').jstree('get_checked').map((id) => {
      return $('#' + id).text().trim();
    });
    this.applyFilters('collections', selectedCollections);
    this.map.setZoom(INITIAL_MAP.zoom);
    this.map.setCenter({ lat: INITIAL_MAP.center.lat, lng: INITIAL_MAP.center.lng });
    this.retailers = [];
    this.paintMapAndRetailers(this.retailers);
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
    distanceFilterDropdown.id = FILTER_IDS.radius;
    distanceFilterDropdown.classList.add('form-select');
    distanceFilterDropdown.classList.add('selector-dropdown');
    [10, 25, 50, 100, 250].forEach(
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
    distanceFilterDropdown.value = this.appliedFilters.radius;
    distanceContainer.append(distanceFilter);

    distanceFilterDropdown.addEventListener('change', (e) => this.applyFilters('radius', e));

    const self = this;

    $('#collectionFilters').jstree({
      core: {
        data: TEMPDATA,
        themes: {
          variant: "large"
        },
      },
      checkbox: {
        three_state: true
      },
      plugins: ["checkbox"]
    }).on('loaded.jstree', function (e, data) {

      const pdpCollection = new URLSearchParams(window.location.search).get(
        'collection',
      )
      const initialCollection = TEMPDATA.find((item) => {
        return  pdpCollection?.toLowerCase().includes(item.text.toLowerCase())
       
      })

      if (!!pdpCollection && !!initialCollection) {

        $('.filter-visible').click()
        data.instance.uncheck_all()
        data.instance.check_node(initialCollection.id)
      }

      const selectedCollections = $('#collectionFilters')
        .jstree('get_checked')
        .map((id) => {
          return $('#' + id)
            .text()
            .trim()
        })
      self.applyFilters('collections', selectedCollections)

    }).on('select_node.jstree deselect_node.jstree', function (e, data) {
      const checkedNode = $('#collectionFilters').jstree('get_checked')

      if (data.node.id === 'collection0') {
        if (data.node.state.selected) {
          data.instance.check_all(true)
        } else {
          $('#collection0 .jstree-checkbox').css(
            'background-position',
            '-160px, 0',
          )
          data.instance.uncheck_all(true)
        }
      } else {
        if (checkedNode.length === TEMPDATA.length) {
          data.instance.check_all(true)
        } else if (
          checkedNode.length === TEMPDATA.length - 1 &&
          !checkedNode.includes('collection0')
        ) {
          data.instance.check_all(true)
        } else if (checkedNode.length === 0) {
          $('#collection0 .jstree-checkbox').css(
            'background-position',
            '-160px, 0',
          )
        } else if (
          checkedNode.length === 1 &&
          checkedNode.includes('collection0')
        ) {
          data.instance.uncheck_all(true)
          $('#collection0 .jstree-checkbox').css(
            'background-position',
            '-160px, 0',
          )
        } else {
          $('#collection0 .jstree-checkbox').css(
            'background-position',
            '-192px 0',
          )
        }
      }

      const selectedCollections = $('#collectionFilters').jstree('get_checked').map((id) => {
        return $('#' + id).text().trim();
      });
      self.applyFilters('collections', selectedCollections);
      self.filterRetailers();
    });

    //submit btn
    const submitBtnContainer = document.getElementById('filterButton');
    submitBtnContainer.addEventListener('click', this.filterRetailers);

    // reset btn  
    const resetBtnContainer = document.getElementById('resetButton');
    resetBtnContainer.addEventListener('click', this.resetFilters);

  };

  getRetailerData = async (requestData) => {
    let url = this.context.retailFinderFilterUrl
    try {
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        },
      )

      const res = await response.json()

      if (!response.ok) {
        throw new Error(res.error.message)
      }

      return {
        flag: true,
        retailers: res.data.retailersCollection.items,
      }
    } catch (error) {
      return {
        flag: false,
        message: error.message,
      }
    }
  };

  sortRetailers = (retailers, type) => {
    let sortedRetailers = [...retailers];
    switch (type) {
      default:
        sortedRetailers.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
    }
    return sortedRetailers;
  };

  // google maps api has no way to reference existing markers
  // so we have to re-paint every time the data to show, retailerData, changes
  // or if we want to center a specific marker, in the case of a hover event
  // so this method is called anytime the data to show changes or when a 
  // retailer marker needs to be centered and highlighted
  paintMapAndRetailers = (retailerData, centerRetailer = null, skipRetailerInfo = false, flag = false) => {
    const map = this.map || new google.maps.Map(document.getElementById('map'), INITIAL_MAP);
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
        ${this.getDistanceBtwnTwoPts(this.selectedPlace, retailer.location).toFixed(2)} miles away
      `
      return this.getMarker(retailer.location, display, infoWindow, retailer.id, centerRetailer);
    });
    // Add a marker clusterer to manage the markers.
    if (!this.markerClusterer) {
      this.markerClusterer = new MarkerClusterer({ markers: markers, map })
    } else {
      this.markerClusterer.clearMarkers();
      this.markerClusterer.addMarkers(markers);
    }
    // when we have a center retailer we are highlighting on an existing retailerInfo already
    // so no neeed to recreate - also creates infinite loop with event handling
    if (!centerRetailer && !skipRetailerInfo) {
      this.addRetailerInfo(retailerData, flag);
    }
    this.updateResultsInfo(retailerData);
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

    const nameElement = document.createElement('h2');
    nameElement.classList.add('header-title');
    nameElement.innerText = retailer.retailerName;
    header.append(nameElement);

    const locationElement = document.createElement('span');
    locationElement.classList.add('location');
    locationElement.innerText = `${retailer.retailerCity}, ${retailer.state}`;
    header.append(locationElement);
    detailElement.append(header);
    const dot = document.querySelector('.header-svg__border');
    const clone = dot.cloneNode(true)
    detailElement.append(clone);

    const collections = document.createElement('div');
    collections.classList.add('collections');
    const collectionsHeader = document.createElement('div');
    collectionsHeader.classList.add('retailer-label');
    collectionsHeader.innerText = 'COLLECTIONS';
    collections.append(collectionsHeader);

    const collectionsList1 = document.createElement('div');
    const collectionsList2 = document.createElement('div');
    collectionsList1.classList.add('collections-list');
    collectionsList2.classList.add('collections-list');
    retailer.collectionsAvailableCollection.items.forEach((collection, index) => {
      if (collection) {
        var collectionItem = document.createElement('span');
        collectionItem.classList.add('collection-item');
        collectionItem.classList.add('retailer-detail');
        collectionItem.innerText = collection.collectionName;
        index % 2 === 0 ? collectionsList1.append(collectionItem) : collectionsList2.append(collectionItem);
      }
    })
     
    collections.append(collectionsList1);
    collections.append(collectionsList2);
    detailElement.append(collections);

    if (retailer.disneyPlatinumCollection) {
      const dpcElement = document.createElement('div');
      dpcElement.classList.add('disney');
      detailElement.append(dpcElement);
    }

    const address = document.createElement('div');
    address.classList.add('retailer-address');
    const addressLabel = document.createElement('div');
    addressLabel.classList.add('retailer-label');
    addressLabel.innerText = 'ADDRESS';
    address.append(addressLabel);
    const streetAddress = document.createElement('div');
    streetAddress.classList.add('street-address');
    streetAddress.classList.add('retailer-detail');
    streetAddress.innerText = `${retailer.retailerStreet}\n${retailer.retailerCity}, ${retailer.state} ${retailer.zip}`;
    address.append(streetAddress);
    const directions = document.createElement('a');
    directions.classList.add('directions');
    directions.innerText = 'GET DIRECTIONS';
    const destination = retailer.retailerStreet.replaceAll(',', '').replaceAll(' ', '+');
    directions.setAttribute('href', `https://www.google.com/maps?daddr=${destination}`);
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
    retailerUrlLink.innerText = "Visit Retailer Website";
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

    //Add See More Stores Button
    const moreBtn = document.createElement('button');
    moreBtn.setAttribute('type', 'button');
    moreBtn.classList.add('more-btn');

    const moreBtnText = document.createElement('span');
    moreBtnText.innerText = 'SEE MORE STORES'
    moreBtn.append(moreBtnText);
    moreBtn.addEventListener('click', () => modal.close());


    detailElement.append(moreBtn);



    const modal = defaultModal({ size: 'normal', skipCache: true });
    modal.open();
    modal.updateContent(detailElement, { wrap: true });
  };

  getDirectBookingElem = (bridalLiveRetailerId) => {
    const scheduler = document.createElement('iframe');
    scheduler.setAttribute('src', `https://app.bridallive.com/forms.html?formType=scheduler&retailerId=${bridalLiveRetailerId}`);
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
    if (retailer.id) {
      window.location.href = '/request-appointment/?id=' + retailer.id + '&name=' + retailer.retailerName.replace(/&/g, '%26');
      //redirect to custom form appending query string

    } else {
      window.location.href = '/request-appointment/?name=' + retailer.retailerName;
    }
  }
};