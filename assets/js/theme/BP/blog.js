import PageManager from '../page-manager';

export default class Blog extends PageManager {
    constructor(context) {
        super(context);
    } 
    
    onReady() {
        let blogJson = this.context.blogJson;
        console.log('context', JSON.parse(blogJson.replace( /(<([^>]+)>)/ig, '')));
    }

}