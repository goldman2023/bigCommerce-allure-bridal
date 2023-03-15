import PageManager from '../page-manager';
import {getFirstprodImageFromCategory,createCategorySlider} from './universal-blocks';
export default class RegistrationThankYou extends PageManager {
    constructor(context) {
        super(context);
    }
    onReady() {
        let contentId = this.context;
        document.querySelectorAll('.catlist').forEach((item) => {
            getFirstprodImageFromCategory(contentId,item.getAttribute('data-path'),response => {
                createCategorySlider(item,response);
            });
        });
        $('.aboutcategorylist').slick({
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