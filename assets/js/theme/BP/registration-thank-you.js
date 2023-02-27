import PageManager from '../page-manager';
import {getProducts} from './universal-blocks';
export default class RegistrationThankYou extends PageManager {
    constructor(context) {
        super(context);
    }
    onReady() {
        let contentId = this.context;
        const recentlyViewedEl = document.getElementById('recentlyViewed');
        if (recentlyViewedEl) {
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
        $('.productGrid').slick({
            dots: false,
            infinite: false,
            speed: 300,
            slidesToShow: 4,
            slidesToScroll: 1,
            centerMode: false,
            responsive: [
            {
                breakpoint: 1024,
                settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: false,
                dots: false
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: true,
                    infinite: false,
                    dots: false
                }
            }
            ]
        });
    }
}