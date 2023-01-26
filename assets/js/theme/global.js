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
import 'jquery-custom-select';
import swal from './global/sweet-alert';

import flatpick from './BP/flatpickr';
import inputmask from './BP/inputmask';
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
    collectionPreview,
    blockElementImages2ColumnRight,
    blockElementImageLeftCopyRight,
    lookBookglobal,
    leftTextBlockglobal,
    blockElementCopyBlock,
    logoSliderBlock,
    globalblockElementFullscreenVideo,
    BlockElementBigCarousel,
    collectionHeaderContent,
    blockElementDivider,
    blockElementSpacer,
    blockElementSpacer24Px,
    referencedBlockHomepageCollections
} from './BP/universal-blocks';

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
            $('.header-shadow').toggleClass('opensearch');
        });       

        //Product Listing page start
        if (mainContent.contains('pages-custom-category-bp-category') || mainContent.contains('bp-category') || mainContent.contains('pages-custom-category-suits-bp-category')) {
            contentFullmetaData(this.context, response => {
                let metadata = response[0].value;
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(mainContent.contains('bp-category') && element.__typename === "ReferencedBlockCategoryBanners"){
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
        if (mainContent.contains('pages-custom-category-category-listing') || mainContent.contains('category-listing') || mainContent.contains('pages-custom-category-suits-category-listing')) {
            document.querySelectorAll('.sub-category-block').forEach((item)=> {
                getProductsByCategoryPath(this.context,item.getAttribute('data-path'),response => {
                    createProductSlider(item,response);
                    let selectForslider = item.querySelector('.slideradded .productGridslider');
                    applySlider(selectForslider, 4, false, true);
                });
                
            });
            contentFullmetaData(this.context, response => {
                let metadata = response[0].value;
                metadata.contentBlocksCollection.items.forEach(element => {
                    if(mainContent.contains('category-listing')) {
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

        const bodyClassEl = document.querySelector('body').classList;
        //Product Detail page start
        if (bodyClassEl.contains('product-type')) {
            let productId = document.querySelector('.productView').getAttribute('data-prod-id');
            productDeatilMetaData(this.context,productId, response => {
                let metadata = response.contentFul;
                let relatedPro = response.related;
                console.log(metadata);
                if(Object.keys(metadata).length === 0) {
                    $('.contentBlocksCollection').hide();
                } else {
                    $('.contentBlocksCollection').show();
                }

                if(Object.keys(relatedPro).length === 0) {
                    $('.productsrelate').hide();
                } else {
                    $('.contentBlocksCollection').show();
                }
                
                let blocksCollections = metadata?.contentBlocksCollection?.items?.map(element => {
                    console.log('response', element);
                    if(element.__typename === "BlockElementStoryBlock"){
                        return blockElementStory(element);
                    }
                    if(element.__typename === "BlockElementFullscreenImage"){
                        return blockElementFullscreenImage(element);
                    }
                    if(element.__typename === "BlockElement3ImagesScreenWidth"){
                        return blockElement3ImagesScreenWidth(element);
                    }
                    if (element.__typename === "BlockElementCollectionPreview") {
                        return collectionPreview(element);
                    }
                    if (element.__typename === "BlockElementBigCarouselSlider") {
                        return imageWithContentSlider(element);
                    }
                    if (element.__typename === "BlockElementBigCarousel") {
                        return BlockElementBigCarousel(element);
                    }
                    if (element.__typename === "BlockElementDiscover") {
                        return blockElementDiscover(element);
                    }
                    if (element.__typename === "BlockElementVerticalGallery") {
                        return blockElementVerticalGallery(element);
                    }
                    if (element.__typename === "BlockElementImages2ColumnRight") {
                        return blockElementImages2ColumnRight(element);
                    }
                    if (element.__typename === "BlockElementImageLeftCopyRight") {
                        return blockElementImageLeftCopyRight(element);
                    }
                    if (element.__typename === "BlockElementLookbook") {
                        return lookBookglobal(element);
                    }
                    if (element.__typename === "ReferencedBlockCategoryBanners") {
                        return leftTextBlockglobal('leftTextbanner', element);
                    }
                    if (element.__typename === "ReferencedBlockCategoryBanners" && element.layoutOrientation === "Image Right") {
                        return leftTextBlockglobal('rightTextbanner', element);
                    }
                    if (element.__typename === "BlockElementCopyBlock") {
                        return blockElementCopyBlock(element);
                    }
                    if (element.__typename === "ReferencedBlockLogoRow") {
                        return logoSliderBlock(element);
                    }
                    if (element.__typename === "BlockElementFullscreenVideo") {
                        return globalblockElementFullscreenVideo(element);
                    }
                    if (element.__typename === "BlockElementDivider") {
                        return blockElementDivider();
                    }
                    if (element.__typename === "BlockElementSpacer") {
                        return blockElementSpacer();
                    }
                    if (element.__typename === "BlockElementSpacer24Px") {
                        return blockElementSpacer24Px();
                    }
                    if (element.__typename === "ReferencedBlockHomepageCollections") {
                        return referencedBlockHomepageCollections(element);
                    }
                }).join('');

                document.getElementById('contentBlocksCollection').innerHTML = blocksCollections;

                metadata?.contentBlocksCollection?.items?.forEach(element => {
                    if(element.__typename === "BlockElementLookbook"){
                        lookBook('blockElementLookbook',element);
                    }
                });

                if(Object.keys(relatedPro).length > 0) {
                    if(relatedPro.thePerfectMatch.length > 0) {
                        let perfectmatch = relatedPro.thePerfectMatch.map((item) => item.bc_product_id).filter((a) => a);
                        getProducts(contentId,'.thePerfectMatch .prodData', perfectmatch);
                        $('#thePerfectMatch').removeClass('hide');
                    }
                    if(relatedPro.youMightAlsoLike.length > 0) {
                        let youmaylike = relatedPro.youMightAlsoLike.map((item) => item.bc_product_id).filter((a) => a);
                        getProducts(contentId,'.youMightalsoLike .prodData', youmaylike);
                        $('#youMightalsoLike').removeClass('hide');
                    }
                }
                
                //Added recently product using localstorage
                if (document.getElementById('recentlyViewed')) {
                    const recentlyProduct = (localStorage.getItem("recentlyProduct")) ? (localStorage.getItem("recentlyProduct")).split(',') : [];
                    const updatedRecentlyProduct = recentlyProduct.slice();
                    if (updatedRecentlyProduct.length > 0) {
                        const currentProductIndex = recentlyProduct.indexOf(this.context.productId);
                        updatedRecentlyProduct.splice(currentProductIndex, 1);
                        getProducts(contentId, '.recentlyViewed .prodData', updatedRecentlyProduct);
                        (updatedRecentlyProduct.length > 0) ? $('#recentlyViewed').removeClass('hide') : '';
                    }
                    if (recentlyProduct.indexOf(this.context.productId) !== -1) {
                        const index = recentlyProduct.indexOf(this.context.productId);
                        recentlyProduct.splice(index, 1);
                    }
                    if (recentlyProduct.length >= 12) {
                        recentlyProduct.pop();
                    }
                    recentlyProduct.unshift(this.context.productId);
                    localStorage.setItem("recentlyProduct", recentlyProduct.join(','));
                }

                document.querySelectorAll('.imageWithContentSlider ul').forEach((item) => {
                    applySlider(item,1,false,true);
                });
            });

            $( ".prod-option.color" ).insertBefore( $( ".prod-option.size" ) );
            $('.prod-option.color .form-select').customSelect();

        } else {
            $('select').customSelect();

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
        if (mainContent.contains('pages-custom-category-category-landing') || mainContent.contains('category-landing')) {
            let geturl = document.getElementById('categoryLanding').getAttribute('data-url')
            getCategorySpecificMetaData(this.context, geturl, response => {
                for (const categoryData of response) {
                    if (categoryData.key === "Contentful Data") {
                        let contentfulData = categoryData?.value;
                        contentfulData?.items?.forEach(element => {
                            if (element.collectionName === document.getElementById('categoryLanding').getAttribute('data-id')) {
                                collectionHeaderContent(element);
                                if (element.collectionBannerImage1) {
                                    blockElementFullscreenVideo('blockElementFullscreenVideo', element.collectionBannerImage1);
                                }
                                let heading = element.collectionHeadline;
                                let lastword = heading?.split(" ")?.reverse()[0];
                                document.querySelector('.productSlider .heading').innerHTML = `${(heading?.replace(lastword, '') !== undefined) ? heading?.replace(lastword, '') : ''} <span class="lastword h1-italic">${(lastword !== undefined) ? lastword : ''}</span>`;
                                if(element.collectionDescription != null || element.collectionDescription != undefined) {
                                    document.querySelector('.productSlider .descrip').innerHTML = `${element.collectionDescription}`;
                                } else {
                                    document.querySelector('.productSlider .descrip').style.display = 'none';
                                }
                            }
                            let blocksCollections = element.contentBlocksCollection.items.map(ele => {
                                
                                if (ele.__typename === "BlockElementCollectionPreview") {
                                    return collectionPreview(ele);
                                }
                                if (ele.__typename === "BlockElementStoryBlock") {
                                    return blockElementStory(ele);
                                }
                                if (ele.__typename === "BlockElementBigCarouselSlider") {
                                    return imageWithContentSlider(ele);
                                }
                                if (ele.__typename === "BlockElementBigCarousel") {
                                    return BlockElementBigCarousel(ele);
                                }
                                if (ele.__typename === "BlockElementDiscover") {
                                    return blockElementDiscover(ele);
                                }
                                if (ele.__typename === "BlockElementVerticalGallery") {
                                    return blockElementVerticalGallery(ele);
                                }
                                if (ele.__typename === "BlockElementFullscreenImage") {
                                    return blockElementFullscreenImage(ele);
                                }
                                if (ele.__typename === "BlockElementImages2ColumnRight") {
                                    return blockElementImages2ColumnRight(ele);
                                }
                                if (ele.__typename === "BlockElementImageLeftCopyRight") {
                                    return blockElementImageLeftCopyRight(ele);
                                }
                                if (ele.__typename === "BlockElementLookbook") {
                                    return lookBookglobal(ele);
                                }
                                if (ele.__typename === "ReferencedBlockCategoryBanners") {
                                    return leftTextBlockglobal('leftTextbanner', ele);
                                }
                                if (ele.__typename === "ReferencedBlockCategoryBanners" && ele.layoutOrientation === "Image Right") {
                                    return leftTextBlockglobal('rightTextbanner', ele);
                                }
                                if (ele.__typename === "BlockElementCopyBlock") {
                                    console.log(ele);
                                    return blockElementCopyBlock(ele);
                                }
                                if (ele.__typename === "ReferencedBlockLogoRow") {
                                    return logoSliderBlock(ele);
                                }
                                if (ele.__typename === "BlockElementFullscreenVideo") {
                                    return globalblockElementFullscreenVideo(ele);
                                }
                                if (ele.__typename === "BlockElement3ImagesScreenWidth") {
                                    return blockElement3ImagesScreenWidth(ele);
                                }
                                if (ele.__typename === "BlockElementDivider") {
                                    return blockElementDivider();
                                }
                                if (ele.__typename === "BlockElementSpacer") {
                                    return blockElementSpacer();
                                }
                                if (ele.__typename === "BlockElementSpacer24Px") {
                                    return blockElementSpacer24Px();
                                }
                                if (ele.__typename === "ReferencedBlockHomepageCollections") {
                                    return referencedBlockHomepageCollections(ele);
                                }
                            });

                            document.getElementById('contentBlocksCollection').innerHTML = blocksCollections.join('');

                            document.querySelectorAll('.imageWithContentSlider ul').forEach((item) => {
                                applySlider(item, 1, false, true);
                            });
                        });
                    }
                    if (categoryData.key === "Related Products") {
                        const relatedProducts = categoryData.value;
                        const relatedProductIds = [];
                        for (const relatedProduct of relatedProducts) {
                            relatedProductIds.push(relatedProduct.bc_product_id);
                        }
                        getProducts(this.context, '.productSlider .productGridSection', relatedProductIds, 5);
                    }
                }
                
            });
        }
        //category Landing page end

        $('.alertBox .close').on('click', e => {
            e.target.closest('.alertBox').style.display = 'none';
            console.log(e);
        });

        $(window).on('load', function() {
            setTimeout(function(){
                applySlider('.productSliderGrid', 3, true, true);
                if (!mainContent.contains('pages-custom-category-category-listing') || !mainContent.contains('category-listing') || !mainContent.contains('pages-custom-category-suits-category-listing')) {

                $('.productGridslider').each(function(){
                    applySlider('.productGridslider', 4, false, true);
                });
                }
                $('.productGridSection').removeClass('hide');
                if (document.querySelector('body').classList.contains('product-type')) {

                    $('.productGrid .product').each(function(){
                        if($(this).children().length == 0) {
                            $(this).remove();
                        }
                    });
                    $('.productGrid').each(function(){
                        let self = $(this);
                        if(self.find('.product').length > 4 ) {
                            applySlider(self, 4, false, false);
                        }
                    });
                }
                // const iframe = document.getElementById("schedulebridalapp");
                const iframe = document?.getElementsByTagName('iframe');
                const iWindow = iframe?.contentWindow;
                const iDocument = iWindow?.document;

                // accessing the element
                const ielement = iDocument?.getElementsByTagName('select');
                if(ielement?.length > 0) {
                    ielement.customSelect();
                }
            }, 3000);
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

        $(document).on('click','.navPages-action',function(){
            e.preventDefault();
            $(this).toggleClass('is-open');
            $(this).siblings().toggleClass('is-open');
        });

        setTimeout(() => {
            let tabs = document.querySelectorAll(".tabs .tab");
            let tabContents = document.querySelectorAll(".tab-content");

            tabs.forEach((tab, index) => {
                tab.addEventListener("click", () => {
                    tabContents.forEach((content) => {
                        content.classList.remove("is-active");
                    });
                    tabs.forEach((tab) => {
                        tab.classList.remove("is-active");
                    });
                    tabContents[index].classList.add("is-active");
                    tabs[index].classList.add("is-active");
                });
            });

            if ($('.logoTabs')) {
                $('.logoTabs').slick({
                    dots: false,
                    infinite: false,
                    speed: 300,
                    slidesToShow: tabs.length > 6 ? 6 : tabs.length,
                    slidesToScroll: 1,
                    centerMode: false,
                    arrows: true,
                    responsive: [
                        {
                            breakpoint: 1100,
                            settings: {
                                slidesToShow: 6,
                                slidesToScroll: 1,
                                infinite: false,
                                centerMode: false,
                                arrows: true,
                                dots: false
                            }
                        },
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                infinite: false,
                                centerMode: true,
                                arrows: false,
                                dots: false
                            }
                        },
                        {
                            breakpoint: 1023,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                centerMode: false,
                                infinite: false,
                                dots: false,
                                arrows: false
                            }
                        },
                        {
                            breakpoint: 900,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                centerMode: false,
                                infinite: false,
                                dots: false,
                                arrows: false
                            }
                        },
                        {
                            breakpoint: 800,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                                centerMode: false,
                                infinite: false,
                                dots: false,
                                arrows: false
                            }
                        },
                        {
                            breakpoint: 600,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 2,
                                centerMode: false,
                                infinite: true,
                                dots: false,
                                arrows: false
                            }
                        }
                    ]
                });
            }
        }, 1000);
        $('.card .titleIcon').on('click', function(e){
            e.preventDefault();
            let prodid = $(this).attr('data-id');
            fetch("/api/storefront/form-fields?filter=customerAccount", {
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json"
                }
            })
            .then((response) => response.json()).then((data) => {
                console.log(data);
                $.ajax({
                    type: "POST",
                    url: `/wishlist.php?action=add&wishlistid=107&product_id=${prodid}`,
                    success: response => {
                        swal.fire({
                            text: "Product added to wishlist",
                            icon: 'success',
                            showCancelButton: false
                        })
                       window.location.href = '/account.php?action=account_details';
                    },
                    error: error => {
                        console.log(error);
                    }
                });
            });
        });
        /*
        if (this.context.customer) {
            $.ajax({
                type: "GET",
                url: `/account.php?action=account_details`,
                dataType: 'html',
                success: response => {
                    console.log('default wishlist', $(response).find("input[data-label='Default Wishlist']").val());
                    const wishlistId = $(response).find("input[data-label='Default Wishlist']").val();
                    $.ajax({
                        type: "GET",
                        url: `/wishlist.php?action=add&wishlistid=${wishlistId}&product_id=2708`,
                        success: response => {
                            swal.fire({
                                text: "Product added to wishlist",
                                icon: 'success',
                                showCancelButton: false
                            });
                        },
                        error: error => {
                            console.log(error);
                        }
                    });
                },
                error: error => {
                    console.log(error);
                }
            });
        }
        */
        
    }
}
