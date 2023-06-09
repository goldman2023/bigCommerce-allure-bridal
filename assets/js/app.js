__webpack_public_path__ = window.__webpack_public_path__; // eslint-disable-line

import Global from './theme/global';

const getAccount = () => import('./theme/account');
const getLogin = () => import('./theme/auth');
const noop = null;

const pageClasses = {
    account_orderstatus: getAccount,
    account_order: getAccount,
    account_addressbook: getAccount,
    shippingaddressform: getAccount,
    account_new_return: getAccount,
    'add-wishlist': () => import('./theme/wishlist'),
    account_recentitems: getAccount,
    account_downloaditem: getAccount,
    editaccount: getAccount,
    account_inbox: getAccount,
    account_saved_return: getAccount,
    account_returns: getAccount,
    account_paymentmethods: getAccount,
    account_addpaymentmethod: getAccount,
    account_editpaymentmethod: getAccount,
    login: getLogin,
    createaccount_thanks: getLogin,
    createaccount: getLogin,
    getnewpassword: getLogin,
    forgotpassword: getLogin,
    blog: () => import('./theme/BP/inspiration'),
    blog_post: () => import('./theme/BP/blog'),
    brand: () => import('./theme/brand'),
    brands: noop,
    cart: () => import('./theme/cart'),
    category: () => import('./theme/category'),
    compare: () => import('./theme/compare'),
    page_contact_form: () => import('./theme/contact-us'),
    error: noop,
    404: noop,
    giftcertificates: () => import('./theme/gift-certificate'),
    giftcertificates_balance: () => import('./theme/gift-certificate'),
    giftcertificates_redeem: () => import('./theme/gift-certificate'),
    default: noop,
    page: noop,
    product: () => import('./theme/product'),
    amp_product_options: () => import('./theme/product'),
    search: () => import('./theme/search'),
    rss: noop,
    sitemap: noop,
    newsletter_subscribe: noop,
    wishlist: () => import('./theme/wishlist'),
    wishlists: () => import('./theme/wishlist'),
};

const customClasses = {
    'pages/custom/page/dressing-room': () => import('./theme/BP/dressing-room'),
    'pages/custom/page/manage-members': () => import('./theme/BP/manage-members'),
    'pages/custom/page/retail-finder': () => import('./theme/BP/retail-finder'), // Mac/Linux
    'pages\\custom\\page\\retail-finder': () => import('./theme/BP/retail-finder'), // Windows
    'pages/custom/page/designer-events': () => import('./theme/BP/designer-events'), // Mac/Linux
    'pages\\custom\\page\\designer-events': () => import('./theme/BP/designer-events'), // Windows
    'pages/custom/page/all-content-blocks': () => import('./theme/BP/all-content-blocks'), // Mac/Linux
    'pages\\custom\\page\\all-content-blocks': () => import('./theme/BP/all-content-blocks'), // Windows
    'pages/custom/page/page-men-design': () => import('./theme/BP/all-content-blocks'), // Mac/Linux
    'pages\\custom\\page\\page-men-design': () => import('./theme/BP/all-content-blocks'), // Windows
    'pages/custom/page/page-abella-design': () => import('./theme/BP/all-content-blocks'), // Mac/Linux
    'pages\\custom\\page\\page-abella-design': () => import('./theme/BP/all-content-blocks'), // Windows
    'pages/custom/page/page-abella-design': () => import('./theme/BP/all-content-blocks'), // Mac/Linux
    'pages\\custom\\page\\page-abella-design': () => import('./theme/BP/all-content-blocks'), // Windows
    'pages/custom/page/page-disney-fairy-tale-wedding': () => import('./theme/BP/all-content-blocks'), // Mac/Linux
    'pages\\custom\\page\\page-disney-fairy-tale-wedding': () => import('./theme/BP/all-content-blocks'), // Windows
    'pages/custom/page/page-madison-james': () => import('./theme/BP/all-content-blocks'), // Mac/Linux
    'pages\\custom\\page\\page-madison-james': () => import('./theme/BP/all-content-blocks'), // Windows
    'pages/custom/page/page-wilderly-bride': () => import('./theme/BP/all-content-blocks'), // Mac/Linux
    'pages\\custom\\page\\page-wilderly-bride': () => import('./theme/BP/all-content-blocks'), // Windows
    'pages/custom/page/custom-home-page': () => import('./theme/BP/homepage'), // Mac/Linux
    'pages\\custom\\page\\custom-home-page': () => import('./theme/BP/homepage'), // Windows
    'pages/custom/page/about': () => import('./theme/BP/all-content-blocks'), // Mac/Linux
    'pages\\custom\\page\\about': () => import('./theme/BP/all-content-blocks'), // Windows
    'pages/custom/page/designer-event-list': () => import('./theme/BP/designer-event-list'), // Mac/Linux
    'pages\\custom\\page\\designer-event-list': () => import('./theme/BP/designer-event-list'), // Windows
    'pages/custom/page/registration-thank-you': () => import('./theme/BP/registration-thank-you'), // Mac/Linux
    'pages\\custom\\page\\registration-thank-you': () => import('./theme/BP/registration-thank-you'), // Windows
    'pages/custom/page/request-event-appointment': () => import('./theme/BP/request-event-appointment'), // Mac/Linux
    'pages\\custom\\page\\request-event-appointment': () => import('./theme/BP/request-event-appointment'), // Windows
    'pages/custom/page/custom-retail-finder': () => import('./theme/BP/request-appointment'), // Mac/Linux
    'pages\\custom\\page\\custom-retail-finder': () => import('./theme/BP/request-appointment'), // Windows
    'pages/custom/page/thank-you-appointment': () => import('./theme/BP/thank-you'), // Mac/Linux
    'pages\\custom\\page\\thank-you-appointment': () => import('./theme/BP/thank-you'), // Windows
    'pages/custom/page/thank-you-events': () => import('./theme/BP/thank-you'), // Mac/Linux
    'pages\\custom\\page\\thank-you-events': () => import('./theme/BP/thank-you'), // Windows
    
};

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param pageType String
 * @param contextJSON
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(pageType, contextJSON = null, loadGlobal = true) {
    const context = JSON.parse(contextJSON || '{}');

    return {
        load() {
            $(() => {
                // Load globals
                if (loadGlobal) {
                    Global.load(context);
                }

                const importPromises = [];

                // Find the appropriate page loader based on pageType
                const pageClassImporter = pageClasses[pageType];
                if (typeof pageClassImporter === 'function') {
                    importPromises.push(pageClassImporter());
                }

                // See if there is a page class default for a custom template
                const customTemplateImporter = customClasses[context.template];
                if (typeof customTemplateImporter === 'function') {
                    importPromises.push(customTemplateImporter());
                }

                // Wait for imports to resolve, then call load() on them
                Promise.all(importPromises).then(imports => {
                    imports.forEach(imported => {
                        imported.default.load(context);
                    });
                });
            });
        },
    };
};
