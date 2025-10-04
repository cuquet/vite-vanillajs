/* -------------------------------- 

File#: _2_slider-multi-value
Title: Multi Value Slider
Descr: Slider element for choosing a minimum and maximum value in a specified range
Usage: https://codyhouse.co/ds/components/info/multi-value-slider
Dependencies
    Slider
-------------------------------- */
import { tools as Util } from '@modules';
import Slider from './_1_slider.js';

class SliderRange extends Slider {
    constructor(element) {
        super(element);
        // this.rangeWrapper = this.element.getElementsByClassName('slider__range')[0];
        // this.rangeInput = this.element.getElementsByClassName('slider__input');
        // this.rangeMin = this.rangeInput[0].getAttribute('min');
        // this.rangeMax = this.rangeInput[0].getAttribute('max');
        // this.sliderWidth = window.getComputedStyle(this.rangeWrapper).getPropertyValue('width');
        // this.thumbWidth = getComputedStyle(this.element).getPropertyValue('--slide-thumb-size');

        if (
            !Util.cssSupports('-ms-ime-align', 'auto') &&
            Util.cssSupports('--color-value', 'red')
        ) {
            Util.addClass(this.element, 'slider--ms-fallback');
        }

        this.updateFillSlider();
        this.initEvents();
    }

    initEvents() {
        this.element.addEventListener('updateRange', (e) => {
            const index = e.detail;
            const oppositeIndex = index === 0 ? 1 : 0;
            const oppositeValue = parseFloat(this.rangeInput[oppositeIndex].value);

            if (
                (index === 0 && this.rangeInput[0].value >= oppositeValue) ||
                (index === 1 && this.rangeInput[1].value <= oppositeValue)
            ) {
                this.rangeInput[index].value = oppositeValue;
                this.element.dispatchEvent(new CustomEvent('inputRangeLimit', { detail: index }));
            }

            this.updateFillSlider();
        });

        this.element.addEventListener('update-slider-multi-value', () => {
            this.sliderWidth = window.getComputedStyle(this.rangeWrapper).getPropertyValue('width');
            this.updateFillSlider();
        });
    }

    updateFillSlider() {
        const startValue = parseInt(
            ((this.rangeInput[0].value - this.rangeMin) / (this.rangeMax - this.rangeMin)) * 100,
        );
        const endValue = parseInt(
            ((this.rangeInput[1].value - this.rangeMin) / (this.rangeMax - this.rangeMin)) * 100,
        );
        const startCalc = `calc(${startValue} * (${this.sliderWidth} - 0.5 * ${this.thumbWidth}) / 100)`;
        const endCalc = `calc(${endValue} * (${this.sliderWidth} - 0.5 * ${this.thumbWidth}) / 100)`;

        this.rangeWrapper.style.setProperty('--slider-fill-value-start', startCalc);
        this.rangeWrapper.style.setProperty('--slider-fill-value-end', endCalc);
    }
}

export default SliderRange;

document.addEventListener('DOMContentLoaded', () => {
    const sliders = Array.from(document.querySelectorAll('.slider--multi-value.js-slider'));
    const sliderInstances = [];
    sliders.forEach((element) => {
        if (element.getElementsByClassName('slider__input').length > 1) {
            sliderInstances.push(new SliderRange(element));
        }
    });

    if (sliderInstances.length > 0) {
        let resizeTimeout;
        const updateEvent = new CustomEvent('update-slider-multi-value');
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                sliderInstances.forEach((slider) => {
                    slider.element.dispatchEvent(updateEvent);
                });
            }, 500);
        });
    }
});

