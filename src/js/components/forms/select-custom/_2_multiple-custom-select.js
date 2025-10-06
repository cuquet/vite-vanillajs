/* 
File#: _2_multiple-custom-select
Title: Multiple Custom Select
Descr: Custom Select Input where multiple options can be selected.
Usage: https://codyhouse.co/ds/components/info/multiple-custom-select
Dependencies
    _1_radios-checkboxes Radio Checkbox Buttons
*/
import { tools as Util } from '@modules';
export class MultipleCustomSelect {
    constructor(element) {
        this.element = element;
        this.select = this.element.querySelector('select');
        this.optGroups = this.select.getElementsByTagName('optgroup');
        this.options = this.select.querySelectorAll('option');
        this.selectId = this.select.getAttribute('id');
        this.selectName = this.select.getAttribute('name');
        this.trigger = null;
        this.dropdown = null;
        this.customOptions = null;
        this.arrowIcon = this.element.getElementsByTagName('svg');
        this.label = document.querySelector(`[for="${this.selectId}"]`);
        this.selectedOptCounter = 0;
        this.optionIndex = 0;
        this.noSelectText = this.element.getAttribute('data-no-select-text') || 'Select';
        this.multiSelectText =
            this.element.getAttribute('data-multi-select-text') || '{n} items selected';
        this.nMultiSelect = this.element.getAttribute('data-n-multi-select') || 1;
        this.noUpdateLabel =
            this.element.getAttribute('data-update-text') &&
            this.element.getAttribute('data-update-text') === 'off';
        this.insetLabel =
            this.element.getAttribute('data-inset-label') &&
            this.element.getAttribute('data-inset-label') === 'on';
        this.init();
    }

    init() {
        this.createCustomSelect();
        this.initEvents();
    }

    createCustomSelect() {
        const triggerClass = this.element.getAttribute('data-trigger-class')
            ? ` ${this.element.getAttribute('data-trigger-class')}`
            : '';
        const [labelText, ariaLabel] = this.getSelectedOptionsText();
        const activeClass = this.selectedOptCounter > 0 ? ' multi-select__button--active' : '';
        let buttonHTML = `<button class="js-multi-select__button multi-select__button${triggerClass}${activeClass}" aria-label="${ariaLabel}" aria-expanded="false" aria-controls="${this.selectId}-dropdown"><span aria-hidden="true" class="js-multi-select__label multi-select__label">${labelText}`;
        buttonHTML +=`</span>`;
        if (this.arrowIcon.length > 0 && this.arrowIcon[0].outerHTML) {
            buttonHTML += this.arrowIcon[0].outerHTML;
        }
        buttonHTML += `</button>${this.createDropdown()}`;
        this.element.insertAdjacentHTML('beforeend', buttonHTML);
        this.dropdown = this.element.getElementsByClassName('js-multi-select__dropdown')[0];
        this.trigger = this.element.getElementsByClassName('js-multi-select__button')[0];
        this.customOptions = this.dropdown.getElementsByClassName('js-multi-select__option');
        this.select.classList.add('hide');
        if (this.arrowIcon.length > 0) {
            this.arrowIcon[0].style.display = 'none';
        }
    }

    createDropdown() {
        let dropdownHTML = `<div class="js-multi-select__dropdown multi-select__dropdown" aria-describedby="${this.selectId}-description" id="${this.selectId}-dropdown">`;
        if (this.label) {
            dropdownHTML += `<p class="sr-only" id="${this.selectId}-description">${this.label.textContent}</p>`;
        }
        if (this.optGroups.length > 0) {
            for (let i = 0; i < this.optGroups.length; i++) {
                const options = this.optGroups[i].getElementsByTagName('option');
                const optGroupLabel = `<li><span class="multi-select__item multi-select__item--optgroup">${this.optGroups[i].getAttribute('label')}</span></li>`;
                dropdownHTML += `<ul class="multi-select__list" role="listbox" aria-multiselectable="true">${optGroupLabel}${this.createOptions(options)}</ul>`;
            }
        } else {
            dropdownHTML += `<ul class="multi-select__list" role="listbox" aria-multiselectable="true">${this.createOptions(this.options)}</ul>`;
        }
        return dropdownHTML;
    }

    createOptions(options) {
        let optionsHTML = '';
        for (let i = 0; i < options.length; i++) {
            const ariaSelected = options[i].hasAttribute('selected')
                ? ' aria-selected="true"'
                : ' aria-selected="false"';
            const disabled = options[i].hasAttribute('disabled') ? 'disabled' : '';
            const checked = options[i].hasAttribute('selected') ? 'checked' : '';
            optionsHTML += `<li class="js-multi-select__option" role="option" data-value="${options[i].value}"${ariaSelected} data-label="${options[i].text}" data-index="${this.optionIndex}"><input aria-hidden="true" class="checkbox js-multi-select__checkbox" type="checkbox" name="${this.selectName}" id="${this.selectId}-${options[i].value}-${this.optionIndex}" ${checked} ${disabled}><label class="multi-select__item multi-select__item--option" aria-hidden="true" for="${this.selectId}-${options[i].value}-${this.optionIndex}"><span>${options[i].text}</span></label></li>`;
            this.optionIndex++;
        }
        return optionsHTML;
    }

