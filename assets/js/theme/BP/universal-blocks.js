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
        console.log("prod data", response);
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
                                    for (const value of data.value) {
                                        footer[value.section] = (footer[value.section]) ? [...footer[value.section], {"linkName": value.linkName, "url": value.url}] : [{"linkName": value.linkName, "url": value.url}];
                                    }
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
        console.log('global Data', globalData);
        //footer implementation
        const footerListContainer = document.querySelector('.footer-info');
        let footerHtml = '';
        for (const [key, value] of Object.entries(globalData.footer)) {
            const keyText = key.toLowerCase();
            
            footerHtml += `<article class="footer-info-col" data-section-type="footer-${keyText}"><h3 class="footer-info-heading">${key}</h3>
            <ul class="footer-info-list">`;
            for (const [innerKey, innerValue] of Object.entries(value)) {
                footerHtml += `<li><a href="${innerValue.url}" class="footer-info__link">${innerValue.linkName}</a></li>`;
            }
            footerHtml += `</ul></article>`;
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
export function getProducts(context,selector,prodList,slidescroll) {
    let prodArray = [];
    prodArray = prodList;
    //prodArray = prodList.split(',');
    let products = [];
    if(selector === '.thePerfectMatch .prodData' || selector === '.youMightalsoLike .prodData') {
        products = prodArray;
    } else {
        products = ['170', '285', '274', '270','2242','2128','167'];
    }
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
        prdlist = productCard(productArray);
        if(slidescroll) {
            document.querySelector(selector).innerHTML = `<ul class="productSliderGrid" data-slick='{"slidesToShow": ${slidescroll}, "slidesToScroll": 1}'>${prdlist.join('')}</ul>`;
        } else {
            document.querySelector(selector).innerHTML = `<ul class="productGrid" >${prdlist.join('')}</ul>`;
        }
    } else {
      document.querySelector(selector).innerHTML =  `<p data-no-products-notification role="alert" aria-live="assertive"tabindex="-1">There are no products listed under this category.</p>`;
    }
   });
};

export function blockElementFullscreenVideo(selectorID,element) {
    let videoURL = '';
    if(element.videoUrl.includes('youtube')) {
      videoURL = `https://www.youtube.com/embed/${element.videoUrl.split('=')[1]}`;
      document.getElementById(selectorID).innerHTML = `<div><iframe type="text/html" src="${videoURL}"  frameborder="0" id="colbannerVideo" controls=0></iframe></div>`;
    } else {
        document.getElementById(selectorID).innerHTML = `<div><video controls id="colbannerVideo"><source src="${element.videoUrl}" type="video/mp4"><source src="${element.videoUrl}" type="video/ogg">Your browser does not support HTML video.</video></div>`;
    }
}

export function lookBookglobal(blockData) {
   return `<div class="blockElementLookbook" id="blockElementLookbook"><div><h4 class="title">Lookbooks - ${blockData.subheadline}</h4><div class="contentSection"><img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/lookbook.jpg" alt="${blockData.subheadline}" /><div class="caption"><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div></div></div></div>`;
}
export function lookBook(selectorID,blockData) {
    let blockItem = `<div><h4 class="title">Lookbooks - ${blockData.subheadline}</h4><div class="contentSection"><img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/lookbook.jpg" alt="${blockData.subheadline}" /><div class="caption"><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div></div></div>`;
    document.getElementById(selectorID).innerHTML = blockItem;
}

export function blockElementFullscreenImage(blockData) {
    return `<div class="blockElementFullscreenImage" id="blockElementFullscreenImage"><div class="mainImage"><img src="${blockData.backgroundImage.url}" style="width: 100%;"/></div></div>`;
}

export function blockElement3ImagesScreenWidth(blockData) {
    let imgthum = blockData.imagesCollection.items.map((image) => `<div class="imageDiv"><img src="${image.url}" /></div>`);
    return ` <div class="blockElement3ImagesScreenWidth" id="blockElement3ImagesScreenWidth"><div class="thumbImg">${imgthum.join('')}</div></div>`;
};

export function blockElementDiscover(blockData) {
    return `<div class="blockElementDiscover" id="blockElementDiscover">
                <div class="discovery-section">
                    <div class="imageflex">
                        <div><img class="first" src="${blockData.imagesCollection.items[0].url}" alt="" /><img class="second" src="${blockData.imagesCollection.items[1].url}" alt=""/></div>
                        <div><img  src="${blockData.imagesCollection.items[2].url}"  alt="" /></div>
                    </div>
                    <div class="caption">
                        <h2>${blockData.blocktitle}</h2>
                        <p class="content">${blockData.bodyCopy}</p>
                        <button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button>
                    </div>
                </div>
            </div>`;
}

