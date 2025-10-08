/* -------------------------------- 

File#: _1_table-col
Title: Column Oriented Table
Descr: Data table for cases where each column is a meaningful unit.
Usage: https://codyhouse.co/ds/components/info/column-oriented-table
Dependencies

-------------------------------- */

//import { tools as Util } from '@modules';

class TableColumn {
    constructor(element) {
        this.element = element;
        this.header = this.element.getElementsByTagName('thead')[0];
        this.body = this.element.getElementsByTagName('tbody')[0];
        this.headerRows = this.header.getElementsByTagName('th');
        this.tableRows = this.body.getElementsByTagName('tr');
        this.mainColCellClass = 'cl-table__th-inner';

        this.init();
        this.setRoles();
        this.initEvents();
    }

    init() {
        const columnData = [];
        for (let i = 0; i < this.tableRows.length; i++) {
            const cells = this.tableRows[i].getElementsByClassName('cl-table__cell');
            for (let j = 1; j < cells.length; j++) {
                if (i === 0) columnData[j] = '';
                columnData[j] +=
                    `<li class="cl-table__item"><span class="cl-table__label">${cells[0].innerHTML}:</span><span>${cells[j].innerHTML}</span></li>`;
            }
        }

        for (let i = 1; i < this.headerRows.length; i++) {
            const content = `<input type="text" class="cl-table__input" aria-hidden="true">
                             <span class="cl-table__th-inner">${this.headerRows[i].innerHTML}<i class="cl-table__th-icon" aria-hidden="true"></i></span>
                             <ul class="cl-table__list" aria-hidden="true">${columnData[i]}</ul>`;
            this.headerRows[i].innerHTML = content;
            this.headerRows[i].classList.add(`js-${this.mainColCellClass}`);
        }
    }

    setRoles() {
        const headerRows = this.header.getElementsByTagName('tr');
        for (let i = 0; i < headerRows.length; i++) {
            headerRows[i].setAttribute('role', 'row');
        }

        const headerCells = this.header.getElementsByTagName('th');
        for (let i = 0; i < headerCells.length; i++) {
            headerCells[i].setAttribute('role', 'cell');
        }
    }

    initEvents() {
        this.element.addEventListener('click', (event) => this.toggleList(event));
        this.element.addEventListener('keydown', (event) => {
            if (
                (event.keyCode && event.keyCode === 13) ||
                (event.key && event.key.toLowerCase() === 'enter')
            ) {
                this.toggleList(event);
            }
        });
    }

    toggleList(event) {
        const target = event.target.closest(`.js-${this.mainColCellClass}`);
        if (target && !event.target.closest('.cl-table__list')) {
            target.classList.toggle(
                'cl-table__cell--show-list',
                !target.classList.contains('cl-table__cell--show-list'),
            );
        }
    }
}

function initTableColumn(context = document) {
    const elements = context.querySelectorAll('.js-cl-table');
    elements.forEach(el => {
        if (!el.dataset.tableColumnInitialized) {
            new TableColumn(el);
            el.dataset.tableColumnInitialized = 'true';
        }
    });
}

export { TableColumn, initTableColumn };