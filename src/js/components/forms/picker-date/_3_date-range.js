/* -------------------------------- 

File#: _3_date-range
Title: Date Range
Descr: A controller for choosing date ranges
Usage: https://codyhouse.co/ds/components/info/date-range
Dependencies
    _2_custom-select
    _1_date-picker
-------------------------------- */

import { tools as Util } from '@modules';
import { DatePicker } from './_1_date-picker';

export class DatePickerRange extends DatePicker {
    constructor(options) {
        super(options);
        this.mouseMoving = false;
    }

    init() {
        this.inputStart = this.element.querySelector('.js-date-range__text--start');
        this.inputEnd = this.element.querySelector('.js-date-range__text--end');

        this.trigger = this.element.getElementsByClassName('js-date-range__trigger')[0];
        if (this.trigger) {
            this.triggerLabel = this.trigger.getAttribute('aria-label');
        }
        this.triggerLabelWrapper = this.trigger.querySelector('.js-date-range__trigger-label');

        this.dateValueStartEl = this.element.querySelector('.js-date-range__value--start');
        this.dateValueStartElLabel = this.dateValueStartEl ? this.dateValueStartEl.textContent : '';

        this.dateValueEndEl = this.element.querySelector('.js-date-range__value--end');
        this.dateValueEndElLabel = this.dateValueEndEl ? this.dateValueEndEl.textContent : '';

        this.selectedStartClass =
            'date-picker__date--selected date-picker__date--range-start js-date-picker__date--range-start';
        this.selectedEndClass =
            'date-picker__date--selected date-picker__date--range-end js-date-picker__date--range-end';
        this.inBetweenClass = 'date-picker__date--range';

        this.predefOptions = this.element.previousElementSibling;

        this.setTabIndex(this.inputStart);
        this.setTabIndex(this.inputEnd);
        this.createLiveRegion('js-date-range__sr-live');
        this.initEvents();
        this.updateDates();
        this.handlePredefinedOptions();
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
                }
                this.togglePicker();
            }
        });
        window.addEventListener('click', (e) => {
            if (
                !e.target.closest('.js-date-picker') &&
                !e.target.closest('.js-date-range__trigger') &&
                this.pickerVisible
            ) {
                this.togglePicker();
            }
        });
        this.datePicker.addEventListener('keydown', this.handlePickerKeydown.bind(this));
        this.body.addEventListener('keydown', this.handleBodyKeydown.bind(this));
        this.body.addEventListener('click', this.handleDateClick.bind(this));

        this.body.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.body.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.inputStart.addEventListener('focusout', () => this.validateInput(this.inputStart));
        this.inputEnd.addEventListener('focusout', () => this.validateInput(this.inputEnd));
    }

    handleDateClick(e) {
        e.preventDefault();
        let button = e.target.closest('button');
        if (button) {
            let day = parseInt(button.textContent);
            if (
                this.dateToSelect === 1 &&
                this.isBefore(
                    [this.currentYear, this.currentMonth, day],
                    [this.selectedYear[0], this.selectedMonth[0], this.selectedDay[0]],
                )
            ) {
                this.dateToSelect = 0;
            }
            this.dateSelected[this.dateToSelect] = true;
            this.selectedDay[this.dateToSelect] = day;
            this.selectedMonth[this.dateToSelect] = this.currentMonth;
            this.selectedYear[this.dateToSelect] = this.currentYear;
            if (this.dateToSelect === 0) {
                this.inputStart.value = this.formatDate(0);
                this.dateToSelect = 1;
                this.resetEndDate(button);
            } else {
                this.inputEnd.value = this.formatDate(1);
                this.dateToSelect = 0;
                this.togglePicker();
            }
            //this.updateTriggerLabel();
            //this.updateLiveRegion();
            this.updateDates();
            this.updateValue();
            this.updateLabel(true);
        }
    }

    handleMouseMove(e) {
        let dateElement = e.target.closest('.js-date-picker__date');
        if (dateElement && this.dateSelected[0] && !this.dateSelected[1]) {
            if (!this.mouseMoving) {
                this.mouseMoving = true;
                window.requestAnimationFrame(() => {
                    this.clearRangeHighlight();
                    this.addRangeHighlight(dateElement);
                    this.resetEndDateHighlight();
                    this.mouseMoving = false;
                });
            }
        }
    }

    handleMouseLeave() {
        if (!this.dateSelected[1]) {
            this.clearRangeHighlight();
            this.resetEndDateHighlight();
        }
    }

    updateLabel(bool) {
        if (this.triggerLabelWrapper && this.triggerLabelWrapper.children) {
            if (bool) {
                this.triggerLabelWrapper.children[0].classList.add('hide');
                this.triggerLabelWrapper.children[1].classList.remove('hide');
                this.adjustPosition();
            } else {
                this.dateSelected[0] ||
                    this.dateSelected[1] ||
                    (this.triggerLabelWrapper.children[1].classList.add('hide'),
                    this.triggerLabelWrapper.children[0].classList.remove('hide'));
            }
        }
    }

    setTabIndex(element) {
        if (!element) {
            return;
        }
        element.setAttribute('tabindex', '-1');
        const parent = element.closest('.js-date-range__input');
        if (parent) {
            parent.classList.add('sr-only');
            parent.style.display = 'block';
        }
    }

    showPicker() {
        this.updateDates();
        this.showCalendar(this.pickerVisible.toString());
    }

    hidePicker() {
        if (document.activeElement.closest('.js-date-picker')) {
            this.trigger.focus();
        }
        this.updateLabel(false);
    }

    resetEndDate(button) {
        this.dateSelected[1] = false;
        this.selectedDay[1] = null;
        this.selectedMonth[1] = null;
        this.selectedYear[1] = null;
        this.inputEnd.value = '';
        this.clearRangeHighlight();
        Util.addClass(button, this.selectedStartClass);
    }

    handlePredefinedOptions() {
        if (!this.predefOptions || !this.predefOptions.classList.contains('js-date-range-select')) {
            return;
        }
        const select = this.predefOptions.querySelector('select');
        if (!select) {
            return;
        }
        if (select.value === 'custom') {
            this.element.classList.remove('hide');
        }
        select.addEventListener('change', () => {
            if (select.value === 'custom') {
                this.element.classList.remove('hide');
                this.adjustPosition();
                this.trigger.focus();
            } else {
                this.element.classList.add('hide');
            }
        });
    }

    getInput(index) {
        let date = index === 0 ? this.inputStart.value : this.inputEnd.value;
        return date;
    }
    updateDates() {
        this.updateDate(0);
        this.updateDate(1);
        this.updateTriggerLabel();
        if (this.dateSelected[0]) {
            this.updateLiveRegion();
        }
        this.handlePredefinedOptions();
    }

    updateValue() {
        if (this.dateValueStartEl) {
            if (this.selectedYear[0] && this.selectedMonth[0] !== false && this.selectedDay[0]) {
                this.dateValueStartEl.textContent = this.formatDate(0);
            } else {
                this.dateValueStartEl.textContent = this.dateValueStartElLabel;
            }
        }
        if (this.dateValueEndEl) {
            if (this.selectedYear[1] && this.selectedMonth[1] !== false && this.selectedDay[1]) {
                this.dateValueEndEl.textContent = this.formatDate(1);
            } else {
                this.dateValueEndEl.textContent = this.dateValueEndElLabel;
            }
        }
    }

    validateInput(input) {
        const parsedDate = this.parseDate(input.value);
        if (parsedDate) {
            if (isNaN(new Date(parsedDate).getTime())) {
                input.value = '';
            } else {
                this.updateDates();
                this.updateValue();
            }
        } else {
            input.value = '';
        }
    }

    updateTriggerLabel() {
        if (this.trigger) {
            let label = '';
            if (this.selectedYear[0] && this.selectedMonth[0] && this.selectedDay[0]) {
                label += `, start date selected is ${new Date(this.selectedYear[0], this.selectedMonth[0], this.selectedDay[0]).toDateString()}`;
            }
            if (this.selectedYear[1] && this.selectedMonth[1] && this.selectedDay[1]) {
                label += `, end date selected is ${new Date(this.selectedYear[1], this.selectedMonth[1], this.selectedDay[1]).toDateString()}`;
            }
            this.trigger.setAttribute('aria-label', this.triggerLabel + label);
        }
    }

    isBefore(date1, date2) {
        return new Date(date1[0], date1[1], date1[2]) < new Date(date2[0], date2[1], date2[2]);
    }

    addRangeHighlight(dateElement) {
        if (
            dateElement &&
            !this.isBefore(
                [this.currentYear, this.currentMonth, parseInt(dateElement.textContent)],
                [this.selectedYear[0], this.selectedMonth[0], this.selectedDay[0]],
            )
        ) {
            if (dateElement.classList.contains('js-date-picker__date--range-start')) {
                dateElement.classList.add('date-picker__date--range-start');
            } else {
                if (!dateElement.classList.contains('js-date-picker__date--range-end')) {
                    dateElement.classList.add(this.inBetweenClass);
                }
                const prevSibling = dateElement.closest('li').previousElementSibling;
                if (prevSibling) {
                    const prevButton = prevSibling.querySelector('button');
                    if (prevButton) {
                        this.addRangeHighlight(prevButton);
                    }
                }
            }
        }
    }

    clearRangeHighlight() {
        let rangeElements = this.element.querySelectorAll(`.${this.inBetweenClass}`);
        rangeElements.forEach((element) => element.classList.remove(this.inBetweenClass));
    }

    resetEndDateHighlight() {
        if (this.dateSelected[0] && !this.dateSelected[1]) {
            const startElements = this.datePicker.querySelectorAll(
                '.date-picker__date--range-start',
            );
            startElements.forEach((element) =>
                element.classList.remove('date-picker__date--range-start'),
            );
        }
    }

    updateLiveRegion() {
        let message = '';
        if (this.dateSelected[0] && !this.dateSelected[1]) {
            message = `Start date selected is ${new Date(this.selectedYear[0], this.selectedMonth[0], this.selectedDay[0]).toDateString()}, select end date`;
        }
        if (this.dateSelected[0] && this.dateSelected[1]) {
            message = `Start date selected is ${new Date(this.selectedYear[0], this.selectedMonth[0], this.selectedDay[0]).toDateString()}, selected end date is ${new Date(this.selectedYear[1], this.selectedMonth[1], this.selectedDay[1]).toDateString()}`;
        }
        if (message) {
            this.srLiveRegion.textContent = message;
        }
    }

    renderCalendar(focus) {
        let firstDay = this.getFirstDayOfMonth(this.currentYear, this.currentMonth, '01');
        this.body.innerHTML = '';
        this.heading.innerHTML = `${this.options.months[this.currentMonth]} ${this.currentYear}`;
        let days = 1,
            calendarHTML = '';
        for (let s = 0; s < 6; s++) {
            for (let i = 0; i < 7; i++) {
                if (s === 0 && i < firstDay) {
                    calendarHTML += '<li></li>';
                } else {
                    if (days > this.getDaysInMonth(this.currentYear, this.currentMonth)) break;
                    let className = '';
                    let tabIndex = '-1';
                    if (days === this.currentDay) {
                        tabIndex = '0';
                    }
                    if (
                        (!this.dateSelected[0] || !this.dateSelected[1]) &&
                        this.getMonth() === this.currentMonth &&
                        this.getYear() === this.currentYear &&
                        days === this.getDay()
                    ) {
                        className += ' date-picker__date--today';
                    } else {
                        if (
                            this.dateSelected[0] &&
                            days === this.selectedDay[0] &&
                            this.currentYear === this.selectedYear[0] &&
                            this.currentMonth === this.selectedMonth[0]
                        ) {
                            className += ` ${this.selectedStartClass}`;
                        }
                        if (
                            this.dateSelected[1] &&
                            days === this.selectedDay[1] &&
                            this.currentYear === this.selectedYear[1] &&
                            this.currentMonth === this.selectedMonth[1]
                        ) {
                            className += ` ${this.selectedEndClass}`;
                        }
                    }
                    calendarHTML += `<li><button class="date-picker__date js-date-picker__date${className}" tabindex="${tabIndex}">${days}`;
                    calendarHTML += '</button></li>';
                    days++;
                }
            }
        }
        this.body.innerHTML = calendarHTML;
        if (
            (this.pickerVisible || this.datePicker.classList.add('date-picker--is-visible'),
            (this.pickerVisible = true),
            focus || this.body.querySelector('button[tabindex="0"]').focus(),
            this.updateFocusableElements(),
            this.dateSelected[1])
        ) {
            var l = this.element.getElementsByClassName('js-date-picker__date--range-end');
            if (0 < l.length) this.addRangeHighlight(l[0]);
            else if (
                (function (e) {
                    var t = !1,
                        n = !1;
                    e.currentYear < e.selectedYear[1]
                        ? (t = !0)
                        : e.currentYear == e.selectedYear[1] &&
                          e.currentMonth <= e.selectedMonth[1] &&
                          (t = !0);
                    e.currentYear > e.selectedYear[0]
                        ? (n = !0)
                        : e.currentYear == e.selectedYear[0] &&
                          e.currentMonth >= e.selectedMonth[0] &&
                          (n = !0);
                    return t && n;
                })(this)
            ) {
                var c = this.element.getElementsByClassName('js-date-picker__date');
                this.addRangeHighlight(c[c.length - 1]);
            }
        }
        this.updateLabel(false);
    }
}

export default DatePickerRange;

export function initDatePickerRange(context = document) {
    const dateRanges = Array.from(context.getElementsByClassName('js-date-range'));

    dateRanges.forEach((dateRange) => {
        const options = { element: dateRange };

        if (dateRange.getAttribute('data-date-format')) {
            options.dateFormat = dateRange.getAttribute('data-date-format');
        }
        if (dateRange.getAttribute('data-date-separator')) {
            options.dateSeparator = dateRange.getAttribute('data-date-separator');
        }
        if (dateRange.getAttribute('data-months')) {
            options.months = dateRange
                .getAttribute('data-months')
                .split(',')
                .map((m) => m.trim());
        }

        new DatePickerRange(options);
    });
}
