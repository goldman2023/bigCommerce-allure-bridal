import PageManager from '../page-manager';
export default class Inspiration extends PageManager {
    constructor(context) {
        super(context);
    } 

    onReady() {
        let filters = [];
        if(window.location.href.indexOf("/tag/") == -1){
            filters = document.getElementById('inspirationfilter').value.split(",");
            localStorage.setItem('inspirationfilters',document.getElementById('inspirationfilter').value);
        } else {
            filters = localStorage.getItem('inspirationfilters').split(",");
        }
        var unique = filters.filter(element => {
            return element !== '';
          }).reduce(function (acc, curr) {
            if (!acc.includes(curr))
                acc.push(curr);
            return acc;
        }, []);
        let selectedValue = "";
        if(window.location.href.indexOf("/tag/") > -1) {
            selectedValue = window.location.href.split('/tag/')[1].replace("%20"," ");
        }
        if(unique.length > 0 ) {
            if(selectedValue !== "") {
                document.getElementById('filterbuttons').innerHTML = `<li class="tag"><a href="/inspiration/" class="button button--secondary">all</a></li>`+unique.map((item) => {
                    let itemArr = item.split("|");
                    if (itemArr) {
                        if(itemArr[1].indexOf(selectedValue) > -1) {
                            return `<li class="tag"><a href="${itemArr[1]}" class="button button--primary">${itemArr[0]}</a></li>`;
                        } else {
                            return `<li class="tag"><a href="${itemArr[1]}" class="button button--secondary">${itemArr[0]}</a></li>`;
                        }
                    }
                }).join('');
            } else {
                document.getElementById('filterbuttons').innerHTML = `<li class="tag"><a href="/inspiration/" class="button button--primary">all</a></li>`+unique.map((item) => {
                    let itemArr = item.split("|");
                    if (itemArr) {
                        return `<li class="tag"><a href="${itemArr[1]}" class="button button--secondary">${itemArr[0]}</a></li>`;
                    }
                }).join('');
            }
        } else {
            document.getElementById('filterbuttons').innerHTML = `<li class="tag"><a href="/inspiration/" class="button button--primary">all</a></li>`;
        }
    }
}