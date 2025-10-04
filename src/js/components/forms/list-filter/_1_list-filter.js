/* 
File#: _1_list-filter
Title: List Filter
Descr: A list of filterable search items.
Usage: https://codyhouse.co/ds/components/info/list-filter

Dependencies:
*/

class ListFilter {
    constructor(element) {
        this.element = element;
        this.search = this.element.querySelector('.js-list-filter__search') || false;
        this.searchCancel = this.element.querySelector(
            '.js-list-filter__search-cancel-btn',
        ) || false;
        this.list = this.element.querySelector('.js-list-filter__list');
        this.items = this.list.getElementsByClassName('js-list-filter__item');
        this.noResults = this.element.getElementsByClassName('js-list-filter__no-results-msg');
        this.searchTags = [];
        this.counter = this.element.getElementsByClassName('js-list-filter__results-nr');
        this.visibleItemsNr = 0;
        this.init();
    }

    // Inicialitza els elements i afegeix els esdeveniments
    init () {
        this.initSearchTags();
        this.initEvents();
    }

    initSearchTags(){
        for (let i = 0; i < this.items.length; i+=1) {
            let label = '';
            const labelElement = this.items[i].getElementsByClassName('js-list-filter__label');
            if (labelElement.length > 0) {
                label = labelElement[0].textContent;
            }
            const filterTags = this.items[i].getAttribute('data-filter-tags');
            if (filterTags) {
                label += ' ' + filterTags;
            }
            this.searchTags.push(label);
        }
        if (this.search) this.filterItems();
    }

    initEvents() {
        this.search.addEventListener('input', this.handleInputSearch.bind(this));
        if (this.searchCancel) {
            this.searchCancel.addEventListener('click', this.handleClickSearch.bind(this));
        }
        this.list.addEventListener('click', this.handleClickRemove.bind(this));
    }

    handleInputSearch(e) {
        this.search.value = e.target.value.trim();
        this.filterItems();
    }
    handleClickSearch() {
        this.search.value = '';
        this.search.dispatchEvent(new Event('input'));
    }
    handleClickRemove(e) {
        const removeBtn = e.target.closest('.js-list-filter__action-btn--remove');
        if (removeBtn) {
            e.preventDefault();
            this.removeItem(removeBtn);
        }
    }
    // Filtra els elements de la llista segons el text de cerca
    filterItems() {
        const searchTerms = (this.search) ? this.search.value.toLowerCase().split(' ') : '';
        const visibilityArray = [];
        for (let i = 0; i < this.items.length; i += 1) {
            visibilityArray.push(this.isItemVisible(i, searchTerms));
        }
        this.updateVisibility(visibilityArray);
    }
    // Comprova si un element és visible segons els termes de cerca
    isItemVisible(index, searchTerms) {
        for (let term of searchTerms) {
            if (term && this.searchTags[index].toLowerCase().indexOf(term) < 0) {
                return false;
            }
        }
        return true;
    }
    // Actualitza la visibilitat dels elements de la llista
    updateVisibility(visibilityArray) {
        this.visibleItemsNr = 0;

        for (let i = 0; i < visibilityArray.length; i+=1) {
            if (visibilityArray[i]) {
                this.visibleItemsNr++;
            }
            this.items[i].classList.toggle('hide', !visibilityArray[i]);
        }
        if (this.noResults.length > 0) {
            this.noResults[0].classList.toggle('hide', this.visibleItemsNr > 0);
        }

        this.updateCounter();
    }

    // Actualitza el comptador de resultats visibles
    updateCounter() {
        if (this.counter.length > 0) {
            this.counter[0].innerHTML = this.visibleItemsNr;
        }
    }

    // Elimina un element de la llista
    removeItem(button) {
        const item = button.closest('.js-list-filter__item');
        if (!item) return;

        const index = Array.prototype.indexOf.call(this.items, item);
        item.remove();
        this.searchTags.splice(index, 1);
        this.visibleItemsNr--;
        this.updateCounter();
    }
}

// Inicialitza la classe per a cada element amb la classe 'js-list-filter'
document.addEventListener('DOMContentLoaded', () => {
    const listFilters =  Array.from(document.getElementsByClassName('js-list-filter'));
    listFilters.forEach(element => { new ListFilter(element); });
});

export default ListFilter;