import PageManager from '../page-manager';
import {
    blockElement3ImagesScreenWidth,
    blockElementFullscreenImage,
    blockElementImages2ColumnRight,
    blockElementImageLeftCopyRight,
    collectionPreview,
    blockElementDiscover,
    lookBookglobal2,
    blockElementStory,
    leftTextBlockglobal,
    blockElementVerticalGallery,
    imageWithContentSlider,
    blockElementCopyBlock,
    logoSliderBlock,
    events,
    globalblockElementFullscreenVideo,
    BlockElementBigCarousel,
    blockElementDivider, 
    blockElementSpacer,
    blockElementSpacer24Px,
    referencedBlockHomepageCollections,
    featuredEvents
} from './universal-blocks';
export default class Homepage extends PageManager {
    constructor(context) {
        super(context);
    } 
    onReady() {
        let allcontentData = document.getElementById('homecontentdata').value;
        let jsContext = JSON.parse(allcontentData.replace( /(<([^>]+)>)/ig, ''));
        let blocksCollections = jsContext[0].contentBlocksCollection.items.map((element ,i)=> {
            if(element.__typename === "BlockElementVerticalGallery"){
                return blockElementVerticalGallery(element);
            }
            if(element.__typename === "BlockElementCopyBlock"){
                return blockElementCopyBlock(element);
            }
            if(element.__typename === "ReferencedBlockHomepageCollections"){
                return referencedBlockHomepageCollections(element);
            }
            if(element.__typename === "ReferencedBlockLogoRow"){
                return logoSliderBlock(element);
            }
            if(element.__typename === "BlockElementFullscreenImage"){
                return blockElementFullscreenImage(element);
            }
            if(element.__typename === "BlockElement3ImagesScreenWidth"){
                return blockElement3ImagesScreenWidth(element);
            }
            if(element.__typename === "ReferencedBlockTrunkShowContainer"){
                return events(element,'home');
            }
            if(element.__typename === "BlockElementImages2ColumnRight"){
                return blockElementImages2ColumnRight(element);
            }
            if(element.__typename === "BlockElementImageLeftCopyRight"){
                return blockElementImageLeftCopyRight(element);
            }
            if(element.__typename === "BlockElementStoryBlock"){
                return blockElementStory(element);
            }
            if(element.__typename === "BlockElementLookbook"){
                return lookBookglobal2(element);
            }
            if(element.__typename === "ReferencedBlockCategoryBanners"){
                return leftTextBlockglobal('leftTextbanner',element);
            }
            if(element.__typename === "ReferencedBlockCategoryBanners" && element.layoutOrientation === "Image Right"){
                return leftTextBlockglobal('rightTextbanner',element);
            }
            if(element.__typename === "BlockElementDiscover"){
                return blockElementDiscover(element);
            }
            if(element.__typename === "BlockElementCollectionPreview"){
                return collectionPreview(element);
             }
             if(element.__typename === "BlockElementBigCarouselSlider" ){
                return imageWithContentSlider(element);
            }
            if(element.__typename === "BlockElementFullscreenVideo") {
                return globalblockElementFullscreenVideo(element);
            }
            if (element.__typename === "BlockElementBigCarousel") {
                return BlockElementBigCarousel(element);
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
            if(element.__typename === "FeaturedDesignerEvents"){
                featuredEvents(this.context,element.count);
                return `<div class="events block-item" id="events"></div>`;
            }
        }).join('');

        document.getElementById('contentBlocksCollection').innerHTML = blocksCollections;

        document.querySelectorAll('.imageWithContentSlider ul').forEach((item) => {
            applySlider(item,1);
        });

        if(document.getElementById('logoSliderBlock')) {
            $('.logoSliderBlock .imgslider').slick({
                dots: false,
                infinite: true,
                speed: 300,
                slidesToShow: 6,
                slidesToScroll: 1,
                centerMode: true,
                responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                    slidesToShow: 6,
                    slidesToScroll: 1,
                    infinite: true,
                    centerMode: true,
                    dots: false
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        centerMode: true,
                        infinite: true,
                        dots: false,
                        arrows: false
                    }
                }
                ]
            });
        }
        if(document.getElementById('events')) {
            if ($(window).width() < 600 ) {
                $('.events .eventsGrid').slick({
                    dots: false,
                    infinite: true,
                    speed: 300,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: true,
                    arrows: false,
                });
            }
        }

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

        if(document.querySelector('.logoTabs')) {
            $('.logoTabs').slick({
                dots: false,
                infinite: false,
                speed: 300,
                slidesToShow: 5,
                slidesToScroll: 1,
                arrows: true,
                responsive: [
                {
                    breakpoint: 1100,
                    settings: {
                    slidesToShow: 5,
                    slidesToScroll: 1,
                    infinite: false,
                    arrows: true,
                    dots: false
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        infinite: false,
                        arrows: true,
                        dots: false
                    }
                },
                {
                    breakpoint: 1023,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        infinite: false,
                        dots: false,
                        arrows: true
                    }
                },
                {
                    breakpoint: 900,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        infinite: false,
                        dots: false,
                        arrows: true
                    }
                },
                {
                    breakpoint: 800,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        infinite: false,
                        dots: false,
                        arrows: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        infinite: true,
                        dots: false,
                        arrows: false
                    }
                }
                ]
            });
        }

    }

}