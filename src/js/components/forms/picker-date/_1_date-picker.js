// File#: _1_date-picker
// Usage: https://codyhouse.co/ds/components/info/date-picker
// Dependencies:

import { tools as Util } from '@modules';

class DatePicker {
    constructor(element) {
        this.options = Util.extend(DatePicker.defaults, element);
        this.element = this.options.element;
        this.datePicker = this.element.getElementsByClassName('js-date-picker')[0];
        this.body = this.datePicker.getElementsByClassName('js-date-picker__dates')[0];
        this.navigation = this.datePicker.getElementsByClassName('js-date-picker__month-nav')[0];
        this.heading = this.datePicker.getElementsByClassName('js-date-picker__month-label')[0];
        this.dateIndexes = this.getDateIndexes(this.options.dateFormat);
        this.pickerVisible = false;
        this.dateSelected = [];
        this.selectedDay = [];
        this.selectedMonth = [];
        this.selectedYear = [];
        this.dateToSelect = 0;
        this.init();
    }

    getDateIndexes(dateFormat) {
        let format = dateFormat.toLowerCase().replace(/-/g, '');
        return [format.indexOf('d'), format.indexOf('m'), format.indexOf('y')];
    }

    init() {
        this.input = this.element.getElementsByClassName('js-date-input__text')[0];

        this.trigger = this.element.getElementsByClassName('js-date-input__trigger')[0];
        if (this.trigger) {
            this.triggerLabel = this.trigger.getAttribute('aria-label');
        }

        this.dateValueEl = this.element.querySelector('.js-date-input__value');
        this.dateValueLabelEl = this.dateValueEl ? this.dateValueEl.textContent : '';

        this.firstFocusable = false;
        this.lastFocusable = false;

        this.createLiveRegion();
        this.initEvents();
        this.updateDate();
    }

    createLiveRegion(classSrLive = 'js-date-input__sr-live') {
        let liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.classList.add('sr-only', classSrLive);
        this.element.appendChild(liveRegion);
        this.srLiveRegion = this.element.getElementsByClassName(classSrLive)[0];
    }

