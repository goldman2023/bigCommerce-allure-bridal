import { hooks } from '@bigcommerce/stencil-utils';
import Url from 'url';
import urlUtils from '../../js/theme/common/utils/url-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
        //added to fix issue PDP Back to List Button
        localStorage.setItem('lastVisitedCategoryUrl', window.location.href);
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();
        $('.hideshowfilter').on('click', () => $(".category-container-block-section").toggleClass("hidefilter"));

        $('.sortItem').each(function(){
            const url = Url.parse(window.location.href, true);
            if($(this).attr('data-value') === url.query.sort) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        });
        $('.customSortLabel').on('click', function(){
            $(this).toggleClass('is-active');
        });
        $('.sortItem').on('click', function(event){
            let targetValue = $(this).attr('data-value');
            $('.sortItem').each(function(){
                if($(this).attr('data-value') === targetValue) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }
            });
            $("#sort").val(targetValue).change();
            const url = Url.parse(window.location.href, true);
            const queryParams = $("#sort").serialize().split('=');

            url.query[queryParams[0]] = queryParams[1];
            delete url.query.page;

            // Url object `query` is not a traditional JavaScript Object on all systems, clone it instead
            const urlQueryParams = {};
            Object.assign(urlQueryParams, url.query);

            event.preventDefault();

            urlUtils.goToUrl(Url.format({ pathname: url.pathname, search: urlUtils.buildQueryString(urlQueryParams) }));
        });


        // $(window).load(function(){
        //     $('.middlemob').html($('.pagefilterheader .middle').html());        
        // });
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
               // scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }
}
