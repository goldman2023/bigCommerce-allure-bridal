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
import {headerFooterData} from './BP/universal-blocks';
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

        //header footer data 	
        headerFooterData(this.context, response => {	
            console.log('response', response);	
        });

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
            if(document.getElementById('main-content').classList.contains('pages-custom-category-category-landing')) {
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(element.__typename === "BlockElementBigCarousel"){
                        imageWithContentSlider(element);
                    }
                    if(element.__typename === "BlockElementStoryBlock"){
                        blockElementStory(element);
                    }
                });
            }
            if(document.getElementById('main-content').classList.contains('pages-product')) {
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(element.__typename === "BlockElementStoryBlock"){
                        blockElementStory(element);
                    }
                    if(element.__typename === "BlockElement3ImagesScreenWidth"){
                        blockElement3ImagesScreenWidth(element);
                    }
                    if(element.__typename === "BlockElementLookbook"){
                        lookBook(element);
                    }
                });
            }
        });

        function lookBook(blockData) {
            let blockItem = `<div><h4 class="title">Lookbooks - ${blockData.subheadline}</h4><div class="contentSection"><img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/lookbook.jpg" alt="${blockData.subheadline}" /><div class="caption"><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div></div></div>`;
            document.getElementById('blockElementLookbook').innerHTML = blockItem;
        }

        function blockElement3ImagesScreenWidth(blockData) {
            let blockItem = `<div class="mainImage">
                <img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/mainimage.jpg" />
                </div><div class="thumbImg"><div class="imageDiv">
                <img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/thumb1.jpg" />
                </div><div class="imageDiv">
                <img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/thumb2.jpg" />
                </div><div class="imageDiv">
                <img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/thumb3.jpg" />
                </div></div>`;

            document.getElementById('blockElement3ImagesScreenWidth').innerHTML = blockItem;
        };

        function blockElementStory(blockData) {
            let storyBlockItem = `<div class="heading-section"><h2 class="title">${blockData.blockname}</h2><p class="date">${blockData.displayedate}</p><div class="leftBottom">
                <img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/storyblock-left-480.png" alt="" />
                </div></div><div class="rightside-section"><div class="rightcol">
                <img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/storyblock-center.png" class="topleft" alt=""/>
                <div class="caption"><p class="content">${blockData.bodyCopy}</p>
                <button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button></div></div><div class="topright">
                <img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/storyblock-right-480.png"  alt="" />
                </div></div><div class="mobilecaption"><p class="content">${blockData.bodyCopy}</p><button href="${blockData.linkUrl}" class="button button--secondary buttonlink">${blockData.linkText}</button></div>
                <div class="mobilebanner"><img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/storyblock-left-480.png" alt="" /></div>`;

            document.getElementById('blockElementStory').innerHTML = storyBlockItem;
        }

        function imageWithContentSlider(blockData) {
            let  contentStructure = `<ul data-slick='{"slidesToShow": 1, "slidesToScroll": 1}'><li><div class="blockrow"><div class="leftblock block">
                <img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/blockcarousel.png" alt="image left block" />
                </div><div class="rightblock block"><div class="caption">
                <h2 class="title">${blockData.title}</h2><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a>
                </div></div></div></li></ul>`;

            document.getElementById('imageWithContentSlider').innerHTML = contentStructure;
            applySlider('.imageWithContentSlider ul',1);

        };

        function leftTextBlock(blockData) {
            let contentStructure = `<img src="https://cdn11.bigcommerce.com/s-7kdijiqhnq/images/stencil/original/image-manager/image2.png" alt="category banner" />
                <div class="overlay"></div><div class="caption"><h2 class="title">${blockData.title}</h2><p class="content">${blockData.bodyCopy}</p><a href="${blockData.linkUrl}" class="buttonlink">${blockData.linkText}</a></div>`;

            document.getElementById('leftTextbanner').innerHTML = contentStructure;
        };

        $(window).on('load', function(){ 
            setTimeout(function(){
                applySlider('.productSliderGrid',3);
                $('.productGridslider').each(function(){
                    applySlider('.productGridslider',4);
                });
            },3000);
        });

        function applySlider(selector,slide) {
            $(selector).slick({
                dots: false,
                infinite: false,
                speed: 300,
                slidesToShow: slide,
                slidesToScroll: 1,
                responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                    slidesToShow: slide,
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
        };
    }
}