export function blockElementStory(blockData) {
    return `<div class="blockElementStory" id="blockElementStory"><div class="heading-section"><h2 class="title">${blockData.blockname}</h2><p class="date">${blockData.displayedate}</p><div class="leftBottom">
        <img src="${blockData.imagesCollection.items[0].url}" alt="" />
        </div></div><div class="rightside-section"><div class="rightcol">
        <img src="${blockData.imagesCollection.items[1].url}" class="topleft" alt=""/>
        <div class="caption"><p class="content">${blockData.bodyCopy}</p>
        <button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button></div></div><div class="topright">
        <img src="${blockData.imagesCollection.items[2].url}"  alt="" />
        </div></div><div class="mobilecaption"><p class="content">${blockData.bodyCopy}</p><button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button></div>
        <div class="mobilebanner"><img src="${blockData.imagesCollection.items[0].url}" alt="" /></div></div>`;
}

export function imageWithContentSlider(blockData) {
    let sliderLi = blockData.bigCarouselImagesCollection.items.map((item) => {
        return `<li><div class="blockrow"><div class="leftblock block">
        <img src="${item.imagesCollection.items[0].url}" alt="image left block" />
        </div><div class="rightblock block"><div class="caption">
        <h2 class="title">${item.title}</h2><p class="content">${item.bodyCopy}</p><a href="${item.linkUrl}" class="buttonlink">${item.linkText}</a>
        </div></div></div></li>`
    });
    return `<div class="imageWithContentSlider" id="imageWithContentSlider"><ul data-slick='{"slidesToShow": 1, "slidesToScroll": 1,"infinite": true}'>${sliderLi.join('')}</ul></div>`;
};

export function collectionPreview(blockData) {
    return `<div class="blockElementCollectionPreview" id="blockElementCollectionPreview"><div class="previewblock">
        <div class="caption"><h4>${blockData.title}</h4><p>${blockData.bodyCopy}</p><button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button></div>
        <div class="imagesection"><div class="leftImg"><img src="${blockData.imagesCollection.items[0].url}"  alt="${blockData.imagesCollection.items[0].description}"/><div class="dateSection"><p>${blockData.photoCaption}</p><p>${blockData.photoCaptionDate}</p></div></div><div class="rightImg"><img src="${blockData.imagesCollection.items[1].url}" alt="${blockData.imagesCollection.items[1].description}"/></div></div></div></div>`;
};

export function leftTextBlockglobal(selectorId,blockData) {
    return `<div id="${selectorId}" class="${selectorId}"><img src="${blockData.backgroundImage.url}" alt="category banner" />
        <div class="overlay"></div><div class="caption"><h2 class="title">${blockData.bannerTitle}</h2><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div></div>`;
};
export function leftTextBlock(selectorId,blockData) {
    let contentStructure = `<img src="${blockData.backgroundImage.url}" alt="category banner" />
        <div class="overlay"></div><div class="caption"><h2 class="title">${blockData.bannerTitle}</h2><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div>`;

    document.getElementById(selectorId).innerHTML = contentStructure;
};

export function blockElementVerticalGallery(blockData) {
    let leftData = blockData.imagesCollection.items.map((item,i) => {
        if(i < 3) {
            if(item.description === '') {
                return `<div class="contentDiv"><img src="${item.url}" /></div>`;
            } else {
                return `<div class="contentDiv"><img src="${item.url}" /><p class="caption">${item.description}</p></div>`;
            }
        }
    });
    let rightData = blockData.imagesCollection.items.map((item,i) => {
        if(i > 2) {
            if(item.description === '') {
                return `<div class="contentDiv"><img src="${item.url}" /></div>`;
            } else {
                return `<div class="contentDiv"><img src="${item.url}" /><p class="caption">${item.description}</p></div>`;
            }
        }
    });

    return `<div class="blockElementVerticalGallery" id="blockElementVerticalGallery"><div class="verticalBlock"><div class="verticalLeftCol">${leftData.join('')}</div><div class="verticalRightCol">${rightData.join('')}</div></div></div>`;
};

function productCard(products) {
    return products.map((item) => {
        return `<li class="product"><article class="card" data-test="card-271"><figure class="card-figure">
                    <a href="${item.node.path}" class="card-figure__link"><div class="card-img-container">
                            <img src="${item.node.defaultImage.url}" alt="${item.node.name}" title="${item.node.name}" data-sizes="auto" 
                            srcset="${item.node.defaultImage.url} 80w, ${item.node.defaultImage.url} 160w, ${item.node.defaultImage.url} 320w, ${item.node.defaultImage.url} 640w, ${item.node.defaultImage.url} 960w, ${item.node.defaultImage.url} 1280w, ${item.node.defaultImage.url} 1920w, ${item.node.defaultImage.url} 2560w" 
                            data-srcset="${item.node.defaultImage.url} 80w, ${item.node.defaultImage.url} 160w, ${item.node.defaultImage.url} 320w, ${item.node.defaultImage.url} 640w, ${item.node.defaultImage.url} 960w, ${item.node.defaultImage.url} 1280w, ${item.node.defaultImage.url} 1920w,${item.node.defaultImage.url} 2560w" class="card-image lazyautosizes lazyloaded" sizes="257px">
                        </div></a><div class="card-body"><h3 class="card-title"><a aria-label="${item.node.name}" "="" href="${item.node.path}" class="name">Style ${item.node.name}</a>
                    <a href="/wishlist.php?action=addwishlist&product_id=${item.node.entityId}" class="titleIcon"></a></h3><div class="card-text" data-test-info-type="price">${item.node.description}</div></article>
                </li>`;
    });
}

