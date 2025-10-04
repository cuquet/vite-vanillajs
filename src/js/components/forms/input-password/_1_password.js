/* -------------------------------- 
File#: _1_password
Title: Password Visibility Control
Descr: Password input field with option to toggle password visibility.
Usage: https://codyhouse.co/ds/components/info/password-visibility-control
-------------------------------- */

import { tools as Util } from '@modules';

export class PasswordVisibility {
    constructor(options) {
        this.options = Util.extend(PasswordVisibility.defaults, options);
        this.element = this.options.element;
        this.input = this.element.querySelector('.js-password__input');
        this.visibilityBtn = this.element.querySelector('.js-password__btn');
        this.visibilityClass = 'password--text-is-visible';
        this.initPassword();
    }

    static defaults = {
        element: false,
    };

    initPassword() {
        this.visibilityBtn.addEventListener('click', (event) => {
            if (document.activeElement !== this.input) {
                event.preventDefault();
                this.togglePasswordVisibility();
            }
        });
    }

    togglePasswordVisibility() {
        const isVisible = !Util.hasClass(this.element, this.visibilityClass);
        Util.toggleClass(this.element, this.visibilityClass, isVisible);
        this.input.setAttribute('type', isVisible ? 'text' : 'password');
    }
}

export function initPasswordVisibility(context = document) {
    const elements = context.querySelectorAll('.js-password');
    elements.forEach(el => {
        if (!el.dataset.pwdvInitialized) {
            new PasswordVisibility({element: el});
            el.dataset.pwdvInitialized = 'true';
        }
    });
}

