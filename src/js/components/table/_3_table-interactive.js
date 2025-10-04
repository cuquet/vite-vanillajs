/* -------------------------------- 

File#: _3_table-interactive
Title: Interactive Table
Descr: Table with the option of sorting data and selecting rows to perform specific actions.

Usage: https://codyhouse.co/ds/components/info/interactive-table
Dependencies
_1_custom-checkbox
_1_menu
_2_menu-bar
-------------------------------- */

//import { tools as Util } from '@modules';

class IntTable {
    constructor(element) {
        this.element = element;
        this.header = this.element.getElementsByClassName('js-int-table__header')[0];
        this.headerCols = this.header.getElementsByTagName('tr')[0].children;
        this.body = this.element.getElementsByClassName('js-int-table__body')[0];
        this.sortingRows = this.element.getElementsByClassName('js-int-table__sort-row');
        this.actionsSelection =[];
        this.actionsNoSelection =[];
        this.initTableControls();
        this.initSelectAll();
        this.initSortableCols();
    }

    initTableControls() {
        const tableId = this.element.getAttribute('id');
        if (!tableId) return;

        //const controls = document.querySelector(`[data-table-controls="${tableId}"]`);
        const controls = document.querySelectorAll(`[data-table-controls="${tableId}"]`);
        
        if (!controls) return;

        //this.actionsSelection = controls.getElementsByClassName('js-int-table-actions__items-selected')[0] || false;
        //this.actionsNoSelection = controls.getElementsByClassName('js-int-table-actions__no-items-selected')[0] || false;
        controls.forEach( control => {
            control.querySelectorAll('.js-int-table-actions__items-selected').forEach(element => { this.actionsSelection.push(element)});
            control.querySelectorAll('.js-int-table-actions__no-items-selected').forEach(element => { this.actionsNoSelection.push(element)});
            
        })

        this.updateActions();
    }

    initSelectAll() {
        const selectAllCheckboxes = this.element.getElementsByClassName('js-int-table__select-all');
        //if (selectAllCheckboxes.length === 0) return;

        this.selectAll = selectAllCheckboxes[0];
        this.selectRow = this.element.getElementsByClassName('js-int-table__select-row');

        this.selectAll.addEventListener('click', () => this.toggleSelectAll());
        this.body.addEventListener('change', (event) => {
            if (event.target.closest('.js-int-table__select-row')) {
                this.updateRowSelection();
            }
        });

        this.updateRowSelection();
    }

    toggleSelectAll() {
        const isChecked = this.selectAll.checked;
        for (let row of this.selectRow) {
            row.checked = isChecked;
            row.closest('.int-table__row').classList.toggle('int-table__row--checked', isChecked);
        }
        this.updateActions(isChecked);
    }

    updateRowSelection() {
        let allChecked = true;
        let anyChecked = false;

        for (let row of this.selectRow) {
            if (row.checked) {
                anyChecked = true;
            } else {
                allChecked = false;
            }
            row.closest('.int-table__row').classList.toggle('int-table__row--checked', row.checked);
        }

        this.selectAll.checked = anyChecked;
        this.selectAll.indeterminate = !allChecked && anyChecked;
        this.updateActions(anyChecked);
    }

    updateActions(isAnySelected) {
        if (this.actionsSelection.length > 0) {
            //this.actionsSelection.classList.toggle('hide', !isAnySelected);
            this.actionsSelection.forEach(element => {element.classList.toggle('hide', !isAnySelected)});
        }
        if (this.actionsNoSelection.length > 0) {
            this.actionsNoSelection.forEach(element => { element.classList.toggle('hide', isAnySelected); });
            //this.actionsNoSelection.classList.toggle('hide', isAnySelected);
        }
    }

    initSortableCols() {
        this.sortableCols = this.element.getElementsByClassName('js-int-table__cell--sort');
        if (this.sortableCols.length === 0) return;

        this.setInitialOrder();
        this.header.addEventListener('click', (event) => this.handleSortClick(event));
        this.header.addEventListener('change', (event) => this.handleSortChange(event));
        this.header.addEventListener('keydown', (event) => this.handleSortKeydown(event));
        this.header.addEventListener('focusin', () => this.handleSortFocusIn());
        this.header.addEventListener('focusout', () => this.handleSortFocusOut());
    }

