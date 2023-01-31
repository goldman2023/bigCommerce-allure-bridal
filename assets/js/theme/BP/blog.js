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
    logoSliderBlock,
    BlockElementBigCarousel,
    blockElementDivider,
    blockElementSpacer,
    blockElementSpacer24Px,
    referencedBlockHomepageCollections
} from '../BP/universal-blocks';
export default class Blog extends PageManager {
    constructor(context) {
        super(context);
    } 

    onReady() {
        let blogJson = this.context.blogJson;
        let metadata = JSON.parse(blogJson.replace( /(<([^>]+)>)/ig, ''));
        console.log("blog post data",metadata[1]);
        
        let sortDate = (metadata[1]?.sortingDate).split('T');
        let date = new Date(`${sortDate[0]}T00:00`);
        let formatdate = date.toString().split(' ');
        
        let dayvariable = {
            'Sun' : "Sunday",
            "Mon": "Monday",
            'Tue' : "Tuesday",
            "Wed": "Wednesday",
            'Thu' : "Thursday",
            "Fri": "Friday",
            "Sat": "Saturday",
        }
        let monthVariable = {
            'Jan' : "Jan",
            "Feb": "Feb",
            'Mar' : "March",
            "Apr": "April",
            'May' : "May",
            "Jun": "June",
            "Jul": "July",
            'Aug' : "Aug",
            "Sep": "Sept",
            'Oct' : "Oct",
            "Nov": "Nov",
            'Dec' : "Dec",
        }
        let dateformatted = `${dayvariable[formatdate[0]]}, ${monthVariable[formatdate[1]]} ${formatdate[2]}, ${formatdate[3]}`;

        function applySlider(selector, slide, centerM, infinity) {
            let centermood = false;
            let infinitymode = false;
            if (centerM){
                centermood = centerM;
            }
            if (infinity) {
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

        blogpostTopBanner('topBanner', metadata[1].title, metadata[1].headline, metadata[1].headlineImage, dateformatted);
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
            if (element.__typename === "BlockElementBigCarousel") {
                return BlockElementBigCarousel(element);
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

        applySlider('.imageWithContentSlider ul',1,false,true);
    }

}