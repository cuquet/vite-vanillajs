import { dates } from '@modules';

class Hours {
    constructor(data) {
        Object.assign(this, data);

        this.hours = [];

        this.current = null;
        this.selected = null;
    }

    init() {
        this.current = new Date().getHours();
        this.selected = new Date().getHours();

        this.set();
    }

    get() {
        return this.hours;
    }

    set() {
        for (let i = 0; i < 24; i++) {
            let hour = (24 + i + this.selected - 4) % 24;
            let type = "hidden";

            if (hour === (24 + this.selected - 2) % 24) {
                type = "prev-last";
            } else if (hour === (24 + this.selected - 1) % 24) {
                type = "prev";
            } else if (hour === this.selected) {
                type = "current";
            } else if (hour === (24 + this.selected + 1) % 24) {
                type = "next";
            } else if (hour === (24 + this.selected + 2) % 24) {
                type = "next-last";
            }

            this.add({ hour, type });
        }
    }

    next() {
        this.current = (24 + this.current + 1) % 24;
    }

    prev() {
        this.current = (24 + this.current - 1) % 24;
    }

    getSelected() {
        return this.selected;
    }

    setSelected() {
        this.selected = this.current;
    }

    setCurrent() {
        this.current = this.selected;
    }

    add(hour) {
        this.hours = [...this.hours, hour];
    }

    clear() {
        this.hours = [];
    }
}

class Minutes {
    constructor(data) {
        Object.assign(this, data);

        this.minutes = [];

        this.current = null;
        this.selected = null;
    }

    init() {
        this.current = new Date().getMinutes();
        this.selected = new Date().getMinutes();

        this.set();
    }

    get() {
        return this.minutes;
    }

    set() {
        for (let i = 0; i < 60; i++) {
            let minute = (60 + i + this.selected - 4) % 60;
            let type = "hidden";

            if (minute === (60 + this.selected - 2) % 60) {
                type = "prev-last";
            } else if (minute === (60 + this.selected - 1) % 60) {
                type = "prev";
            } else if (minute === this.selected) {
                type = "current";
            } else if (minute === (60 + this.selected + 1) % 60) {
                type = "next";
            } else if (minute === (60 + this.selected + 2) % 60) {
                type = "next-last";
            }

            this.add({ minute, type });
        }
    }

    next() {
        this.current = (60 + this.current + 1) % 60;
    }

    prev() {
        this.current = (60 + this.current - 1) % 60;
    }

    getSelected() {
        return this.selected;
    }

    setSelected() {
        this.selected = this.current;
    }

    setCurrent() {
        this.current = this.selected;
    }

    add(minute) {
        this.minutes = [...this.minutes, minute];
    }

    clear() {
        this.minutes = [];
    }
}

class Time {
    constructor(data) {
        Object.assign(this, data);

        this.init();
    }

    init() {
        this.hours = new Hours();
        this.minutes = new Minutes();

        this.checkValue();
    }

    checkValue() {
        if (!this.value) {
            this.hours.init();
            this.minutes.init();
            return;
        }

        if (dates.isValidDate(this.value)) {
            this.hours.current = this.value.getHours();
            this.hours.selected = this.value.getHours();
            this.hours.set();

            this.minutes.current = this.value.getMinutes();
            this.minutes.selected = this.value.getMinutes();
            this.minutes.set();
            return;
        }

        if (this.value.includes("/") || this.value.includes("-")) {
            this.value = this.value.split(" ")[1];
        }

        if (!dates.isValidTime(this.value)) {
            this.hours.init();
            this.minutes.init();
            return;
        }

        if (this.value.includes(":")) {
            this.value = this.value.split(":");
        }

        if (this.value.length === 2 || this.value.length === 3) {
            this.hours.current = Number(this.value[0]);
            this.hours.selected = Number(this.value[0]);
            this.hours.set();

            this.minutes.current = Number(this.value[1]);
            this.minutes.selected = Number(this.value[1]);
            this.minutes.set();
        } else {
            this.hours.init();
            this.minutes.init();
        }
    }

    set() {
        this.hours.set();
        this.minutes.set();
    }

    setValue(value) {
        this.value = value;
        this.clear();
        this.checkValue();
    }

    setSelected() {
        this.hours.setSelected();
        this.minutes.setSelected();
    }

    reset() {
        this.hours.setCurrent();
        this.minutes.setCurrent();
    }

    clear() {
        this.hours.clear();
        this.minutes.clear();
    }

    toString() {
        return dates.timeToString(this.hours.current, this.minutes.current);
    }
}

export default Time;