    initEvents() {
        if (this.trigger) {
            this.trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePicker();
            });
        }
        this.navigation.addEventListener('click', (e) => {
            e.preventDefault();
            let button = e.target.closest('.js-date-picker__month-nav-btn');
            if (button) {
                button.classList.contains('js-date-picker__month-nav-btn--prev')
                    ? this.showPrevMonth()
                    : this.showNextMonth();
            }
        });
        window.addEventListener('keydown', (e) => {
            if ((e.key && e.key === 'Escape') || (e.key && e.key.toLowerCase() === 'escape')) {
                if (!this.pickerVisible) return;
                if (document.activeElement.closest('.js-date-picker')) {
                    this.trigger.focus();
                } else {
                    this.hidePicker();
                }
            }
        });
        window.addEventListener('click', (e) => {
            if (
                !e.target.closest('.js-date-picker') &&
                !e.target.closest('.js-date-input') &&
                this.pickerVisible
            ) {
                this.hidePicker();
            }
        });
        this.datePicker.addEventListener('keydown', this.handlePickerKeydown.bind(this));
        this.body.addEventListener('keydown', this.handleBodyKeydown.bind(this));
        this.body.addEventListener('click', this.handleDateClick.bind(this));

        this.input.addEventListener('focus', () => this.togglePicker());
        this.input.addEventListener('keydown', (e) => this.handleInputKeydown(e));
    }

    handleBodyKeydown(e) {

        let day = this.currentDay;
        const keyActions = {
            ArrowDown: () => this.navigateDays(day + 7),
            ArrowRight: () => this.navigateDays(day + 1),
            ArrowLeft: () => this.navigateDays(day - 1),
            ArrowUp: () => this.navigateDays(day - 7),
            End: () => {
                e.preventDefault();
                this.navigateDays(
                    day + 6 - this.getFirstDayOfMonth(this.currentYear, this.currentMonth, day),
                );
            },
            Home: () => {
                e.preventDefault();
                this.navigateDays(
                    day - this.getFirstDayOfMonth(this.currentYear, this.currentMonth, day),
                );
            },
            PageDown: () => {
                e.preventDefault();
                this.showNextMonth();
            },
            PageUp: () => {
                e.preventDefault();
                this.showPrevMonth();
            },
        };
        if (keyActions[e.key]) {
            keyActions[e.key]();
        }
    }

    handlePickerKeydown(e) {
        if ((e.keyCode && e.keyCode === 9) || (e.key && e.key === 'Tab')) {
            if (this.firstFocusable === document.activeElement && e.shiftKey) {
                e.preventDefault();
                this.lastFocusable.focus();
            }
            if (this.lastFocusable === document.activeElement && !e.shiftKey) {
                e.preventDefault();
                this.firstFocusable.focus();
            }
        }
    }

    handleDateClick(e) {
        e.preventDefault();
        let button = e.target.closest('button');
        if (button) {
            let day = parseInt(button.textContent);
            this.dateSelected[this.dateToSelect] = true;
            this.selectedDay[this.dateToSelect] = day;
            this.selectedMonth[this.dateToSelect] = this.currentMonth;
            this.selectedYear[this.dateToSelect] = this.currentYear;
            this.input.value = this.formatDate(this.dateToSelect);
            this.input.focus();
            this.updateDate();
            this.updateValue();
        }
    }

    handleInputKeydown(e) {
        if ((e.keyCode && e.keyCode === 13) || (e.key && e.key.toLowerCase() === 'enter')) {
            this.updateDate();
            this.updateValue();
            this.hidePicker();
        } else if (
            (e.keyCode && e.keyCode === 40) ||
            (e.key && e.key.toLowerCase() === 'arrowdown' && this.pickerVisible)
        ) {
            this.body.querySelector('button[tabindex="0"]').focus();
        }
    }

    togglePicker() {
        this.pickerVisible = !this.pickerVisible;
        Util.toggleClass(this.datePicker, 'date-picker--is-visible', this.pickerVisible);
        this.pickerVisible ? this.showPicker() : this.hidePicker();
        this.trigger.setAttribute('aria-expanded', this.pickerVisible.toString());
    }

    hidePicker() {
        this.firstFocusable = false;
        this.lastFocusable = false;
        if (document.activeElement.closest('.js-date-picker')) {
            this.trigger.focus();
        }
    }

    showPicker() {
        this.updateDate();
        this.showCalendar(this.pickerVisible.toString());
    }

    showCalendar(focus) {
        this.currentDay = this.getCurrentDay();
        this.currentMonth = this.getCurrentMonth();
        this.currentYear = this.getCurrentYear();
        this.renderCalendar(focus);
    }

    showNextMonth() {
        this.currentYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
        this.currentMonth = (this.currentMonth + 1) % 12;
        this.currentDay = this.getCurrentDay();
        this.renderCalendar(true);
        this.srLiveRegion.textContent = `${this.options.months[this.currentMonth]} ${this.currentYear}`;
    }

    showPrevMonth() {
        this.currentYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
        this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
        this.currentDay = this.getCurrentDay();
        this.renderCalendar(true);
        this.srLiveRegion.textContent = `${this.options.months[this.currentMonth]} ${this.currentYear}`;
    }

    parseDate(date) {
        const parts = date.split(this.options.dateSeparator);
        if (parts.length < 3) {
            return null;
        }
        return `${parts[this.dateIndexes[2]]}-${parts[this.dateIndexes[1]]}-${parts[this.dateIndexes[0]]}`;
    }

    getInput(index = 0) {
        let date = index === 0 ? this.input.value : false;
        return date;
    }

    updateDate(index = 0) {
        let date = this.getInput(index);
        this.dateSelected[index] = false;
        if (date !== '') {
            const parsedDate = this.parseDate(date);
            this.dateSelected[index] = true;
            this.currentDay = this.getDay(parsedDate);
            this.currentMonth = this.getMonth(parsedDate);
            this.currentYear = this.getYear(parsedDate);
        } else {
            this.currentDay = this.getDay();
            this.currentMonth = this.getMonth();
            this.currentYear = this.getYear();
        }
        this.selectedDay[index] = this.dateSelected[index] ? this.currentDay : false;
        this.selectedMonth[index] = this.dateSelected[index] ? this.currentMonth : false;
        this.selectedYear[index] = this.dateSelected[index] ? this.currentYear : false;
    }

    updateValue() {
        if (!this.dateValueEl) return;
        if (this.selectedYear[0] && this.selectedMonth[0] !== false && this.selectedDay[0]) {
            this.dateValueEl.textContent = this.formatDate(0);
        } else {
            this.dateValueEl.textContent = this.dateValueLabelEl;
        }
    }

    renderCalendar(focus) {
        let firstDay = this.getFirstDayOfMonth(this.currentYear, this.currentMonth, '01');
        this.body.innerHTML = '';
        this.heading.innerHTML = `${this.options.months[this.currentMonth]} ${this.currentYear}`;
        let days = 1;
        let calendarHTML = '';
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    calendarHTML += '<li></li>';
                } else {
                    if (days > this.getDaysInMonth(this.currentYear, this.currentMonth)) break;
                    let className = '';
                    let tabIndex = '-1';
                    if (days === this.currentDay) {
                        tabIndex = '0';
                    }
                    if (
                        !this.dateSelected[this.dateToSelect] &&
                        this.getMonth() === this.currentMonth &&
                        this.getYear() === this.currentYear &&
                        days === this.getDay()
                    ) {
                        className += ' date-picker__date--today';
                    }
                    if (
                        this.dateSelected[this.dateToSelect] &&
                        days === this.selectedDay[this.dateToSelect] &&
                        this.currentYear === this.selectedYear[this.dateToSelect] &&
                        this.currentMonth === this.selectedMonth[this.dateToSelect]
                    ) {
                        className += ' date-picker__date--selected';
                    }
                    calendarHTML += `<li><button class="date-picker__date${className}" tabindex="${tabIndex}" type="button">${days}`;
                    calendarHTML +="</button></li>";
                    days++;
                }
            }
        }
        this.body.innerHTML = calendarHTML;
        if (!this.pickerVisible) {
            this.datePicker.classList.add('date-picker--is-visible');
            this.pickerVisible = true;
        }
        if (!focus) {
            this.body.querySelector('button[tabindex="0"]').focus();
        }
        this.updateFocusableElements();
        this.adjustPosition();
    }

    updateFocusableElements() {
        function getFirstFocusable(el) {
            for (let i = 0; i < el.length; i++) {
                if (
                    (el[i].offsetWidth || el[i].offsetHeight || el[i].getClientRects().length) &&
                    el[i].getAttribute('tabindex') !== '-1'
                ) {
                    return el[i];
                }
            }
        }
        function getLastFocusable(el) {
            for (let i = el.length - 1; i >= 0; i--) {
                if (
                    (el[i].offsetWidth || el[i].offsetHeight || el[i].getClientRects().length) &&
                    el[i].getAttribute('tabindex') !== '-1'
                ) {
                    return el[i];
                }
            }
        }
        let focusableElements = this.datePicker.querySelectorAll(
            Util.focusableElString(),
        );
        this.firstFocusable = getFirstFocusable(focusableElements);
        this.lastFocusable = getLastFocusable(focusableElements);
    }

    adjustPosition() {
        this.datePicker.style.left = '0px';
        this.datePicker.style.right = 'auto';
        if (this.datePicker.getBoundingClientRect().right > window.innerWidth) {
            this.datePicker.style.left = 'auto';
            this.datePicker.style.right = '0px';
        }
    }

    formatDate(index) {
        function pad(value) {
            return value < 10 ? '0' + value : value;
        }
        let parts = [];
        parts[this.dateIndexes[0]] = pad(this.selectedDay[index]);
        parts[this.dateIndexes[1]] = pad(this.selectedMonth[index] + 1);
        parts[this.dateIndexes[2]] = this.selectedYear[index];
        return parts.join(this.options.dateSeparator);
    }

    navigateDays(day) {
        let daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
        if (day > daysInMonth) {
            this.currentDay = day - daysInMonth;
            this.showNextMonth();
        } else if (day < 1) {
            const prevMonthDays = this.getDaysInMonth(this.currentYear, this.currentMonth - 1);
            this.currentDay = prevMonthDays + day;
            this.showPrevMonth();
        } else {
            this.currentDay = day;
            const buttons = this.body.querySelectorAll('button');
            buttons.forEach((button) => button.setAttribute('tabindex', '-1'));
            const targetButton = Array.from(buttons).find((button) => button.textContent == day);
            if (targetButton) {
                targetButton.setAttribute('tabindex', '0');
                targetButton.focus();
            }
        }
        this.updateFocusableElements();
    }

    getDay(date) {
        return date ? parseInt(date.split('-')[2]) : new Date().getDate();
    }

    getMonth(date) {
        return date ? parseInt(date.split('-')[1]) - 1 : new Date().getMonth();
    }

    getYear(date) {
        return date ? parseInt(date.split('-')[0]) : new Date().getFullYear();
    }

    getCurrentDay() {
        return this.currentDay > this.getDaysInMonth(this.currentYear, this.currentMonth)
            ? 1
            : this.currentDay;
    }

    getCurrentMonth() {
        return this.currentMonth > 11 ? 0 : this.currentMonth;
    }

    getCurrentYear() {
        return this.currentMonth > 11 ? this.currentYear + 1 : this.currentYear;
    }
    getDaysInMonth(year, month) {
        return 32 - new Date(year, month, 32).getDate();
    }

    getFirstDayOfMonth(year, month, day) {
        let firstDay = new Date(year, month, day).getDay() - 1;
        return firstDay < 0 ? 6 : firstDay;
    }
}

DatePicker.defaults = {
    element: '',
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    dateFormat: 'd-m-y',
    dateSeparator: '/',
};

export default DatePicker;

document.addEventListener('DOMContentLoaded', () => {
    let dateInputs = Array.from(document.getElementsByClassName('js-date-input'));
    let supportsAlignItems = CSS.supports('align-items', 'stretch');
    dateInputs.forEach((dateInput) => {
        if (supportsAlignItems) {
                let options = { element: dateInput };
                if (dateInput.getAttribute('data-date-format')) {
                    options.dateFormat = dateInput.getAttribute('data-date-format');
                }
                if (dateInput.getAttribute('data-date-separator')) {
                    options.dateSeparator =
                        dateInput.getAttribute('data-date-separator');
                }
                if (dateInput.getAttribute('data-months')) {
                    options.months = dateInput
                        .getAttribute('data-months')
                        .split(',')
                        .map((month) => month.trim());
                }
                new DatePicker(options);
        } else {
            dateInput.classList.add('date-input--hide-calendar');
        }
    });
});

