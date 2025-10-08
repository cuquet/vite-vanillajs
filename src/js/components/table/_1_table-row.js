/* -------------------------------- 

File#: _1_table-row
Title: Row Oriented Table
Descr: Data tables used to organize information,
       with a specific layout for cases where each row is a meaningful unit.

Usage: https://codyhouse.co/ds/components/info/row-oriented-table
Dependencies

-------------------------------- */

//import { tools as Util } from '@modules';

class TableRow {
    constructor(element) {
        this.element = element;
        this.headerRows = this.element.getElementsByTagName('thead')[0].getElementsByTagName('th');
        this.tableRows = this.element.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        this.collapsedLayoutClass = 'row-table--collapsed';
        this.mainRowCellClass = 'row-table__th-inner';
        
        this.init();
        this.initEvents();
    }

    init() {
        for (let i = 0; i < this.tableRows.length; i++) {
            let listItems = '';
            const cells = this.tableRows[i].getElementsByClassName('row-table__cell');
            for (let j = 0; j < cells.length; j++) {
                if (j === 0) {
                    cells[j].classList.add(`js-${this.mainRowCellClass}`);
                    const innerTh = cells[j].getElementsByClassName('row-table__th-inner');
                    if (innerTh.length > 0) {
                        innerTh[0].innerHTML +=
                            '<i class="row-table__th-icon" aria-hidden="true"></i>';
                    }
                } else {
                    listItems += `<li class="row-table__item"><span class="row-table__label">${this.headerRows[j].innerHTML}:</span><span>${cells[j].innerHTML}</span></li>`;
                }
            }
            const list = `<ul class="row-table__list" aria-hidden="true">${listItems}</ul>`;
            cells[0].innerHTML = `<input type="text" class="row-table__input" aria-hidden="true">${cells[0].innerHTML}${list}`;
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
        const target = event.target.closest(`.js-${this.mainRowCellClass}`);
        if (target && !event.target.closest('.row-table__list')) {
            target.classList.toggle('row-table__cell--show-list');
        }
    }
}

function initTableRow(context = document) {
    const elements = context.querySelectorAll('.js-row-table');
    elements.forEach(el => {
        if (!el.dataset.tableRowInitialized) {
            new TableRow(el);
            el.dataset.tableRowInitialized = 'true';
        }
    });
}

export { TableRow, initTableRow }; 