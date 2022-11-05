import { MarkerClusterer } from '@googlemaps/markerclusterer'
import regeneratorRuntime from 'regenerator-runtime'
import PageManager from '../page-manager'



export default class RetailFinder extends PageManager {
  constructor(context) {
    super(context)
    this.pageContent = document.querySelector('.page-content')
  }

  onReady() {
    this.showRetailerNameAddy();
    this.showRetailerLocation();

    // this.showRetailerResults();
  }


  createRetailerItem = (retailerData, total, idx) => {
    const container = document.createElement('div');
    container.classList.add('retailer-item');
    // last three which would be in the last row doesnt need a border
    if (idx < total - 3) {
      container.classList.add('bordered');
    }

    const nameHeader = document.createElement('div');
    nameHeader.classList.add('retailer-title');
    nameHeader.innerText = retailerData.retailerName;
    container.append(nameHeader);

    const locationInfo = document.createElement('div');
    locationInfo.classList.add('retailer-location');
    const cityState = document.createElement('span');
    cityState.classList.add('retailer-city-state');
    cityState.innerText = `${retailerData.retailerCity}, ${retailerData.state}`;
    locationInfo.append(cityState);
    const distance = document.createElement('span');
    distance.classList.add('retailer-distance');
    //TODO figure out how to calculate this
    distance.innerText = '3.2 miles away';
    locationInfo.append(distance);
    container.append(locationInfo);

    const numCollections = document.createElement('span');
    numCollections.classList.add('retailer-collection-count');
    numCollections.innerHTML = `Carries ${retailerData.collectionsAvailableCollection.items.length} collections`;
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

  showRetailerNameAddy = () => {
    const self = this;
    const query = `
            query {
                retailersCollection {
                    items {
                        retailerName
                        retailerCity
                        state
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
            }
        `

    async function getRetailerInfo() {
      let results = await fetch(
        'https://graphql.contentful.com/content/v1/spaces/y49u4slmhh3t/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer gfV8uz8VRPcukDWe6Xf22_vlvkfz5-w83Bo7JRDpAUY',
          },
          body: JSON.stringify({ query }),
        }
      )
      const resultJson = await results.json();

      const retailFinderResults = document.getElementById('retail-finder-results')

      // TODO temp total remove
      const total = 9 || resultJson.data.retailersCollection.items.length;
      resultJson.data.retailersCollection.items.forEach((retailerData, idx) => {
        const retailerItem = self.createRetailerItem(retailerData, total, idx);
        retailFinderResults.append(retailerItem)
      });

      // TODO remove, just duplicating to show multiple rows
      resultJson.data.retailersCollection.items.forEach((retailerData, idx) => {
        const retailerItem = self.createRetailerItem(retailerData, total, idx + 3);
        retailFinderResults.append(retailerItem)
      });
      resultJson.data.retailersCollection.items.forEach((retailerData, idx) => {
        const retailerItem = self.createRetailerItem(retailerData, total, idx + 6);
        retailFinderResults.append(retailerItem)
      });
    }

    getRetailerInfo();
  }

  showRetailerLocation = () => {
    function initMap() {
      let array = []
      const query = `
                query {
                    retailersCollection {
                    items{
                        location {
                            lat
                            lon
                        }
                    }
                    }
                }
            `
      const getDistanceBtwnTwoPts = (mk1, mk2) => {
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
      }

      const getUserLocation = () =>
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
        })

      async function getRetailerLoc() {
        let results = await fetch(
          'https://graphql.contentful.com/content/v1/spaces/y49u4slmhh3t/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                'Bearer gfV8uz8VRPcukDWe6Xf22_vlvkfz5-w83Bo7JRDpAUY',
            },
            body: JSON.stringify({ query }),
          }
        )

        const userLocation = await getUserLocation()
        let latLoc = await results.json()
        let displayLatLoc = latLoc.data.retailersCollection.items
        displayLatLoc.forEach((store) => {
          const { location: storeLocation } = store
          const distance = getDistanceBtwnTwoPts(storeLocation, userLocation)

          storeLocation.lat = parseInt(`${store.location.lat}`)
          storeLocation.lon = parseInt(`${store.location.lon}`)
          storeLocation.distanceFromUser = parseInt(`${distance}`)
        })

        // TODO: filter array based on chosen mile radius
        const map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: { lat: 34.05223, lng: -118.243 },
          disableDefaultUI: true,
        })
        const infoWindow = new google.maps.InfoWindow({
          content: '',
          disableAutoPan: true,
        })
        // Add some markers to the map.
        const markers = array.map((position) => {
          const marker = new google.maps.Marker({
            position,
          })

          // markers can only be keyboard focusable when they have click listeners
          // open info window when marker is clicked
          marker.addListener('click', () => {
            infoWindow.setContent('blah')
            infoWindow.open(map, marker)
          })
          return marker
        })

        // Add a marker clusterer to manage the markers.
        new MarkerClusterer({ markers, map })
      }

      getRetailerLoc()
    }
    initMap()
  }
}
