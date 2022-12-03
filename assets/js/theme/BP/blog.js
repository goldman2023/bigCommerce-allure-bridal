import PageManager from '../page-manager';
import '../global/jquery-migrate';

import {
    blockElement3ImagesScreenWidth,
    blockElementFullscreenImage,
    blockElementImages2ColumnRight,
    blockElementImageLeftCopyRight,
    blogpostTopBanner,
    blogpostContentBlock,
    blockElementStory,
    collectionPreview,
    imageWithContentSlider,
    blockElementDiscover,
    blockElementVerticalGallery,
    lookBookglobal,
    leftTextBlockglobal,
    blockElementCopyBlock,
    logoSliderBlock
    } from '../BP/universal-blocks';
export default class Blog extends PageManager {
    constructor(context) {
        super(context);
    } 

    onReady() {
        let blogJson = this.context.blogJson;
        let metadata = JSON.parse(blogJson.replace( /(<([^>]+)>)/ig, ''));
        console.log("blog post data",metadata[1]);
        let date = metadata[1].sortingDate;
        console.log(new Date(date));
        let dayvariable = {
            '0' : "Sunday",
            "1": "Monday",
            '2' : "Tuesday",
            "3": "Wednesday",
            '4' : "Thrusday",
            "5": "Friday",
            "6": "Saturday",
        }
        let monthVariable = {
            '0' : "Jan",
            "1": "Feb",
            '2' : "March",
            "3": "April",
            '4' : "May",
            "5": "June",
            "6": "July",
            '7' : "Aug",
            "8": "Sept",
            '9' : "Oct",
            "10": "Nov",
            '11' : "Dec",
        }
        let dateformatted = `${dayvariable[new Date(date).getDay()]}, ${monthVariable[new Date(date).getMonth()]} ${new Date(date).getDate()}, ${new Date(date).getFullYear()}`;

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

        blogpostTopBanner('topBanner',metadata[1].title, metadata[1].headline,metadata[1].headlineImage,dateformatted);
        blogpostContentBlock('content-section',metadata[1]);
        let blocksCollections = metadata[1].contentBlocksCollection.items.map(element => {
            if(element.__typename === "BlockElementFullscreenImage"){
                return blockElementFullscreenImage(element); 
            }
            if(element.__typename === "BlockElement3ImagesScreenWidth"){
                return blockElement3ImagesScreenWidth(element);
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
            if (element.__typename === "BlockElementCollectionPreview") {
                return collectionPreview(element);
            }
            if (element.__typename === "BlockElementBigCarouselSlider") {
                return imageWithContentSlider(element);
            }
            if (element.__typename === "BlockElementDiscover") {
                return blockElementDiscover(element);
            }
            if (element.__typename === "BlockElementVerticalGallery") {
                return blockElementVerticalGallery(element);
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
        }).join('');
        document.getElementById('contentBlocksCollection').innerHTML = blocksCollections;

        applySlider('.imageWithContentSlider ul',1,false,true);
    }

}