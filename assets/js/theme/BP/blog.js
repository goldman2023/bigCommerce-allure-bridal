import PageManager from '../page-manager';

export default class Blog extends PageManager {
    constructor(context) {
        super(context);
    } 
    
    onReady() {
        const blogPostEl = document.querySelector('#blog-desc > p');

        console.log('Blog Data', JSON.parse(blogPostEl.innerHTML));
    }

}