import PageManager from "../page-manager";
import regeneratorRuntime from "regenerator-runtime";

export default class RetailFinder extends PageManager {
    constructor(context) {
        super(context);
        this.pageContent = document.querySelector('.page-content');
        this.pageContent.innerHTML = `
        <form class="form">
                <h2 class="blog-title retail-finder-title"><strong>Try It On</strong></h2>
                <div class="form-field">
                    <span class="form-label">Within</span>
                    <select class="form-select selector-dropdown">
                        <option>50 Miles</option>
                        <option>100 Miles</option>
                        <option>150 Miles</option>
                    </select>
                </div>
                <div class="form-field">
                    <span class="form-label">of</span>
                    <input class="form-input selector-dropdown" type="text" />
                </div>
                <div class="form-field">
                    <span class="form-label">carrying</span>
                    <select class="form-select selector-dropdown">
                        <option selected>Any Collection</option>
                        <option>100</option>
                        <option>150</option>
                    </select>
                </div>
                <div class="form-field--checkbox">
                    <span>View Map</span>
                    <input class="form-label" type="checkbox" />
                </div>
                <div class="buttons-container">
                    <button class="button">SEARCH</button>
                </div>
        </form>
        `;
    }

    onReady() {    
        const retailFinderResults = document.getElementById('retail-finder-results');
        
        const showGraphQlData = () => {
            const query = `
                query {
                    retailersCollection {
                    items{
                        retailerName,
                        retailerCity,
                        state
                    }
                    }
                }
            `;
            
            // NON ASYNC FETCH /////////////////////
            // fetch("https://graphql.contentful.com/content/v1/spaces/y49u4slmhh3t/", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //         Authorization: "Bearer gfV8uz8VRPcukDWe6Xf22_vlvkfz5-w83Bo7JRDpAUY"
            //     },
            //     body: JSON.stringify({
            //         query
            //     })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     console.log(data.data)
            // })
            // .catch(error => console.log(error));
    
        async function getCharacters() {
            let results = await fetch("https://graphql.contentful.com/content/v1/spaces/y49u4slmhh3t/", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer gfV8uz8VRPcukDWe6Xf22_vlvkfz5-w83Bo7JRDpAUY"
                },
                body: JSON.stringify({query}),
            });
            let characters = await results.json();
            console.log(characters.data);
            // let display = characters.data.retailersCollection.items[0].retailerName;
            let display = characters.data.retailersCollection.items;
            // let retailerList = display.forEach(element => {
            //     for (let key in element) {
            //         let results = `${key}: ${element[key]}`;
            //         letFilteredResults = results.
            //         console.log(results);
            //         document.getElementById('retail-finder-results').insertAdjacentHTML('afterbegin', results);
            //     }
            // });
            let retailerList = display.forEach(element => {
                let results = Object.values(element).join("\n");
                console.log(results);
                console.log(element.retailerName);
                let retailer = document.createElement('h3');
                retailer.classList.add('retailer-name');
                retailer.innerText = element.retailerName;
                retailFinderResults.append(retailer);
                let retailerAddy = document.getElementsByClassName('retailer-name');
                let retailerCity = document.createElement('span');
                retailerCity.innerText = element.retailerCity;
                retailFinderResults.append(retailerCity);
                let retailerState = document.createElement('span');
                retailerState.innerText =', ' + element.state;
                retailFinderResults.append(retailerState);
            });
        }
    
        getCharacters();
        };
    
        showGraphQlData();
    }
}