import Form from './Form.js';
import Button from '@components/button';
import { tools as Util, icons, dates } from '@modules';

class InputTime extends Form {
    constructor(data) {
        super(data);

        Object.assign(this, data);

        this.isOpen = false;

        this.create();
    }

    create() {
        this.field = this.createField();
        this.wrapper = this.createWrapper();
        this.labelEl = this.createLabel();
        this.inputEl = this.createInput();

        this.field.appendChild(this.labelEl);
        this.field.appendChild(this.wrapper);
        this.wrapper.appendChild(this.inputEl);

        if (this.message && !this.manualErrorHandling) {
            this.field.appendChild(this.createMessage());
        }

        const iconButtonPalette = new Button('IconButton', {
            ariaLabel: 'Icona rellotge',
            classes: 'picker__trigger',
            buttonSize: 'small',
            svgSize: 'xs',
            icon: icons.get(this.input.icon),
            onClick: () => {
                this.onBtnClick();
                //this.inputEl.focus();
            },
        });

        this.wrapper.appendChild(iconButtonPalette.get());
    }

    createInput() {
        const input = document.createElement('input');
        Util.addClass(input, 'form-control width-100% picker__input');
        input.type = 'text';
        input.name = this.input.name;
        input.id = this.input.id;
        input.value = this.formatValue();
        input.readOnly = this.input.readOnly;

        if (this.input.placeholder) {
            input.placeholder = this.input.placeholder;
        }
        if (this.input.readOnly) {
            input.addEventListener('focus', this.handleFocus.bind(this));
        }

        return input;
    }

    handleFocus() {
        this.field.classList.add('active');
        this.field.classList.add('focus');

        if (this.onFocus) {
            this.onFocus();
        }
    }

    handleBlur() {
        if (!this.input.value) {
            this.field.classList.remove('active');
        }
        this.field.classList.remove('focus');

        if (this.onBlur) {
            this.onBlur();
        }
    }

    setValue(value) {
        this.input.value = value;
        this.inputEl.value = this.formatValue();
        this.field.classList.add('active');
        this.removeMessage();
    }

    formatValue() {
        let value = this.input.value;

        if (!value) {
            return '';
        }

        if (dates.isValidDate(value)) {
            const hour = value.getHours();
            const minute = value.getMinutes();

            return dates.timeToString(hour, minute);
        }

        if (value.includes('/') || value.includes('-')) {
            value = value.split(' ')[1];
        }

        if (!dates.isValidTime(value)) {
            return '';
        }

        if (value.includes(':')) {
            value = value.split(':');
        }

        if (value.length === 2 || value.length === 3) {
            const hour = Number(value[0]);
            const minute = Number(value[1]);

            return dates.timeToString(hour, minute);
        } else {
            return '';
        }
    }
}

export default InputTime;
