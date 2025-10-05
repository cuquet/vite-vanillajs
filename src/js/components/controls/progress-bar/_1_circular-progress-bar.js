/* -------------------------------- 

File#: _1_cirdular-progress-bar
Title: Circular Progress Bar
Descr: Display the current progress of a task using a circular SVG shape.

Usage: https://codyhouse.co/ds/components/info/circular-progress-bar

-------------------------------- */

import { tools as Util } from '@modules';
import { ProgressBar }from './_1_progress-bar';

export class CProgressBar extends ProgressBar {
    constructor(element, opts) {
        super(element, Util.extend(CProgressBar.defaults, opts));
        this.fillLength = parseFloat(2 * Math.PI * this.fill.getAttribute('r')).toFixed(2);
        this.colorThresholds = this.getColorThresholds;
        this.init();
    }
    static defaults = {
        fillClass: 'c-progress-bar__fill',
        labelClass: 'js-c-progress-bar__value',
        ariaLabelClass: 'js-c-progress-bar__aria-value',
        colorUpdateClass: 'c-progress-bar--color-update',
        colorVariable: '--c-progress-bar-color-',
        colorFillVariable: 'c-progress-bar--fill-color-',
    }; 

    get updateValue() {
        return parseFloat(this.element.getAttribute('data-progress'));
    }
    init() {
        const cx = this.fill.getAttribute('cx');
        this.fill.setAttribute('transform', `rotate(-90 ${cx} ${cx})`);
        this.fill.setAttribute('stroke-dashoffset', this.fillLength);
        this.fill.setAttribute('stroke-dasharray', this.fillLength);
        this.changeColor && this.updateColor(this.value);
        if (this.animate && this.canAnimate) {
            this.updateProgress(0);
            new IntersectionObserver(
                (entries) => {
                    if (entries[0].intersectionRatio.toFixed(1) > 0 && !this.animationTriggered) {
                        this.animateTo(this.value, this.animationDuration, () => {
                            this.dispatchEvent('progressCompleted', `${this.value}%`);
                        });
                    }
                },
                { threshold: [0, 0.1] },
            ).observe(this.element);
        } else {
            this.updateProgress(this.value);
        }
        setTimeout(() => {
            this.element.classList.add('c-progress-bar--init');
        }, 30);
        this.element.addEventListener('updateProgress', (event) => {
            if (this.animationId) window.cancelAnimationFrame(this.animationId);
            let newValue = event.detail.value;
            const duration = event.detail.duration || this.animationDuration;
            this.animateTo(newValue, duration, () => {
                this.dispatchEvent('progressCompleted', `${this.value}%`);
                if (this.ariaLabel) this.ariaLabel.textContent = `${newValue}%`;
            });
        });
    }
    updateProgress(value) {
        const offset = (((100 - value) * this.fillLength) / 100).toFixed(2);
        this.fill.setAttribute('stroke-dashoffset', offset);
        if (this.label) this.label.textContent = Math.round(value);
        this.changeColor && this.updateColor(value);
    }
    animateTo(targetValue, duration, callback) {
        const startValue =
            100 -
            Math.round(
                (parseFloat(this.fill.getAttribute('stroke-dashoffset')) / this.fillLength) * 100,
            );
        const change = targetValue - startValue;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            let progress = Math.min(elapsed / duration, 1);
            let currentValue = startValue + change * progress;
            this.updateProgress(currentValue);
            if (progress < 1) {
                this.animationId = window.requestAnimationFrame(animate);
            } else {
                this.animationId = false;
                callback();
            }
        };
        window.requestAnimationFrame(animate);
    }
}

export function initCProgressBar(context = document) {
    const elements = context.querySelectorAll('.js-c-progress-bar');
    elements.forEach(el => {
        if (!el.dataset.cprogressBarInitialized) {
            new CProgressBar(el);
            el.dataset.cprogressBarInitialized = 'true';
        }
    });
}

