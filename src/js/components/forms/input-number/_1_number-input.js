/* -------------------------------- 
File#: _1_input-number
Title: Number input
Descr: Number input field with custom increment buttons
Usage: https://codyhouse.co/ds/components/info/number-input
 -------------------------------- */

export class NumberInput {
    constructor(element) {
        this.element = element;
        this.input = this.element.querySelector('.js-number-input__value');
        this.min = parseFloat(this.input.getAttribute('min'));
        this.max = parseFloat(this.input.getAttribute('max'));
        this.step = parseFloat(this.input.getAttribute('step')) || 1;
        this.precision = this.getPrecision(this.step);
        this.initEvents();
    }

    getPrecision(step) {
        const stepString = step.toString();
        return stepString.includes('.') ? stepString.split('.')[1].length : 0;
    }

    initEvents() {
        this.element.addEventListener('click', this.handleButtonClick.bind(this));
        this.input.addEventListener('focusout', this.handleFocusOut.bind(this));
    }

    handleButtonClick(event) {
        const button = event.target.closest('.js-number-input__btn');
        if (!button) return;

        event.preventDefault();
        let value = parseFloat(this.input.value);
        value = button.classList.contains('number-input__btn--plus')
            ? value + this.step
            : value - this.step;
        value = this.clampValue(value);
        this.input.value = value.toFixed(this.precision);
        this.input.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    }

    handleFocusOut() {
        let value = parseFloat(this.input.value);
        value = this.clampValue(value);
        this.input.value = value.toFixed(this.precision);
    }

    clampValue(value) {
        if (value < this.min) value = this.min;
        if (value > this.max) value = this.max;
        return value;
    }
}

export function initNumberInput(context = document) {
    const elements = context.querySelectorAll('.js-number-input');
    elements.forEach(el => {
        if (!el.dataset.numberInitialized) {
            new NumberInput(el);
            el.dataset.numberInitialized = 'true';
        }
    });
}



