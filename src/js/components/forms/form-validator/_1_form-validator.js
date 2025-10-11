/* -------------------------------- 

File#: _1_form-validator
Title: Form Validator
Descr: 
Usage: https://codyhouse.co/ds/components/info/form-validator
Dependencies

 -------------------------------- */
import { tools as Util } from '@modules';

export class FormValidator {
    constructor(options) {
        this.options = Util.extend(FormValidator.defaults, options);
        this.element = this.options.element;
        this.input = Array.from(this.element.querySelectorAll('input'));
        this.textarea = Array.from(this.element.querySelectorAll('textarea'));
        this.select = Array.from(this.element.querySelectorAll('select'));
        this.errorFields = [];
        this.errorFieldListeners = [];
    }

    static defaults = {
        element: '',
        inputErrorClass: 'form-control--error',
        inputWrapperErrorClass: 'form-validate__input-wrapper--error',
        customValidate: {},
    };

    validate(callback) {
        this.resetErrors();

        this.input.forEach((input) => this.checkValidity(input));
        this.textarea.forEach((textarea) => this.checkValidity(textarea));
        this.select.forEach((select) => this.checkValidity(select));

        this.errorFields.forEach((field) => this.addErrorListeners(field));

        if (this.errorFields.length > 0) {
            this.errorFields[0].focus();
        }

        if (callback) {
            callback(this.errorFields);
        }
    }

    resetErrors() {
        this.errorFields.forEach((field, index) => {
            this.toggleErrorClass(field, false);
            field.removeEventListener('change', this.errorFieldListeners[index]);
            field.removeEventListener('input', this.errorFieldListeners[index]);
        });

        this.errorFields = [];
        this.errorFieldListeners = [];
    }

    checkValidity(field) {
        if (field.checkValidity()) {
            const validateType = field.getAttribute('data-validate');
            if (validateType && this.options.customValidate[validateType]) {
                this.options.customValidate[validateType](field, (isValid) => {
                    if (!isValid) {
                        this.errorFields.push(field);
                    }
                });
            }
        } else {
            this.errorFields.push(field);
        }
    }

    addErrorListeners(field) {
        this.toggleErrorClass(field, true);

        const listener = () => {
            this.toggleErrorClass(field, false);
            field.removeEventListener('change', listener);
            field.removeEventListener('input', listener);
        };

        this.errorFieldListeners.push(listener);
        field.addEventListener('change', listener);
        field.addEventListener('input', listener);
    }

    toggleErrorClass(field, add) {
        Util.toggleClass(field,this.options.inputErrorClass, add );
        if (this.options.inputWrapperErrorClass) {
            const wrapper = field.closest('.js-form-validate__input-wrapper');
            if (wrapper) {
                Util.toggleClass(wrapper,this.options.inputWrapperErrorClass, add );
            }
        }
    }

}

// expose to global scope (optional)
if (typeof window !== 'undefined') {
    if (!window.FormValidator) window.FormValidator = FormValidator;
}

