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
    blockElementDiscover,
    blockElement3ImagesScreenWidth,
    blockElementFullscreenImage,
    lookBook,
    getFirstprodImageFromCategory,
    createCategorySlider,
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

        $('.mobileMenu-icons.searchIcon').on('click', function(e){
            e.preventDefault();
            $('.navPages-quickSearch.mobile-only').toggle();
        })

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
                let metadata = response.contentFul;
                let relatedPro = response.related;
                console.log(metadata);
                let blocksCollections = metadata.contentBlocksCollection.items.map(element => {
                    if(element.__typename === "BlockElementStoryBlock"){
                        return blockElementStory(element);
                    }
                    if(element.__typename === "BlockElementFullscreenImage"){
                        return blockElementFullscreenImage(element);
                    }
                    if(element.__typename === "BlockElement3ImagesScreenWidth"){
                        return blockElement3ImagesScreenWidth(element);
                    }
                }).join('');

                document.getElementById('contentBlocksCollection').innerHTML = blocksCollections;

                metadata.contentBlocksCollection.items.forEach(element => {
                    if(element.__typename === "BlockElementLookbook"){
                        lookBook('blockElementLookbook',element);
                    }
                });
                if(Object.keys(relatedPro).length > 0) {

                    if(relatedPro.thePerfectMatch.length > 0) {
                        let perfectmatch = relatedPro.thePerfectMatch.map((item) => item.bc_product_id);
                        getProducts(contentId,'.thePerfectMatch .prodData',perfectmatch);
                    }
                    if(relatedPro.youMightAlsoLike.length > 0) {
                        let youmaylike = relatedPro.youMightAlsoLike.map((item) => item.bc_product_id);
                        getProducts(contentId,'.youMightalsoLike .prodData',youmaylike);
                    }
                }
            });
        }
        //Product Detail page end

        //about page start
        if(mainContent.contains('pages-custom-page-about')) {
            document.querySelectorAll('.catlist').forEach((item) => {
                getFirstprodImageFromCategory(this.context,item.getAttribute('data-path'),response => {
                    createCategorySlider(item,response);
                });
            });
            applySlider('.aboutcategorylist',4,false,false);
        }
        //about page end

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
                    let blocksCollections = element.contentBlocksCollection.items.map(ele => {
                        if(ele.__typename === "BlockElementCollectionPreview"){
                           return collectionPreview(ele);
                        }
                        if(ele.__typename === "BlockElementBigCarouselSlider"){
                            return imageWithContentSlider(ele);
                        }
                        if(ele.__typename === "BlockElementDiscover"){
                            return blockElementDiscover(ele);
                        }
                        if(ele.__typename === "BlockElementVerticalGallery"){
                            return blockElementVerticalGallery(ele);
                        }
                        if(ele.__typename === "BlockElementFullscreenImage"){
                            return blockElementFullscreenImage(ele);
                        }
                    });

                    document.getElementById('contentBlocksCollection').innerHTML = blocksCollections.join('');
                    applySlider('.imageWithContentSlider ul',1,false,true);
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
                    applySlider('.productGridslider',4,false,true);
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

        if(document.getElementById('initials')) {
            let customerName = document.getElementById('initials').getAttribute('data-name');
            document.getElementById('initials').innerHTML = customerName.charAt(0);
        }
    }
}
