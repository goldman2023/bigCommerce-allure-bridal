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
        if (response?.data?.site?.product !== undefined) {
            const product = response.data.site.product;
            if (product?.metafields?.edges?.length > 0) {
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
        } else {
            let metafieldData = [];
            callback.call(this, metafieldData);
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
            } else {
                let contentFul = {};
                let related = {};
                callback.call(this, {contentFul, related});
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
                let footer = [];
                let navigation = [];
                for(const [index, metafield] of metafields.entries()) {
                    if (typeof callback == 'function') {
                        const metaFieldObj = {"key": metafield.node.key, "value": JSON.parse(metafield.node.value)};
                        metafieldData.push(metaFieldObj);
                        if (index+1 === noOfEntries) {
                            for (const data of metafieldData) {
                                if (data.key === "Data for footer") {
                                    footer = data.value;
                                }
                                if (data.key === "Data for navigation") {
                                    navigation = data.value;
                                }
                            }
                        }
                    }
                }
                callback.call(this, { navigation, footer });
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
        const navigationElMobile = document.querySelector('.newmobilemenu');

        let navigationHtml = ``;
        let navigationHtmlMobile = `<li class="navPages-item my-acct"><a href="${context.customer ? '/account.php?action=order_status' : '/login.php'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M19.6339 22.7601C17.7435 24.0475 15.4596 24.8001 13 24.8001C10.5403 24.8001 8.25641 24.0475 6.36599 22.7601H7.09995C7.09995 19.5016 9.74147 16.8601 13 16.8601C16.2584 16.8601 18.9 19.5016 18.9 22.7601H19.6339ZM19.8975 22.5753C19.8133 19.3707 17.5441 16.7103 14.525 16.0292C16.4492 15.3904 17.8371 13.5759 17.8371 11.4373C17.8371 8.76577 15.6714 6.60007 12.9999 6.60007C10.3284 6.60007 8.1627 8.76577 8.1627 11.4373C8.1627 13.5759 9.55063 15.3904 11.4749 16.0292C8.45582 16.7103 6.18665 19.3707 6.10238 22.5753C3.13277 20.4323 1.19995 16.9419 1.19995 13.0001C1.19995 6.48311 6.48299 1.20007 13 1.20007C19.5169 1.20007 24.8 6.48311 24.8 13.0001C24.8 16.9419 22.8671 20.4323 19.8975 22.5753ZM25.8 13.0001C25.8 20.0693 20.0692 25.8001 13 25.8001C5.93071 25.8001 0.199951 20.0693 0.199951 13.0001C0.199951 5.93083 5.93071 0.200073 13 0.200073C20.0692 0.200073 25.8 5.93083 25.8 13.0001ZM12.9999 15.2745C15.1191 15.2745 16.8371 13.5565 16.8371 11.4373C16.8371 9.31805 15.1191 7.60007 12.9999 7.60007C10.8807 7.60007 9.1627 9.31805 9.1627 11.4373C9.1627 13.5565 10.8807 15.2745 12.9999 15.2745Z" fill="#1D1B1B" ></path>
            </svg><span class="navPages-action accountlink">My Account</span></a></li>`;

        let index = 0;

        for (const navigation of globalData.navigation) {
            const topNavs = navigation.navEntriesCollection.items;
            for (const topNav of topNavs) {
                navigationHtml += `<li class="site-navigation__link"><a href="${topNav.topNavLinkUrl}">${topNav.topNavLinkName}</a>`;

                navigationHtmlMobile += `<li class="navPages-item">
                    <a href="${topNav.topNavLinkUrl}" 
                            data-collapsible="navPages-${index}" 
                            aria-controls="navPages-${index}" 
                            class="navPages-action ${topNav.sectionChildNavigationCollection?.items?.length > 0 && 'has-subMenu'}"
                            aria-expanded="false"
                            >
                        ${topNav.topNavLinkName} 
                        <i class="icon navPages-action-moreIcon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="16" viewBox="0 0 8 16" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.400086 14.9374C0.0876666 14.625 0.0876666 14.1184 0.400086 13.806L6.2344 7.97169L0.400086 2.13738C0.087666 1.82496 0.087666 1.31843 0.400085 1.00601C0.712505 0.693586 1.21904 0.693586 1.53146 1.00601L7.36577 6.84032C7.99061 7.46516 7.99061 8.47822 7.36577 9.10306L1.53146 14.9374C1.21904 15.2498 0.712506 15.2498 0.400086 14.9374Z" fill="#93908F"></path>
                        </svg></i>
                    </a>`;

                if (topNav.sectionChildNavigationCollection.items.length > 0) {

                    navigationHtmlMobile += `<div class="navPage-subMenu" id="navPages-${index}" aria-hidden="true" tabindex="-1">
                    <ul class="navPage-subMenu-list">`;

                    navigationHtml += `<div class="sub-site__navigation"><div class="sub-site__navigation-inner">`;

                    for (const secondNav of topNav.sectionChildNavigationCollection.items) {
                        navigationHtmlMobile += `<li class="navPage-subMenu-item">
                            <a class="navPage-subMenu-action navPages-action ${secondNav.navItemsCollection?.items?.length > 0 && 'has-subMenu'}" href="${secondNav.navSectionUrl}" aria-label="${secondNav.navSectionName}">${secondNav.navSectionName}
                            ${secondNav.navItemsCollection?.items?.length > 0 ? `
                            <span class="collapsible-icon-wrapper"
                            data-collapsible="navPages-${secondNav.navSectionName.replaceAll(' ','')}"
                            data-collapsible-disabled-breakpoint="medium"
                            data-collapsible-disabled-state="open"
                            data-collapsible-enabled-state="closed"
                        >
                            <i class="icon navPages-action-moreIcon" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="6" viewBox="0 0 12 6" fill="none">
                                    <path d="M10.7929 6.10352e-05H1.20711C0.761654 6.10352e-05 0.538571 0.538632 0.853554 0.853615L5.64645 5.64651C5.84171 5.84177 6.15829 5.84177 6.35355 5.64651L11.1464 0.853615C11.4614 0.538632 11.2383 6.10352e-05 10.7929 6.10352e-05Z" fill="#BC8372"/>
                                    </svg>
                            </i>
                        </span>`: ''}</a>
                        `;

                        navigationHtml += `<ul class="sub-site__navigation-${secondNav.navSectionName.toLowerCase()}">
                                <li class="sub-site__title">
                                    <a href="${secondNav.navSectionUrl}">
                                        ${secondNav.navSectionName}
                                    </a>
                                </li>`;
                        if (secondNav.navItemsCollection.items.length > 0) {

                            navigationHtmlMobile += `<ul class="navPage-childList" id="navPages-${secondNav.navSectionName.replaceAll(' ','')}">`;

                            for (const thirdNav of secondNav.navItemsCollection.items) {  
                                navigationHtmlMobile += `<li class="navPage-childList-item">
                                    <a class="navPage-childList-action navPages-action"
                                    href="${thirdNav.navLinkUrl}"
                                    aria-label="${thirdNav.navLinkName}"
                                    >
                                    ${thirdNav.navLinkName}
                                        <i class="icon navPages-action-moreIcon" aria-hidden="true">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="16" viewBox="0 0 8 16" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.400086 14.9374C0.0876666 14.625 0.0876666 14.1184 0.400086 13.806L6.2344 7.97169L0.400086 2.13738C0.087666 1.82496 0.087666 1.31843 0.400085 1.00601C0.712505 0.693586 1.21904 0.693586 1.53146 1.00601L7.36577 6.84032C7.99061 7.46516 7.99061 8.47822 7.36577 9.10306L1.53146 14.9374C1.21904 15.2498 0.712506 15.2498 0.400086 14.9374Z" fill="#93908F"/>
                                            </svg>
                                        </i>
                                    </a>
                                </li>
                                `

                                navigationHtml +=`<li class="sub-site__text"><a href="${thirdNav.navLinkUrl}">${thirdNav.navLinkName}</a></li>`;
                            }   
                            navigationHtmlMobile += `</ul>`;

                        }
                        navigationHtmlMobile += `</li>`;

                        navigationHtml += `</ul>`;

                    }
                    navigationHtml += `
                        <div class="sub-site__navigation-image">
                            <img data-src="${topNav.megaMenuImage.url}" class="lazyload">
                        </div>
                    </div></div>`;

                    navigationHtmlMobile += `</ul><div class="sub-site__navigation-image">
                    <img data-src="${topNav.megaMenuImage.url}" class="lazyload">
                </div></div>`
                }
                
                navigationHtml += `</li>`;
                navigationHtmlMobile +=  `</li>`;

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
        navigationElMobile.innerHTML = navigationHtmlMobile;

        setTimeout(() => {
            const mobileNavItems = document.querySelectorAll('.newmobilemenu .navPages-item .has-subMenu');
            [].forEach.call(mobileNavItems, function (mobileNavItem) {
                mobileNavItem.addEventListener("click", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    mobileNavItem.classList.toggle('is-open');
                    mobileNavItem.nextElementSibling.classList.toggle('is-open');
                }, false);
            });
        }, 500);

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
    if(blockdata?.products?.edges?.length > 0) {
        if (blockdata.products.edges[0].node.defaultImage !== null) {
            block.querySelector('.cardimage').setAttribute("src", blockdata.products.edges[0].node.defaultImage.url);
        } else {
            block.querySelector('.cardimage').setAttribute("src", 'https://via.placeholder.com/150x250?Text=No Image');  
        }
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
            } else {
                let metafieldData = [];
                callback.call(this, metafieldData);
            }
        }
    });
}
export function getProducts(context, selector, prodList, slidescroll) {
    let products = [];
    if (selector === '.recentlyViewed .prodData' || selector === '.thePerfectMatch .prodData' || selector === '.youMightalsoLike .prodData' || selector === '.productSlider .productGridSection') {
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
            if (productsData.data) {
                const productArray = productsData.data.site.products.edges;
                let prdlist = [];
                if (productArray.length > 0) {
                    prdlist = productCard(context, productArray);
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
            document.getElementById(selectorID).innerHTML = `<div><video autoplay playsinline loop muted plays-inline="" id="colbannerVideo"><source src="${element.videoUrl}" type="video/mp4"><source src="${element.videoUrl}" type="video/ogg">Your browser does not support HTML video.</video></div>`;
        }
    }
    if (element?.backgroundImage?.url && element?.backgroundImage?.url !== undefined) {
        document.getElementById(selectorID).innerHTML = `<img alt="${element?.backgroundImage?.title}" data-src="${element?.backgroundImage?.url}" class="lazyload"/>`;
    }
}

export function globalblockElementFullscreenVideo(element) {
    let videoURL = '';
    if(element.videoUrl.includes('youtube')) {
        videoURL = `https://www.youtube.com/embed/${element.videoUrl.split('=')[1]}`;
        return `<div class="blockElementFullscreenVideo block-item full-size" ><div><iframe type="text/html" src="${videoURL}"  frameborder="0" id="colbannerVideo" controls=0></iframe></div></div>`;
    } else {
          return `<div class="blockElementFullscreenVideo block-item full-size" ><div><video autoplay loop muted playsinline plays-inline="" id="colbannerVideo"><source src="${element.videoUrl}" type="video/mp4"><source src="${element.videoUrl}" type="video/ogg">Your browser does not support HTML video.</video></div></div>`;
    }
}

export function lookBookglobal(blockData) {
    return `<div class="blockElementLookbook block-item full-size" id="blockElementLookbook"><div><h4 class="title">${(blockData?.blocktitle) ? blockData?.blocktitle : ''} - ${(blockData?.subheadline) ? blockData?.subheadline : ''}</h4><div class="contentSection"><img data-src="${(blockData?.imagesCollection?.items[0]?.url) ? blockData?.imagesCollection?.items[0]?.url : ''}" alt="${(blockData?.subheadline) ? blockData?.subheadline : ''}" class="lazyload"/><div class="caption">
        ${(blockData?.bodyCopy == null || blockData?.bodyCopy == undefined) ? '' :
        `<p class="content">${blockData.bodyCopy}</p>`
        }   
        ${(blockData?.linkText == null || blockData?.linkText == undefined) ? '' :
        `<a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a>` }
        </div></div></div></div>`;
}

export function lookBookglobal2(blockData) {
    return `<div class="blockElementLookbook2 block-item full-size" id="blockElementLookbook2"><div><div class="caption"><h2>${(blockData.blocktitle) ? blockData.blocktitle : ''}</h2><div class="divider"></div><h4>${(blockData.subheadline) ? blockData.subheadline : ''}</h4><p class="content">${blockData?.bodyCopy}</p><a href="${blockData?.linkUrl}" class="button button-secondary">${blockData?.linkText}</a></div><div class="contentSection"><img data-src="${(blockData?.imagesCollection?.items[0]?.url) ? blockData?.imagesCollection?.items[0]?.url : ''}" alt="${blockData?.subheadline}" class="lazyload"/></div></div></div>`;
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
                <div class="imageblock col"><img data-src="${item.eventImage.url}" alt="${item.retailerName}" class="lazyload"/></div>
                <div class="contentBlock col">
                    <h4>${item.retailerName}</h4>
                    <p class="addressp">${item.location}</p>
                    <div class="divider"></div>
                    <label>Date</label>
                    <p class="colored">${new Date(item.eventStartDate).toLocaleDateString().replaceAll('/','.')} - ${new Date(item.eventEndDate).toLocaleDateString().replaceAll('/','.')}</p>
                    <label>Collections</label>
                    <p class="colored">${item.collectionsAvailable.map((col)=> `${col}`).join(", ")}</p>
                    <label>address</label>
                    <span>${item.locationAddressStreet}</span>
                    <span>${item.locationAddressCityStateZip}</span>
                    <p><a class="colored" href="http://maps.google.com/?q=${item.locationAddressStreet} ${item.locationAddressCityStateZip}">GET DIRECTIONS</a></p>
                    <label>Phone</label>
                    <p>${item.locationPhoneNumber}</p>
                    <label>website</label>
                    <a href="${item.locationWebsiteUrl}" target="_blank" class="colored">${item.locationWebsiteUrl}</a>
                </div>
              </div>
            </div>`).join('')}
    </div>
    ${blockData.containerButtonUrl !== null ? `<a href="${blockData.containerButtonUrl}" class="button button--secondary" >${blockData.containerButtonText}</a>` : ''}
    </div>`;
}
export function blockElementFullscreenImage(blockData) {
    console.log(blockData?.contentOrScreenWidth);
    return `<div class="blockElementFullscreenImage block-item ${(blockData?.contentOrScreenWidth === 'Screen Width') ? 'full-size' : ''}" id="blockElementFullscreenImage"><div class="mainImage"><img data-src="${blockData?.backgroundImage?.url}" alt="${(blockData?.subheadline && blockData?.subheadline !== undefined) ? blockData?.subheadline : ''}" class="lazyload"/>
    ${blockData?.bodyCopy !== null ? `<div class="homepageCaption"><div class="content"><div class="bannercap"><h4>${(blockData?.subheadline && blockData?.subheadline !== undefined) ? blockData?.subheadline : ''}</h4><p>${(blockData?.bodyCopy && blockData?.bodyCopy !== undefined) ? blockData?.bodyCopy : ''}</p><a href="${blockData?.linkUrl}">${blockData?.linkText}</a></div>` : ''}</div></div></div></div>`;
}

export function blockElementCopyBlock(blockData) {
    return `<div class="blockElementCopyBlock block-item" id="blockElementCopyBlock"><div class="heightwidth"><h2 class="h2">${(blockData?.blockName && blockData?.blockName !== undefined) ? blockData?.blockName : ''}</h2><p class="body-light-1">${(blockData?.bodyCopy && blockData?.bodyCopy !== undefined) ? blockData?.bodyCopy : ''}<p></div></div>`;
}

export function logoSliderBlock(blockData) {
    return `<div class="logoSliderBlock block-item" id="logoSliderBlock"><div class="imgslider"> ${blockData?.logosCollection?.items.map((logo)=> `<div class="logo-item"><img data-src="${logo?.url}" alt="${logo?.title}" class="lazyload"/></div>` ).join('')}</div></div>`;
}

export function blockElement3ImagesScreenWidth(blockData) {
    let imgthum = blockData?.imagesCollection?.items?.map((image) => `<div class="imageDiv"><img data-src="${image.url}" alt="${image.title}" class="lazyload"/></div>`);
    return ` <div class="blockElement3ImagesScreenWidth block-item" id="blockElement3ImagesScreenWidth"><div class="thumbImg">${imgthum.join('')}</div></div>`;
};

export function blockElementDiscover(blockData) {
    return `<div class="blockElementDiscover block-item" id="blockElementDiscover">
                <div class="discovery-section">
                    <div class="imageflex">
                        <div class="leftcol">${blockData?.imagesCollection?.items[0]?.url ? `<img class="first lazyload" data-src="${blockData?.imagesCollection?.items[0]?.url}" alt="${blockData?.imagesCollection?.items[0]?.title}" />` : ''}
                        ${blockData?.imagesCollection?.items[1]?.url ? `<img class="lazyload second" data-src="${blockData?.imagesCollection?.items[1]?.url}" alt="${blockData?.imagesCollection?.items[1]?.title}"/>` : ''}</div>
                        <div class="rightcol">${blockData?.imagesCollection?.items[2]?.url ? `<img  class="lazyload third" data-src="${blockData?.imagesCollection?.items[2]?.url}"  alt="${blockData?.imagesCollection?.items[2]?.title}" />` : '' }</div>
                    </div>
                    <div class="caption">
                        ${(blockData?.blocktitle && blockData?.blocktitle !== undefined) ?
                        `<h1 class="h1-italic">${blockData?.blocktitle}</h1>` : ''}
                        ${(blockData?.bodyCopy && blockData?.bodyCopy !== undefined) ?
                        `<p class="content body-1">${blockData?.bodyCopy}</p>` : ''}
                        ${(blockData?.linkUrl && blockData?.linkUrl !== undefined) ?
                        `<a href="${blockData?.linkUrl}" class="button button--secondary buttonlink">${blockData?.linkText}</a>`: ''}
                    </div>
                </div>
            </div>`;
}

export function blockElementStory(blockData) {
    return `<div class="blockElementStory block-item" id="blockElementStory">
    <div class="flexdata"><div class="heading-section"><h1 class="title h1-italic">${blockData?.blockname}</h1>${(blockData?.displayedate != undefined && blockData?.displayedate != null) ? `<p class="date body-3"><span class="borderdate"></span><span class="originaldate">${blockData?.displayedate}</span></p>` : `<p></p></br>`}<div class="leftBottom">
        <img data-src="${blockData?.imagesCollection?.items[0]?.url}" alt="${blockData?.imagesCollection?.items[0]?.title}" class="lazyload"/>
        </div></div><div class="rightside-section"><div class="rightcol">
        <img data-src="${(blockData?.imagesCollection?.items[1]?.url !== undefined) ? blockData?.imagesCollection?.items[1]?.url : ''}" class="topleft lazyload" alt="${(blockData?.imagesCollection?.items[1]?.title !== undefined) ? blockData?.imagesCollection?.items[1]?.title : ''}"/>
        <div class="caption"><p class="content body-2">${(blockData?.bodyCopy && blockData?.bodyCopy !== undefined) ? blockData?.bodyCopy : ''}</p>
        ${(blockData?.linkUrl && blockData?.linkUrl !== undefined && blockData?.linkText && blockData?.linkText !== undefined) ? 
        `<a href="${(blockData?.linkUrl) ? blockData?.linkUrl : ''}" class="button button--secondary buttonlink">${(blockData?.linkText) ? blockData?.linkText : ''}</a>` : ''}
        </div></div><div class="topright">
        <img data-src="${(blockData?.imagesCollection?.items[2]?.url !== undefined) ? blockData?.imagesCollection?.items[2]?.url : ''}"  alt="${(blockData?.imagesCollection?.items[2]?.title !== undefined) ? blockData?.imagesCollection?.items[2]?.title : ''}" class="lazyload"/>
        </div></div><div class="mobilecaption"><p class="content body-2">${(blockData?.bodyCopy && blockData?.bodyCopy !== undefined) ? blockData?.bodyCopy : ''}</p>
        ${(blockData?.linkUrl && blockData?.linkUrl !== undefined && blockData?.linkText && blockData?.linkText !== undefined) ?
        `<a href="${(blockData?.linkUrl) ? blockData?.linkUrl : ''}" class="button button--secondary buttonlink">${(blockData?.linkText) ? blockData?.linkText : ''}</a>` : ''}
        </div>
        <div class="mobilebanner"><img data-src="${blockData?.imagesCollection?.items[0]?.url}" alt="${blockData?.imagesCollection?.items[0]?.title}" class="lazyload"/></div></div></div>`;
}

export function BlockElementBigCarousel(blockData) {
    let sliderLi = blockData.imagesCollection.items.map((item) => {
        return `<li><div class="blockrow"><div class="leftblock block">
        <img data-src="${item.url}" alt="image left block" class="lazyload"/>
        </div><div class="rightblock block"><div class="caption">
        <h1 class="title h1-italic">${blockData.title}</h1><p class="content body-light-1">${(blockData.bodyCopy) ? blockData.bodyCopy : ''}</p>${blockData.linkUrl ? `<a href="${(blockData.linkUrl) ? blockData.linkUrl : ''}" class="buttonlink body-3">${(blockData.linkText) ? blockData.linkText : ''}</a>` : ''}
        </div></div></div></li>`
    });
    return `<div class="imageWithContentSlider block-item full-size" id="imageWithContentSlider"><ul data-slick='{"slidesToShow": 1, "slidesToScroll": 1,"infinite": true}'>${sliderLi.join('')}</ul></div>`;
}

export function imageWithContentSlider(blockData) {
    let sliderLi = blockData?.bigCarouselImagesCollection?.items?.map((item) => {
        return `<li><div class="blockrow"><div class="leftblock block">
        <img data-src="${item?.imagesCollection?.items[0]?.url}" alt="image left block" class="lazyload"/>
        </div><div class="rightblock block"><div class="caption">
        <h1 class="title h1-italic">${item?.title}</h1><p class="content body-light-1">${(item.bodyCopy) ? item.bodyCopy : ''}</p>${item.linkUrl ? `<a href="${(item.linkUrl) ? item.linkUrl : ''}" class="buttonlink body-3">${(item.linkText) ? item.linkText : ''}</a>` : ''}
        </div></div></div></li>`
    });
    return `<div class="imageWithContentSlider block-item full-size" id="imageWithContentSlider"><ul data-slick='{"slidesToShow": 1, "slidesToScroll": 1,"infinite": true}'>${sliderLi.join('')}</ul></div>`;
};

export function collectionPreview(blockData) {
    if (blockData?.imagesCollection?.items?.length > 0) {
        if (blockData.imagesCollection.items.length > 2) {
            return `<div class="blockElementCollectionPreview block-item" id="blockElementCollectionPreview"><div class="previewblock">
            <div class="caption"><h2>${blockData.title}</h2><p class="body-1">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</a></div>
            <div class="imagesection"><div class="leftImg half"><img data-src="${blockData?.imagesCollection?.items[0]?.url}" class="lazyload" alt="${blockData?.imagesCollection?.items[0]?.description}"/>
            <div class="dateSection">
            ${blockData.photoCaption !== null ? `<p>${blockData.photoCaption}</p>` : ''}
            ${blockData.photoCaptionDate !== null ? `<p>${blockData.photoCaptionDate}</p>` : ''}
            </div>
            </div><div class="rightImg half">
            <img data-src="${blockData?.imagesCollection?.items[1]?.url}" alt="${blockData?.imagesCollection?.items[1]?.description}" class="lazyload"/>
            ${blockData?.imagesCollection?.items[2] ? `<img data-src="${blockData?.imagesCollection?.items[2]?.url}" alt="${blockData?.imagesCollection?.items[2]?.description}" class="lazyload"/>` : ''}
            </div></div></div></div>`;
        } else {
            let leftImg = '';
            if (blockData?.imagesCollection?.items[0]) {
                leftImg = `<span><img data-src="${blockData?.imagesCollection?.items[0]?.url}"  alt="${blockData?.imagesCollection?.items[0]?.description}" class="lazyload"/></span>`;
            }
            let rightImg = '';
            if (blockData?.imagesCollection?.items[1]) {
                rightImg = `<div class="rightImg">
                <span><img data-src="${blockData?.imagesCollection?.items[1]?.url}" alt="${blockData?.imagesCollection?.items[1]?.description}" class="lazyload"/></span>
                </div>`;
            }
            return `<div class="blockElementCollectionPreview block-item" id="blockElementCollectionPreview"><div class="previewblock">
            <div class="caption"><h2>${blockData.title}</h2><p class="body-1">${blockData.bodyCopy}</p><a href="${(blockData.linkUrl) ? blockData.linkUrl : ''}" class="button button--secondary buttonlink">${blockData.linkText}</a></div>
            <div class="imagesection"><div class="leftImg">${leftImg}
            <div class="dateSection">
            ${blockData.photoCaption !== null ? `<p class="body-2">${blockData.photoCaption}</p>` : ''}
            ${blockData.photoCaptionDate !== null ? `<p class="body-2">${blockData.photoCaptionDate}</p>` : ''}
            </div>
            </div>${rightImg}</div></div></div>`;
        }
    } else {
        return '';
    }
};

export function leftTextBlockglobal(selectorId, blockData) {

    return `<div id="${selectorId} block-item" class="${selectorId}"><img data-src="${blockData.backgroundImage.url}" alt="category banner" class="lazyload desktoponly"/><img data-src="${blockData?.mobileImage?.url}" alt="category banner" class="lazyload mobileonly"/>
        <div class="overlay"></div><div class="content-wrapper"><div class="caption"><h1 class="title h1-italic">${blockData.bannerTitle}</h1><p class="content body-light-2">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink body-3">${blockData.linkText}</a></div></div></div>`;
};

export function blockElementVerticalGallery(blockData) {
    if(blockData.imagesCollection) {
        let leftData = '';
        blockData?.imagesCollection?.items?.map((item,i) => {
            if(i % 2 === 0) {
                if(item.description === '') {
                    leftData += `<div class="contentDiv"><img data-src="${item.url}" alt="${item.title}" class="lazyload"/></div>`;
                } else {
                    let descriptionArr = (item.description) ? item.description.split('-') : '';
                    console.log(descriptionArr);
                    let descriptionHtml = '';
                    if (descriptionArr.length > 0) {
                        descriptionHtml = `<p class="caption body-1">${descriptionArr[0]} ${(descriptionArr[1] != null && descriptionArr[1] != undefined) ? `<span class="author body-light-2">-${descriptionArr[1]}</span>` : ''}</p>`;
                    }
                    leftData +=  `<div class="contentDiv"><img data-src="${item.url}" alt="${item.title}" class="lazyload"/>${descriptionHtml}</div>`;
                }
            }
        });
        let rightData = '';
        blockData?.imagesCollection?.items?.map((item, i) => {
            if (i % 2 !== 0) {
                if(item.description === '') {
                    rightData += `<div class="contentDiv"><img data-src="${item.url}" alt="${item.title}" class="lazyload"/></div>`;
                } else {
                    let descriptionHtml = '';
                    if (item.description) {
                        let descriptionArr = item.description.split('-');
                        console.log(descriptionArr);
                        descriptionHtml = `<p class="caption body-1">${descriptionArr[0]} ${(descriptionArr[1] != null && descriptionArr[1] != undefined) ? `<span class="author body-light-2">-${descriptionArr[1]}</span>` : ''}</p>`;
                    }
                    
                    rightData += `<div class="contentDiv"><img data-src="${item.url}" alt="${item.title}" class="lazyload"/>${descriptionHtml} </div>`;
                }
            }
        });
        return `<div class="blockElementVerticalGallery block-item full-size" id="blockElementVerticalGallery"><div class="backgroundoverlay"></div><div class="verticalcontainer"><div class="verticalBlock"><div class="verticalLeftCol">${leftData}</div><div class="verticalRightCol">${rightData}</div></div></div></div>`;
    }
};

function productCard(context, products) {
    return products.map((item) => {
        return `<li class="product"><article class="card" data-test="card-271"><figure class="card-figure">
                    <a href="${item?.node?.path}" class="card-figure__link"><div class="card-img-container">
                            ${ (item?.node?.defaultImage?.url && item?.node?.defaultImage?.url !== undefined) ? 
                                `<img data-src="${item?.node?.defaultImage?.url}" alt="${item?.node?.name}" title="${item?.node?.name}" data-sizes="auto" 
                                srcset="${item?.node?.defaultImage?.url} 80w, ${item?.node?.defaultImage?.url} 160w, ${item?.node?.defaultImage?.url} 320w, ${item?.node?.defaultImage?.url} 640w, ${item?.node?.defaultImage?.url} 960w, ${item?.node?.defaultImage?.url} 1280w, ${item?.node?.defaultImage?.url} 1920w, ${item?.node?.defaultImage?.url} 2560w" 
                                data-srcset="${item?.node?.defaultImage?.url} 80w, ${item?.node?.defaultImage?.url} 160w, ${item?.node?.defaultImage?.url} 320w, ${item?.node?.defaultImage?.url} 640w, ${item?.node?.defaultImage?.url} 960w, ${item?.node?.defaultImage?.url} 1280w, ${item?.node?.defaultImage?.url} 1920w,${item?.node?.defaultImage?.url} 2560w" class="card-image lazyautosizes lazyload">` : 
                                `<img data-src="${context.notFoundImg}" title="${item?.node?.name}" class="card-image lazyautosizes lazyload" />` 
                            }
                        </div></a><div class="card-body"><h4 class="card-title"><a aria-label="${item?.node?.name}" "="" href="${item?.node?.path}" class="name h4">${item?.node?.name}</a>
                    <a href="/wishlist.php?action=addwishlist&product_id=${item?.node?.entityId}" data-id="${item?.node?.entityId}" class="titleIcon">
                    <div class="loadingOverlay"></div></a></h4><div class="card-text body-3" data-test-info-type="price">${item?.node?.description}</div></article>
                </li>`;
    });
};

export function blockElementImages2ColumnRight(blockData) {
    let  contentStructure = `<div class="blockElementImages2ColumnRight block-item" id="blockElementImages2ColumnRight"><div class="col1"><img data-src="${blockData?.image1Column?.url}" alt="${blockData?.image1Column?.title}" class="lazyload"/></div><div class="col2"><img data-src="${blockData?.image2Column?.url}" src="${blockData?.image2Column?.title}" class="lazyload"/></div></div>`;
    return contentStructure;
};

export function blockElementImageLeftCopyRight(blockData) {
    let contentStructure = `<div class="blockElementImageLeftCopyRight block-item" id="blockElementImageLeftCopyRight"><div class="leftimageblock"><div class="leftImg"><img data-src="${blockData?.image?.url}" alt="${blockData?.blockName}" class="lazyload"/></div><div class="textSection"><div class="caption"><h1 class="h1-italic">${blockData?.blockName}</h1><p class="body-light-1">${blockData?.bodyCopy}</p><a  href="${blockData?.linkUrl}" class="button button--secondary">${blockData?.linkText}</a></div></div></div></div>`;
    return contentStructure;
};

export function leftTextBlock(selectorId,blockData) {
    let contentStructure = `<img data-src="${blockData?.backgroundImage?.url}" alt="category banner" class="lazyload"/>
        <div class="overlay"></div><div class="caption"><h2 class="title">${blockData?.bannerTitle}</h2><p class="content">${blockData?.bodyCopy}</p><a href="${blockData?.linkUrl}" class="buttonlink body-3">${blockData?.linkText}</a></div>`;

    document.getElementById(selectorId).innerHTML = contentStructure;
};

export function createProductSlider(context, block, blockData) {
    let prdlist = [];
    if(blockData?.products?.edges?.length > 0 ){
        prdlist = productCard(context, blockData?.products?.edges);
        block.querySelector('.sub-products').innerHTML = `<ul class="productGridslider" data-slick='{"slidesToShow": 4, "slidesToScroll": 4}'>${prdlist?.join('')}</ul>`;
        block.querySelector('.sub-products').classList.add("slideradded");
    } else {
        block.querySelector('.sub-products').innerHTML = `<p data-no-products-notification role="alert" aria-live="assertive"tabindex="-1">There are no products listed under this category.</p>`;
    }
    block.querySelector('.sub-description').innerHTML = blockData?.description;
};

export function blogpostTopBanner(selectorID, title, heading, imageHeading, date){
    let contentStructure = `<div class="topbannerSection"><img data-src="${imageHeading?.url}" alt="${title}" class="lazyload"/><div class="overlay"></div><div class="caption"><h2>${title ? title : ''}</h2><span class="date body-3">${date ? date : ''}<div class="divider"></div></span><p class="subheading">${heading ? heading : ''}</p></div></div>`;
    document.getElementById(selectorID).innerHTML = contentStructure;
};

export function lookBook(selectorID, blockData) {
    let blockItem = `<div><h4 class="title">${(blockData.blocktitle) ? blockData.blocktitle : ''} - ${(blockData.subheadline) ? blockData.subheadline : ''}</h4><div class="contentSection"><img data-src="${(blockData.imagesCollection.items[0].url) ? blockData.imagesCollection.items[0].url : ''}" alt="${(blockData.subheadline) ? blockData.subheadline : ''}" class="lazyload"/><div class="caption"><div class="caption">
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
        <p class="body-light-1">${(element.collectionSubheadline) ? element.collectionSubheadline : ''}</p><div>
        ${(element.collectionButton) ? '<a href="' + element.collectionButtonUrl +'" class="button button--secondary buttonlink">' + element.collectionButton +'</a>' : ''}
        </div>`;
};

export function referencedBlockHomepageCollections(blockData) {

    let logoStructure = blockData.homepageCollectionsCollection?.items?.map((item,i) => {
        return `<div class="tab ${item?.slug} ${i === 0 ? 'is-active' : ''}" role="presentation">${item?.logoImage.url ? `<img class="first lazyload" data-src="${item?.logoImage.url}" alt="${item?.logoImage.title}" />` : ''}</div>`;
    });

    let contentStructure = blockData.homepageCollectionsCollection?.items?.map((item,i) => {
        return `<div class="tab-content ${i === 0 ? 'is-active' : ''} ${item?.slug}" id="tab-description-${i}">
            <div class="blockElementDiscover">
                <div class="discovery-section">
                    <div class="imageflex">
                        <div class="leftcol">
                            ${(item?.imageLeft?.url && item?.imageLeft?.url !== undefined) ? `<img class="lazyload first" data-src="${item?.imageLeft?.url}" alt="${item?.imageLeft.title}" />` : ''}
                            ${(item?.imageCenter?.url && item?.imageCenter?.url !== undefined) ? `<img class="lazyload second" data-src="${item?.imageCenter?.url}" alt="${item?.imageCenter?.title}"/>` : ''}
                        </div>
                        <div class="rightcol">
                            ${(item?.imageRight.url && item?.imageRight.url !== undefined) ? `<img  class="lazyload third" data-src="${item?.imageRight.url}"  alt="${item?.imageRight.title}" />` : '' }
                        </div>
                    </div>
                    <div class="caption">
                        ${(item?.collectionName && item?.collectionName !== undefined) ?
                            `<h1 class="h1-italic">${item?.collectionName}</h1>` : ''}
                        ${(item?.description && item?.description !== undefined) ?
                            `<p class="content body-1">${item?.description}</p>` : ''}
                        ${(item?.linkUrl && item?.linkUrl !== undefined) ?
                            `<a href="${item?.linkUrl}" class="button button--secondary buttonlink">${item?.linkText}</a>` : ''}
                    </div>
                </div>
            </div>
        </div>`
    });

    return  `<div class="block-item logotabsblocksection"><div class="tabs logoTabs" data-tab role="tablist">${logoStructure.join('')}</div><div class="logotabcontents tabs-contents">${contentStructure.join('')}</div></div>`;
};