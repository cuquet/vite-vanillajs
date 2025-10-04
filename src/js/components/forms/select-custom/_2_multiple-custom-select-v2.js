/* -------------------------------- 

File#: _2_multiple-custom-select-v2
Title: Multiple Custom Select v2
Descr: A list of filterable checkbox inputs.
Dependences:
    _1_custom-checkbox
    _1_list-filter
Usage: https://codyhouse.co/ds/components/info/multiple-custom-select-v2

-------------------------------- */
import { ListFilter } from '@/js/components/forms/list-filter';

export class MultipleCustomSelectV2 extends ListFilter {
    constructor(element) {
        super(element);
        //this.element = element;
        this.checkboxes = this.element.getElementsByClassName('js-multi-select-v2__input') || false;
        this.counter = this.element.getElementsByClassName(
            'js-multi-select-v2__selected-items-counter',
        );
        this.resetBtn = this.element.getElementsByClassName('js-multi-select-v2__reset') || false;
        this.checkedClass = 'multi-select-v2__label--checked';
        this.init();
    }

    init() {
        this.initSearchTags();
        this.updateCheckedLabels();
        this.updateCounter();
        this.initEvents();
    }

    updateCheckedLabels() {
        if (this.checkboxes) {
            for (let i = 0; i < this.checkboxes.length; i++) {
                if (this.checkboxes[i].checked) {
                    const label = this.checkboxes[i].closest('label');
                    if (label) label.classList.add(this.checkedClass);
                }
            }
        }
    }

    updateCounter(count) {
        if (this.counter.length > 0) {
            if (count === undefined) {
                count = 0;
                for (let i = 0; i < this.checkboxes.length; i++) {
                    if (this.checkboxes[i].checked) count += 1;
                }
            }
            this.counter[0].innerHTML = count;
        }
    }

    initEvents() {
        this.search.addEventListener('input', this.handleInputSearch.bind(this));
        if (this.searchCancel) {
            this.searchCancel.addEventListener('click', this.handleClickSearch.bind(this));
        }
        this.element.addEventListener('change', (event) => {
            const label = event.target.closest('label');
            if (label) label.classList.toggle(this.checkedClass, event.target.checked);
            this.updateCounter();
        });

        if (this.resetBtn) {
            this.resetBtn[0].addEventListener('click', () => {
                for (let i = 0; i < this.checkboxes.length; i++) {
                    this.checkboxes[i].checked = false;
                }
                this.updateCounter(0);
                this.resetCheckedLabels();
            });
        }
    }

    resetCheckedLabels() {
        const checkedLabels = this.element.getElementsByClassName(this.checkedClass);
        while (checkedLabels[0]) {
            checkedLabels[0].classList.remove(this.checkedClass);
        }
    }
}

export function initMultipleCustomSelectV2(context = document) {
    const elements = context.querySelectorAll('.js-multi-select-v2');
    elements.forEach(el => {
        if (!el.dataset.mcs2Initialized) {
            new MultipleCustomSelectV2(el);
            el.dataset.mcs2Initialized = 'true';
        }
    });
}
