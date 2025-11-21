// File#: _1_date-picker
// Usage: https://codyhouse.co/ds/components/info/date-picker
/*
 * DATE PICKER COMPONENT
 * ---------------------
 * HTML mínim requerit:
 * <div class="date-input js-date-input"
 *      data-months="Gener,Febrer,Març,Abril,Maig,Juny,Juliol,Agost,Setembre,Octubre,Novembre,Desembre"
 *      data-weekdays="Dilluns,Dimarts,Dimecres,Dijous,Divendres,Dissabte,Diumenge"
 *      data-weekdays-short="Dl,Dt,Dc,Dj,Dv,Ds,Dg"      // opcional, si no hi és s'agafa la primera lletra
 *      data-week-start="0|1"                            // 0=Diumenge, 1=Dilluns
 *      data-date-format="d-m-y"                         // ordre dels components
 *      data-date-separator="-"                          // separador
 *      data-btn-today="Avui"                            // opcional, mostra botó 'Avui'
 *      data-btn-clear="Esborrar">                       // opcional, mostra botó 'Esborrar'
 *
 *      <div class="date-input__wrapper">
 *          <input class="js-date-input__text">
 *          <button class="js-date-input__trigger">[...icon...]</button>
 *      </div>
 *
 *      <div class="js-date-picker">
 *          <ol class="js-date-picker__dates"></ol>
 *      </div>
 * </div>
 *
 * FUNCIONAMENT:
 * - El component genera automàticament:
 *     • placeholder de l'input segons format i separador
 *     • el label sr-only amb el format de data
 *     • el header del calendari amb mesos i dies de la setmana
 *     • aria-labelledby i aria-live per accessibilitat
 *     • botons opcionals 'Avui' i 'Esborrar'
 * - Dies de la setmana s'ordenen segons data-week-start
 * - Si data-weekdays-short no existeix, s'agafa la primera lletra de cada dia
 *
 * Exemple mínim funcional:
 * <div class="date-input js-date-input" data-date-format="d-m-y" data-date-separator="/">
 *     <div class="date-input__wrapper">
 *         <input class="js-date-input__text">
 *         <button class="js-date-input__trigger">📅</button>
 *     </div>
 *     <div class="js-date-picker"><ol class="js-date-picker__dates"></ol></div>
 * </div>
 */

import { tools as Util } from '@modules';

export class DatePicker {
    constructor(element) {
        this.options = Util.extend(DatePicker.defaults, element);
        this.element = this.options.element;

        this.datePicker = this.element.querySelector('.js-date-picker');
        this.body = this.datePicker.querySelector('.js-date-picker__dates');

        this.input = this.element.querySelector('.js-date-input__text');
        this.trigger = this.element.querySelector('.js-date-input__trigger');
        this.dateValueEl = this.element.querySelector('.js-date-input__value');
        this.dateValueLabelEl = this.dateValueEl ? this.dateValueEl.textContent : '';

        this.dateIndexes = this.getDateIndexes(this.options.dateFormat);
        this.pickerVisible = false;
        this.dateSelected = [];
        this.selectedDay = [];
        this.selectedMonth = [];
        this.selectedYear = [];
        this.dateToSelect = 0;

        this.init();
    }

    static defaults = {
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
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        weekStart: 0, // 0 = Sunday, 1 = Monday
        dateFormat: 'd-m-y',
        dateSeparator: '/',
    };

