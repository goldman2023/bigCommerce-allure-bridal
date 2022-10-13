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

function globalMetadata (context, callback) {
    let query = `
    query ProductsQuery {
        site {
            product(entityId: 170) {
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

export function contentFullmetaData(context, callback) {
    globalMetadata(context, response => {
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
function headerFooterData(context, callback) {
    headerFooterQuery(context, response => {
        if (response.data.site.product !== undefined) {
            const product = response.data.site.product;
            if (product.metafields.edges.length > 0) {
                const metafields = product.metafields.edges;
                console.log(metafields);
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
                                    console.log('navigation', data.value)
                                    for (const value of data.value) {
                                        navigation[value.topNavLink] = (navigation[value.topNavLink]) ? [...navigation[value.topNavLink], {"linkUrl": value.linkUrl, "linkName": value.linkName, "navigationSection": value.navigationSection}] : [{"linkUrl": value.linkUrl, "linkName": value.linkName, "navigationSection": value.navigationSection}];
                                    }
                                    console.log('navigation', navigation);
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
        /*
        let navigationHtml = '';
        for (const [key, value] of Object.entries(globalData.navigation)) {
            const keyText = key.toLowerCase();
            
            navigationHtml += `<article class="footer-info-col" data-section-type="footer-${keyText}"><h3 class="footer-info-heading">${key}</h3>
            <ul class="footer-info-list">`;
            for (const [innerKey, innerValue] of Object.entries(value)) {
                navigationHtml += `<li><a href="${innerValue.url}" class="footer-info__link">${innerValue.linkName}</a></li>`;
            }
            navigationHtml += `</ul></article>`;
        }
        //footerListContainer.insertAdjacentHTML('beforeend', footerHtml);*/
    });
}

export function getCategoryMetaData(context,path, callback) { 
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
        products = ['170', '285', '274', '270'];
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
        prdlist = productArray.map((item) => {
            return `<li class="product"><article class="card" data-test="card-271"><figure class="card-figure">
                        <a href="${item.node.path}" class="card-figure__link"><div class="card-img-container">
                                <img src="${item.node.defaultImage.url}" alt="${item.node.name}" title="${item.node.name}" data-sizes="auto" 
                                srcset="${item.node.defaultImage.url} 80w, ${item.node.defaultImage.url} 160w, ${item.node.defaultImage.url} 320w, ${item.node.defaultImage.url} 640w, ${item.node.defaultImage.url} 960w, ${item.node.defaultImage.url} 1280w, ${item.node.defaultImage.url} 1920w, ${item.node.defaultImage.url} 2560w" 
                                data-srcset="${item.node.defaultImage.url} 80w, ${item.node.defaultImage.url} 160w, ${item.node.defaultImage.url} 320w, ${item.node.defaultImage.url} 640w, ${item.node.defaultImage.url} 960w, ${item.node.defaultImage.url} 1280w, ${item.node.defaultImage.url} 1920w,${item.node.defaultImage.url} 2560w" class="card-image lazyautosizes lazyloaded" sizes="257px">
                            </div></a><div class="card-body"><h3 class="card-title"><a aria-label="${item.node.name}" "="" href="${item.node.path}" class="name">Style ${item.node.name}</a><a href="/wishlist.php?action=addwishlist&product_id=${item.node.entityId}" class="titleIcon"></a>
                        </h3><div class="card-text" data-test-info-type="price">${item.node.description}</div></article>
                    </li>`;
        });
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

export function lookBook(selectorID,blockData) {
    let blockItem = `<div><h4 class="title">Lookbooks - ${blockData.subheadline}</h4><div class="contentSection"><img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/lookbook.jpg" alt="${blockData.subheadline}" /><div class="caption"><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div></div></div>`;
    document.getElementById(selectorID).innerHTML = blockItem;
}

export function blockElementFullscreenImage(selectorID,blockData) {
    let blockItem = `<div class="mainImage"><img src="${blockData.backgroundImage.url}" style="width: 100%;"/></div>`;

    document.getElementById(selectorID).innerHTML = blockItem;
}

export function blockElement3ImagesScreenWidth(selectorID,blockData) {
    let imgthum = blockData.imagesCollection.items.map((image) => {
        return `<div class="imageDiv">
        <img src="${image.url}" />
        </div>`;
    })
    let blockItem = `<div class="thumbImg">${imgthum.join('')}</div>`;

    document.getElementById(selectorID).innerHTML = blockItem;
};

export function blockElementStory(selectorID,blockData) {
    let storyBlockItem = `<div class="heading-section"><h2 class="title">${blockData.blockname}</h2><p class="date">${blockData.displayedate}</p><div class="leftBottom">
        <img src="${blockData.imagesCollection.items[0].url}" alt="" />
        </div></div><div class="rightside-section"><div class="rightcol">
        <img src="${blockData.imagesCollection.items[1].url}" class="topleft" alt=""/>
        <div class="caption"><p class="content">${blockData.bodyCopy}</p>
        <button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button></div></div><div class="topright">
        <img src="${blockData.imagesCollection.items[2].url}"  alt="" />
        </div></div><div class="mobilecaption"><p class="content">${blockData.bodyCopy}</p><button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button></div>
        <div class="mobilebanner"><img src="${blockData.imagesCollection.items[0].url}" alt="" /></div>`;

    document.getElementById(selectorID).innerHTML = storyBlockItem;
}

export function imageWithContentSlider(selectorID,blockData) {
    let sliderLi = blockData.imagesCollection.items.map((item) => {
        return `<li><div class="blockrow"><div class="leftblock block">
        <img src="${item.url}" alt="image left block" />
        </div><div class="rightblock block"><div class="caption">
        <h2 class="title">${blockData.title}</h2><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a>
        </div></div></div></li>`
    });
    let  contentStructure = `<ul data-slick='{"slidesToShow": 1, "slidesToScroll": 1,"infinite": true}'>${sliderLi.join('')}</ul>`;

    document.getElementById(selectorID).innerHTML = contentStructure;
};

export function collectionPreview(selectorID,blockData) {
    let  contentStructure = `<div class="previewblock">
        <div class="caption"><h4>${blockData.title}</h4><p>${blockData.bodyCopy}</p><button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button></div>
        <div class="imagesection"><div class="leftImg"><img src="${blockData.imagesCollection.items[0].url}"  alt="${blockData.imagesCollection.items[0].description}"/><div class="dateSection"><p>${blockData.photoCaption}</p><p>${blockData.photoCaptionDate}</p></div></div><div class="rightImg"><img src="${blockData.imagesCollection.items[1].url}" alt="${blockData.imagesCollection.items[1].description}"/></div></div></div>`;

    document.getElementById(selectorID).innerHTML = contentStructure;
};

export function leftTextBlock(selectorId,blockData) {
    let contentStructure = `<img src="${blockData.backgroundImage.url}" alt="category banner" />
        <div class="overlay"></div><div class="caption"><h2 class="title">${blockData.bannerTitle}</h2><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div>`;

    document.getElementById(selectorId).innerHTML = contentStructure;
};

export function blockElementVerticalGallery(selectorId,blockData) {
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

    let contentStructure = `<div class="verticalBlock"><div class="verticalLeftCol">${leftData.join('')}</div><div class="verticalRightCol">${rightData.join('')}</div></div>`;
    document.getElementById(selectorId).innerHTML = contentStructure;
};
