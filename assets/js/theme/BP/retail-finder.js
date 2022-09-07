import { MarkerClusterer } from '@googlemaps/markerclusterer'
import PageManager from '../page-manager'

export default class RetailFinder extends PageManager {
  constructor(context) {
    super(context)
    this.pageContent = document.querySelector('.page-content')
  }

  onReady() {
    this.showRetailerNameAddy()
    this.showRetailerLocation()
  }

  showRetailerNameAddy = () => {
    const retailFinderResults = document.getElementById('retail-finder-results')
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
                        collectionsCollection {
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
      let {
        data: {
          retailersCollection: { items: display },
        },
      } = await results.json()

      let retailerList = display.forEach((element) => {
        let results = Object.values(element).join('\n')

        let retailer = document.createElement('h3')
        retailer.classList.add('retailer-name')
        retailer.innerText = element.retailerName

        let resultsContainer = document.createElement('div')
        resultsContainer.classList.add('results-container')
        resultsContainer.style.cssText += 'padding: 0 15px'
        resultsContainer.append(retailer)

        let retailerAddy = document.getElementsByClassName('retailer-name')

        let retailerLocation = document.createElement('p')
        retailerLocation.classList.add('retailer-city')
        retailerLocation.innerText = `${element.retailerCity}, ${element.state}`
        resultsContainer.append(retailerLocation)

        if (element.collectionsCollection.items.length > 0) {
          const collectionsContainer = document.createElement('div')
          let collectionsTitle = document.createElement('h5')
          collectionsTitle.innerText = 'Collections:'
          collectionsContainer.append(collectionsTitle)

          element.collectionsCollection.items.map((col) => {
            let collections = document.createElement('div')
            collections.classList.add('collections')
            collections.innerText = col.collectionName
            collectionsContainer.append(collections)
          })

          resultsContainer.append(collectionsContainer)
        }

        retailFinderResults.append(resultsContainer)
      })
    }

    getRetailerInfo()
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
