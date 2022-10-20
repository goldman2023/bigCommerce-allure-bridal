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

        blogpostTopBanner('topBanner',metadata[1].title, metadata[1].headline,metadata[1].headlineImage);
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