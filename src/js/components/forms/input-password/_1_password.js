/* -------------------------------- 

File#: _1_password
Title: Password Visibility Control
Descr: Password input field with option to toggle password visibility.
Usage: https://codyhouse.co/ds/components/info/password-visibility-control

-------------------------------- */

import { tools as Util } from '@modules';

class PasswordVisibility {
    constructor(options) {
        this.options = Util.extend(PasswordVisibility.defaults, options);
        this.element = this.options.element;
        this.input = this.element.getElementsByClassName('js-password__input')[0];
        this.visibilityBtn = this.element.getElementsByClassName('js-password__btn')[0];
        this.visibilityClass = 'password--text-is-visible';
        this.initPassword();
    }

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
PasswordVisibility.defaults = {
    element: false,
};

document.addEventListener('DOMContentLoaded', () => {
    const passwordElements = Array.from(document.getElementsByClassName('js-password'));
    passwordElements.forEach((element) => {
        new PasswordVisibility({element: element});
    });
});

export default PasswordVisibility;
