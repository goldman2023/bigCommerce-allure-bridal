import PageManager from '../page-manager';

export default class DressingRoom extends PageManager {
    constructor(context) {
        super(context);
        console.log(context);
        this.$contentEl = document.querySelector('.page-content .page--inner');
        this.dressingRoomHtml = '';
        this.productObj = [];
        this.updatedProductObj = [];
        this.$assignLookBtn = $('#assign-look-button');
        this.$loadingOverlay = $('.dressing-room--page .loadingOverlay');
    }
    onReady() {
        if (this.context.customer) {
            this.dressingRoomHtml += `<h2>${this.context.customer.name}'s Dressing Room </h2>`;
            
            this.createProductObj().then(productObj => {
                this.renderProductDetails(productObj);
            });

            this.$assignLookBtn.on('click', event => {
                event.preventDefault();
                console.log(event);
                this.assignLook(response => {
                    this.showAlertMessage("Look has been assigned.");
                    document.querySelector('#modal-assign-look .modal-close').click();
                });
            });

        } else {
            window.location.href = '/login.php';
        } 
    }

    assignLook(callback) {
        let bc_customer_ids = []; 
        const inputElements = document.getElementsByClassName('assign-member-ids');
        for(let inputElement of inputElements){
            if(inputElement.checked){
                bc_customer_ids.push(inputElement.value);
            }
        }
        const requiredAssignLook = document.getElementById('required-assign');
        const optionalAssignLook = document.getElementById('optional-assign');

        const payload = {
            dressing_room_action: "assignment",
            wedding_party_id: 2, 
            bc_customer_ids: bc_customer_ids,
            assigned_optional_bc_product: optionalAssignLook.checked ?  document.querySelector('#modal-assign-look .modal-body .product-sku').innerText : '',
            assigned_required_bc_product: requiredAssignLook.checked ?  document.querySelector('#modal-assign-look .modal-body .product-sku').innerText : ''    
        }
        console.log(payload);
        fetch(`${this.context.workatoApiPath}/dressingroom/products`, {
            method: 'POST',
            headers: {"API-TOKEN": this.context.workatoApiToken},
            body: JSON.stringify(payload)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            if (typeof callback == 'function') {
                callback.call(this, res);
            }
        })
        .catch(error => console.error(error)); 
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
                    self.dressingRoomHtml += `<li class="product" id="product-${productInner.entityId}">
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
                                <div class="hide" data-test-sku>
                                    ${productInner.sku}
                                </div>
                                <div class="f jcsb">
                                    <div class="card-text" data-test-info-type="price">$${productInner.prices.price.value}</div>
                                    <div class="f f10">
                                        <div class="card-text" data-test-info-type="up_votes">
                                            <div class="up-votes f f3" data-product-id="${productInner.entityId}" data-order-id="${self.updatedProductObj[productInner.entityId].bc_order_id}">
                                                <div class="icon">
                                                    <svg data-product-id="${productInner.entityId}" data-order-id="${self.updatedProductObj[productInner.entityId].bc_order_id}">
                                                        <use xlink:href="#icon-up_vote" />
                                                    </svg>
                                                </div>
                                                <div id="up-vote-count-${productInner.entityId}">${(self.updatedProductObj[productInner.entityId].up_votes) ? self.updatedProductObj[productInner.entityId].up_votes : 0}</div>
                                                
                                            </div>
                                        </div>
                                        <div class="card-text" data-test-info-type="down_votes">
                                        <div class="down-votes f f3" data-product-id="${productInner.entityId}" data-order-id="${self.updatedProductObj[productInner.entityId].bc_order_id}">
                                            <div class="icon">
                                                <svg data-product-id="${productInner.entityId}" data-order-id="${self.updatedProductObj[productInner.entityId].bc_order_id}">
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
                                <div class="f jcsb">
                                    <div class="card-text" data-test-info-type="added_by">Added By: ${self.updatedProductObj[productInner.entityId].assigned_by}</div>
                                </div>
                                <a class="button" data-reveal-id="modal-assign-look" rel="${productInner.entityId}">Assign Look</a>
                            </div>
                        </article>
                    </li>`
                });
                self.dressingRoomHtml += `</ul>`;
                self.$contentEl.innerHTML = self.dressingRoomHtml;
                setTimeout(() => {
                    self.upVote(self);
                    self.downVote(self);
                    self.updateAssignLook();
                    $('.dressing-room--page .loadingOverlay').hide();
                }, 300);
            })
            .catch(error => console.log(error));
        }
    }
    
    updateAssignLook() {
        self = this;
        const assignLookElements = document.querySelectorAll('[data-reveal-id="modal-assign-look"]');
        if (assignLookElements.length > 0) {
            for (const assignLookEl of assignLookElements) {
                assignLookEl.addEventListener('click', function onClick(event) {
                    const productId = event.target.getAttribute('rel');
                    //update image
                    const listItemImg = document.querySelector(`#product-${productId} .card-img-container img`).getAttribute('data-src');
                    document.querySelector('#modal-assign-look .modal-body .modal--inner .left img').setAttribute('data-src', listItemImg);
                    //update product title
                    const productTitle = document.querySelector(`#product-${productId} .card-title a`).innerText;
                    document.querySelector('#modal-assign-look .modal-body .modal--inner .right .product-title').innerText = productTitle;
                    document.querySelector('#modal-assign-look .modal-body .modal--inner .left img').setAttribute('alt', productTitle);

                    //update product sku
                    const productSku = document.querySelector(`#product-${productId} [data-test-sku]`).innerText;
                    document.querySelector('#modal-assign-look .modal-body .product-sku').innerText = productSku;

                    console.log(productSku);
                    self.fetchMembers().then(members => {
                        let memberList = '';
                        if (members.length > 0) {
                            for (const member of members) {
                                console.log(member);
                                memberList += `
                                <li class="form-field">
                                    <input
                                        class="form-checkbox assign-member-ids"
                                        type="checkbox"
                                        id="member-${member.bc_customer_id}"
                                        name="bc_customer_ids[${member.bc_customer_id}]"
                                        value="${member.bc_customer_id}"
                                        required
                                    >
                                    <label class="form-label" for="member-${member.bc_customer_id}">
                                        ${member.first_name} ${member.last_name}
                                    </label>
                                </li>`;
                            }
                            document.querySelector('#modal-assign-look .members').innerHTML = memberList;
                        }
                    });
                });
            }
        }
    }

    fetchMembers() {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: `${this.context.workatoApiPath}/wedding-studio/members?wedding_party_id=2`,
                headers: {"API-TOKEN": this.context.workatoApiToken},
                success: response => {
                    console.log(response);
                    resolve(response.data);
                },
                error: error => {
                    if(error.statusText) {
                        reject(error.statusText);
                    } else if (error.responseJSON.error) {
                        reject(error.responseJSON.error);
                    } else {
                        reject(error);
                    }
                }
            });
        });
    }

    upVote(self) {
        const upVotesElements = document.getElementsByClassName('up-votes');
        if (upVotesElements.length > 0) {
            for (const upVotesEl of upVotesElements) {
                upVotesEl.addEventListener('click', function onClick(event) {
                    self.$loadingOverlay.show();
                    const upVoteCountEl = document.querySelector(`#up-vote-count-${event.target.getAttribute('data-product-id')}`);
                    const prevUpVoteCount = parseInt(upVoteCountEl.innerText);
                    const formData = {
                        "dressing_room_action": "voting",
                        "wedding_party_id": 2, 
                        "bc_product_id": event.target.getAttribute('data-product-id'),
                        "bc_customer_id": self.context.customer.id,
                        "bc_order_id": event.target.getAttribute('data-order-id'),
                        "up_vote": event.target.classList.contains("done") ? -1 : 1,
                        "down_vote": 0,
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
                            self.$loadingOverlay.hide();
                        },
                        error: error => {
                            
                        }
                    });
                }); 
            };
        }
    }

    downVote(self) {
        const downVotesElements = document.getElementsByClassName('down-votes');
        if (downVotesElements.length > 0) {
            for (const downVotesEl of downVotesElements) {
                downVotesEl.addEventListener('click', function onClick(event) {
                    self.$loadingOverlay.show();
                    const downVoteCountEl = document.querySelector(`#down-vote-count-${event.target.getAttribute('data-product-id')}`);
                    const prevDownVoteCount = parseInt(downVoteCountEl.innerText);
                    const formData = {
                        "dressing_room_action": "voting",
                        "wedding_party_id": 2, 
                        "bc_product_id": event.target.getAttribute('data-product-id'),
                        "bc_customer_id": self.context.customer.id,
                        "bc_order_id": event.target.getAttribute('data-order-id'),
                        "up_vote": 0,
                        "down_vote": event.target.classList.contains("done") ? -1 : 1
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
                            self.$loadingOverlay.hide();
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
        window.scroll({ top: 500, left: 0, behavior: 'smooth' });
    }
}