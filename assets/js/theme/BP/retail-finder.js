import { MarkerClusterer } from '@googlemaps/markerclusterer'
// import is required by client, not by code
import regeneratorRuntime from 'regenerator-runtime'
import PageManager from '../page-manager'



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
  }

  onReady = async () => {
    await this.paintMapAndRetailers();
    this.addSortSelectOptions();
    this.addEventHandlers();
  }

  addEventHandlers = () => {
    const locationTypeahead = document.getElementById('location-typeahead');
    const autocomplete = new google.maps.places.Autocomplete(locationTypeahead);
    autocomplete.bindTo("bounds", this.map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      console.log("place", place);
    });
  }

  createRetailerItem = (retailer, total, idx) => {
    const container = document.createElement('div');
    container.classList.add('retailer-item');
    // last three which would be in the last row doesnt need a border
    if (idx < total - 3) {
      container.classList.add('bordered');
    }

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

    // todo evaluate platinum collections
    if (true) {

    }

    return container;
  };

  addRetailerInfo = (retailerData) => {
    const retailFinderResults = document.getElementById('retail-finder-results')
    retailFinderResults.innerHTML = "";
    // TODO temp total remove
    const total = 9 || retailerData.length;
    this.retailers = retailerData;
    retailerData.forEach((retailerData, idx) => {
      const retailerItem = this.createRetailerItem(retailerData, total, idx);
      retailFinderResults.append(retailerItem)
    });

    // TODO remove, just duplicating to show multiple rows
    retailerData.forEach((retailerData, idx) => {
      const retailerItem = this.createRetailerItem(retailerData, total, idx + 3);
      retailFinderResults.append(retailerItem)
    });
    retailerData.forEach((retailerData, idx) => {
      const retailerItem = this.createRetailerItem(retailerData, total, idx + 6);
      retailFinderResults.append(retailerItem)
    });
  }

  getMarker = (latLong, display, infoWindow, icon) => {
    const position = {
      lat: latLong.lat,
      lng: latLong.lon
    };
    const marker = new google.maps.Marker({
      position,
      icon
    });

    // markers can only be keyboard focusable when they have click listeners
    // open info window when marker is clicked
    marker.addListener('click', () => {
      infoWindow.setContent(display);
      infoWindow.open(map, marker);
    })
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
          resolve(location)
        },
        (err) => reject(err)
      )
    });

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
    const userLocation = await this.getUserLocation();
    const latLoc = await results.json();
    const retailers = latLoc.data.retailersCollection.items;
    return retailers.map((retailer) => {
      const withDistance = { ...retailer };
      const { location: storeLocation } = retailer;
      const distance = this.getDistanceBtwnTwoPts(storeLocation, userLocation);
      withDistance.distanceFromUser = parseInt(`${distance}`);
      return withDistance;
    });
  };

  sortRetailers = (evt) => {
    const sortBy = evt.target.value;
    // TODO make OOP if we need more than 3 options
    if (sortBy === 'name') {
      this.retailers = this.retailers.sort((a, b) => a.retailerName.localeCompare(b.retailerName));
    } else if (sortBy === 'distance') {
      this.retailers = this.retailers.sort((a, b) => parseFloat(a.distanceFromUser) - parseFloat(b.distanceFromUser));
    } else {
      this.retailers = [...this.originalRetailers];
    }
    this.paintMapAndRetailers();
  };

  addSortSelectOptions = () => {
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', this.sortRetailers);
    const defaultSort = document.createElement('option');
    defaultSort.value = 'default';
    defaultSort.innerText = 'N/A';
    sortSelect.append(defaultSort);
    this.SORTABLES.forEach((sortable) => {
      const sortOption = document.createElement('option');
      sortOption.value = sortable.value;
      sortOption.innerText = sortable.display;
      sortSelect.append(sortOption);
    });
    sortSelect.value = defaultSort.value;
  }

  paintMapAndRetailers = async () => {
    const retailerData = this.retailers.length ? this.retailers : await this.getRetailerData();
    if (!this.originalRetailers.length) {
      this.originalRetailers = [...retailerData];
    };
    this.retailers = retailerData;
    const userLocation = await this.getUserLocation();
    // TODO: filter array based on chosen mile radius
    const map = this.map || new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: { lat: userLocation.lat, lng: userLocation.lon },
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
      return this.getMarker(loc.location, display, infoWindow, {
        path: 'M10 0C4.5 0 0 4.5 0 10c0 7.4 9.1 13.6 9.4 13.8.2.1.4.2.6.2s.4-.1.6-.2c.3-.2 9.4-6.4 9.4-13.8 0-5.5-4.5-10-10-10zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z',
        fillColor: '#373c3f',
        fillOpacity: 1,
        strokeWeight: 1,
      })
    });
    // Add a marker clusterer to manage the markers.
    const userLocationMarker = this.getMarker(userLocation, 'Your Location', infoWindow, {
      path: 'M10 0C4.5 0 0 4.5 0 10c0 7.4 9.1 13.6 9.4 13.8.2.1.4.2.6.2s.4-.1.6-.2c.3-.2 9.4-6.4 9.4-13.8 0-5.5-4.5-10-10-10zm0 14c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z',
      fillColor: '#fe948a',
      fillOpacity: 1,
      strokeWeight: 1,

    });
    markers.push(userLocationMarker);
    new MarkerClusterer({ markers, map })

    this.addRetailerInfo(retailerData);
  }
};
