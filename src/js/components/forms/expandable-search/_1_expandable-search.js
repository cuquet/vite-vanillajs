/* -------------------------------- 
File#: _1_expandable-search
Title: Expandable Search
Descr: A search button that expands to reveal a search input element.
Usage: https://codyhouse.co/ds/components/info/expandable-search
-------------------------------- */

export class ExpandableSearch {
    constructor(element) {
        this.element = element;
        this.input = this.element.querySelector('.js-expandable-search__input');
        this.init();
    }

    init() {
        if (!this.input) return;
        this.input.addEventListener('input', (e) => {
            e.target.classList.toggle(
                'expandable-search__input--has-content',
                e.target.value.length > 0,
            );
        });
    }
}

export function initExpandableSearch(context = document) {
    const elements = context.querySelectorAll('.js-expandable-search');
    elements.forEach((el) => {
        if (!el.dataset.expandableSearchInitialized) {
            new ExpandableSearch(el);
            el.dataset.expandableSearchInitialized = 'true';
        }
    });
}
