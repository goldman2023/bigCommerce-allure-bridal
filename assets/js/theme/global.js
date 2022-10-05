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
import {
    headerFooterData,
    contentFullmetaData,
    getCategoryMetaData,
    getProducts,
    blockElementFullscreenVideo,
    leftTextBlock,
    imageWithContentSlider,
    blockElementStory,
    blockElement3ImagesScreenWidth,
    lookBook,
    collectionPreview} from './BP/universal-blocks';
export default class Global extends PageManager {
    onReady() {
        const {
            channelId, cartId, productId, categoryId, secureBaseUrl, maintenanceModeSettings, adminBarLanguage,
        } = this.context;
        let contentId = this.context;
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

        contentFullmetaData(this.context, response => {
            console.log('contentFullmetaData', response);
            let metadata = response[0].value;
            if(document.getElementById('main-content').classList.contains('pages-custom-category-bp-category')) {
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(element.__typename === "ReferencedBlockCategoryBanners"){
                        leftTextBlock('leftTextbanner',element);
                    }
                });
            }
            if(document.getElementById('main-content').classList.contains('pages-product')) {
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(element.__typename === "BlockElementStoryBlock"){
                        blockElementStory('blockElementStory',element);
                    }
                    if(element.__typename === "BlockElement3ImagesScreenWidth"){
                        blockElement3ImagesScreenWidth('blockElement3ImagesScreenWidth',element);
                    }
                    if(element.__typename === "BlockElementLookbook"){
                        lookBook('blockElementLookbook',element);
                    }
                });
                if(metadata.thePerfectMatch.length > 0) {
                    getProducts(contentId,'.thePerfectMatch .prodData',metadata.thePerfectMatch,4);
                }
                if(metadata.youMightalsoLike.length > 0) {
                    getProducts(contentId,'.youMightalsoLike .prodData',metadata.youMightalsoLike,4);
                }
            }
        });

        if(document.getElementById('main-content').classList.contains('pages-custom-category-category-landing')) {
            getCategoryMetaData(this.context, '/dresses/allure-romance/', response => {	
                let categoryData = response[0].value;
                console.log("category landing", categoryData);
                categoryData.items.forEach(element => {
                    if(element.collectionName === document.getElementById('categoryLanding').getAttribute('data-id')) {
                      if(element.collectionBannerImage1) {
                        blockElementFullscreenVideo('blockElementFullscreenVideo',element.collectionBannerImage1);
                      }
                      let heading = element.collectionHeadline;
                      let lastword = heading.split(" ").reverse()[0];
                      document.querySelector('.productSlider .heading').innerHTML= `${heading.replace(lastword,'')} <span class="lastword">${lastword}</span>`
                      let stringArray = element.productsInCollection;
                      let numberArray = [];
                      length = stringArray.length;
                      for (var i = 0; i < length; i++){
                        if(stringArray[i] !== ""){
                          numberArray.push(parseInt(stringArray[i]));
                        }
                      }
                      getProducts(this.context,'.productSlider .productGridSection',numberArray,3);
                    }
                    element.contentBlocksCollection.items.forEach(ele => {
                        if(ele.__typename === "BlockElementCollectionPreview"){
                            collectionPreview('blockElementCollectionPreview',ele);
                        }
                        if(ele.__typename === "BlockElementBigCarousel"){
                            imageWithContentSlider('imageWithContentSlider',ele);
                            applySlider('.imageWithContentSlider ul',1);
                        }
                        if(ele.__typename === "BlockElementDiscover"){
                            blockElementStory('blockElementDiscover',ele);
                        }
                    });
                  });
            });
        }

        $('.alertBox .close').on('click', e => {
            e.target.closest('.alertBox').style.display = 'none';
            console.log(e);
        });

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
