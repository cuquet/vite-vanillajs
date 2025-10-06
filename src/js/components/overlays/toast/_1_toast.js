/* -------------------------------- 

File#: _1_toast
Title: Toast
Descr: Notification message
Usage: https://codyhouse.co/ds/components/info/toast

-------------------------------- */

//import { tools as Util } from '@modules';

export class Toasts {
    constructor() {
        this.toastsEl = document.getElementsByClassName('js-toast');
        this.toastsId = this.getRandomInt(0, 1000);
        this.index = 0;
        this.closingToast = false;
        this.initToasts();
    }

    initToast(element) {
        this.initSingleToast(element);
    }

    initToasts() {
        const positions = [
            'top-right',
            'top-left',
            'top-center',
            'bottom-right',
            'bottom-left',
            'bottom-center',
        ];
        positions.forEach((position) => this.createWrapper(position));

        Array.from(this.toastsEl).forEach((toast) => this.initSingleToast(toast));

        window.addEventListener('newToast', (event) => this.initSingleToast(event.detail));
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    createWrapper(position) {
        const positionClasses = {
            'top-right': 'top-0 right-0 flex-column',
            'top-left': 'top-0 left-0 flex-column',
            'top-center': 'top-0 left-50% -translate-x-50% flex-column items-center',
            'bottom-right': 'bottom-0 right-0 flex-column-reverse',
            'bottom-left': 'bottom-0 left-0 flex-column-reverse',
            'bottom-center': 'bottom-0 left-50% -translate-x-50% flex-column-reverse items-center',
        };

        const div = document.createElement('div');
        div.className = `toast-wrapper position-fixed flex ${positionClasses[position]}`;
        div.id = `toast-wrapper-${position}`;
        document.body.appendChild(div);
        this[position] = document.getElementById(`toast-wrapper-${position}`);
    }

    initSingleToast(toast) {
        const id = `toast-${this.toastsId}-${this.index++}`;
        this[id] = {
            interval: toast.getAttribute('data-toast-interval') || 5000,
            intervalId: false,
            closing: false,
            position: this.getToastPosition(toast),
        };
        toast.id = id;

        toast.addEventListener('openToast', () => {
            if (!toast.classList.contains('toast--hidden') || this[id].closing) return;
            this.openToast(toast, id);
        });

        toast.addEventListener('click', (event) => {
            if (event.target.closest('.js-toast__close-btn')) {
                this.closingToast = true;
                this.closeToast(toast, id);
            }
        });
    }

    getToastPosition(toast) {
        const classes = toast.getAttribute('class');
        if (classes.includes('toast--top-left')) return 'top-left';
        if (classes.includes('toast--top-center')) return 'top-center';
        if (classes.includes('toast--bottom-right')) return 'bottom-right';
        if (classes.includes('toast--bottom-left')) return 'bottom-left';
        if (classes.includes('toast--bottom-center')) return 'bottom-center';
        return 'top-right';
    }

    openToast(toast, id) {
        if (this[id].intervalId) {
            clearInterval(this[id].intervalId);
            this[id].intervalId = false;
        }

        const fragment = document.createDocumentFragment();
        fragment.appendChild(toast);
        this[this[id].position].appendChild(fragment);

        toast.style.position = 'static';

        setTimeout(() => {
            toast.classList.remove('toast--hidden');
        });

        if (this[id].interval && parseInt(this[id].interval) > 0) {
            this.setToastInterval(toast, id, this[id].interval);
        }
    }

    setToastInterval(toast, id, interval) {
        this[id].intervalId = setTimeout(() => {
            if (this.closingToast) return this.setToastInterval(toast, id, 1000);
            this.closeToast(toast, id);
        }, interval);
    }

    closeToast(toast, id) {
        this[id].closing = true;
        toast.classList.add('toast--hidden');
        if (this[id].intervalId) clearTimeout(this[id].intervalId);
        this.closeToastAnimation(toast, id);
    }

    closeToastAnimation(toast, id) {
        const siblings = this.getToastNextSiblings(toast);
        const toastStyle = window.getComputedStyle(toast);
        const margin =
            parseInt(toastStyle.getPropertyValue('margin-top')) ||
            parseInt(toastStyle.getPropertyValue('margin-bottom'));
        const translate = toast.offsetHeight + margin;
        const translateValue = this[id].position.includes('top') ? `-${translate}` : translate;

        siblings.forEach((sibling) => {
            sibling.style.transform = `translateY(${translateValue}px)`;
        });

        toast.addEventListener('transitionend', (event) => {
            if (event.propertyName !== 'opacity') return;
            toast.removeEventListener('transitionend', event);
            this.removeToast(toast, siblings, id);
            this.closingToast = false;
        });
    }

    getToastNextSiblings(toast) {
        const siblings = [];
        let nextSibling = toast.nextElementSibling;
        while (nextSibling) {
            siblings.push(nextSibling);
            nextSibling = nextSibling.nextElementSibling;
        }
        return siblings;
    }

    removeToast(toast, siblings, id) {
        toast.style.position = '';

        siblings.forEach((sibling) => {
            sibling.style.transition = 'none';
            sibling.style.transform = '';
            setTimeout(() => {
                sibling.style.transition = '';
            }, 10);
        });

        this[id].closing = false;
    }
}

// ho necessito si vull crear toast al vol
window.Toasts = Toasts;

export function initToasts(context = document) {
    const elements = context.querySelectorAll('.js-toast');
    elements.forEach(el => {
        if (!el.dataset.toastsInitialized) {
            new Toasts(el);
            el.dataset.soastsInitialized = 'true';
        }
    });
}

