import PageManager from '../page-manager';
export default class Inspiration extends PageManager {
    constructor(context) {
        super(context);
    } 

    onReady() {
        let self = this;
        fetch('https://apim.workato.com/allure/allure-b2c-website/blog/tags', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {"API-TOKEN": self.context.workatoApiToken},

        })
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            let filters = res.BlogTags.map((item)=>item.tag);
            var unique = filters.filter(element => {
                return element !== '';
              }).reduce(function (acc, curr) {
                if (!acc.includes(curr))
                    acc.push(curr);
                return acc;
            }, []);
            let selectedValue = "";
            if(window.location.href.indexOf("/tag/") > -1) {
                selectedValue = window.location.href.split('/tag/')[1].replaceAll("%20"," ");
            }
            if(unique.length > 0 ) {
                if(selectedValue !== "") {
                    document.getElementById('filterbuttons').innerHTML = `<li class="tag"><a href="/inspiration/" class="button button--secondary">all</a></li>`+unique.map((tagitem) => {
                        if (tagitem) {
                            if(tagitem === selectedValue) {
                                return `<li class="tag"><a href="/inspiration/tag/${encodeURIComponent(tagitem)}" class="button button--primary">${tagitem}</a></li>`;
                            } else {
                                return `<li class="tag"><a href="/inspiration/tag/${encodeURIComponent(tagitem)}" class="button button--secondary">${tagitem}</a></li>`;
                            }
                        }
                    }).join('');
                } else {
                    document.getElementById('filterbuttons').innerHTML = `<li class="tag"><a href="/inspiration/" class="button button--primary">all</a></li>`+unique.map((tagitem) => {
                        if (tagitem) {
                            return `<li class="tag"><a href="/inspiration/tag/${encodeURIComponent(tagitem)}" class="button button--secondary">${tagitem}</a></li>`;
                        }
                    }).join('');
                }
            } else {
                document.getElementById('filterbuttons').innerHTML = `<li class="tag"><a href="/inspiration/" class="button button--primary">all</a></li>`;
            }
        })
        .catch(error => console.error(error));
    }
}