    init() {
        if (this.trigger) this.triggerLabel = this.trigger.getAttribute('aria-label');

        this.firstFocusable = false;
        this.lastFocusable = false;

        this.createLiveRegion();
        this.renderHeader(); // header dinàmic
        this.initEvents();
        this.updateDate();
        if (
            this.input &&
            (!this.input.placeholder || this.input.dataset.autoPlaceholder !== 'false')
        ) {
            const f = this.options.dateFormat.toLowerCase();
            const sep = this.options.dateSeparator;
            this.input.placeholder = f
                .replace('d', 'dd')
                .replace('m', 'mm')
                .replace('y', 'yyyy')
                .split('')
                .join('')
                .replace(/ddmm|ddmmyyyy|yymmdd/g, '') // cleanup no necessari però segur
                .replace(/-/g, sep)
                .replace(/ /g, '');
            this.input.dataset.autoPlaceholder = 'true';
        }
        if (this.input) {
            const inputId = this.input.id || `date-input-${Date.now()}`;
            this.input.id = inputId;

            let label = this.element.querySelector(`label[for="${inputId}"]`);
            if (label) {
                let sr = label.querySelector('.sr-only');
                if (!sr) {
                    sr = document.createElement('i');
                    sr.className = 'sr-only';
                    label.appendChild(sr);
                }
                sr.textContent = `, format ${this.options.dateFormat.toLowerCase().replace('d', 'dd').replace('m', 'mm').replace('y', 'yyyy').split('-').join(this.options.dateSeparator)}`;
            }
        }
        this.renderOptionalButtons();
    }

    createLiveRegion(classSrLive = 'js-date-input__sr-live') {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.classList.add('sr-only', classSrLive);
        this.element.appendChild(liveRegion);
        this.srLiveRegion = this.element.getElementsByClassName(classSrLive)[0];
    }

    getDateIndexes(dateFormat) {
        const fmt = dateFormat.toLowerCase().replace(/-/g, '');
        return [fmt.indexOf('d'), fmt.indexOf('m'), fmt.indexOf('y')];
    }

    renderHeader() {
        const header = document.createElement('header');
        header.className = 'date-picker__header';

        // Contenidor mes + navegació
        const monthDiv = document.createElement('div');
        monthDiv.className = 'date-picker__month';

        const monthLabel = document.createElement('span');
        monthLabel.className = 'date-picker__month-label js-date-picker__month-label';
        monthLabel.id = `calendar-label-${Date.now()}`;
        this.datePicker.setAttribute('aria-labelledby', monthLabel.id);
        monthDiv.appendChild(monthLabel);
        this.heading = monthLabel;

        const nav = document.createElement('nav');
        const ulNav = document.createElement('ul');
        ulNav.className = 'date-picker__month-nav js-date-picker__month-nav';

        const createNavButton = (direction) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `date-picker__month-nav-btn js-date-picker__month-nav-btn js-date-picker__month-nav-btn--${direction}`;

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'icon icon--xs');
            svg.setAttribute('viewBox', '0 0 16 16');

            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = direction === 'prev' ? 'Previous month' : 'Next month';

            const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            polyline.setAttribute('fill', 'none');
            polyline.setAttribute('stroke', 'currentColor');
            polyline.setAttribute('stroke-linecap', 'round');
            polyline.setAttribute('stroke-linejoin', 'round');
            polyline.setAttribute('stroke-width', '2');
            polyline.setAttribute(
                'points',
                direction === 'prev' ? '10 2 4 8 10 14' : '6 2 12 8 6 14',
            );

