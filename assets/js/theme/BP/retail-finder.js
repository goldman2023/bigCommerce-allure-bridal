import PageManager from "../page-manager";
import regeneratorRuntime from "regenerator-runtime";

export default class RetailFinder extends PageManager {
    constructor(context) {
        super(context);
        this.pageContent = document.querySelector('.content');
        this.retailFinderHtml = '';
        this.pageContent.innerHTML = `
            <h2 class="retail-finder-title"><strong>Where to Buy</strong></h2>
            <div class="select-container">
                <span>Within</span>
                <select class="selector-dropdown">
                    <option>50 Miles</option>
                    <option>100 Miles</option>
                    <option>150 Miles</option>
                </select>
            </div>
            <div class="select-container">
                <span>of</span>
                <input type="text" />
            </div>
            <div class="select-container">
            <span>carrying</sapn>
                <select class="selector-dropdown">
                    <option selected>Any Collection</option>
                    <option>100</option>
                    <option>150</option>
                </select>
            </div>
            <div class="buttons-container">
                <button class="button">SEARCH</button>
                <button class="button">Reset</button>
            </div>
            <br />
            <div class="results-divider">
                <span>Results</span>
                </div>
            <div id="retail-finder-results"></div>
        `;
    }

    onReady() {    
        
        const showGraphQlData = () => {
            const query = `
                query {
                    retailersCollection {
                        items{
                            retailerName,
                            retailerStreet,
                            retailerCity,
                            state,
                            zipCode,
                            location{
                                lat,
                                lon
                            }
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
            display.forEach(element => {
                for (let key in element) {
                    let results = `<p><strong>${key}: ${element[key]}</strong></p>`;
                    document.getElementById('retail-finder-results').insertAdjacentHTML('afterbegin', results);
                }
            });
        }
    
        getCharacters();
        };
    
        showGraphQlData();
    }
}