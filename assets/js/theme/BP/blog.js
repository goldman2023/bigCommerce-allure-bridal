import PageManager from '../page-manager';
import {
    blockElement3ImagesScreenWidth,
    blockElementFullscreenImage,
    blockElementImages2ColumnRight,
    blockElementImageLeftCopyRight,
    blogpostTopBanner,
    blogpostContentBlock
    } from '../BP/universal-blocks';
export default class Blog extends PageManager {
    constructor(context) {
        super(context);
    } 

    onReady() {
        let blogJson = this.context.blogJson;
        let metadata = JSON.parse(blogJson.replace( /(<([^>]+)>)/ig, ''));
        console.log(metadata);

        blogpostTopBanner('topBanner',metadata.headlineImage,metadata.headline);
        blogpostContentBlock('content-section',metadata.bodyCopy);

        metadata.contentBlocksCollection.items.forEach(element => {
            if(element.__typename === "BlockElementFullscreenImage"){
                blockElementFullscreenImage('blockElementFullscreenImage',element); 
            }
            if(element.__typename === "BlockElement3ImagesScreenWidth"){
                blockElement3ImagesScreenWidth('blockElement3ImagesScreenWidth',element);
            }
            if(element.__typename === "BlockElementImages2ColumnRight"){
                blockElementImages2ColumnRight('blockElementImages2ColumnRight',element);
            }
            if(element.__typename === "BlockElementImageLeftCopyRight"){
                blockElementImageLeftCopyRight('blockElementImageLeftCopyRight',element);
            }
        });
    }

}