            svg.appendChild(title);
            svg.appendChild(polyline);
            btn.appendChild(svg);
            li.appendChild(btn);
            return li;
        };

        ulNav.appendChild(createNavButton('prev'));
        ulNav.appendChild(createNavButton('next'));
        nav.appendChild(ulNav);
        monthDiv.appendChild(nav);
        header.appendChild(monthDiv);

        // Dies setmana
        const olWeek = document.createElement('ol');
        olWeek.className = 'date-picker__week';

        // fem una còpia
        const weekdays = this.options.weekdays.slice();
        const weekdaysShort =
            this.options.weekdaysShort || this.options.weekdays.map((w) => w.substring(0, 1));

        // reordena seguint weekStart
        if (this.options.weekStart === 0) {
            // Sunday first
            weekdays.unshift(weekdays.pop());
        }

        weekdays.forEach((full, i) => {
            const li = document.createElement('li');
            const dayDiv = document.createElement('div');
            dayDiv.className = 'date-picker__day';
            dayDiv.textContent = weekdaysShort[i];
            const sr = document.createElement('span');
            sr.className = 'sr-only';
            sr.textContent = full;
            dayDiv.appendChild(sr);
            li.appendChild(dayDiv);
            olWeek.appendChild(li);
        });

        header.appendChild(olWeek);
        this.datePicker.insertBefore(header, this.body);
        this.navigation = ulNav; // referència per events
    }

    initEvents() {
        if (this.trigger)
            this.trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePicker();
            });

        this.navigation.addEventListener('click', (e) => {
            e.preventDefault();
            const button = e.target.closest('.js-date-picker__month-nav-btn');
            if (!button) return;
            button.classList.contains('js-date-picker__month-nav-btn--prev')
                ? this.showPrevMonth()
                : this.showNextMonth();
        });

        this.body.addEventListener('click', this.handleDateClick.bind(this));
        this.body.addEventListener('keydown', this.handleBodyKeydown.bind(this));
        this.datePicker.addEventListener('keydown', this.handlePickerKeydown.bind(this));
        this.input.addEventListener('focus', () => this.togglePicker());
        this.input.addEventListener('keydown', (e) => this.handleInputKeydown(e));

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.pickerVisible) this.hidePicker();
        });
        window.addEventListener('click', (e) => {
            if (
                !e.target.closest('.js-date-picker') &&
                !e.target.closest('.js-date-input') &&
                this.pickerVisible
            )
                this.hidePicker();
        });
    }

    handleDateClick(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        e.preventDefault();
        const day = parseInt(btn.textContent);
        this.dateSelected[this.dateToSelect] = true;
        this.selectedDay[this.dateToSelect] = day;
        this.selectedMonth[this.dateToSelect] = this.currentMonth;
        this.selectedYear[this.dateToSelect] = this.currentYear;

        this.input.value = this.formatDate(this.dateToSelect);
        this.updateDate();
        this.updateValue();
        this.input.focus();
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            this.updateDate();
            this.updateValue();
            this.hidePicker();
        } else if ((e.key === 'ArrowDown' || e.keyCode === 40) && this.pickerVisible) {
            this.body.querySelector('button[tabindex="0"]')?.focus();
        }
    }

    handleBodyKeydown(e) {
        const keyActions = {
            ArrowDown: () => this.navigateDays(this.currentDay + 7),
            ArrowUp: () => this.navigateDays(this.currentDay - 7),
            ArrowLeft: () => this.navigateDays(this.currentDay - 1),
            ArrowRight: () => this.navigateDays(this.currentDay + 1),
            Home: () => {
                e.preventDefault();
                this.navigateDays(
                    this.currentDay -
                        this.getFirstDayOfMonth(this.currentYear, this.currentMonth, 1),
                );
            },
            End: () => {
                e.preventDefault();
                this.navigateDays(
                    this.currentDay +
                        6 -
                        this.getFirstDayOfMonth(this.currentYear, this.currentMonth, 1),
                );
            },
            PageUp: () => {
                e.preventDefault();
                this.showPrevMonth();
            },
            PageDown: () => {
                e.preventDefault();
                this.showNextMonth();
            },
        };
        keyActions[e.key]?.();
    }

    handlePickerKeydown(e) {
        if (e.key !== 'Tab') return;
        if (this.firstFocusable === document.activeElement && e.shiftKey) {
            e.preventDefault();
            this.lastFocusable.focus();
        }
        if (this.lastFocusable === document.activeElement && !e.shiftKey) {
            e.preventDefault();
            this.firstFocusable.focus();
        }
    }

    togglePicker() {
        this.pickerVisible = !this.pickerVisible;
        Util.toggleClass(this.datePicker, 'date-picker--is-visible', this.pickerVisible);
        this.pickerVisible ? this.showPicker() : this.hidePicker();
        this.trigger?.setAttribute('aria-expanded', this.pickerVisible.toString());
    }

    hidePicker() {
        this.pickerVisible = false;
        this.datePicker.classList.remove('date-picker--is-visible');
        this.firstFocusable = this.lastFocusable = false;
        this.trigger?.focus();
    }

    showPicker() {
        this.updateDate();
        this.showCalendar(true);
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
        if (parts.length < 3) return null;
        return `${parts[this.dateIndexes[2]]}-${parts[this.dateIndexes[1]]}-${parts[this.dateIndexes[0]]}`;
    }

    getInput(index = 0) {
        return index === 0 ? this.input.value : '';
    }

    updateDate(index = 0) {
        const date = this.getInput(index);
        this.dateSelected[index] = false;
        if (date) {
            const parsed = this.parseDate(date);
            this.dateSelected[index] = true;
            this.currentDay = this.getDay(parsed);
            this.currentMonth = this.getMonth(parsed);
            this.currentYear = this.getYear(parsed);
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

    formatDate(index) {
        const pad = (v) => (v < 10 ? '0' + v : v);
        const parts = [];
        parts[this.dateIndexes[0]] = pad(this.selectedDay[index]);
        parts[this.dateIndexes[1]] = pad(this.selectedMonth[index] + 1);
        parts[this.dateIndexes[2]] = this.selectedYear[index];
        return parts.join(this.options.dateSeparator);
    }

    navigateDays(day) {
        const daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
        if (day > daysInMonth) {
            this.currentDay = day - daysInMonth;
            this.showNextMonth();
        } else if (day < 1) {
            const prevMonthDays = this.getDaysInMonth(this.currentYear, this.currentMonth - 1);
            this.currentDay = prevMonthDays + day;
            this.showPrevMonth();
        } else {
            this.currentDay = day;
            this.body
                .querySelectorAll('button')
                .forEach((btn) => btn.setAttribute('tabindex', '-1'));
            const target = Array.from(this.body.querySelectorAll('button')).find(
                (b) => parseInt(b.textContent) === day,
            );
            if (target) target.setAttribute('tabindex', '0'), target.focus();
        }
        this.updateFocusableElements();
    }

    // -------------------------------------------
    // Calendar rendering
    // -------------------------------------------
    showCalendar(focus = true) {
        this.currentDay ||= this.getDay();
        this.currentMonth ||= this.getMonth();
        this.currentYear ||= this.getYear();
        this.renderCalendar(focus);
    }

    renderCalendar(focus = true) {
        const firstDay = this.getFirstDayOfMonth(this.currentYear, this.currentMonth);
        const daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
        this.heading.textContent = `${this.options.months[this.currentMonth]} ${this.currentYear}`;
        let html = '';
        let dayCounter = 1;

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) html += '<li></li>';
                else if (dayCounter <= daysInMonth) {
                    const classes = [];
                    let tabIndex = '-1';
                    if (dayCounter === this.currentDay) tabIndex = '0';
                    if (
                        !this.dateSelected[this.dateToSelect] &&
                        dayCounter === this.getDay() &&
                        this.currentMonth === this.getMonth() &&
                        this.currentYear === this.getYear()
                    )
                        classes.push('date-picker__date--today');
                    if (
                        this.dateSelected[this.dateToSelect] &&
                        dayCounter === this.selectedDay[this.dateToSelect] &&
                        this.currentMonth === this.selectedMonth[this.dateToSelect] &&
                        this.currentYear === this.selectedYear[this.dateToSelect]
                    )
                        classes.push('date-picker__date--selected');
                    html += `<li><button type="button" class="date-picker__date  js-date-picker__date ${classes.join(' ')}" tabindex="${tabIndex}">${dayCounter}</button></li>`;
                    dayCounter++;
                }
            }
        }
        this.body.innerHTML = html;
        if (!focus) this.body.querySelector('button[tabindex="0"]')?.focus();
        this.updateFocusableElements();
        this.adjustPosition();
    }

    updateFocusableElements() {
        const focusable = Array.from(this.datePicker.querySelectorAll(Util.focusableElString()));
        this.firstFocusable = focusable.find((el) => el.offsetParent !== null);
        this.lastFocusable = [...focusable].reverse().find((el) => el.offsetParent !== null);
    }

    adjustPosition() {
        this.datePicker.style.left = '0px';
        this.datePicker.style.right = 'auto';
        if (this.datePicker.getBoundingClientRect().right > window.innerWidth) {
            this.datePicker.style.left = 'auto';
            this.datePicker.style.right = '0px';
        }
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
    getDaysInMonth(year, month) {
        return 32 - new Date(year, month, 32).getDate();
    }
    getFirstDayOfMonth(year, month) {
        let fd = new Date(year, month, 1).getDay(); // 0=Sunday ... 6=Saturday
        // ajusta segons weekStart
        if (this.options.weekStart === 1) {
            // Monday first → fem que Monday=0
            fd = (fd - 1 + 7) % 7;
        }
        return fd;
    }
    getCurrentDay() {
        return this.currentDay > this.getDaysInMonth(this.currentYear, this.currentMonth)
            ? 1
            : this.currentDay;
    }

    renderOptionalButtons() {
        const todayLabel = this.element.dataset.btnToday;
        const clearLabel = this.element.dataset.btnClear;
        if (!todayLabel && !clearLabel) return;

        const actions = document.createElement('div');
        actions.className = 'grid gap-xs date-picker__actions';

        if (todayLabel) {
            const btnToday = document.createElement('button');
            btnToday.type = 'button';
            btnToday.className = 'btn col-4 date-picker__btn';
            btnToday.textContent = todayLabel;
            btnToday.addEventListener('click', () => {
                const now = new Date();
                this.selectedDay[0] = now.getDate();
                this.selectedMonth[0] = now.getMonth();
                this.selectedYear[0] = now.getFullYear();
                this.input.value = this.formatDate(0);
                this.updateDate();
                this.updateValue();
                this.renderCalendar(true);
            });
            actions.appendChild(btnToday);
        }

        if (clearLabel) {
            const btnClear = document.createElement('button');
            btnClear.type = 'button';
            btnClear.className = 'btn col-4 offset-4 date-picker__btn';
            btnClear.textContent = clearLabel;
            btnClear.addEventListener('click', () => {
                this.input.value = '';
                this.selectedDay[0] = this.selectedMonth[0] = this.selectedYear[0] = false;
                this.updateValue();
                this.renderCalendar(true);
            });
            actions.appendChild(btnClear);
        }

        this.datePicker
            .querySelector('.js-date-picker__dates')
            ?.insertAdjacentElement('afterend', actions);
    }
}

