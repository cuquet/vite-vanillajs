/* -------------------------------- 

File#: _1_expandable-search
Title: Expandable Search
Descr: A search button that expands to reveal a search input element.
Usage: https://codyhouse.co/ds/components/info/expandable-search

-------------------------------- */

export default class ExpandableSearch {
    constructor() {
        this.init();
    }
    init() {
        const ExSearchs = Array.from(document.getElementsByClassName('js-expandable-search'));
        ExSearchs.forEach(exSearch => {
            const input = exSearch.getElementsByClassName('js-expandable-search__input')[0];
            if (input) {
                input.addEventListener('input', function (e) {
                    e.target.classList.toggle(
                    'expandable-search__input--has-content',
                    e.target.value.length > 0,
                    );
                });
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new ExpandableSearch();
});
