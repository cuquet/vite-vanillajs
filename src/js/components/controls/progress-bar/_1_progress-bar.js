/* -------------------------------- 

File#: _1_progress-bar
Title: Progress Bar
Descr: Display the current progress of a task

Usage: https://codyhouse.co/ds/components/info/progress-bar

-------------------------------- */

import { tools as Util } from '@modules';

class ProgressBar {
    constructor(element, opts) {
        this.element = element;
        Object.assign(this, Util.extend(ProgressBar.defaults, opts));
        this.fill = this.getFillElemement;
        this.label = this.getLabelElement;
        this.value = this.updateValue;
        this.animate = !this.prefersReducedMotion
            ? this.element.hasAttribute('data-animation') &&
            this.element.getAttribute('data-animation') === 'on'
            : false;
        this.animationDuration = this.element.hasAttribute('data-duration')
            ? this.element.getAttribute('data-duration')
            : 1000;
        this.canAnimate =
            'IntersectionObserver' in window &&
            'IntersectionObserverEntry' in window &&
            'intersectionRatio' in window.IntersectionObserverEntry.prototype;
        this.ariaLabel = this.getAriaLabelElement;
        this.changeColor =
            Util.hasClass(this.element, this.colorUpdateClass) &&
            Util.cssSupports('color', 'var(--color-value)');
        this.colorThresholds = this.getColorThresholds;
        this.animationId = false;
        this.init();
    }
    get getFillElemement () {
        return this.element.querySelector('.'.concat(this.fillClass));
    }
    get getLabelElement () {
        return this.element.querySelector('.'.concat(this.labelClass));
    }
    get getAriaLabelElement () {
        return this.element.querySelector('.'.concat(this.ariaLabelClass));
    }
    get getColorThresholds () {
        let thresholds = [];
        let i = 1;
        while (
            !isNaN(
                parseInt(
                    getComputedStyle(this.element).getPropertyValue(`${this.colorVariable}${i}`),
                ),
            )
        ) {
            thresholds.push(
                parseInt(
                    getComputedStyle(this.element).getPropertyValue(`${this.colorVariable}${i}`),
                ),
            );
            i += 1;
        }
        return thresholds;
    }
    get updateValue () {
        return parseFloat(
            (100 * this.fill.offsetWidth) /
                this.element.getElementsByClassName('progress-bar__bg')[0].offsetWidth,
        );
    }
    init () {
        this.changeColor && this.updateColor(this.value);
        if (this.animate && this.canAnimate) {
            this.updateProgress(0);
            new IntersectionObserver(
                (entries) => {
                    if (entries[0].intersectionRatio.toFixed(1) > 0 && !this.animationTriggered) {
                        this.animateTo(0, this.value, this.animationDuration, () => {
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
            this.element.classList.add('progress-bar--init');
        }, 30);
        this.element.addEventListener('updateProgress', (event) => {
            if (this.animationId) window.cancelAnimationFrame(this.animationId);
            let newValue = event.detail.value;
            const duration = event.detail.duration ? event.detail.duration : this.animationDuration;
            let oldValue = this.updateValue;
            this.animateTo(oldValue, newValue, duration, () => {
                this.dispatchEvent('progressCompleted', `${this.value}%`);
                if (this.ariaLabel) this.ariaLabel.textContent = `${newValue}%`;
            });
        });
    }
    updateProgress (value) {
        this.fill.style.width = value + '%';
        if (this.label) this.label.textContent = `${value}%`;
        this.changeColor && this.updateColor(value);
    }
    updateColor (value) {
        let colorClass = `${this.colorFillVariable}${this.colorThresholds.length}`;
        for (let i = 0; i < this.colorThresholds.length; i += 1) {
            if (value <= this.colorThresholds[i]) {
                colorClass = `${this.colorFillVariable}` + (i + 1);
                break;
            }
        }
        this.element.className = this.element.className
            .split(' ')
            .filter((c) => !c.startsWith(this.colorFillVariable))
            .join(' ')
            .trim();
        Util.addClass(this.element, colorClass);
    }
    animateTo (initValue, targetValue, duration, callback) {
        const changeInValue = targetValue - initValue;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            let currentValue = parseInt((elapsed / duration) * changeInValue + initValue);

            if (changeInValue > 0 && currentValue > targetValue) currentValue = targetValue;
            if (changeInValue < 0 && currentValue < targetValue) currentValue = targetValue;
            if (elapsed >= duration) currentValue = targetValue;

            this.updateProgress(currentValue);
            if (elapsed < duration) {
                this.animationId = window.requestAnimationFrame(animate);
            } else {
                this.animationId = false;
                callback();
            }
        };

        if (window.requestAnimationFrame && !this.prefersReducedMotion) {
            this.animationId = window.requestAnimationFrame(animate);
        } else {
            this.updateProgress(targetValue);
            callback();
        }
    }
    dispatchEvent (eventName, detail) {
        this.element.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}
ProgressBar.defaults = {
    prefersReducedMotion: Util.osHasReducedMotion(),
    fillClass: 'progress-bar__fill',
    labelClass: 'progress-bar__value',
    ariaLabelClass: 'js-progress-bar__aria-value',
    colorUpdateClass: 'progress-bar--color-update',
    colorVariable : '--progress-bar-color-',
    colorFillVariable : 'progress-bar--fill-color-',
};

export default ProgressBar;

document.addEventListener('DOMContentLoaded', () => {
    const progressBars = Array.from(document.getElementsByClassName('js-progress-bar'));
    progressBars.forEach((el) => {
        new ProgressBar(el);
    });
});