export function initDatePicker(context = document) {
    const dateInputs = Array.from(context.getElementsByClassName('js-date-input'));
    dateInputs.forEach((el) => {
        // Evita reinicialitzar si ja s’ha fet
        if (el.dataset.datePickerInit === 'true') return;

        if (CSS.supports('align-items', 'stretch')) {
            const options = { element: el };
            if (el.dataset.dateFormat) options.dateFormat = el.dataset.dateFormat;
            if (el.dataset.dateSeparator) options.dateSeparator = el.dataset.dateSeparator;
            if (el.dataset.months)
                options.months = el.dataset.months.split(',').map((m) => m.trim());
            if (el.dataset.weekdays)
                options.weekdays = el.dataset.weekdays.split(',').map((d) => d.trim());
            if (el.dataset.weekdaysShort)
                options.weekdaysShort = el.dataset.weekdaysShort.split(',').map((w) => w.trim());
            if (el.dataset.weekStart) options.weekStart = parseInt(el.dataset.weekStart, 10);
            if (el.dataset.btnToday) options.btnToday = el.dataset.btnToday;
            if (el.dataset.btnClear) options.btnClear = el.dataset.btnClear;

            new DatePicker(options);
            el.dataset.datePickerInit = 'true';
        } else {
            el.classList.add('date-input--hide-calendar'); // fallback per navegadors sense suport
        }
    });
}
