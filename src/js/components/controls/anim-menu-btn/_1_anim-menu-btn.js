/* -------------------------------- 

File#: _1_anim-menu-btn
Title: Animated Menu Button
Descr: Custom Select with advanced structure options.
Usage: https://codyhouse.co/ds/components/info/animated-menu-button
-------------------------------- */

export class AnimMenuBtn {
    constructor(target = '.js-anim-menu-btn') {
        if (typeof target === 'string') {
            this.elements = Array.from(document.querySelectorAll(target));
        } else if (target instanceof Element) {
            this.elements = [target];
        } else {
            this.elements = Array.from(target || []);
        }
        this._onClick = this._onClick.bind(this);
        this.init();
    }

    init() {
        this.elements.forEach(el => el.addEventListener('click', this._onClick));
    }

    _onClick(event) {
        event.preventDefault();
        const el = event.currentTarget;
        const newState = !el.classList.contains('anim-menu-btn--state-b');
        el.classList.toggle('anim-menu-btn--state-b', newState);
        const customEvent = new CustomEvent('anim-menu-btn-clicked', { detail: newState });
        el.dispatchEvent(customEvent);
    }

    destroy() {
        this.elements.forEach(el => el.removeEventListener('click', this._onClick));
    }
}

export function initAnimMenuBtn(context = document) {
    const elements = context.querySelectorAll('.js-anim-menu-btn');
    elements.forEach(el => {
        if (!el.dataset.animatedBtnInitialized) {
            new AnimMenuBtn(el);
            el.dataset.animatedBtnInitialized = 'true';
        }
    });
}
