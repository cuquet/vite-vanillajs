/* 
File#: _2_custom-select
Title: Custom Select
Descr: Custom select form element.
Usage: https://codyhouse.co/ds/components/info/custom-select

Dependencies:
    _1_popover
    _1_inputgroup
    _1_input-icon 
*/

export class CustomSelect {
    constructor(element) {
        this.element = element;
        this.select = this.element.getElementsByTagName('select')[0];
        this.optGroups = this.select.getElementsByTagName('optgroup');
        this.options = this.select.getElementsByTagName('option');
        this.selectedOption = this.getSelectedOption();
        this.selectId = this.select.getAttribute('id');
        this.trigger = null;
        this.dropdown = null;
        this.customOptions = null;
        this.arrowIcon = this.element.getElementsByTagName('svg');
        this.label = document.querySelector(`[for="${this.selectId}"]`);
        this.labelContent = this.label ? `, ${this.label.textContent}` : '';
        this.optionIndex = 0;
        this.init();
        this.initEvents();
    }

    init() {
        this.element.insertAdjacentHTML('beforeend', this.renderTriggerButton + this.renderDropdown);
        this.dropdown = this.element.getElementsByClassName('js-select__dropdown')[0];
        this.trigger = this.element.getElementsByClassName('js-select__button')[0];
        this.customOptions = this.dropdown.getElementsByClassName('js-select__item');
        this.select.classList.add('hide');
        if (this.arrowIcon.length > 0) {
            this.arrowIcon[0].style.display = 'none';
        }
        this.minWidth = parseInt(getComputedStyle(this.dropdown).getPropertyValue('min-width'));
        this.placeElement();
    }


