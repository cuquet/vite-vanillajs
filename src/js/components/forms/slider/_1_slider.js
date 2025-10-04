/* -------------------------------- 
File#: _1_slider
Title: Slider
Descr: Slider element for choosing numbers between a min and a max value.
Usage: https://codyhouse.co/ds/components/info/slider
Dependencies: 
-------------------------------- */

class Slider {
    constructor(element) {
        this.element = element;
        this.rangeWrapper = this.element.querySelector('.slider__range');
        this.rangeInput = this.element.querySelectorAll('.slider__input');
        this.value = this.element.querySelectorAll('.js-slider__value');
        this.floatingValue = this.element.querySelectorAll('.js-slider__value--floating');
        this.rangeMin = this.rangeInput[0].getAttribute('min');
        this.rangeMax = this.rangeInput[0].getAttribute('max');
        this.sliderWidth = window.getComputedStyle(this.rangeWrapper).getPropertyValue('width');
        this.thumbWidth = getComputedStyle(this.element).getPropertyValue('--slide-thumb-size');
        this.isInputVar = this.value[0].tagName.toLowerCase() === 'input';
        this.isFloatingVar = this.floatingValue.length > 0;
        if (this.isFloatingVar) {
            this.floatingValueLeft = window.getComputedStyle(this.floatingValue[0]).getPropertyValue('left');
        }
        this.init();
    }

    init() {
        this.updateInputVar();
        this.updateFloating();
        this.updateFillSlider();
        this.initEvents();
    }

    initEvents() {
        this.rangeInput.forEach((input, index) => {
            input.addEventListener('input', () => this.handleUpdate(index));
            input.addEventListener('change', () => this.handleUpdate(index));
        });

        if (this.isInputVar) {
            this.value.forEach((input, index) => {
                input.addEventListener('change', () => this.handleUpdateInputValue(index));
            });
        }

        this.element.addEventListener('slider-updated', () => {
            this.value.forEach((_, index) => this.handleUpdate(index));
        });

        this.element.addEventListener('inputRangeLimit', (event) => {
            this.updateInputVar();
            this.updateFloating(event.detail);
        });
    }

    updateInputVar() {
        this.rangeInput.forEach((input, index) => {
            if (this.isInputVar) {
                this.value[index].value = input.value;
            } else {
                this.value[index].textContent = input.value;
            }
        });
    }

    updateFloating(index = 0) {
        if (this.isFloatingVar) {
            for (let i = index; i < (index + 1); i++) {
                const ratio = (this.rangeInput[i].value - this.rangeMin) / (this.rangeMax - this.rangeMin);
                this.floatingValue[i].style.left = `calc(0.5 * ${this.floatingValueLeft} + ${ratio} * (${this.sliderWidth} - ${this.floatingValueLeft}))`;
            }
        }
    }

    updateFillSlider() {
        if (this.rangeInput.length > 1) {
            this.element.dispatchEvent(new CustomEvent('updateRange', { detail: 0 }));
        } else {
            const ratio = (this.rangeInput[0].value - this.rangeMin) / (this.rangeMax - this.rangeMin) * 100;
            const fillValue = `calc(${ratio} * (${this.sliderWidth} - 0.5 * ${this.thumbWidth}) / 100)`;
            const emptyValue = `calc(${this.sliderWidth} - ${ratio} * (${this.sliderWidth} - 0.5 * ${this.thumbWidth}) / 100)`;
            this.rangeWrapper.style.setProperty('--slider-fill-value', fillValue);
            this.rangeWrapper.style.setProperty('--slider-empty-value', emptyValue);
        }
    }

    handleUpdate(index) {
        this.updateInputVar();
        this.updateFloating(index);
        this.updateFillSlider();
    }

    handleUpdateInputValue(index) {
        let value = parseFloat(this.value[index].value);
        if (isNaN(value)) {
            this.value[index].value = this.rangeInput[index].value;
        } else {
            value = Math.max(this.rangeMin, Math.min(this.rangeMax, value));
            this.rangeInput[index].value = value;
            this.rangeInput[index].dispatchEvent(new Event('change'));
        }
    }
}


export default Slider;

document.addEventListener('DOMContentLoaded', () => {
    const sliders = Array.from(document.querySelectorAll('.js-slider'));
    sliders.forEach((element) => {
        new Slider(element);
    });
});
