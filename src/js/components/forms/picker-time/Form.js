import { tools as Util } from '@modules';

class Form {
    constructor() {
        if (this.constructor === Form) {
            throw new TypeError("Abstract class 'Form' cannot be instantiated directly.");
        }

        window.addEventListener('load', this.handleLoad.bind(this));
    }

    get() {
        return this.field;
    }
    createWrapper() {
        const wrapper = document.createElement('div');
        Util.addClass(wrapper, 'input__wrapper');
        return wrapper;
    }

    createField() {
        const field = document.createElement('div');
        Util.addClass(field, 'time-picker');
        if (this.input.value !== '') {
            field.classList.add('active');
        }
        if (this.error) {
            field.classList.add('error');
        }

        return field;
    }

    createLabel() {
        const label = document.createElement('label');
        Util.addClass(label, 'form-label');
        label.textContent = this.label.text;
        label.htmlFor = this.label.for;
        return label;
    }

    createMessage() {
        if (!this.message) {
            return;
        }

        this.messageEl = document.createElement('div');
        this.messageEl.classList.add('message');
        if (this.error) {
            this.messageEl.classList.add('error');
        }
        this.messageEl.textContent = this.message;

        return this.messageEl;
    }

    removeMessage() {
        if (!this.messageEl) {
            return;
        }
        this.messageEl.remove();
        if (this.error) {
            this.field.classList.remove('error');
            this.messageEl.classList.remove('error');
        }
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
        this.inputEl.value = value;
        this.field.classList.add('active');
        this.removeMessage();
    }

    handleLoad() {
        const autofilledInput = this.field.querySelector('input:-webkit-autofill');

        if (autofilledInput) {
            this.field.classList.add('active');
        }
    }

    handleBlur() {
        if (!this.inputEl.value) {
            this.field.classList.remove('active');
        }
        this.field.classList.remove('focus');

        if (this.onBlur) {
            this.onBlur(this.inputEl.value);
        }
    }

    handleFocus() {
        this.field.classList.add('active');
        this.field.classList.add('focus');
    }

    handleInput() {
        if (!this.manualErrorHandling) {
            this.removeMessage();
        }

        if (this.onInput) {
            this.onInput(this.inputEl.value);
        }
    }

    showError(message) {
        this.error = true;
        this.message = message;
        this.field.classList.add('error');
        this.field.appendChild(this.createMessage());
    }

    removeError() {
        this.error = false;
        this.message = null;
        this.field.classList.remove('error');
        this.removeMessage();
    }

    focus() {
        this.inputEl.focus();
    }

    blur() {
        this.inputEl.blur();
    }

    clear() {
        this.input.value = '';
        this.inputEl.value = '';
        this.field.classList.remove('active');
        this.removeError();
    }
}

export default Form;
