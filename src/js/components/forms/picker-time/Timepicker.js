import InputTime from './InputTime';
import Panel from './Panel';
import Time from './Time';
import Picker from './Picker';
import { tools as Util } from '@modules';

export class TimePicker {
    constructor(element, opts) {
        //Object.assign(this, data);
        Object.assign(this, Util.extend(TimePicker.defaults, opts));
        this.element = element;
        this.init();
    }

    static defaults = {
        values: {
            // time: "2022-10-16 16:45:22",
            // time: "16:42:44",
            // time: "16:28",
            // time: new Date("2022-10-16"),
            // time: new Date("2022-10-16 16:19:10"),
            //time: new Date(Date.now()),
            time: '',
        },
        errors: {
            time: '16:00',
        },
        label: {
            text: "Sel·lecciona l'hora",
        },
    };

    init() {
        this.ID = Util.getNewId();
        this.inputTime = new InputTime({
            label: {
                text: this.label.text,
                for: this.ID,
            },
            input: {
                name: 'time',
                id: this.ID,
                value: this.value ? this.value.time : this.values.time,
                placeholder: 'hh:mm',
                readOnly: true,
                icon: '#clock-history',
                format: 'long',
            },
            error: this.error,
            message: this.message,
            onBtnClick: () => {
                this.panel.open();
                this.picker.render();
                this.panel.render(this.picker.get());
            },
            onFocus: () => {
                this.panel.open();
                this.picker.render();
                this.panel.render(this.picker.get());
            },
            onBlur: () => {
                this.inputTime.setValue(this.time.toString());
            },
        });

        this.panel = new Panel({
            input: this.inputTime,
            onOpen: () => {
                this.inputTime.blur();
            },
            onClose: () => {
                this.inputTime.handleBlur();
                this.time.reset();
                this.picker.destroy();
                this.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
        });

        this.time = new Time({
            value: this.inputTime.value,
        });

        this.picker = new Picker({
            time: this.time,
            onCancel: () => {
                this.panel.close();
            },
            onAccept: () => {
                this.time.clear();
                this.time.setSelected();
                this.time.set();
                this.panel.close();
                this.inputTime.setValue(this.time.toString());

                //this.onSelect(this.time.toString());
            },
        });
    }

    get() {
        return this.inputTime.get();
    }

    getValue() {
        return this.inputTime.getValue();
    }

    setValue(value) {
        this.inputTime.setValue(value);
        this.time.setValue(value);
    }

    destroy() {
        //this.inputTime.destroy();
        this.panel.destroy();
        this.time.reset();

        delete this;
    }
}

export function initTimePicker(context = document) {
    const elements = context.querySelectorAll('.js-time-picker');
    elements.forEach((el) => {
        if (!el.dataset.timePickerInitialized) {
            const timepicker = new TimePicker(el);
            el.dataset.timePickerInitialized = 'true';
            el.appendChild(timepicker.get());
        }
    });
}
