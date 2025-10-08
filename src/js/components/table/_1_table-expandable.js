/* -------------------------------- 

File#: _1_expandable-table
Title: Expandable Table
Descr: A table whose rows expand to reveal additional information.
Usage: https://codyhouse.co/ds/components/info/expandable-table

-------------------------------- */

//import { tools as Util } from '@modules';

class ExpandableTable {
    constructor(element) {
        this.element = element;
        this.rows = this.element
            .getElementsByClassName('js-ex-table__body')[0]
            .getElementsByTagName('tr');
        this.labels = this.element.getElementsByClassName('js-ex-table__label');
        this.init();
    }

    init() {
        const buttons = this.element.getElementsByClassName('js-ex-table__btn');
        for (let i = 0; i < buttons.length; i++) {
            const isExpanded = !!buttons[i].closest('.ex-table__row--show-more-content');
            buttons[i].setAttribute('aria-expanded', isExpanded);
        }

        this.element.addEventListener('click', (event) => {
            const button = event.target.closest('.js-ex-table__btn');
            if (button) {
                const row = button.parentNode.parentNode;
                const shouldExpand = !row.classList.contains('ex-table__row--show-more-content');
                row.classList.toggle('ex-table__row--show-more-content', shouldExpand);
                button.setAttribute('aria-expanded', shouldExpand);
                if (!shouldExpand) {
                    this.collapseRow(row);
                }
                this.updateRows();
            }
        });
    }

    updateRows() {
        for (let i = 0; i < this.rows.length; i++) {
            if (this.rows[i].classList.contains('ex-table__row--show-more-content')) {
                this.expandRow(this.rows[i]);
            }
        }
    }

    expandRow(row) {
        const moreContent = row.getElementsByClassName('js-ex-table__more-content');
        if (moreContent.length > 0) {
            if (this.labels[0].offsetWidth <= 0) {
                this.setStyleForHiddenLabel(row, moreContent[0], true);
            } else {
                this.resetStyle(row, moreContent[0]);
            }
        }
    }

    collapseRow(row) {
        const moreContent = row.getElementsByClassName('js-ex-table__more-content');
        if (moreContent.length > 0) {
            this.resetStyle(row, moreContent[0]);
        }
    }

    setStyleForHiddenLabel(row, moreContent, expand) {
        if (expand) {
            const contentHeight = moreContent.offsetHeight;
            const children = row.children;
            for (let i = 0; i < children.length; i++) {
                children[i].setAttribute('style', `border-bottom-width: ${contentHeight}px;`);
            }
            moreContent.setAttribute(
                'style',
                `top: ${parseFloat(row.offsetHeight + row.offsetTop - contentHeight)}px;`,
            );
        } else {
            this.resetStyle(row, moreContent);
        }
    }

    resetStyle(row, moreContent) {
        moreContent.removeAttribute('style');
        const children = row.children;
        for (let i = 0; i < children.length; i++) {
            children[i].removeAttribute('style');
        }
    }
}

function initExpandableTable(context = document) {
    const elements = context.querySelectorAll('.js-ex-table');
    elements.forEach(el => {
        if (!el.dataset.expandableTableInitialized) {
            new ExpandableTable(el);
            el.dataset.expandableTableInitialized = 'true';
        }
    });
}

export { ExpandableTable, initExpandableTable };