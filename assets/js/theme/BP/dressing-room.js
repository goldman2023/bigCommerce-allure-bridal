import PageManager from '../page-manager';

export default class DressingRoom extends PageManager {
    constructor(context) {
        super(context);
        console.log(context);
        this.$contentEl = document.querySelector('.page-content');
        this.dressingRoomHtml = '';
        this.productObj = [];
        this.updatedProductObj = [];
    }
    onReady() {
        if (this.context.customer) {
            this.dressingRoomHtml += `<h2>${this.context.customer.name}'s Dressing Room <span><a href="/">Edit Name</a></span></h2>`;
            
            this.createProductObj().then(productObj => {
                console.log(this.updatedProductObj);
                this.renderProductDetails(productObj);
            });
        } else {
            window.location.href = '/login.php';
        }   
        
    }

    createProductObj() {
        return new Promise((resolve, reject) => {
            this.fetchProductDetails().then(products => {
                if (products.length > 0) {
                    products.forEach((product, index) => {
                        this.productObj.push(product.product_id);
                        this.updatedProductObj[product.product_id] = product;
                        if (index+1 == products.length) {
                            resolve(this.productObj);
                        }
                    });
                } else {
                    resolve(products.length);
                }
            });
        });
    }

    fetchProductDetails () {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: `${this.context.workatoApiPath}/dressingroom?bc_customer_id=10&wedding_party_id=2`,
                headers: {"API-TOKEN": this.context.workatoApiToken},
                success: response => {
                    console.log(response);
                    resolve(response.data);
                },
                error: function(e){
                    resolve(false);
                }
            });
        });
    }

    renderProductDetails (products) {
        console.log(products);
        let self = this;
        if (products == 0) {
            self.$contentEl.innerHTML = `${self.dressingRoomHtml} <p>There is no product in the Dressing Room.</p>`;
        } else {
            fetch('/graphql', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.context.graphQlToken}`
                },
                body: JSON.stringify({
                    query: `
                        query ProductsQuery {
                            site {
                                products(entityIds: [${products}]) {
                                    edges {
                                        node {
                                            entityId
                                            name
                                            sku
                                            description
                                            path
                                            prices {
                                                price {
                                                    currencyCode
                                                    value
                                                }
                                            }
                                            defaultImage {
                                                url (
                                                    width: 300
                                                    height: 300
                                                )
                                                altText
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    `
                })
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(res) {
                const returnProducts = res.data.site.products.edges;
                self.dressingRoomHtml  += `<ul class="productGrid productGrid--maxCol4">`;
                returnProducts.forEach(product => {
                    let productInner = product.node;
                    self.dressingRoomHtml += `<li class="product">
                        <article class="card">
                            <figure class="card-figure">
                                <a href="${productInner.path}" class="card-figure__link" aria-label="${productInner.name}">
                                    <div class="card-img-container">
                                        <img src="${productInner.defaultImage.url}" alt="${productInner.defaultImage.altText}" title="${productInner.name}" data-sizes="auto" class="card-image lazyautosizes ls-is-cached lazyloaded">
                                    </div>
                                </a>
                            </figure>
                            <div class="card-body">
                                <p class="card-text" data-test-info-type="sku">${productInner.sku}</p>
                                <p class="card-text" data-test-info-type="price">$${productInner.prices.price.value}</p>
                                <p class="card-text" data-test-info-type="like_count">Like: ${self.updatedProductObj[productInner.entityId].like_count}</p>
                                <p class="card-text" data-test-info-type="dislike_count">Dislike: ${self.updatedProductObj[productInner.entityId].dislike_count}</p>
                                <p class="card-text" data-test-info-type="like_by">Like By: ${self.updatedProductObj[productInner.entityId].is_like == 1 ? 'Liked': 'Not Liked'}</p>
                                <h3 class="card-title">
                                    <a aria-label="${productInner.name}"  href="${productInner.path}">
                                        ${productInner.name}
                                    </a>
                                </h3>
                            </div>
                        </article>
                    </li>`
                });
                self.dressingRoomHtml += `</ul>`;
                
                self.$contentEl.innerHTML = self.dressingRoomHtml;
            })
            .catch(error => console.error(error));
        }
    }
    
    
}