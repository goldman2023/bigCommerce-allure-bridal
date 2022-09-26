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
                let heading = element.collectionHeadline;
                let lastword = heading.split(" ").reverse()[0];
                document.querySelector('.productSlider .heading').innerHTML= `${heading.replace(lastword,'')} <span class="lastword">${lastword}</span>`
                let stringArray = element.productsInCollection;
                let numberArray = [];
                length = stringArray.length;

                for (var i = 0; i < length; i++){
                  if(stringArray[i] !== ""){
                    numberArray.push(parseInt(stringArray[i]));
                  }
              }
                this.getProducts(numberArray);
              }
            });
        });
    };
    getProducts(prodList) {
      console.log(typeof prodList);
      console.log(prodList);

      let prodArray = [];
      prodArray = prodList;
      //prodArray = prodList.split(',');
      let products = ['170', '285', '274', '270'];
      let autho = 'Bearer '+document.getElementById('gettheKey').value;
      fetch('/graphql', { 
         method: 'POST',
         credentials: 'same-origin',
         headers: {
             'Content-Type': 'application/json',
             Authorization: autho,
         },
         body: JSON.stringify({
             query: `query ProductsQuery {
              site { 
                products(entityIds: [${products}]) {
                        edges {
                          node {
                            id
                            entityId
                            name
                            sku
                            path
                            description
                            defaultImage {
                            url(width: 1200)
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
     .then(productsData => {
      const productArray = productsData.data.site.products.edges;
      let prdlist = [];
      if(productArray.length > 0 ){
          prdlist = productArray.map((item) => {
              return `<li class="product"><article class="card" data-test="card-271"><figure class="card-figure">
                          <a href="${item.node.path}" class="card-figure__link"><div class="card-img-container">
                                  <img src="${item.node.defaultImage.url}" alt="${item.node.name}" title="${item.node.name}" data-sizes="auto" 
                                  srcset="${item.node.defaultImage.url} 80w, ${item.node.defaultImage.url} 160w, ${item.node.defaultImage.url} 320w, ${item.node.defaultImage.url} 640w, ${item.node.defaultImage.url} 960w, ${item.node.defaultImage.url} 1280w, ${item.node.defaultImage.url} 1920w, ${item.node.defaultImage.url} 2560w" 
                                  data-srcset="${item.node.defaultImage.url} 80w, ${item.node.defaultImage.url} 160w, ${item.node.defaultImage.url} 320w, ${item.node.defaultImage.url} 640w, ${item.node.defaultImage.url} 960w, ${item.node.defaultImage.url} 1280w, ${item.node.defaultImage.url} 1920w,${item.node.defaultImage.url} 2560w" class="card-image lazyautosizes lazyloaded" sizes="257px">
                              </div></a><div class="card-body"><h3 class="card-title"><a aria-label="${item.node.name}" "="" href="${item.node.path}" class="name">Style ${item.node.name}</a>
                          </h3><div class="card-text" data-test-info-type="price">${item.node.description}</div></article>
                      </li>`;
          });
          document.querySelector('.productSlider .productGridSection').innerHTML = `<ul class="productSliderGrid" data-slick='{"slidesToShow": 3, "slidesToScroll": 3}'>${prdlist.join('')}</ul>`;
      } else {
        document.querySelector('.productSlider .productGridSection').innerHTML =  `<p data-no-products-notification role="alert" aria-live="assertive"tabindex="-1">There are no products listed under this category.</p>`;
      }
     });
    };
}