    initEvents() {
        this.dropdown.addEventListener('change', (event) => {
            const option = event.target.closest('.js-multi-select__option');
            if (option) {
                this.toggleOption(option);
            }
        });

        this.dropdown.addEventListener('click', (event) => {
            const option = event.target.closest('.js-multi-select__option');
            if (option && event.target.classList.contains('js-multi-select__option')) {
                this.toggleOption(option);
            }
        });

        this.trigger.addEventListener('click', (event) => {
            event.preventDefault();
            this.toggleDropdown();
        });

        if (this.label) {
            this.label.addEventListener('click', () => {
                this.focusElement(this.trigger);
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
        window.addEventListener('keyup', this.handleKeyup.bind(this));
        window.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    async toggleDropdown(forceState) {
        const expanded =
            forceState ||
            (this.trigger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
        this.trigger.setAttribute('aria-expanded', expanded);
        if (expanded === 'true') {
            const focusElement =
                this.dropdown
                    .querySelector('[aria-selected="true"]')
                    ?.getElementsByClassName('js-multi-select__checkbox')[0] ||
                this.customOptions[0].getElementsByClassName('js-multi-select__checkbox')[0];
            this.focusElement(focusElement);
            try {
                await Util.transitionend(this.dropdown); // 👈 espera el final de la transició, cross-browser
            } catch (err) {
                console.warn('Transition error:', err);
            }
            this.positionDropdown();
        }
    }

    navigateOptions(direction, event) {
        event.preventDefault();
        let currentIndex = Array.prototype.indexOf.call(
            this.customOptions,
            document.activeElement.closest('.js-multi-select__option'),
        );
        currentIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (currentIndex < 0) {
            currentIndex = this.customOptions.length - 1;
        } else if (currentIndex >= this.customOptions.length) {
            currentIndex = 0;
        }
        this.focusElement(
            this.customOptions[currentIndex].getElementsByClassName('js-multi-select__checkbox')[0],
        );
    }

    toggleOption(option) {
        const isSelected = option.getAttribute('aria-selected') === 'true';
        option.setAttribute('aria-selected', isSelected ? 'false' : 'true');
        this.updateOption(option.getAttribute('data-index'), !isSelected);
        const [labelText, ariaLabel] = this.getSelectedOptionsText();
        this.trigger.getElementsByClassName('js-multi-select__label')[0].innerHTML = labelText;
        this.trigger.classList.toggle('multi-select__button--active', this.selectedOptCounter > 0);
        this.trigger.setAttribute('aria-label', ariaLabel);
    }

    updateOption(index, isSelected) {
        this.options[index].selected = isSelected;
        this.select.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    }

    getSelectedOptionsText() {
        let labelText = `<span class="multi-select__term">${this.noSelectText}</span>`;
        if (this.noUpdateLabel) {
            return [labelText, this.noSelectText];
        }
        let selectedText = '';
        this.selectedOptCounter = 0;
        for (let i = 0; i < this.options.length; i++) {
            if (this.options[i].selected) {
                if (this.selectedOptCounter > 0) {
                    selectedText += ', ';
                }
                selectedText += this.options[i].text;
                this.selectedOptCounter++;
            }
        }
        if (this.selectedOptCounter > this.nMultiSelect) {
            selectedText = `<span class="multi-select__details">${this.multiSelectText.replace('{n}', this.selectedOptCounter)}</span>`;
            labelText =
                this.multiSelectText.replace('{n}', this.selectedOptCounter) +
                `, ${this.noSelectText}`;
        } else if (this.selectedOptCounter > 0) {
            labelText = `${selectedText}, ${this.noSelectText}`;
            selectedText = `<span class="multi-select__details">${selectedText}</span>`;
        } else {
            selectedText = labelText;
            labelText = this.noSelectText;
        }
        if (this.insetLabel && this.selectedOptCounter > 0) {
            selectedText = `<span class="multi-select__term">${this.noSelectText}</span>${selectedText}`;
        }
        return [selectedText, labelText];
    }

    positionDropdown() {
        const triggerRect = this.trigger.getBoundingClientRect();
        const dropdownRight = window.innerWidth < triggerRect.left + this.dropdown.offsetWidth;
        const dropdownUp = window.innerHeight - triggerRect.bottom < triggerRect.top;
        const maxHeight = dropdownUp
            ? triggerRect.top - 20
            : window.innerHeight - triggerRect.bottom - 20;
        this.dropdown.classList.toggle('multi-select__dropdown--right', dropdownRight);
        this.dropdown.classList.toggle('multi-select__dropdown--up', dropdownUp);
        this.dropdown.style.maxHeight = `${maxHeight}px`;
        this.dropdown.style.width = `${triggerRect.width}px`;
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
            if (document.activeElement.closest('.js-multi-select')) {
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
export function initMultipleCustomSelect(context = document) {
    const elements = context.querySelectorAll('.js-multi-select');
    elements.forEach(el => {
        if (!el.dataset.mcsInitialized) {
            new MultipleCustomSelect(el);
            el.dataset.mcsInitialized = 'true';
        }
    });
}
