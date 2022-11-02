import PageManager from '../page-manager';
import {
    blockElement3ImagesScreenWidth,
    blockElementFullscreenImage,
    blockElementImages2ColumnRight,
    blockElementImageLeftCopyRight,
    blogpostTopBanner,
    blogpostContentBlock,
    blockElementStory 
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
        }).join('');
        document.getElementById('contentBlocksCollection').innerHTML = blocksCollections;
    }

}