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
    events
    } from './universal-blocks';
export default class Homepage extends PageManager {
    constructor(context) {
        super(context);
    } 
    onReady() {
        let allcontentData = document.getElementById('homecontentdata').value;
        let jsContext = JSON.parse(allcontentData.replace( /(<([^>]+)>)/ig, ''));
        console.log(jsContext);
        let blocksCollections = jsContext[0].contentBlocksCollection.items.map((element ,i)=> {
            if(element.__typename === "BlockElementVerticalGallery"){
                return blockElementVerticalGallery(element);
            }
            if(element.__typename === "BlockElementCopyBlock"){
                return blockElementCopyBlock(element);
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
                return events(element);
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
                slidesToShow: 5,
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