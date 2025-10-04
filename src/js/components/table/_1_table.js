/* -------------------------------- 

File#: _1_table
Title: Table
Descr: Data tables used to organize and display information in rows and columns
Usage: https://codyhouse.co/ds/components/info/table

-------------------------------- */

//import { tools as Util } from '@modules';

class Table {
    constructor(element) {
        this.table = element;
        this.tableExpandedLayoutClass = 'table--expanded';
        this.init();
    }

    init() {
        this.checkTableLayout(); // switch from a collapsed to an expanded layout
        this.table.classList.add('table--loaded'); // show table

        // custom event emitted when window is resized
        this.table.addEventListener('update-table', () => {
            this.checkTableLayout();
        });
    }

    checkTableLayout() {
        const layout = getComputedStyle(this.table, ':before')
            .getPropertyValue('content')
            .replace(/\\'|"/g, '');
        this.table.classList.toggle(this.tableExpandedLayoutClass, layout != 'collapsed');
    }

    static initAll() {
        const tables = document.getElementsByClassName('js-table');
        if (tables.length > 0) {
            let j = 0;
            for (let i = 0; i < tables.length; i++) {
                const beforeContent = getComputedStyle(tables[i], ':before').getPropertyValue(
                    'content',
                );
                if (beforeContent && beforeContent != '' && beforeContent != 'none') {
                    new Table(tables[i]);
                    j++;
                } else {
                    tables[i].classList.add('table--loaded');
                }
            }

            if (j > 0) {
                let resizingId = false;
                const customEvent = new CustomEvent('update-table');
                window.addEventListener('resize', () => {
                    clearTimeout(resizingId);
                    resizingId = setTimeout(() => Table.doneResizing(tables, customEvent), 300);
                });
                window.requestAnimationFrame
                    ? window.requestAnimationFrame(() => Table.doneResizing(tables, customEvent))
                    : Table.doneResizing(tables, customEvent);
            }
        }
    }

    static doneResizing(tables, customEvent) {
        for (let i = 0; i < tables.length; i++) {
            tables[i].dispatchEvent(customEvent);
        }
    }
}

export default Table;

document.addEventListener('DOMContentLoaded', () => {
    Table.initAll();
});