    initEvents() {
        this.dropdown.addEventListener('click', (event) => {
            const item = event.target.closest('.js-select__item');
            if (item) {
                this.selectOption(item);
            }
        });

        this.trigger.addEventListener('click', () => {
            this.toggleDropdown();
        });

        if (this.label) {
            this.label.addEventListener('click', () => {
                this.trigger.focus();
            });
        }

        this.dropdown.addEventListener('keydown', (event) => {
            if (event.keyCode === 38 || (event.key && event.key.toLowerCase() === 'arrowup')) {
                this.navigateOptions('prev', event);
            } else if (
                event.keyCode === 40 ||
                (event.key && event.key.toLowerCase() === 'arrowdown')
            ) {
                this.navigateOptions('next', event);
            }
        });

        this.element.addEventListener('select-updated', () => {
            this.updateSelectedOption();
        });
        window.addEventListener('keyup', this.handleKeyup.bind(this));
        window.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    get renderTriggerButton() {
        const triggerClass = this.element.getAttribute('data-trigger-class')
            ? ` ${this.element.getAttribute('data-trigger-class')}`
            : '';
        const triggerLabel = this.options[this.select.selectedIndex].innerHTML + this.labelContent;
        let button = `<button type="button" class="js-select__button select__button${triggerClass}" aria-label="${triggerLabel}" aria-expanded="false" aria-controls="${this.selectId}-dropdown"><span aria-hidden="true" class="js-select__label select__label">${this.selectedOption}`;
        button += '</span>';
        if (this.arrowIcon.length > 0 && this.arrowIcon[0].outerHTML) {
            const clonedIcon = this.arrowIcon[0].cloneNode(true);
            clonedIcon.classList.remove('select__icon');
            button += clonedIcon.outerHTML;
        }
        return button + '</button>';
    }

    get renderDropdown() {
        let dropdown = `<div class="js-select__dropdown select__dropdown" aria-describedby="${this.selectId}-description" id="${this.selectId}-dropdown">`;
        if (this.label) {
            dropdown += `<p class="sr-only" id="${this.selectId}-description">${this.label.textContent}</p>`;
        }
        if (this.optGroups.length > 0) {
            for (let i = 0; i < this.optGroups.length; i++) {
                const options = this.optGroups[i].getElementsByTagName('option');
                const label = this.optGroups[i].getAttribute('label');

                let optGroupLabel = '';
                if (label && label.trim() !== '') {
                    optGroupLabel = `<li><span class="select__item select__item--optgroup">${label}</span></li>`;
                }
                dropdown += `<ul class="select__list" role="listbox">${optGroupLabel}${this.getOptionsList(options)}</ul>`;
            }
        } else {
            dropdown += `<ul class="select__list" role="listbox">${this.getOptionsList(this.options)}</ul>`;
        }
        return dropdown;
    }

    getSelectedOption() {
        return 'selectedIndex' in this.select
            ? this.options[this.select.selectedIndex].text
            : this.select.querySelector('option[selected]').text;
    }

    getOptionsList(options) {
        let list = '';
        for (let i = 0; i < options.length; i++) {
            const isSelected = options[i].hasAttribute('selected')
                ? ' aria-selected="true"'
                : ' aria-selected="false"';
            const isDisabled = options[i].hasAttribute('disabled') ? ' disabled' : '';
            list += `<li><button type="button" class="reset js-select__item select__item select__item--option" role="option" data-value="${options[i].value}" ${isSelected}${isDisabled} data-index="${this.optionIndex}">${options[i].text}</button></li>`;
            this.optionIndex++;
        }
        return list;
    }

    selectOption(item) {
        if (item.hasAttribute('aria-selected') && item.getAttribute('aria-selected') === 'true') {
            this.trigger.setAttribute('aria-expanded', 'false');
        } else {
            const selectedItem = this.dropdown.querySelector('[aria-selected="true"]');
            if (selectedItem) {
                selectedItem.setAttribute('aria-selected', 'false');
            }
            item.setAttribute('aria-selected', 'true');
            this.trigger.getElementsByClassName('js-select__label')[0].textContent =
                item.textContent;
            this.trigger.setAttribute('aria-expanded', 'false');
            this.select.selectedIndex = item.getAttribute('data-index');
            this.select.dispatchEvent(new CustomEvent('change', { bubbles: true }));
            this.select.dispatchEvent(new CustomEvent('input', { bubbles: true }));
            this.updateAriaLabel();
        }
        this.trigger.focus();
    }

    toggleDropdown(forceState) {
        const ariaExpanded = forceState || (this.trigger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
        this.trigger.setAttribute('aria-expanded', ariaExpanded);
        if (ariaExpanded === 'true') {
            const selectedItem =
                this.dropdown.querySelector('[aria-selected="true"]') || this.customOptions[0];
            this.focusElement(selectedItem);
            this.dropdown.addEventListener(
                'transitionend',
                () => {
                    this.focusElement(selectedItem);
                },
                { once: true },
            );
            this.placeElement();
        }

    }

    placeElement() {
        this.dropdown.classList.remove('select__dropdown--right', 'select__dropdown--up');
        const triggerRect = this.trigger.getBoundingClientRect();
        this.dropdown.classList.toggle(
            'select__dropdown--right',
            //document.documentElement.clientWidth - 5 < triggerRect.left + this.dropdown.offsetWidth
            Math.min(document.documentElement.clientWidth || 0, window.innerWidth || 0) < triggerRect.left + this.dropdown.offsetWidth,
        );
        const dropdownUp = window.innerHeight - triggerRect.bottom - 5 < triggerRect.top;
        this.dropdown.classList.toggle(
            'select__dropdown--up', 
            dropdownUp
        );
        
        
        const maxHeight = dropdownUp
            ? triggerRect.top - 20
            : window.innerHeight - triggerRect.bottom - 20;
        this.dropdown.style.maxHeight = `${maxHeight}px`;
        if (this.minWidth < triggerRect.width) {
            this.dropdown.style.minWidth = `${triggerRect.width}px`;
        }
        
        this.dropdown.style.maxWidth = `${window.innerWidth * .85}px`
    }

    navigateOptions(direction, event) {
        event.preventDefault();
        let currentIndex = Array.prototype.indexOf.call(this.customOptions, document.activeElement);
        currentIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (currentIndex < 0) {
            currentIndex = this.customOptions.length - 1;
        } else if (currentIndex >= this.customOptions.length) {
            currentIndex = 0;
        }
        this.focusElement(this.customOptions[currentIndex]);
    }

    updateSelectedOption() {
        const selectedItem = this.dropdown.querySelector('[aria-selected="true"]');
        if (selectedItem) {
            selectedItem.setAttribute('aria-selected', 'false');
        }
        const newSelectedItem = this.dropdown.querySelector(
            `.js-select__item[data-index="${this.select.selectedIndex}"]`,
        );
        newSelectedItem.setAttribute('aria-selected', 'true');
        this.trigger.getElementsByClassName('js-select__label')[0].textContent =
            newSelectedItem.textContent;
        this.trigger.setAttribute('aria-expanded', 'false');
        this.updateAriaLabel();
    }

    updateAriaLabel() {
        this.trigger.setAttribute(
            'aria-label',
            this.options[this.select.selectedIndex].innerHTML + this.labelContent,
        );
    }

    focusElement(element) {
        element.focus();
        if (document.activeElement !== element) {
            element.setAttribute('tabindex', '-1');
            element.focus();
        }
    }

    handleKeyup(event) {
        if ((event.code == 'Escape' || event.key === 'Escape') ) {
            if (document.activeElement.closest('.js-select')) {
                this.trigger.focus();
            }
            this.toggleDropdown('false');
        }
    }
    
    handleOutsideClick(event){
        if (!this.element.contains(event.target)) {
            this.toggleDropdown('false');
        }
    }
}

export function initCustomSelect(context = document) {
    const elements = context.querySelectorAll('.js-select');
    elements.forEach(el => {
        if (!el.dataset.selectInitialized) {
            new CustomSelect(el);
            el.dataset.selectInitialized = 'true';
        }
    });
}