    setInitialOrder() {
        const rows = this.body.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            rows[i].setAttribute('data-order', i);
        }
    }

    handleSortClick(event) {
        const target = event.target.closest('.js-int-table__cell--sort');
        if (target && event.target.tagName.toLowerCase() !== 'input') {
            this.sortTable(target);
        }
    }

    handleSortChange(event) {
        const target = event.target.closest('.js-int-table__cell--sort');
        if (target) {
            this.sortTable(target, event.target.value);
        }
    }

    handleSortKeydown(event) {
        if (event.keyCode === 13 || (event.key && event.key.toLowerCase() === 'enter')) {
            const target = event.target.closest('.js-int-table__cell--sort');
            if (target) {
                this.sortTable(target);
            }
        }
    }

    handleSortFocusIn() {
        const target = document.activeElement.closest('.js-int-table__cell--sort');
        if (target) {
            target.classList.add('int-table__cell--focus');
        }
    }

    handleSortFocusOut() {
        for (let col of this.sortableCols) {
            col.classList.remove('int-table__cell--focus');
        }
    }

    sortTable(target, order) {
        const currentOrder =
            order ||
            (target.classList.contains('int-table__cell--asc')
                ? 'desc'
                : target.classList.contains('int-table__cell--desc')
                    ? 'none'
                    : 'asc');
        const colIndex = Array.prototype.indexOf.call(this.headerCols, target);

        this.sortRows(currentOrder, colIndex, target);

        for (let col of this.headerCols) {
            col.classList.remove('int-table__cell--asc', 'int-table__cell--desc');
        }

        if (currentOrder === 'asc') {
            target.classList.add('int-table__cell--asc');
        } else if (currentOrder === 'desc') {
            target.classList.add('int-table__cell--desc');
        }

        if (!order) {
            target.querySelector(`input[value="${currentOrder}"]`).checked = true;
        }
    }

    sortRows(order, colIndex, target) {
        const rows = this.body.getElementsByTagName('tr');
        let switching = true;

        while (switching) {
            switching = false;
            for (let i = 0; i < rows.length - 1; i++) {
                const x =
                    order === 'none'
                        ? rows[i].getAttribute('data-order')
                        : rows[i].children[colIndex].textContent.trim();
                const y =
                    order === 'none'
                        ? rows[i + 1].getAttribute('data-order')
                        : rows[i + 1].children[colIndex].textContent.trim();

                if (this.compareValues(x, y, order, target)) {
                    this.body.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    break;
                }
            }
        }
    }

    compareValues(x, y, order, target) {
        const dateFormat = target.getAttribute('data-date-format');
        if (dateFormat && order !== 'none') {
            return order === 'asc' || order === 'none'
                ? this.parseDate(x, dateFormat) > this.parseDate(y, dateFormat)
                : this.parseDate(y, dateFormat) > this.parseDate(x, dateFormat);
        }

        if (isNaN(x) || isNaN(y)) {
            return order === 'asc' || order === 'none'
                ? y.localeCompare(x) < 0
                : x.localeCompare(y) < 0;
        }

        return order === 'asc' || order === 'none' ? Number(x) > Number(y) : Number(y) > Number(x);
    }

    parseDate(dateString, format) {
        const dateParts = dateString.match(/(\d+)/g);
        const dateMap = {};
        let index = 0;

        format.replace(/(yyyy|dd|mm)/g, (part) => {
            dateMap[part] = index++;
        });

        return new Date(dateParts[dateMap.yyyy], dateParts[dateMap.mm] - 1, dateParts[dateMap.dd]);
    }
}

//window.IntTable = IntTable;
export default IntTable;

document.addEventListener('DOMContentLoaded', () => {
    const tablesInt = Array.from(document.getElementsByClassName('js-int-table'));
    tablesInt.forEach((elm) => { new IntTable(elm) });
});
