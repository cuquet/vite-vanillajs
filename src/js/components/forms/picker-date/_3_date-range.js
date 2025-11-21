/* -------------------------------- 

File#: _3_date-range
Title: Date Range
Descr: A controller for choosing date ranges
Usage: https://codyhouse.co/ds/components/info/date-range
Dependencies
    _2_custom-select
    _1_date-picker
-------------------------------- */
/* (context):
 * HTML mínim:
 * <div class="js-date-range date-range"
 *      data-months="Gener,Febrer,Març,Abril,Maig,Juny,Juliol,Agost,Setembre,Octubre,Novembre,Desembre"
 *      data-weekdays="Dilluns,Dimarts,Dimecres,Dijous,Divendres,Dissabte,Diumenge"
 *      data-weekdays-short="Dl,Dt,Dc,Dj,Dv,Ds,Dg"
 *      data-week-start="1"
 *      data-date-format="d-m-y"
 *      data-date-separator="-"
 *      data-btn-today="Avui"
 *      data-btn-clear="Esborrar">
        <div class="date-range js-date-range">
            <div class="date-range__input js-date-range__input">
                <input type="text" class="js-date-range__text js-date-range__text--start">
            </div>
            <div class="date-range__input js-date-range__input">
                <input type="text" class="js-date-range__text js-date-range__text--end">
            </div>
            <button class="btn btn--subtle js-date-range__trigger" aria-label="Select start and end dates using the calendar widget">
                <svg class="icon margin-right-2xs" aria-hidden="true" viewBox="0 0 20 20">
                    <g fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2">
                        <rect x="1" y="4" width="18" height="14" rx="1"/>
                        <line x1="5" y1="1" x2="5" y2="4"/>
                        <line x1="15" y1="1" x2="15" y2="4"/>
                        <line x1="1" y1="9" x2="19" y2="9"/>
                    </g>
                </svg>
                <span class="js-date-range__trigger-label" aria-hidden="true">
                    <span>Select dates</span>
                    <span class="hide">
                        <i class="js-date-range__value js-date-range__value--start">Check in</i>
                        - 
                        <i class="js-date-range__value js-date-range__value--end">Check out</i>
                    </span>
                </span>
            </button>
            <div class="date-picker js-date-picker" role="dialog">
                <ol class="date-picker__dates js-date-picker__dates"></ol>
            </div>
        </div>
 * </div>
 *
 * DATASET OPTIONS:
 *   data-months="..."           → 12 mesos, separats per coma
 *   data-weekdays="..."         → 7 noms complets
 *   data-weekdays-short="..."   → 7 abreviacions (opcional)
 *   data-week-start="0|1"       → Diumenge=0, Dilluns=1
 *   data-date-format="d-m-y"    → ordre D/M/Y
 *   data-date-separator="-"     → separador de data
 *   data-btn-today="Avui"       → mostra botó avui
 *   data-btn-clear="Esborrar"   → mostra botó esborrar
 */

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

        this.trigger = this.element.querySelector('.js-date-range__trigger');
        this.triggerLabel = this.trigger?.getAttribute('aria-label');
        this.triggerLabelWrapper = this.trigger?.querySelector('.js-date-range__trigger-label');

        this.dateValueStartEl = this.element.querySelector('.js-date-range__value--start');
        this.dateValueStartElLabel = this.dateValueStartEl?.textContent || '';
        this.dateValueEndEl = this.element.querySelector('.js-date-range__value--end');
        this.dateValueEndElLabel = this.dateValueEndEl?.textContent || '';

        this.selectedStartClass =
            'date-picker__date--selected date-picker__date--range-start js-date-picker__date--range-start';
        this.selectedEndClass =
            'date-picker__date--selected date-picker__date--range-end js-date-picker__date--range-end';
        this.inBetweenClass = 'date-picker__date--range';

        this.predefOptions = this.element.previousElementSibling;

        // IMPORTANT: usar el renderHeader de la classe base per obtenir
        // exactament la mateixa estructura DOM que _1_date-picker fa
        DatePicker.prototype.renderHeader.call(this);

        // Assegurem que tenim referències correctes que usa la resta de mètodes
        this.datePicker = this.element.querySelector('.js-date-picker');
        this.body = this.datePicker.querySelector('.js-date-picker__dates');
        // this.navigation ja l'ha posat renderHeader (assigned to ulNav)

        // inputs del range: ocults per a accessibilitat (igual que abans)
        this.setTabIndex(this.inputStart);
        this.setTabIndex(this.inputEnd);

        this.createLiveRegion('js-date-range__sr-live');

        // events, dates i UI específics de range
        this.initEvents();
        this.updateDates();
        this.handlePredefinedOptions();

        // render inicial del calendari i botons opcionals per range
        this.renderCalendar();
        this.renderOptionalButtons();
    }

    initEvents() {
        this.trigger?.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePicker();
        });

        this.navigation?.addEventListener('click', (e) => {
            const button = e.target.closest('.js-date-picker__month-nav-btn');
            if (!button) return;
            button.classList.contains('js-date-picker__month-nav-btn--prev')
                ? this.showPrevMonth()
                : this.showNextMonth();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key?.toLowerCase() === 'escape' && this.pickerVisible) {
                this.trigger.focus();
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
        const button = e.target.closest('button');
        if (!button) return;

        const day = parseInt(button.textContent, 10);

        // Si es selecciona end abans que start → revertir
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

        this.updateDates();
        this.updateValue();
        this.updateLabel(true);
    }

    handleMouseMove(e) {
        const dateElement = e.target.closest('.js-date-picker__date');
        if (dateElement && this.dateSelected[0] && !this.dateSelected[1] && !this.mouseMoving) {
            this.mouseMoving = true;
            window.requestAnimationFrame(() => {
                this.clearRangeHighlight();
                this.addRangeHighlight(dateElement);
                this.resetEndDateHighlight();
                this.mouseMoving = false;
            });
        }
    }

    handleMouseLeave() {
        if (!this.dateSelected[1]) {
            this.clearRangeHighlight();
            this.resetEndDateHighlight();
        }
    }

    updateLabel(showSelected) {
        if (!this.triggerLabelWrapper?.children) return;
        const [startLabel, selectedLabel] = this.triggerLabelWrapper.children;
        if (showSelected) {
            startLabel?.classList.add('hide');
            selectedLabel?.classList.remove('hide');
            this.adjustPosition();
        } else if (!this.dateSelected[0] && !this.dateSelected[1]) {
            selectedLabel?.classList.add('hide');
            startLabel?.classList.remove('hide');
        }
    }

    setTabIndex(input) {
        if (!input) return;
        input.setAttribute('tabindex', '-1');
        const parent = input.closest('.js-date-range__input');
        if (parent) {
            parent.classList.add('sr-only');
            parent.style.display = 'block';
        }
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

    isBefore(date1, date2) {
        return new Date(date1[0], date1[1], date1[2]) < new Date(date2[0], date2[1], date2[2]);
    }

    addRangeHighlight(dateElement) {
        if (
            dateElement &&
            !this.isBefore(
                [this.currentYear, this.currentMonth, parseInt(dateElement.textContent, 10)],
                [this.selectedYear[0], this.selectedMonth[0], this.selectedDay[0]],
            )
        ) {
            if (dateElement.classList.contains('js-date-picker__date--range-start')) {
                dateElement.classList.add('date-picker__date--range-start');
            } else {
                if (!dateElement.classList.contains('js-date-picker__date--range-end')) {
                    dateElement.classList.add(this.inBetweenClass);
                }
                const prevLi = dateElement.closest('li').previousElementSibling;
                if (prevLi) {
                    const prevButton = prevLi.querySelector('button');
                    if (prevButton) this.addRangeHighlight(prevButton);
                }
            }
        }
    }

    clearRangeHighlight() {
        this.element
            .querySelectorAll(`.${this.inBetweenClass}`)
            .forEach((el) => el.classList.remove(this.inBetweenClass));
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

    highlightSelectedRange() {
        if (!this.dateSelected[0] || !this.dateSelected[1]) return;

        const startDate = new Date(this.selectedYear[0], this.selectedMonth[0], this.selectedDay[0]);
        const endDate = new Date(this.selectedYear[1], this.selectedMonth[1], this.selectedDay[1]);

        this.body.querySelectorAll('button.js-date-picker__date').forEach((btn) => {
            const day = parseInt(btn.textContent, 10);
            const current = new Date(this.currentYear, this.currentMonth, day);

            // Eliminem totes les classes de rang prèvies
            btn.classList.remove(
                ...this.inBetweenClass.split(' '),
                ...this.selectedStartClass.split(' '),
                ...this.selectedEndClass.split(' ')
            );

            if (current.getTime() === startDate.getTime()) {
                btn.classList.add(...this.selectedStartClass.split(' '));
            } else if (current.getTime() === endDate.getTime()) {
                btn.classList.add(...this.selectedEndClass.split(' '));
            } else if (current > startDate && current < endDate) {
                btn.classList.add(...this.inBetweenClass.split(' '));
            }
        });
    }

    handlePredefinedOptions() {
        const selectContainer = this.predefOptions;
        if (!selectContainer?.classList.contains('js-date-range-select')) return;
        const select = selectContainer.querySelector('select');
        if (!select) return;
        if (select.value === 'custom') this.element.classList.remove('hide');
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

    renderHeader() {
        // ESBORREM CAP HEADER EXISTENT
        const oldMonth = this.datePicker.querySelector('.js-date-picker__month');
        if (oldMonth) oldMonth.remove();
        const oldWeek = this.datePicker.querySelector('.js-date-picker__week');
        if (oldWeek) oldWeek.remove();

        //
        // ─────────────────────────────────────────
        //   CREATE MONTH HEADER
        // ─────────────────────────────────────────
        //
        const month = document.createElement('div');
        month.className = 'date-picker__month js-date-picker__month';

        // MONTH LABEL
        const label = document.createElement('span');
        label.className = 'date-picker__month-label js-date-picker__month-label';
        month.appendChild(label);

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
        //
        // ─────────────────────────────────────────
        //   CREATE WEEKDAY HEADER
        // ─────────────────────────────────────────
        //
        const week = document.createElement('ol');
        week.className = 'date-picker__week js-date-picker__week';

        // weekdays amb fallback
        const weekdays = this.options?.weekdaysShort ||
            this.options?.weekdays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        // rotar per weekStart
        const rotated = weekdays.slice(this.weekStart).concat(weekdays.slice(0, this.weekStart));

        rotated.forEach((name) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="date-picker__day">
                    ${name}
                    <span class="sr-only">${name}</span>
                </div>`;
            week.appendChild(li);
        });

        // INSERIR EN L’ORDRE CORRECTE
        this.datePicker.insertBefore(month, this.body);
        this.datePicker.insertBefore(week, this.body);

        // assigna navigation per click events
        this.navigation = nav;
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

                // Assignem start date
                this.selectedDay[0] = now.getDate();
                this.selectedMonth[0] = now.getMonth();
                this.selectedYear[0] = now.getFullYear();
                this.inputStart.value = this.formatDate(0);

                // Reiniciem end date
                this.selectedDay[1] = null;
                this.selectedMonth[1] = null;
                this.selectedYear[1] = null;
                this.inputEnd.value = '';

                this.dateSelected[0] = true;
                this.dateSelected[1] = false;

                this.updateDates();
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
                // Neteja ambdues dates
                this.inputStart.value = '';
                this.inputEnd.value = '';
                this.selectedDay[0] = this.selectedMonth[0] = this.selectedYear[0] = null;
                this.selectedDay[1] = this.selectedMonth[1] = this.selectedYear[1] = null;
                this.dateSelected[0] = false;
                this.dateSelected[1] = false;

                this.updateValue();
                this.renderCalendar(true);
            });
            actions.appendChild(btnClear);
        }

        this.datePicker
            .querySelector('.js-date-picker__dates')
            ?.insertAdjacentElement('afterend', actions);
    }

    renderCalendar(jumpToSelected = false) {
        super.renderCalendar(jumpToSelected); // si sobrescrius
        this.highlightSelectedRange();
    }

    getInput(index) {
        return index === 0 ? this.inputStart.value : this.inputEnd.value;
    }

    updateDates() {
        this.updateDate(0);
        this.updateDate(1);
        this.updateTriggerLabel();
        if (this.dateSelected[0]) this.updateLiveRegion();
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

    updateTriggerLabel() {
        if (!this.trigger) return;
        let label = '';
        if (this.selectedYear[0] && this.selectedMonth[0] && this.selectedDay[0]) {
            label += `, start date selected is ${new Date(this.selectedYear[0], this.selectedMonth[0], this.selectedDay[0]).toDateString()}`;
        }
        if (this.selectedYear[1] && this.selectedMonth[1] && this.selectedDay[1]) {
            label += `, end date selected is ${new Date(this.selectedYear[1], this.selectedMonth[1], this.selectedDay[1]).toDateString()}`;
        }
        this.trigger.setAttribute('aria-label', this.triggerLabel + label);
    }

    updateLiveRegion() {
        if (!this.dateSelected[0]) return;
        const startStr = new Date(
            this.selectedYear[0],
            this.selectedMonth[0],
            this.selectedDay[0],
        ).toDateString();
        const endStr = this.dateSelected[1]
            ? new Date(
                  this.selectedYear[1],
                  this.selectedMonth[1],
                  this.selectedDay[1],
              ).toDateString()
            : 'select end date';
        this.srLiveRegion.textContent = `Start date selected is ${startStr}, ${this.dateSelected[1] ? 'selected end date is ' + endStr : endStr}`;
    }
}

// Inicialitza component Date Range
export function initDatePickerRange(context = document) {
    const dateRanges = Array.from(context.getElementsByClassName('js-date-range'));

    dateRanges.forEach((dateRange) => {
        if (dateRange.dataset.datePickerRangeInit === 'true') return;

        const options = { element: dateRange };

        if (dateRange.dataset.dateFormat) options.dateFormat = dateRange.dataset.dateFormat;
        if (dateRange.dataset.dateSeparator)
            options.dateSeparator = dateRange.dataset.dateSeparator;
        if (dateRange.dataset.months) {
            options.months = dateRange.dataset.months.split(',').map((m) => m.trim());
        }
        if (dateRange.dataset.weekdays) {
            options.weekdays = dateRange.dataset.weekdays.split(',').map((d) => d.trim());
        }
        if (dateRange.dataset.weekdaysShort) {
            options.weekdaysShort = dateRange.dataset.weekdaysShort.split(',').map((w) => w.trim());
        }
        if (dateRange.dataset.weekStart) {
            options.weekStart = parseInt(dateRange.dataset.weekStart, 10);
        }
        if (dateRange.dataset.btnToday) options.btnToday = dateRange.dataset.btnToday;
        if (dateRange.dataset.btnClear) options.btnClear = dateRange.dataset.btnClear;

        new DatePickerRange(options);
        dateRange.dataset.datePickerRangeInit = 'true';
    });
}

export default DatePickerRange;
