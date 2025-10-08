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
		this.expandedClass = 'table--expanded';
		this.loadedClass = 'table--loaded';
		this.init();
	}

	init() {
		this.updateLayout();
		this.table.classList.add(this.loadedClass);
		this.observeResize();
	}

	updateLayout() {
		const content = getComputedStyle(this.table, ':before')
			.getPropertyValue('content')
			.replace(/['"]/g, '');
		const isExpanded = content !== 'collapsed';

		// Només aplica el canvi si cal (evita reentrades innecessàries)
		if (this.table.classList.contains(this.expandedClass) !== isExpanded) {
			this.table.classList.toggle(this.expandedClass, isExpanded);
		}
	}

	observeResize() {
		if ('ResizeObserver' in window) {
			this.resizeObserver = new ResizeObserver(() => {
				// 👇 Evita el warning "ResizeObserver loop completed..."
				requestAnimationFrame(() => this.updateLayout());
			});
			this.resizeObserver.observe(this.table);
		} else {
			// Fallback: escolta esdeveniments de resize globals
			window.addEventListener('resize', this.updateLayout.bind(this));
		}
	}

	dispose() {
		if (this.resizeObserver) this.resizeObserver.disconnect();
		window.removeEventListener('resize', this.updateLayout);
	}
}

function initTable(context = document) {
	const tables = Array.from(context.querySelectorAll('.js-table'));
	tables.forEach((tableEl) => {
		// Evita reinicialitzar
		if (tableEl.dataset.tableInitialized) return;
		const beforeContent = getComputedStyle(tableEl, ':before').getPropertyValue('content');
		if (beforeContent && beforeContent !== '' && beforeContent !== 'none') {
			new Table(tableEl);
			tableEl.dataset.tableInitialized = 'true';
		} else {
			tableEl.classList.add('table--loaded');
		}
	});
}

export { Table, initTable };
