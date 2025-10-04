/* -------------------------------- 

File#: _1_collapse
Title: Collapse
Descr: Control button to toggle the visibility of a panel element.
Usage: https://codyhouse.co/ds/components/info/collapse

-------------------------------- */

//import { tools as Util } from '@modules';

class Collapse {
    constructor(element) {
        this.element = element;
        this.triggers = document.querySelectorAll(
            `[aria-controls="${this.element.getAttribute('id')}"]`,
        );
        this.animate = this.element.getAttribute('data-collapse-animate') === 'on';
        this.animating = false;
        this.init();
    }

    init() {
        if (this.triggers) {
            // estableix l'atribut inicial 'aria-expanded' per als elements de disparador
            this.updateTriggers(!this.element.classList.contains('hide'));

            // detecta el clic als elements de disparador
            this.triggers.forEach((trigger) => {
                trigger.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.toggleVisibility();
                });
            });
        }

        // esdeveniment personalitzat
        this.element.addEventListener('collapseToggle', () => {
            this.toggleVisibility();
        });
    }

    toggleVisibility() {
        const isHidden = this.element.classList.contains('hide');
        if (this.animating) return;
        this.animating = true;
        this.animateElement(isHidden);
        this.updateTriggers(isHidden);
    }

    animateElement(show) {
        if (!this.animate || !window.requestAnimationFrame) {
            this.element.classList.toggle('hide', !show);
            this.animating = false;
            return;
        }

        this.element.classList.remove('hide');
        const initHeight = show ? 0 : this.element.offsetHeight;
        const finalHeight = show ? this.element.offsetHeight : 0;

        this.element.classList.add('overflow-hidden');

        this.setHeight(
            initHeight,
            finalHeight,
            200,
            () => {
                if (!show) this.element.classList.add('hide');
                this.element.removeAttribute('style');
                this.element.classList.remove('overflow-hidden');
                this.animating = false;
            },
            'easeInOutQuad',
        );
    }

    updateTriggers(expanded) {
        this.triggers.forEach((trigger) => {
            expanded
                ? trigger.setAttribute('aria-expanded', 'true')
                : trigger.removeAttribute('aria-expanded');
        });
    }

    setHeight(start, to, duration, cb, timeFunction) {
        const change = to - start;
        let currentTime = null;

        const animateHeight = (timestamp) => {
            if (!currentTime) currentTime = timestamp;
            const progress = Math.min(timestamp - currentTime, duration);
            let val = parseInt((progress / duration) * change + start);
            if (timeFunction) {
                val = Math[timeFunction](progress, start, to - start, duration);
            }
            this.element.style.height = `${val}px`;
            if (progress < duration) {
                window.requestAnimationFrame(animateHeight);
            } else {
                if (cb) cb();
            }
        };

        this.element.style.height = `${start}px`;
        window.requestAnimationFrame(animateHeight);
    }
}

window.Collapse = Collapse;
export default Collapse;

// Inicialitza els objectes Collapse
document.querySelectorAll('.js-collapse').forEach((element) => {
    new Collapse(element);
});
