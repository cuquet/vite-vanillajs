/* -------------------------------- 

File#: _1_back-to-top.js
Title: Back to top
Descr: Component that triggers scroll-y to the top of the page
Usage: https://codyhouse.co/ds/components/info/back-to-top

-------------------------------- */

//import { tools as Util } from '@modules';

export class Back2Top {
    constructor(element) {
        this.backTop = element;
        this.dataElement = this.backTop.getAttribute('data-element');
        this.scrollElement = this.dataElement ? document.querySelector(this.dataElement) : window ;
        this.scrollOffsetInit =
            parseInt(this.backTop.getAttribute('data-offset-in')) ||
            parseInt(this.backTop.getAttribute('data-offset')) ||
            0;
        this.scrollOffsetOutInit = parseInt(this.backTop.getAttribute('data-offset-out')) || 0;
        this.scrollOffset = 0;
        this.scrollOffsetOut = 0;
        this.scrolling = false;
        this.targetIn = this.backTop.getAttribute('data-target-in')
            ? document.querySelector(this.backTop.getAttribute('data-target-in'))
            : false;
        this.targetOut = this.backTop.getAttribute('data-target-out')
            ? document.querySelector(this.backTop.getAttribute('data-target-out'))
            : false;
        this.updateOffsets();
        this.initEvents();
        this.checkBackToTop();
    }

    initEvents() {
        this.checkBackToTop = this.checkBackToTop.bind(this); 
        this.backTop.addEventListener('click', (event) => this.scrollToTop(event));
        if (this.scrollOffset > 0 || this.scrollOffsetOut > 0) {
            this.scrollElement.addEventListener('scroll', () => {this.onScroll()});
        }
    }

    scrollToTop(event) {
        event.preventDefault();
        const scrollToSupported = typeof this.scrollElement.scrollTo === 'function';
        if (!window.requestAnimationFrame || !scrollToSupported) {
            if (scrollToSupported) {
                this.scrollElement.scrollTo(0, 0);
            } else {
                window.scrollTo(0, 0);
            }
        } else {
            this.scrollElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const href = this.backTop.getAttribute('href');
        if (href) {
            const targetElement = document.getElementById(href.replace('#', ''));
            if (targetElement) {
                this.moveFocus(targetElement);
            }
        }
    }

    onScroll() {
        if (!this.scrolling) {
            this.scrolling = true;
            !window.requestAnimationFrame
                ? setTimeout(() => this.checkBackToTop(), 250)
                : window.requestAnimationFrame(() => this.checkBackToTop());
        }
    }

    checkBackToTop() {
        this.updateOffsets();
        let windowTop = this.scrollElement.scrollTop || document.documentElement.scrollTop;
        if (!this.dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
        let condition = windowTop >= this.scrollOffset;
        if (this.scrollOffsetOut > 0) {
            condition =
                windowTop >= this.scrollOffset &&
                window.innerHeight + windowTop < this.scrollOffsetOut;
        }
        this.backTop.classList.toggle('back-to-top--is-visible', condition);
        this.scrolling = false;
    }

    updateOffsets() {
        this.scrollOffset = this.getOffset(this.targetIn, this.scrollOffsetInit, true);
        this.scrollOffsetOut = this.getOffset(this.targetOut, this.scrollOffsetOutInit);
    }

    getOffset(target, startOffset, bool) {
        let offset = 0;
        if (target) {
            let windowTop = this.scrollElement.scrollTop || document.documentElement.scrollTop;
            if (!this.dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
            let boundingClientRect = target.getBoundingClientRect();
            offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
            offset += windowTop;
        }
        if (startOffset) {
            offset += parseInt(startOffset);
        }
        return offset;
    }

    moveFocus(element) {
        if (!element) element = document.getElementsByTagName('body')[0];
        element.focus();
        if (document.activeElement !== element) {
            element.setAttribute('tabindex', '-1');
            element.focus();
        }
    }
}

export function initBack2Top(context = document) {
    const el = context.querySelector('.js-back-to-top');
    if (el) {
        if (!el.dataset.backTopInitialized) {
            new Back2Top(el);
            el.dataset.backTopInitialized = 'true';
        }
    }
}


