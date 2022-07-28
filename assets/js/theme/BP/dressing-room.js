import PageManager from '../page-manager';

export default class DressingRoom extends PageManager {
    constructor(context) {
        super(context);
        console.log(context);
        this.$contentEl = document.querySelector('.page-content .page--inner');
        this.dressingRoomHtml = '';
        this.productObj = [];
        this.updatedProductObj = [];
    }
    onReady() {
        if (this.context.customer) {
            this.dressingRoomHtml += `<h2>${this.context.customer.name}'s Dressing Room <span><a href="/">Edit Name</a></span></h2>`;
            
            this.createProductObj().then(productObj => {
                this.renderProductDetails(productObj);
            });
        } else {
            window.location.href = '/login.php';
        } 
    }

    createProductObj() {
        return new Promise((resolve, reject) => {
            this.fetchProductDetails().then(products => {
                console.log("products", products);
                if (products.length > 0) {
                    products.forEach((product, index) => {
                        this.productObj.push(product.bc_product_id);
                        this.updatedProductObj[product.bc_product_id] = product;
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
            fetch(`${this.context.workatoApiPath}/dressingroom/get-products?wedding_party_id=2`, {
                method: 'GET',
                headers: {"API-TOKEN": this.context.workatoApiToken},
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(res) {
                resolve(res.data);
            })
            .catch(error => console.error(error));
        });
    }

    renderProductDetails (products) {
        let self = this;
        console.log(self.updatedProductObj);
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
                                        <img data-src="${productInner.defaultImage.url}" alt="${productInner.defaultImage.altText}" title="${productInner.name}" data-sizes="auto" class="card-image lazyautosizes ls-is-cached lazyload lazyloaded">
                                    </div>
                                </a>
                            </figure>
                            <div class="card-body">
                                <h3 class="card-title">
                                    <a aria-label="${productInner.name}"  href="${productInner.path}">
                                        ${productInner.name}
                                    </a>
                                </h3>
                                <div class="f jcsb">
                                    <div class="card-text" data-test-info-type="price">$${productInner.prices.price.value}</div>
                                    <div class="f f10">
                                        <div class="card-text" data-test-info-type="up_votes">
                                            <div class="up-votes f f3" data-product-id="${productInner.entityId}" data-order-id="0">
                                                <div class="icon">
                                                    <svg data-product-id="${productInner.entityId}" data-order-id="0">
                                                        <use xlink:href="#icon-up_vote" />
                                                    </svg>
                                                </div>
                                                <div id="up-vote-count-${productInner.entityId}">${(self.updatedProductObj[productInner.entityId].up_votes) ? self.updatedProductObj[productInner.entityId].up_votes : 0}</div>
                                                
                                            </div>
                                        </div>
                                        <div class="card-text" data-test-info-type="down_votes">
                                        <div class="down-votes f f3" data-product-id="${productInner.entityId}" data-order-id="0">
                                            <div class="icon">
                                                <svg data-product-id="${productInner.entityId}" data-order-id="0">
                                                    <use xlink:href="#icon-up_vote" />
                                                </svg>
                                            </div>
                                            <div id="down-vote-count-${productInner.entityId}">
                                                ${(self.updatedProductObj[productInner.entityId].down_votes) ? self.updatedProductObj[productInner.entityId].down_votes : 0}
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                <div class="card-text" data-test-info-type="added_by">Added By: ${self.updatedProductObj[productInner.entityId].assigned_by}</div>
                                
                            </div>
                        </article>
                    </li>`
                });
                self.dressingRoomHtml += `</ul>`;
                self.$contentEl.innerHTML = self.dressingRoomHtml;
                setTimeout(() => {
                    self.upVote();
                    self.downVote();
                }, 300);
            })
            .catch(error => console.log(error));
        }
    }
    
    upVote () {
        const upVotesElements = document.querySelectorAll('[data-test-info-type="up_votes"] .up-votes');
        if (upVotesElements.length > 0) {
            for (const upVotesEl of upVotesElements) {
                self = this;
                upVotesEl.addEventListener('click', function onClick(event) {
                    console.log(event.target);
                    const upVoteCountEl = document.querySelector(`#up-vote-count-${event.target.getAttribute('data-product-id')}`);
                    const prevUpVoteCount = parseInt(upVoteCountEl.innerText);
                    const formData = {
                        "dressing_room_action": "voting",
                        "wedding_party_id": 2, 
                        "bc_product_id": event.target.getAttribute('data-product-id'),
                        "bc_customer_id": self.context.customer.id,
                        "bc_order_id": event.target.getAttribute('data-order-id'),
                        "up_vote": 1,
                        "down_vote": 0,
                        "assigned_required_bc_product": "string",
                        "assigned_optional_bc_product": "string"
                    };
                    $.ajax({
                        type: "POST",
                        url: `${self.context.workatoApiPath}/dressingroom/products`,
                        headers: {"API-TOKEN": self.context.workatoApiToken},
                        data: JSON.stringify(formData),
                        success: response => {
                            self.showAlertMessage("Product has been upvoted Successfully!");
                            if (event.target.classList.contains("done")) {
                                event.target.classList.remove("done");
                                upVoteCountEl.innerText = prevUpVoteCount-1;
                            } else {
                                event.target.classList.add("done");
                                upVoteCountEl.innerText = prevUpVoteCount+1;
                            }
                        },
                        error: error => {
                            
                        }
                    });
                }); 
            };
        }
    }

    downVote () {
        const downVotesElements = document.querySelectorAll('[data-test-info-type="down_votes"] .down-votes');
        if (downVotesElements.length > 0) {
            for (const downVotesEl of downVotesElements) {
                self = this;
                downVotesEl.addEventListener('click', function onClick(event) {
                    console.log(event.target);
                    const downVoteCountEl = document.querySelector(`#down-vote-count-${event.target.getAttribute('data-product-id')}`);
                    const prevDownVoteCount = parseInt(downVoteCountEl.innerText);
                    const formData = {
                        "dressing_room_action": "voting",
                        "wedding_party_id": 2, 
                        "bc_product_id": event.target.getAttribute('data-product-id'),
                        "bc_customer_id": self.context.customer.id,
                        "bc_order_id": event.target.getAttribute('data-order-id'),
                        "up_vote": 0,
                        "down_vote": 1,
                        "assigned_required_bc_product": "string",
                        "assigned_optional_bc_product": "string"
                    };
                    $.ajax({
                        type: "POST",
                        url: `${self.context.workatoApiPath}/dressingroom/products`,
                        headers: {"API-TOKEN": self.context.workatoApiToken},
                        data: JSON.stringify(formData),
                        success: response => {
                            self.showAlertMessage("Product has been down voted Successfully!");
                            if (event.target.classList.contains("done")) {
                                event.target.classList.remove("done");
                                downVoteCountEl.innerText = prevDownVoteCount-1;
                            } else {
                                event.target.classList.add("done");
                                downVoteCountEl.innerText = prevDownVoteCount+1;
                            }
                        },
                        error: error => {
                            
                        }
                    });
                }); 
            };
        }
    }

    showAlertMessage(message) {
        const alertBoxEl = document.querySelector('.alertBox');
        const alertBoxMessgeEl = document.querySelector('.alertBox .alertBox-message #alertBox-message-text');
        alertBoxEl.style.display = 'flex';
        alertBoxMessgeEl.innerText = message;
    }
}