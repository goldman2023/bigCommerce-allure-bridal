function headerFooterQuery (context, callback) {
    let query = `
        query ProductsQuery {
            site {
                product(entityId: 287) {
                    entityId
                    description
                    metafields (
                        namespace: "Contentful Data"
                        keys: ["Data for navigation", "Data for footer"]
                        first: 5
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
    `;
    fetch('/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.graphQlToken}`
        },
        body: JSON.stringify({
            query: query
        })
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
function productDetailMetadata (context,prodID, callback) {
    let prodductId = 170;
    if(prodID) {
        prodductId = prodID;
    }
    let query = `
    query ProductsQuery {
        site {
            product(entityId: ${prodductId}) {
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
                metafields (
                    namespace: "Contentful Data"
                    keys: ["Contentful Data", "Related Products"]
                    first: 2
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
    `;
    fetch('/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.graphQlToken}`
        },
        body: JSON.stringify({
            query: query
        })
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

function globalMetadata (context,prodID, callback) {
    let prodductId = 170;
    if(prodID) {
        prodductId = prodID;
    }
    let query = `
    query ProductsQuery {
        site {
            product(entityId: ${prodductId}) {
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
    `;
    fetch('/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.graphQlToken}`
        },
        body: JSON.stringify({
            query: query
        })
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

function categoryQuery (context, categoryPath, callback) {
    let query = `
    query CategoryByUrl {
        site {
            route(path: "${categoryPath}") {
            node {
              id
              ... on Category {
                name
                metafields (
                    namespace: "Contentful Data"
                    keys: ["Contentful Data", "Related Products"]
                    first: 2
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
    `;
    fetch('/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.graphQlToken}`
        },
        body: JSON.stringify({
            query: query
        })
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
function categoryByPath (context, categoryPath, callback) {
    let query = `
    query CategoryByUrl {
        site {
            route(path: "${categoryPath}") {
            node {
                id
                ... on Category {
                name
                products {
                    edges {
                    node {
                        defaultImage {
                        url(width: 1200)
                        }
                    }
                    }
                }
                }
            }
            }
        }
    }
    `;
    fetch('/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.graphQlToken}`
        },
        body: JSON.stringify({
            query: query
        })
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


function categoryQueryByPath (context, categoryPath, callback) {
    let query = `
    query CategoryByUrl {
        site {
            route(path: "${categoryPath}") {
            node {
                id
                ... on Category {
                name
                entityId
                description
                products {
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
            }
        }
    }
    `;
    fetch('/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.graphQlToken}`
        },
        body: JSON.stringify({
            query: query
        })
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
export function contentFullmetaData(context, callback) {
    globalMetadata(context,'', response => {
        if (response.data.site.product !== undefined) {
            const product = response.data.site.product;
            if (product.metafields.edges.length > 0) {
                const metafields = product.metafields.edges;
                const metafieldData = [];
                const noOfEntries = metafields.length;
                for(const [index, metafield] of metafields.entries()) {
                    if (typeof callback == 'function') {
                        const metaFieldObj = {"key": metafield.node.key, "value": JSON.parse(metafield.node.value)};
                        metafieldData.push(metaFieldObj);
                        if (index+1 === noOfEntries) {
                            callback.call(this, metafieldData);
                        }
                    }
                }
            }
        }
    });
}

export function productDeatilMetaData(context,prodID, callback) {
    productDetailMetadata(context,prodID, response => {
        if (response.data.site.product !== undefined) {
            const product = response.data.site.product;
            if (product.metafields.edges.length > 0) {
                const metafields = product.metafields.edges;
                const metafieldData = [];
                const noOfEntries = metafields.length;
                for(const [index, metafield] of metafields.entries()) {
                    if (typeof callback == 'function') {
                        const metaFieldObj = {"key": metafield.node.key, "value": JSON.parse(metafield.node.value)};
                        metafieldData.push(metaFieldObj);
                        if (index+1 === noOfEntries) {
                            let contentFul = {};
                            let related = {};
                            for (const data of metafieldData) {
                                if (data.key === "Contentful Data") {
                                        contentFul = data.value;
                                }
                                if (data.key === "Related Products") {
                                    related = data.value;
                                }
                                callback.call(this, {contentFul, related});
                            }
                        }
                    }
                }
            }
        }
    });
}
function headerFooterData(context, callback) {
    headerFooterQuery(context, response => {
        if (response.data.site.product !== undefined) {
            const product = response.data.site.product;
            if (product.metafields.edges.length > 0) {
                const metafields = product.metafields.edges;
                const metafieldData = [];
                const noOfEntries = metafields.length;
                for(const [index, metafield] of metafields.entries()) {
                    if (typeof callback == 'function') {
                        const metaFieldObj = {"key": metafield.node.key, "value": JSON.parse(metafield.node.value)};
                        metafieldData.push(metaFieldObj);
                        if (index+1 === noOfEntries) {
                            let footer = [];
                            let navigation = [];
                            for (const data of metafieldData) {
                                if (data.key === "Data for footer") {
                                    footer = data.value;
                                }
                                if (data.key === "Data for navigation") {
                                    navigation = data.value;
                                }
                                
                                callback.call(this, {navigation, footer});
                            }
                        }
                    }
                }
            }
        }
    });
}

export function renderHeaderFooter (context) {
    headerFooterData (context, globalData => {
        //footer implementation
        const footerListContainer = document.querySelector('.footer-info');
        let footerHtml = '';
        for (const footer of globalData.footer) {
            const footerObj = footer.footerSectionsCollection.items;
            for (const [key, value] of Object.entries(footerObj)) {
                const keyText = (value.sectionName).toLowerCase();
                
                footerHtml += `<article class="footer-info-col" data-section-type="footer-${keyText}"><h3 class="footer-info-heading">${value.sectionName}</h3>
                <ul class="footer-info-list">`;
                for (const [innerKey, innerValue] of Object.entries(value.sectionLinksCollection.items)) {
                    footerHtml += `<li><a href="${innerValue.linkUrl}" class="footer-info__link">${innerValue.linkName}</a></li>`;
                }
                footerHtml += `</ul></article>`;
            }
        }
        footerListContainer.insertAdjacentHTML('beforeend', footerHtml);
        
        //navigation bar implementation
        const navigationEl = document.querySelector('.site-navigation');
        let navigationHtml = ``;
        let index = 0;
        for (const navigation of globalData.navigation) {
            const topNavs = navigation.navEntriesCollection.items;
            for (const topNav of topNavs) {
                navigationHtml += `<li 
                    class="site-navigation__link"
                >
                    <a href="${topNav.topNavLinkUrl}">${topNav.topNavLinkName}</a>`;
                
                if (topNav.sectionChildNavigationCollection.items.length > 0) {
                    navigationHtml += `<div class="sub-site__navigation">`;
                    for (const secondNav of topNav.sectionChildNavigationCollection.items) {
                        navigationHtml += `<ul class="sub-site__navigation-${secondNav.navSectionName.toLowerCase()}">
                                <li class="sub-site__title">
                                    <a href="${secondNav.navSectionUrl}">
                                        ${secondNav.navSectionName}
                                    </a>
                                </li>`;
                        for (const thirdNav of secondNav.navItemsCollection.items) {       
                            navigationHtml +=`<li class="sub-site__text"><a href="${thirdNav.navLinkUrl}">${thirdNav.navLinkName}</a></li>`;
                        }   
                        navigationHtml += `</ul>`;
                    }
                    navigationHtml += `
                        <div class="sub-site__navigation-image">
                            <img src="${topNav.megaMenuImage.url}">
                        </div>
                    </div>`;
                }
                
                navigationHtml += `</li>`;
                if (topNavs.length != index+1) {
                    navigationHtml +=   `<svg 
                            class="site-navigation_svg" 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="12" 
                            height="12" 
                            viewBox="0 0 12 12" 
                            fill="none"
                        >
                            <rect 
                                x="5.99991" 
                                y="1.58603" 
                                width="6" 
                                height="6" 
                                transform="rotate(45 5.99991 1.58603)" 
                                fill="#695C5C" 
                                stroke="white" 
                                stroke-width="2"
                            >
                            </rect>
                        </svg>`;
                }
                index++;
            }
        }
        navigationEl.innerHTML = navigationHtml;
    });
}
export function getProductsByCategoryPath(context,path, callback) { 
    categoryQueryByPath(context, path, response => {
        if (response.data.site.route.node !== undefined) {
            callback.call(this, response.data.site.route.node);
        }
    });
}

export function getFirstprodImageFromCategory(context,path, callback) { 
    categoryByPath(context, path, response => {
        if (response.data.site.route.node !== undefined) {
            callback.call(this, response.data.site.route.node);
        }
    });
}

export function createCategorySlider(block,blockdata) {
    if(blockdata.products.edges.length > 0){
        block.querySelector('.cardimage').setAttribute("src", blockdata.products.edges[0].node.defaultImage.url);
    } else {
        block.querySelector('.cardimage').setAttribute("src", 'https://via.placeholder.com/150x250?Text=No Image'); 
    }
};

export function getCategorySpecificMetaData(context,path, callback) { 
    categoryQuery(context, path, response => {
        if (response.data.site.route.node !== undefined) {
            const category = response.data.site.route.node;
            if (category.metafields.edges.length > 0) {
                const metafields = category.metafields.edges;
                const metafieldData = [];
                const noOfEntries = metafields.length;
                for(const [index, metafield] of metafields.entries()) {
                    if (typeof callback == 'function') {
                        const metaFieldObj = {"key": metafield.node.key, "value": JSON.parse(metafield.node.value)};
                        metafieldData.push(metaFieldObj);
                        if (index+1 === noOfEntries) {
                            callback.call(this, metafieldData);
                        }
                    }
                }
            }
        }
    });
}
export function getProducts(context, selector, prodList, slidescroll) {
    let products = [];
    if (selector === '.thePerfectMatch .prodData' || selector === '.youMightalsoLike .prodData' || selector === '.productSlider .productGridSection') {
        products = prodList;
    } 
    if (products.length > 0) {
        fetch('/graphql', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context.graphQlToken}`
            },
            body: JSON.stringify({
                query: `query ProductsQuery {
            site { 
              products(entityIds: [${products.toString()}]) {
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
            console.log(productsData);
            if (productsData.data) {
                const productArray = productsData.data.site.products.edges;
                let prdlist = [];
                if (productArray.length > 0) {
                    prdlist = productCard(productArray);
                    if (slidescroll) {
                        document.querySelector(selector).innerHTML = `<ul class="productSliderGrid" data-slick='{"slidesToShow": ${slidescroll}, "slidesToScroll": 1}'>${prdlist.join('')}</ul>`;
                    } else {
                        document.querySelector(selector).innerHTML = `<ul class="productGrid" >${prdlist.join('')}</ul>`;
                    }
                } 
            }
        });
    }
};

export function blockElementFullscreenVideo(selectorID, element) {
    let videoURL = '';
    if (element.videoUrl) {
        if (element.videoUrl.includes('youtube')) {
            videoURL = `https://www.youtube.com/embed/${element.videoUrl.split('=')[1]}`;
            document.getElementById(selectorID).innerHTML = `<div><iframe type="text/html" src="${videoURL}"  frameborder="0" id="colbannerVideo" controls=0></iframe></div>`;
        } else {
            document.getElementById(selectorID).innerHTML = `<div><video autoplay loop muted plays-inline="" id="colbannerVideo"><source src="${element.videoUrl}" type="video/mp4"><source src="${element.videoUrl}" type="video/ogg">Your browser does not support HTML video.</video></div>`;
        }
    }
}

export function globalblockElementFullscreenVideo(element) {
    let videoURL = '';
    if(element.videoUrl.includes('youtube')) {
        videoURL = `https://www.youtube.com/embed/${element.videoUrl.split('=')[1]}`;
        return `<div class="blockElementFullscreenVideo block-item full-size" ><div><iframe type="text/html" src="${videoURL}"  frameborder="0" id="colbannerVideo" controls=0></iframe></div></div>`;
    } else {
          return `<div class="blockElementFullscreenVideo block-item full-size" ><div><video autoplay loop muted plays-inline="" id="colbannerVideo"><source src="${element.videoUrl}" type="video/mp4"><source src="${element.videoUrl}" type="video/ogg">Your browser does not support HTML video.</video></div></div>`;
    }
}

export function lookBookglobal(blockData) {
    return `<div class="blockElementLookbook block-item full-size" id="blockElementLookbook"><div><h4 class="title">${(blockData?.blocktitle) ? blockData?.blocktitle : ''} - ${(blockData?.subheadline) ? blockData?.subheadline : ''}</h4><div class="contentSection"><img src="${(blockData?.imagesCollection?.items[0]?.url) ? blockData?.imagesCollection?.items[0]?.url : ''}" alt="${(blockData?.subheadline) ? blockData?.subheadline : ''}" /><div class="caption">
        ${(blockData?.bodyCopy == null || blockData?.bodyCopy == undefined) ? '' :
        `<p class="content">${blockData.bodyCopy}</p>`
        }   
        ${(blockData?.linkText == null || blockData?.linkText == undefined) ? '' :
        `<a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a>` }
        </div></div></div></div>`;
}

export function lookBookglobal2(blockData) {
    return `<div class="blockElementLookbook2 block-item full-size" id="blockElementLookbook2"><div><div class="caption"><h2>${(blockData.blocktitle) ? blockData.blocktitle : ''}</h2><div class="divider"></div><h4>${(blockData.subheadline) ? blockData.subheadline : ''}</h4><p class="content">${blockData?.bodyCopy}</p><a href="${blockData?.linkUrl}" class="button button-secondary">${blockData?.linkText}</a></div><div class="contentSection"><img src="${(blockData?.imagesCollection?.items[0]?.url) ? blockData?.imagesCollection?.items[0]?.url : ''}" alt="${blockData?.subheadline}" /></div></div></div>`;
}

export function blockElementDivider() {
    return '<div class="divider"></div>';
}

export function blockElementSpacer() {
    return '<div class="blockElementSpacer spacer"></div>';
}

export function blockElementSpacer24Px() {
    return '<div class="blockElementSpacer24Px spacer24"></div>';
}

export function events(blockData) {
    return `<div class="events block-item" id="events">
    <h2>Upcoming Designer Events</h2>
    <div class="eventsGrid">
        ${blockData.trunkShowsCollection.items.map((item)=> 
            `<div class="eventsCard">
              <div class="block">
                <div class="imageblock col"><img src="${item.eventImage.url}" alt="${item.retailerName}" /></div>
                <div class="contentBlock col">
                    <h4>${item.retailerName}</h4>
                    <p class="addressp">${item.location}</p>
                    <div class="divider"></div>
                    <label>Date</label>
                    <p class="colored">${new Date(item.eventStartDate).toLocaleDateString().replaceAll('/','.')} - ${new Date(item.eventEndDate).toLocaleDateString().replaceAll('/','.')}</p>
                    <label>Collections</label>
                    <p class="colored">${item.collectionsAvailable.map((col)=> `${col}`).join("  ")}</p>
                    <label>address</label>
                    <span>${item.locationAddressStreet}</span>
                    <span>${item.locationAddressCityStateZip}</span>
                    <p><a class="colored" href="http://maps.google.com/?q=${item.locationAddressStreet} ${item.locationAddressCityStateZip}">GET DIRECTION</a></p>
                    <label>Phone</label>
                    <p>${item.locationPhoneNumber}</p>
                    <label>website</label>
                    <p class="colored">${item.locationWebsiteUrl}</p>
                </div>
              </div>
            </div>`).join('')}
    </div>
    <a href="${blockData.containerButtonUrl}" class="button button--secondary" >${blockData.containerButtonText}</a>
    </div>`;
}
export function blockElementFullscreenImage(blockData) {
    return `<div class="blockElementFullscreenImage block-item ${(blockData?.contentOrScreenWidth !== 'Screen Width') ? 'full-size' : ''}" id="blockElementFullscreenImage"><div class="mainImage"><img src="${blockData?.backgroundImage?.url}" alt="${blockData?.subheadline}" />
    ${blockData?.bodyCopy !== null ? `<div class="homepageCaption"><div class="content"><div class="bannercap"><h4>${blockData?.subheadline}</h4><p>${blockData?.bodyCopy}</p><a href="${blockData?.linkUrl}">${blockData?.linkText}</a></div>` : ''}</div></div></div></div>`;
}

export function blockElementCopyBlock(blockData) {
    return `<div class="blockElementCopyBlock block-item" id="blockElementCopyBlock"><div class="heightwidth"><h2>${blockData?.blockName}</h2><p>${blockData?.bodyCopy}<p></div></div>`;
}

export function logoSliderBlock(blockData) {
    return `<div class="logoSliderBlock block-item" id="logoSliderBlock"><div class="imgslider"> ${blockData?.logosCollection?.items.map((logo)=> `<div class="logo-item"><img src="${logo?.url}" alt="${logo?.title}" /></div>` ).join('')}</div></div>`;
}

export function blockElement3ImagesScreenWidth(blockData) {
    let imgthum = blockData?.imagesCollection?.items?.map((image) => `<div class="imageDiv"><img src="${image.url}" alt="${image.title}" /></div>`);
    return ` <div class="blockElement3ImagesScreenWidth block-item" id="blockElement3ImagesScreenWidth"><div class="thumbImg">${imgthum.join('')}</div></div>`;
};

export function blockElementDiscover(blockData) {
    return `<div class="blockElementDiscover block-item" id="blockElementDiscover">
                <div class="discovery-section">
                    <div class="imageflex">
                        <div class="leftcol">${blockData?.imagesCollection?.items[0]?.url ? `<img class="first" src="${blockData?.imagesCollection?.items[0]?.url}" alt="${blockData?.imagesCollection?.items[0]?.title}" />` : ''}
                        ${blockData?.imagesCollection?.items[1]?.url ? `<img class="second" src="${blockData?.imagesCollection?.items[1]?.url}" alt="${blockData?.imagesCollection?.items[1]?.title}"/>` : ''}</div>
                        <div class="rightcol">${blockData?.imagesCollection?.items[2]?.url ? `<img  class="third" src="${blockData?.imagesCollection?.items[2]?.url}"  alt="${blockData?.imagesCollection?.items[2]?.title}" />` : '' }</div>
                    </div>
                    <div class="caption">
                        <h2>${blockData?.blocktitle}</h2>
                        <p class="content">${blockData?.bodyCopy}</p>
                        <a href="${blockData?.linkUrl}" class="button button--secondary buttonlink">${blockData?.linkText}</a>
                    </div>
                </div>
            </div>`;
}

export function blockElementStory(blockData) {
    return `<div class="blockElementStory block-item" id="blockElementStory">
    <div class="caption" ><h2>Inspiration</h2><p>Allure Bridals real customer’s fantastic wedding stories. These should be your wedding inspiration.</p></div>
    <div class="flexdata"><div class="heading-section"><h2 class="title">${blockData?.blockname}</h2>${(blockData?.displayedate != undefined && blockData?.displayedate != null) ? `<p class="date">${blockData?.displayedate}</p>` : `<p></p></br>`}<div class="leftBottom">
        <img src="${blockData?.imagesCollection?.items[0]?.url}" alt="${blockData?.imagesCollection?.items[0]?.title}" />
        </div></div><div class="rightside-section"><div class="rightcol">
        <img src="${(blockData?.imagesCollection?.items[1]?.url !== undefined) ? blockData?.imagesCollection?.items[1]?.url : ''}" class="topleft" alt="${(blockData?.imagesCollection?.items[1]?.title !== undefined) ? blockData?.imagesCollection?.items[1]?.title : ''}"/>
        <div class="caption"><p class="content">${blockData?.bodyCopy}</p>
        <a href="${(blockData?.linkUrl) ? blockData?.linkUrl : ''}" class="button button--secondary buttonlink">${blockData?.linkText}</a></div></div><div class="topright">
        <img src="${(blockData?.imagesCollection?.items[2]?.url !== undefined) ? blockData?.imagesCollection?.items[2]?.url : ''}"  alt="${(blockData?.imagesCollection?.items[2]?.title !== undefined) ? blockData?.imagesCollection?.items[2]?.title : ''}" />
        </div></div><div class="mobilecaption"><p class="content">${blockData?.bodyCopy}</p><a href="${(blockData?.linkUrl) ? blockData?.linkUrl : ''}" class="button button--secondary buttonlink">${blockData?.linkText}</a></div>
        <div class="mobilebanner"><img src="${blockData?.imagesCollection?.items[0]?.url}" alt="${blockData?.imagesCollection?.items[0]?.title}" /></div></div></div>`;
}

export function BlockElementBigCarousel(blockData) {
    let sliderLi = blockData.imagesCollection.items.map((item) => {
        return `<li><div class="blockrow"><div class="leftblock block">
        <img src="${item.url}" alt="image left block" />
        </div><div class="rightblock block"><div class="caption">
        <h2 class="title">${blockData.title}</h2><p class="content">${(blockData.bodyCopy) ? blockData.bodyCopy : ''}</p>${blockData.linkUrl ? `<a href="${(blockData.linkUrl) ? blockData.linkUrl : ''}" class="buttonlink">${(blockData.linkText) ? blockData.linkText : ''}</a>` : ''}
        </div></div></div></li>`
    });
    return `<div class="imageWithContentSlider block-item full-size" id="imageWithContentSlider"><ul data-slick='{"slidesToShow": 1, "slidesToScroll": 1,"infinite": true}'>${sliderLi.join('')}</ul></div>`;
}

export function imageWithContentSlider(blockData) {
    let sliderLi = blockData?.bigCarouselImagesCollection?.items?.map((item) => {
        return `<li><div class="blockrow"><div class="leftblock block">
        <img src="${item?.imagesCollection?.items[0]?.url}" alt="image left block" />
        </div><div class="rightblock block"><div class="caption">
        <h2 class="title">${item?.title}</h2><p class="content">${(item.bodyCopy) ? item.bodyCopy : ''}</p>${item.linkUrl ? `<a href="${(item.linkUrl) ? item.linkUrl : ''}" class="buttonlink">${(item.linkText) ? item.linkText : ''}</a>` : ''}
        </div></div></div></li>`
    });
    return `<div class="imageWithContentSlider block-item full-size" id="imageWithContentSlider"><ul data-slick='{"slidesToShow": 1, "slidesToScroll": 1,"infinite": true}'>${sliderLi.join('')}</ul></div>`;
};

export function collectionPreview(blockData) {
    if (blockData?.imagesCollection?.items?.length > 0) {
        if (blockData.imagesCollection.items.length > 2) {
            return `<div class="blockElementCollectionPreview block-item" id="blockElementCollectionPreview"><div class="previewblock">
            <div class="caption"><h4>${blockData.title}</h4><p>${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</a></div>
            <div class="imagesection"><div class="leftImg half"><img src="${blockData?.imagesCollection?.items[0]?.url}"  alt="${blockData?.imagesCollection?.items[0]?.description}"/>
            <div class="dateSection">
            ${blockData.photoCaption !== null ? `<p>${blockData.photoCaption}</p>` : ''}
            ${blockData.photoCaptionDate !== null ? `<p>${blockData.photoCaptionDate}</p>` : ''}
            </div>
            </div><div class="rightImg half">
            <img src="${blockData?.imagesCollection?.items[1]?.url}" alt="${blockData?.imagesCollection?.items[1]?.description}"/>
            ${blockData?.imagesCollection?.items[2] ? `<img src="${blockData?.imagesCollection?.items[2]?.url}" alt="${blockData?.imagesCollection?.items[2]?.description}"/>` : ''}
            </div></div></div></div>`;
        } else {
            let leftImg = '';
            if (blockData?.imagesCollection?.items[0]) {
                leftImg = `<span><img src="${blockData?.imagesCollection?.items[0]?.url}"  alt="${blockData?.imagesCollection?.items[0]?.description}"/></span>`;
            }
            let rightImg = '';
            if (blockData?.imagesCollection?.items[1]) {
                rightImg = `<div class="rightImg">
                <span><img src="${blockData?.imagesCollection?.items[1]?.url}" alt="${blockData?.imagesCollection?.items[1]?.description}"/></span>
                </div>`;
            }
            return `<div class="blockElementCollectionPreview block-item" id="blockElementCollectionPreview"><div class="previewblock">
            <div class="caption"><h4>${blockData.title}</h4><p>${blockData.bodyCopy}</p><a href="${(blockData.linkUrl) ? blockData.linkUrl : ''}" class="button button--secondary buttonlink">${blockData.linkText}</a></div>
            <div class="imagesection"><div class="leftImg">${leftImg}
            <div class="dateSection">
            ${blockData.photoCaption !== null ? `<p>${blockData.photoCaption}</p>` : ''}
            ${blockData.photoCaptionDate !== null ? `<p>${blockData.photoCaptionDate}</p>` : ''}
            </div>
            </div>${rightImg}</div></div></div>`;
        }
    } else {
        return '';
    }
};

export function leftTextBlockglobal(selectorId,blockData) {
    return `<div id="${selectorId} block-item" class="${selectorId}"><img src="${blockData.backgroundImage.url}" alt="category banner" />
        <div class="overlay"></div><div class="caption"><h2 class="title">${blockData.bannerTitle}</h2><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div></div>`;
};

export function blockElementVerticalGallery(blockData) {
    if(blockData.imagesCollection) {
        let leftData = '';
        blockData?.imagesCollection?.items?.map((item,i) => {
            if(i % 2 === 0) {
                if(item.description === '') {
                    leftData += `<div class="contentDiv"><img src="${item.url}" alt="${item.title}" /></div>`;
                } else {
                    let descriptionArr = (item.description) ? item.description.split('—') : '';
                    let descriptionHtml = '';
                    if (descriptionArr.length > 0) {
                        descriptionHtml = `<p class="caption">${descriptionArr[0]} ${(descriptionArr[1] != null && descriptionArr[1] != undefined) ? `<span class="author">-${descriptionArr[1]}</span>` : ''}</p>`;
                    }
                    leftData +=  `<div class="contentDiv"><img src="${item.url}" alt="${item.title}" />${descriptionHtml}</div>`;
                }
            }
        });
        let rightData = '';
        blockData?.imagesCollection?.items?.map((item,i) => {
            if (i % 2 !== 0) {
                if(item.description === '') {
                    rightData += `<div class="contentDiv"><img src="${item.url}" alt="${item.title}" /></div>`;
                } else {
                    let descriptionHtml = '';
                    if (item.description) {
                        let descriptionArr = item.description.split('—');
                        descriptionHtml = `<p class="caption">${descriptionArr[0]} ${(descriptionArr[1] != null && descriptionArr[1] != undefined) ? `<span class="author">-${descriptionArr[1]}</span>` : ''}</p>`;
                    }
                    
                    rightData += `<div class="contentDiv"><img src="${item.url}" alt="${item.title}" />${descriptionHtml} </div>`;
                }
            }
        });
        return `<div class="blockElementVerticalGallery block-item full-size" id="blockElementVerticalGallery"><div class="backgroundoverlay"></div><div class="verticalcontainer"><div class="verticalBlock"><div class="verticalLeftCol">${leftData}</div><div class="verticalRightCol">${rightData}</div></div></div></div>`;
    }
};

function productCard(products) {
    return products.map((item) => {
        return `<li class="product"><article class="card" data-test="card-271"><figure class="card-figure">
                    <a href="${item?.node?.path}" class="card-figure__link"><div class="card-img-container">
                            <img src="${item?.node?.defaultImage?.url}" alt="${item?.node?.name}" title="${item?.node?.name}" data-sizes="auto" 
                            srcset="${item?.node?.defaultImage?.url} 80w, ${item?.node?.defaultImage?.url} 160w, ${item?.node?.defaultImage?.url} 320w, ${item?.node?.defaultImage?.url} 640w, ${item?.node?.defaultImage?.url} 960w, ${item?.node?.defaultImage?.url} 1280w, ${item?.node?.defaultImage?.url} 1920w, ${item?.node?.defaultImage?.url} 2560w" 
                            data-srcset="${item?.node?.defaultImage?.url} 80w, ${item?.node?.defaultImage?.url} 160w, ${item?.node?.defaultImage?.url} 320w, ${item?.node?.defaultImage?.url} 640w, ${item?.node?.defaultImage?.url} 960w, ${item?.node?.defaultImage?.url} 1280w, ${item?.node?.defaultImage?.url} 1920w,${item?.node?.defaultImage?.url} 2560w" class="card-image lazyautosizes lazyloaded" sizes="257px">
                        </div></a><div class="card-body"><h3 class="card-title"><a aria-label="${item?.node?.name}" "="" href="${item?.node?.path}" class="name">Style ${item?.node?.name}</a>
                    <a href="/wishlist.php?action=addwishlist&product_id=${item?.node?.entityId}" class="titleIcon"></a></h3><div class="card-text" data-test-info-type="price">${item?.node?.description}</div></article>
                </li>`;
    });
};

export function blockElementImages2ColumnRight(blockData) {
    let  contentStructure = `<div class="blockElementImages2ColumnRight block-item" id="blockElementImages2ColumnRight"><div class="col1"><img src="${blockData?.image1Column?.url}" alt="${blockData?.image1Column?.title}" /></div><div class="col2"><img src="${blockData?.image2Column?.url}" src="${blockData?.image2Column?.title}" /></div></div>`;
    return contentStructure;
};

export function blockElementImageLeftCopyRight(blockData) {
    let  contentStructure = `<div class="blockElementImageLeftCopyRight block-item" id="blockElementImageLeftCopyRight"><div class="leftimageblock"><div class="leftImg"><img src="${blockData?.image?.url}" src="${blockData?.blockName}" /></div><div class="textSection"><div class="caption"><h3>${blockData?.blockName}</h3><p>${blockData?.bodyCopy}</p><a  href="${blockData?.linkUrl}" class="button button--secondary">${blockData?.linkText}</a></div></div></div></div>`;
    return contentStructure;
};

export function leftTextBlock(selectorId,blockData) {
    let contentStructure = `<img src="${blockData?.backgroundImage?.url}" alt="category banner" />
        <div class="overlay"></div><div class="caption"><h2 class="title">${blockData?.bannerTitle}</h2><p class="content">${blockData?.bodyCopy}</p><a href="${blockData?.linkUrl}" class="buttonlink">${blockData?.linkText}</a></div>`;

    document.getElementById(selectorId).innerHTML = contentStructure;
};

export function createProductSlider(block,blockData) {
    let prdlist = [];
    if(blockData?.products?.edges?.length > 0 ){
        prdlist = productCard(blockData?.products?.edges);
        block.querySelector('.sub-products').innerHTML = `<ul class="productGridslider" data-slick='{"slidesToShow": 4, "slidesToScroll": 4}'>${prdlist?.join('')}</ul>`;
    } else {
        block.querySelector('.sub-products').innerHTML = `<p data-no-products-notification role="alert" aria-live="assertive"tabindex="-1">There are no products listed under this category.</p>`;
    }
    block.querySelector('.sub-description').innerHTML = blockData?.description;
};

export function blogpostTopBanner(selectorID,title,heading,imageHeading,date){
    let  contentStructure = `<div class="topbannerSection"><img src="${imageHeading?.url}" alt="${title}" /><div class="overlay"></div><div class="caption"><h2>${title ? title : ''}</h2><span class="date">${date ? date : ''}<div class="divider"></div></span><p class="subheading">${heading ? heading : ''}</p></div></div>`;
    document.getElementById(selectorID).innerHTML = contentStructure;
};

export function lookBook(selectorID, blockData) {
    let blockItem = `<div><h4 class="title">${(blockData.blocktitle) ? blockData.blocktitle : ''} - ${(blockData.subheadline) ? blockData.subheadline : ''}</h4><div class="contentSection"><img src="${(blockData.imagesCollection.items[0].url) ? blockData.imagesCollection.items[0].url : ''}" alt="${(blockData.subheadline) ? blockData.subheadline : ''}" /><div class="caption"><div class="caption">
        ${(blockData?.bodyCopy == null || blockData?.bodyCopy == undefined) ? '' :
            `<p class="content">${blockData.bodyCopy}</p>`
        }   
        ${(blockData?.linkText == null || blockData?.linkText == undefined) ? '' :
            `<a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a>` }
        </div></div></div>`;
    document.getElementById(selectorID).innerHTML = blockItem;
};

export function blogpostContentBlock(selectorID,blockData){
    let paragraphs = blockData?.bodyCopy?.json?.content?.map((p,i) =>
    `<p class="para-${i}">${p?.content?.map((cont)=>{
        if (cont.nodeType === 'text' || cont.nodeType === 'paragraph') {
            return cont.value;
        }
        if (cont.nodeType === 'hyperlink') {
            return `<a href="${cont.data.uri ? cont.data.uri : cont.data.url}" target="_blank">${cont.content[0]?.value ? cont.content[0]?.value : cont.data.uri}</a>`;
        }
    }).join('')}</p>`).join('');

    const dataDisplay = (name,data) => {
        return `<div class="row"><div>${name}</div>
            <div>
                ${data.json?.content.map((p)=>
                    `<span >
                        ${p?.content?.map((cont)=>{
                            if (cont.nodeType === 'text' || cont.nodeType === 'paragraph') {
                                return cont.value;
                            }
                            if (cont.nodeType === 'hyperlink') {
                                return `<a href="${cont.data.uri ? cont.data.uri : cont.data.url}" target="_blank">${cont.content[0]?.value ? cont.content[0]?.value : cont.data.uri}</a>`;
                            }
                        }).join('')}
                    </span>`
                ).join(' ') }
            </div>
        </div>`
    };
    let rightsideblock = `<h6>VENDORS</h6>
        <div class="flexdiv">
            ${blockData?.gown !== null ? `${dataDisplay('Gown',blockData.gown)}`  : ''}
            ${blockData?.tuxedos !== null ? `${dataDisplay('Tuxedos',blockData.tuxedos)}`  : ''}
            ${blockData?.photographyVideography !== null ? `${dataDisplay('Photographer/Videography',blockData.photographyVideography)}`  : ''}
            ${blockData?.florals !== null ? `${dataDisplay('Florals',blockData.florals)}`  : ''}
            ${blockData?.planningVenue !== null ? `${dataDisplay('Planning & Venue',blockData.planningVenue)}`  : ''}
        </div>`;
        let  contentStructure = '';
        if(blockData.gown === null && blockData.tuxedos === null && blockData.photographyVideography === null && blockData.florals === null && blockData.planningVenue === null) {
            contentStructure = `<div class="content-sections-block"><div class="leftblock fullwidth">${paragraphs}</div></div>`;
        } else {
            contentStructure = `<div class="content-sections-block"><div class="leftblock">${paragraphs}</div><div class="rightblock">${rightsideblock}</div></div>`;
        }
    document.getElementById(selectorID).innerHTML = contentStructure;
};

export function collectionHeaderContent(element) {
    const headerContent = document.querySelector('.blockElementHeaderContent');
    headerContent.innerHTML = `${(element.collectionName) ? '<h1>' + element.collectionName + '</h1>' : ''}
        <p>${(element.collectionSubheadline) ? element.collectionSubheadline : ''}</p><div>
        ${(element.collectionButton) ? '<a href="' + element.collectionButtonUrl +'" class="button button--secondary buttonlink">' + element.collectionButton +'</a>' : ''}
        </div>`;
};

export function referencedBlockHomepageCollections(blockData) {

    let logoStructure = blockData.homepageCollectionsCollection?.items?.map((item,i) => {
        return `<div class="tab ${i === 0 ? 'is-active' : ''}" role="presentation">${item?.logoImage.url ? `<img class="first" src="${item?.logoImage.url}" alt="${item?.logoImage.title}" />` : ''}</div>`;
    });

    let contentStructure = blockData.homepageCollectionsCollection?.items?.map((item,i) => {
        return `<div class="tab-content ${i === 0 ? 'is-active' : ''} ${item?.slug}" id="tab-description-${i}">
            <div class="blockElementDiscover">
                <div class="discovery-section">
                    <div class="imageflex">
                        <div class="leftcol">${item?.imageLeft.url ? `<img class="first" src="${item?.imageLeft.url}" alt="${item?.imageLeft.title}" />` : ''}
                        ${item?.imageCenter.url ? `<img class="second" src="${item?.imageCenter.url}" alt="${item?.imageCenter.title}"/>` : ''}</div>
                        <div class="rightcol">${item?.imageRight.url ? `<img  class="third" src="${item?.imageRight.url}"  alt="${item?.imageRight.title}" />` : '' }</div>
                    </div>
                    <div class="caption">
                        <h2>${item?.collectionName}</h2>
                        <p class="content">${item?.description}</p>
                        <a href="${item?.linkUrl}" class="button button--secondary buttonlink">${item?.linkText}</a>
                    </div>
                </div>
            </div>
        </div>`
    });

    return  `<div class="block-item logotabsblocksection"><div class="tabs logoTabs" data-tab role="tablist">${logoStructure.join('')}</div><div class="logotabcontents tabs-contents">${contentStructure.join('')}</div></div>`;
};