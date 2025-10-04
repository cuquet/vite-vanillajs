/* -------------------------------- 

File#: _2_adv-custom-select
Title: Advanced Custom Select
Descr: Custom Select with advanced structure options.
Usage: https://codyhouse.co/ds/components/info/advanced-custom-select
Dependencies
    _1_popover
-------------------------------- */
import { tools as Util } from '@modules';
//import { Popover } from '@/js/components/controls';

export class AdvSelect {
    constructor(element) {
        this.element = element;
        this.select = this.element.getElementsByTagName('select')[0];
        this.optGroups = this.select.getElementsByTagName('optgroup');
        this.options = this.select.getElementsByTagName('option');
        this.optionData = this.getOptionsData();
        this.selectId = this.select.getAttribute('id');
        this.selectLabel = document.querySelector(`[for=${this.selectId}]`);
        this.trigger = this.element.getElementsByClassName('js-adv-select__control')[0];
        this.triggerLabel = this.trigger.getElementsByClassName('js-adv-select__value')[0];
        this.dropdown = document.getElementById(this.trigger.getAttribute('aria-controls'));

        this.init(); // init markup
        this.initEvents(); // init event listeners
    }

    getOptionsData() {
        const obj = [];
        const dataset = this.options[0].dataset;

        const camelCaseToDash = (myStr) => myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

        for (const prop in dataset) {
            if (Object.prototype.hasOwnProperty.call(dataset, prop)) {
                obj.push(camelCaseToDash(prop));
            }
        }
        return obj;
    }

    init() {
        // create custom structure
        this.createAdvStructure();
        // update trigger label
        this.updateTriggerLabel();
        // hide native select and show custom structure
        Util.addClass(this.select, 'hide');
        Util.removeClass(this.trigger, 'hide');
        Util.removeClass(this.dropdown, 'hide');
    }

    initEvents() {
        if (this.selectLabel) {
            // move focus to custom trigger when clicking on <select> label
            this.selectLabel.addEventListener('click', () => {
                this.trigger.focus();
            });
        }

        // option is selected in dropdown
        this.dropdown.addEventListener('click', (event) => {
            this.triggerSelection(event.target);
        });

        // keyboard navigation
        this.dropdown.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp') {
                this.keyboardCustomSelect('prev', event);
            } else if (event.key === 'ArrowDown') {
                this.keyboardCustomSelect('next', event);
            } else if (event.key === 'Enter') {
                this.triggerSelection(document.activeElement);
            }
        });
    }

    createAdvStructure() {
        const optgroup = this.dropdown.querySelector('[role="group"]');
        const option = this.dropdown.querySelector('[role="option"]');
        const optgroupClone = optgroup ? optgroup.cloneNode() : false;
        const optgroupLabel = optgroupClone
            ? document.getElementById(optgroupClone.getAttribute('describedby'))
            : false;
        const optionClone = option ? option.cloneNode(true) : false;

        let dropdownCode = '';

        if (this.optGroups.length > 0) {
            for (let i = 0; i < this.optGroups.length; i++) {
                dropdownCode += this.getOptGroupCode(
                    this.optGroups[i],
                    optgroupClone,
                    optionClone,
                    optgroupLabel,
                    i,
                );
            }
        } else {
            for (let i = 0; i < this.options.length; i++) {
                dropdownCode += this.getOptionCode(this.options[i], optionClone);
            }
        }

        this.dropdown.innerHTML = dropdownCode;
    }

    getOptGroupCode(optGroup, optGroupClone, optionClone, optgroupLabel, index) {
        if (!optGroupClone || !optionClone) return '';
        let code = '';
        const options = optGroup.getElementsByTagName('option');
        for (let i = 0; i < options.length; i++) {
            code += this.getOptionCode(options[i], optionClone);
        }
        if (optgroupLabel) {
            const label = optgroupLabel.cloneNode(true);
            const id = `${label.getAttribute('id')}-${index}`;
            label.setAttribute('id', id);
            optGroupClone.setAttribute('describedby', id);
            code =
                label.outerHTML.replace('{optgroup-label}', optGroup.getAttribute('label')) + code;
        }
        optGroupClone.innerHTML = code;
        return optGroupClone.outerHTML;
    }

    getOptionCode(option, optionClone) {
        optionClone.setAttribute('data-value', option.value);
        if (option.selected) {
            optionClone.setAttribute('aria-selected', 'true');
            optionClone.setAttribute('tabindex', '0');
        } else {
            optionClone.removeAttribute('aria-selected');
            optionClone.removeAttribute('tabindex');
        }
        let optionHtml = optionClone.outerHTML;
        optionHtml = optionHtml.replace('{option-label}', option.text);
        for (let i = 0; i < this.optionData.length; i++) {
            optionHtml = optionHtml.replace(
                `{${this.optionData[i]}}`,
                option.getAttribute(`data-${this.optionData[i]}`),
            );
        }
        return optionHtml;
    }

    updateTriggerLabel() {
        this.triggerLabel.innerHTML =
            this.dropdown.querySelector('[aria-selected="true"]').innerHTML;
    }

    triggerSelection(target) {
        const option = target.closest('[role="option"]');
        if (!option) return;
        this.selectOption(option);
    }

    selectOption(option) {
        if (
            option.hasAttribute('aria-selected') &&
            option.getAttribute('aria-selected') === 'true'
        ) {
            return;
        } else {
            const selectedOption = this.dropdown.querySelector('[aria-selected="true"]');
            if (selectedOption) {
                selectedOption.removeAttribute('aria-selected');
                selectedOption.removeAttribute('tabindex');
            }
            option.setAttribute('aria-selected', 'true');
            option.setAttribute('tabindex', '0');
            // new option has been selected -> update native <select> element and trigger label
            this.updateNativeSelect(option.getAttribute('data-value'));
            this.updateTriggerLabel();
        }
        // move focus back to trigger
        setTimeout(() => {
            this.trigger.click();
        });
    }

    updateNativeSelect(selectedValue) {
        const selectedOption = this.select.querySelector(`[value="${selectedValue}"]`);
        this.select.selectedIndex = Util.getIndexInArray(this.options, selectedOption);
        this.select.dispatchEvent(new CustomEvent('change', { bubbles: true })); // trigger change event
    }

    keyboardCustomSelect(direction) {
        const selectedOption = this.select.querySelector(
            `[value="${document.activeElement.getAttribute('data-value')}"]`,
        );
        if (!selectedOption) return;
        let index = Util.getIndexInArray(this.options, selectedOption);

        index = direction === 'next' ? index + 1 : index - 1;
        if (index < 0 || index >= this.options.length) return;

        const dropdownOption = this.dropdown.querySelector(
            `[data-value="${this.options[index].getAttribute('value')}"]`,
        );
        if (dropdownOption) Util.moveFocus(dropdownOption);
    }
}

window.AdvSelect = AdvSelect;

export function initAdvSelect(context = document) {
    const elements = context.querySelectorAll('.js-adv-select');
    elements.forEach(el => {
        if (!el.dataset.advSelectInitialized) {
            new AdvSelect(el);
            el.dataset.advSelectInitialized = 'true';
        }
    });
}
