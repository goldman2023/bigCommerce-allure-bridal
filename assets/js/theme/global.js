import 'focus-within-polyfill';

import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import adminBar from './global/adminBar';
import carousel from './common/carousel';
import loadingProgressBar from './global/loading-progress-bar';
import svgInjector from './global/svg-injector';

export default class Global extends PageManager {
    onReady() {
        const {
            channelId, cartId, productId, categoryId, secureBaseUrl, maintenanceModeSettings, adminBarLanguage,
        } = this.context;
        cartPreview(secureBaseUrl, cartId);
        quickSearch();
        currencySelector(cartId);
        foundation($(document));
        quickView(this.context);
        carousel(this.context);
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        adminBar(secureBaseUrl, channelId, maintenanceModeSettings, JSON.parse(adminBarLanguage), productId, categoryId);
        loadingProgressBar();
        svgInjector();

        $('.alertBox .close').on('click', e => {
            e.target.closest('.alertBox').style.display = 'none';
            console.log(e);
        });
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
                `
            })
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            let metadata = JSON.parse(res.data.site.product.metafields.edges[0].node.value);
            console.log(metadata);
            if(document.getElementById('main-content').classList.contains('pages-custom-category-bp-category')) {
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(element.__typename === "ReferencedBlockCategoryBanners"){
                        leftTextBlock(element);
                    }
                });
                
            }
        });

        function leftTextBlock(blockData) {
            document.querySelector('.leftTextbanner .title').innerHTML = blockData.bannerTitle;
            document.querySelector('.leftTextbanner .content').innerHTML = blockData.bodyCopy;
            document.querySelector('.leftTextbanner .buttonlink').innerHTML = blockData.linkText;
            document.querySelector('.leftTextbanner .title').setAttribute('href',blockData.linkUrl);
        };

        $(window).on('load', function(){ 
            setTimeout(function(){
                $('.productGridslider').each(function(){
                $(this).slick({
                            dots: false,
                            infinite: false,
                            speed: 300,
                            slidesToShow: 4,
                            slidesToScroll: 1,
                            responsive: [
                            {
                                breakpoint: 1024,
                                settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                infinite: false,
                                dots: false
                                }
                            },
                            {
                                breakpoint: 600,
                                settings: {
                                    slidesToShow: 1,
                                    slidesToScroll: 1,
                                    centerMode: true,
                                    infinite: false,
                                    dots: false
                                }
                            }
                            ]
                        });
                        
            });
            $('.productSliderGrid').each(function(){
                $(this).slick({
                            dots: false,
                            infinite: false,
                            speed: 300,
                            slidesToShow: 3,
                            slidesToScroll: 1,
                            responsive: [
                            {
                                breakpoint: 1024,
                                settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                infinite: false,
                                dots: false
                                }
                            },
                            {
                                breakpoint: 600,
                                settings: {
                                    slidesToShow: 1,
                                    slidesToScroll: 1,
                                    centerMode: true,
                                    infinite: false,
                                    dots: false
                                }
                            }
                            ]
                        });
            });
            },3000);
            });
    }

     
}
