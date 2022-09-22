import PageManager from '../page-manager'
import '../global/jquery-migrate';
import 'slick-carousel';

export default class CategoryListing extends PageManager {
    constructor(context) {
        super(context);
    }
    onReady() {
        document.querySelectorAll('.sub-category-block').forEach((item)=> {
            this.getCategory(item,item.getAttribute('data-path'));
        });
    }
     getCategory(block,categoryPath) {
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
                    `
                }),
        })
        .then(res => res.json())
        .then(categoryData => {
            const productArray = categoryData.data.site.route.node.products.edges;
            let prdlist = [];
            if(productArray.length > 0 ){
                prdlist = productArray.map((item) => {
                    return `<li class="product"><article class="card" data-test="card-271"><figure class="card-figure">
                                <a href="${item.node.path}" class="card-figure__link"><div class="card-img-container">
                                        <img src="${item.node.defaultImage.url}" alt="${item.node.name}" title="${item.node.name}" data-sizes="auto" 
                                        srcset="${item.node.defaultImage.url} 80w, ${item.node.defaultImage.url} 160w, ${item.node.defaultImage.url} 320w, ${item.node.defaultImage.url} 640w, ${item.node.defaultImage.url} 960w, ${item.node.defaultImage.url} 1280w, ${item.node.defaultImage.url} 1920w, ${item.node.defaultImage.url} 2560w" 
                                        data-srcset="${item.node.defaultImage.url} 80w, ${item.node.defaultImage.url} 160w, ${item.node.defaultImage.url} 320w, ${item.node.defaultImage.url} 640w, ${item.node.defaultImage.url} 960w, ${item.node.defaultImage.url} 1280w, ${item.node.defaultImage.url} 1920w,${item.node.defaultImage.url} 2560w" class="card-image lazyautosizes lazyloaded" sizes="257px">
                                    </div></a><div class="card-body"><h3 class="card-title"><a aria-label="${item.node.name}" "="" href="${item.node.path}" class="name">Style ${item.node.name}</a>
                                <a href="/wishlist.php?action=addwishlist&product_id=${item.node.entityId}" class="titleIcon"></a></h3><div class="card-text" data-test-info-type="price">${item.node.description}</div></article>
                            </li>`;
                });
                block.querySelector('.sub-products').innerHTML = `<ul class="productGrid" data-slick='{"slidesToShow": 4, "slidesToScroll": 4}'>${prdlist.join('')}</ul>`;
            } else {
                block.querySelector('.sub-products').innerHTML = `<p data-no-products-notification role="alert" aria-live="assertive"tabindex="-1">There are no products listed under this category.</p>`;
            }
            block.querySelector('.sub-description').innerHTML = categoryData.data.site.route.node.description;
        });
    };
}