export function createProductSlider(block,blockData) {
    let prdlist = [];
    if(blockData.products.edges.length > 0 ){
        prdlist = productCard(blockData.products.edges);
        block.querySelector('.sub-products').innerHTML = `<ul class="productGridslider" data-slick='{"slidesToShow": 4, "slidesToScroll": 4}'>${prdlist.join('')}</ul>`;
    } else {
        block.querySelector('.sub-products').innerHTML = `<p data-no-products-notification role="alert" aria-live="assertive"tabindex="-1">There are no products listed under this category.</p>`;
    }
    block.querySelector('.sub-description').innerHTML = blockData.description;
};

export function blockElementImages2ColumnRight(blockData) {
    let  contentStructure = `<div class="blockElementImages2ColumnRight" id="blockElementImages2ColumnRight"><div class="col1"><img src="${blockData.image1Column.url}" /></div><div class="col2"><img src="${blockData.image2Column.url}" /></div></div>`;
    return contentStructure;
};
export function blockElementImageLeftCopyRight(blockData) {
    let  contentStructure = `<div class="blockElementImageLeftCopyRight" id="blockElementImageLeftCopyRight"><div class="leftimageblock"><div class="leftImg"><img src="${blockData.image.url}" /></div><div class="textSection"><div class="caption"><h3>${blockData.blockName}</h3><p>${blockData.bodyCopy}</p><a  href="${blockData.linkUrl}" class="button button--secondary">${blockData.linkText}</a></div></div></div></div>`;
    return contentStructure;
};

export function blogpostTopBanner(selectorID,title,heading,imageHeading){
    let  contentStructure = `<div class="topbannerSection"><img src="${imageHeading.url}" alt="${title}" /><div class="caption"><h2>${title ? title : ''}</h2><span class="date"><div class="divider"></div></span><p class="subheading">${heading ? heading : ''}</p></div></div>`;
    document.getElementById(selectorID).innerHTML = contentStructure;
}

export function blogpostContentBlock(selectorID,blockData){
    let paragraphs = blockData.bodyCopy.json.content.map((p,i) =>  `<p class="para-${i}">${p.content[0].value}</p>`).join('');
    let rightsideblock = `<h6>VENDORS</h6>
        <div class="flexdiv">
        ${blockData.gown !== null ?
            `<div class="row">
                <div>Gown</div>
                <div><span>${blockData.gown.json.content.map((item)=> item.content[0].value).join(' ')}</span></div>
            </div>`
            : ''}
            ${blockData.tuxedos !== null ?
            `<div class="row">
                <div>Tuxedos</div>
                <div><span>${blockData.tuxedos.json.content.map((item)=> item.content[0].value).join(' ')}</span></div>
            </div>`
            : ''}
            ${blockData.photographyVideography !== null ?
            `<div class="row">
                <div>Photographer/Videography</div>
                <div>
                ${blockData.photographyVideography.json.content[0].content[0].value}
                ${blockData.photographyVideography.json.content[1].content.map((item)=> {
                    if(item.nodeType == "hyperlink") {
                        return `<a href="${item.data.url}" target="_blank">${item.content[0].value}</a>`;
                    } else {
                        return item.value;
                    }
                }).join(' ') }
                </div>
            </div>`
            : ''}
            ${blockData.florals !== null ?
            `<div class="row">
                <div>Florals</div>
                <div>
                ${blockData.florals.json.content[0].content[0].value}
                ${blockData.florals.json.content[1].content.map((item)=> {
                    if(item.nodeType == "hyperlink") {
                        return `<a href="${item.data.url}" target="_blank">${item.content[0].value}</a>`;
                    } else {
                        return item.value;
                    }
                }).join(' ')}</div>
            </div>`
            : ''}
            ${blockData.planningVenue !== null ?
            `<div class="row">
                <div>Planning & Venue</div>
                <div>
                ${blockData.planningVenue.json.content[0].content[0].value}
                ${blockData.planningVenue.json.content[1].content.map((item)=> {
                    if(item.nodeType == "hyperlink") {
                        return `<a href="${item.data.url}" target="_blank">${item.content[0].value}</a>`;
                    } else {
                        return item.value;
                    }
                }).join(' ') }</div>
            </div>`
            : ''}
        </div>`;
    let  contentStructure = `<div class="content-sections-block"><div class="leftblock">${paragraphs}</div><div class="rightblock">${rightsideblock}</div></div>`;
    document.getElementById(selectorID).innerHTML = contentStructure;
}
