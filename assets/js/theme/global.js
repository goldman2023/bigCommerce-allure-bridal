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
    renderHeaderFooter,
    contentFullmetaData,
    productDeatilMetaData,
    getCategorySpecificMetaData,
    getProductsByCategoryPath,
    createProductSlider,
    getProducts,
    blockElementFullscreenVideo,
    leftTextBlock,
    imageWithContentSlider,
    blockElementVerticalGallery,
    blockElementStory,
    blockElement3ImagesScreenWidth,
    blockElementFullscreenImage,
    lookBook,
    collectionPreview} from './BP/universal-blocks';

export default class Global extends PageManager {
    onReady() {
        const {
            channelId, cartId, productId, categoryId, secureBaseUrl, maintenanceModeSettings, adminBarLanguage,
        } = this.context;
        let contentId = this.context;
        let mainContent = document.getElementById('main-content').classList;
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
        renderHeaderFooter(this.context);

        //Product Listing page start
        if(mainContent.contains('pages-custom-category-bp-category') || mainContent.contains('pages-custom-category-suits-bp-category')) {
            contentFullmetaData(this.context, response => {
                let metadata = response[0].value;
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(mainContent.contains('pages-custom-category-bp-category') && element.__typename === "ReferencedBlockCategoryBanners"){
                        leftTextBlock('leftTextbanner',element);
                    }
                    if(mainContent.contains('pages-custom-category-suits-bp-category') && element.__typename === "ReferencedBlockCategoryBanners" && element.layoutOrientation === "Image Right"){
                        leftTextBlock('rightTextbanner',element);
                    }
                });
            });
        }
        //Product Listing page end

        //Category Listing page start
        if(mainContent.contains('pages-custom-category-category-listing') || mainContent.contains('pages-custom-category-suits-category-listing')) {
            document.querySelectorAll('.sub-category-block').forEach((item)=> {
                getProductsByCategoryPath(this.context,item.getAttribute('data-path'),response => {
                    createProductSlider(item,response);
                });
            });
            contentFullmetaData(this.context, response => {
                let metadata = response[0].value;
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(mainContent.contains('pages-custom-category-category-listing')) {
                        if(element.__typename === "ReferencedBlockCategoryBanners"){
                            leftTextBlock('leftTextbanner',element);
                        }
                    }
                    if(mainContent.contains('pages-custom-category-suits-category-listing')) {
                        if(element.__typename === "ReferencedBlockCategoryBanners" && element.layoutOrientation === "Image Right"){
                            leftTextBlock('rightTextbanner',element);
                        }
                    }
                });
            });
        }
        //Category Listing page end

        //Product Detail page start
        if(mainContent.contains('pages-product') || mainContent.contains('suits-product')) {
            let productId = document.querySelector('.productView').getAttribute('data-prod-id');
            productDeatilMetaData(this.context,productId, response => {
                let metadata = response[0].value;
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(element.__typename === "BlockElementStoryBlock"){
                        blockElementStory('blockElementStory',element);
                    }
                    if(element.__typename === "BlockElementFullscreenImage"){
                        blockElementFullscreenImage('blockElementFullscreenImage',element);
                    }
                    if(element.__typename === "BlockElement3ImagesScreenWidth"){
                        blockElement3ImagesScreenWidth('blockElement3ImagesScreenWidth',element);
                    }
                    if(element.__typename === "BlockElementLookbook"){
                        lookBook('blockElementLookbook',element);
                    }
                });
                if(metadata.thePerfectMatch.length > 0) {
                    getProducts(contentId,'.thePerfectMatch .prodData',metadata.thePerfectMatch);
                }
                if(metadata.youMightalsoLike.length > 0) {
                    getProducts(contentId,'.youMightalsoLike .prodData',metadata.youMightalsoLike);
                }
            });
        }
        //Product Detail page end

        //category Landing page start
        if(mainContent.contains('pages-custom-category-category-landing')) {
            let geturl = document.getElementById('categoryLanding').getAttribute('data-url')
            getCategorySpecificMetaData(this.context, geturl, response => {
                let categoryData = response[0].value;
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
                        // if(ele.__typename === "BlockElementDiscover"){
                        //     blockElementStory('blockElementDiscover',ele);
                        // }
                        if(ele.__typename === "BlockElementVerticalGallery"){
                            blockElementVerticalGallery('blockElementVerticalGallery',ele);
                        }
                    });
                  });
            });
        }
        //category Landing page end

        $('.alertBox .close').on('click', e => {
            e.target.closest('.alertBox').style.display = 'none';
            console.log(e);
        });

        $(window).on('load', function() {
            setTimeout(function(){
                applySlider('.productSliderGrid',3,true,true);
                $('.productGridslider').each(function(){
                    applySlider('.productGridslider',4);
                });
            },3000);
        });

        function applySlider(selector,slide,centerM,infinity) {
            let centermood = false;
            let infinitymode = false;
            if(centerM){
                centermood = centerM;
            }
            if(infinity) {
                infinitymode = infinity;
            }
            $(selector).slick({
                dots: false,
                infinite: infinitymode,
                speed: 300,
                slidesToShow: slide,
                slidesToScroll: 1,
                centerMode: centerM,
                responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                    slidesToShow: slide,
                    slidesToScroll: 1,
                    infinite: infinitymode,
                    dots: false
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        centerMode: true,
                        infinite: infinitymode,
                        dots: false
                    }
                }
                ]
            });
        };
    }
}
