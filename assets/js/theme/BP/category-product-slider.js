import PageManager from '../page-manager'
import '../global/jquery-migrate';
import 'slick-carousel';

export default class CategoryProductSlider extends PageManager {
    constructor(context) {
        super(context);
    }
    onReady() {
            this.getCategory("/dresses/allure-romance/");
    }
     getCategory(categoryPath) {
        let autho = 'Bearer '+document.getElementById('gettheKey').value;
         fetch('/graphql', { 
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Authorization: autho,
            },
            body: JSON.stringify({
                query: `query CategoryByUrl {
                    site {
                        route(path: "${categoryPath}") {
                        node {
                          id
                          ... on Category {
                            name
                            metafields (
                              namespace: "Contentful Data"
                              keys: ["Contentful Data"]
                              first: 1
                          ) {
                              edges {
                                  node {
                                      entityId
                                      id
                                      key
                                      value
                                  }
                              }
                          }
                          }
                        }
                      }
                    }
                  }
                    `
                }),
        })
        .then(res => res.json())
        .then(categoryData => {
            const obj = categoryData.data.site.route.node.metafields.edges[0].node.value;
            const cateName = categoryData.data.site.route.node.name;
            const data = JSON.parse(obj.replace(/\\/g, ""));
            console.log(data.items[0]);
            data.items.forEach(element => {
              if(element.collectionName === cateName) {
                // document.querySelector('.productSlider').setAttribute('data-ids',element.productsInCollection);
                document.querySelector('.productSlider .heading').innerHTML= element.collectionHeadline;
                let stringArray = element.productsInCollection;
                let numberArray = [];
                length = stringArray.length;

                for (var i = 0; i < length; i++){
                    numberArray.push(parseInt(stringArray[i]));
              }
                this.getProducts(numberArray);
              }
            });
        });
    };
    getProducts(prodList) {
      console.log(prodList);
      let autho = 'Bearer '+document.getElementById('gettheKey').value;
      fetch('/graphql', { 
         method: 'POST',
         credentials: 'same-origin',
         headers: {
             'Content-Type': 'application/json',
             Authorization: autho,
         },
         body: JSON.stringify({
             query: `query productsById($productIds: [${prodList}]) { 
                    site { 
                      products(entityIds: $productIds) { 
                        edges {
                          node {
                            entityId
                            sku
                            name
                            path
                          }
                        }
                      } 
                    } 
                  }
                 `
             }),
     })
     .then(res => res.json())
     .then(productsData => {
         console.log(productsData);
     });
    };
}