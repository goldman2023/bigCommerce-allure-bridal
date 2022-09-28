import 'focus-within-polyfill';

import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import adminBar from './global/adminBar';
import carousel from './common/carousel';
import loadingProgressBar from './global/loading-progress-bar';
import svgInjector from './global/svg-injector';

export default class Global extends PageManager {
    onReady() {
        const {
            channelId, cartId, productId, categoryId, secureBaseUrl, maintenanceModeSettings, adminBarLanguage,
        } = this.context;
        cartPreview(secureBaseUrl, cartId);
        quickSearch();
        currencySelector(cartId);
        foundation($(document));
        quickView(this.context);
        carousel(this.context);
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        adminBar(secureBaseUrl, channelId, maintenanceModeSettings, JSON.parse(adminBarLanguage), productId, categoryId);
        loadingProgressBar();
        svgInjector();

        $('.alertBox .close').on('click', e => {
            e.target.closest('.alertBox').style.display = 'none';
            console.log(e);
        });
        $(window).on('load', function(){ 
            setTimeout(function(){
                $('.productGridslider').each(function(){
                $(this).slick({
                            dots: false,
                            infinite: false,
                            speed: 300,
                            slidesToShow: 4,
                            slidesToScroll: 1,
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
            });
            $('.productSliderGrid').each(function(){
                $(this).slick({
                            dots: false,
                            infinite: false,
                            speed: 300,
                            slidesToShow: 3,
                            slidesToScroll: 1,
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
            });
            },3000);
            });
    }
}
