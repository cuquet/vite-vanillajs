/* -------------------------------- 
File#: _3_table-interactive
Title: Interactive Table (modern + Util)
Descr: Taula amb selecció de files i ordenació de columnes.
Basat en CodyHouse https://codyhouse.co/ds/components/info/interactive-table

Dependencies:
_1_custom-checkbox
_1_menu
_2_menu-bar
-------------------------------- */
import { tools as Util } from '@modules';

/* -------------------------------- 
File#: _3_table-interactive
Title: Interactive Table
Descr: Taula interactiva amb selecció i ordenació
-------------------------------- */

class IntTable {
	constructor(element) {
		this.element = element;
		this.header = element.querySelector('.js-int-table__header');
		this.body = element.querySelector('.js-int-table__body');
		this.headerCols = this.header?.querySelectorAll('tr:first-child > *') || [];
		this.sortableCols = element.querySelectorAll('.js-int-table__cell--sort');
		this.selectAll = element.querySelector('.js-int-table__select-all');
		this.selectRow = element.querySelectorAll('.js-int-table__select-row');
		this.actionsSelection = [];
		this.actionsNoSelection = [];

		this.init();
	}

	/* --------------------------------------------------
	🔹 Inicialització general
	-------------------------------------------------- */
	init() {
		this.initTableControls();
		this.initSelectAll();
		this.initSortableCols();
	}

	/* --------------------------------------------------
	🔹 Panells d’accions externs
	-------------------------------------------------- */
	initTableControls() {
		const tableId = this.element.id;
		if (!tableId) return;

		const controls = document.querySelectorAll(`[data-table-controls="${tableId}"]`);
		if (!controls.length) return;

		controls.forEach(control => {
			control.querySelectorAll('.js-int-table-actions__items-selected')
				.forEach(el => this.actionsSelection.push(el));
			control.querySelectorAll('.js-int-table-actions__no-items-selected')
				.forEach(el => this.actionsNoSelection.push(el));
		});

		this.updateActions(false);
	}

	updateActions(isAnySelected) {
		this.actionsSelection.forEach(el => Util.toggleClass(el, 'hide', !isAnySelected));
		this.actionsNoSelection.forEach(el => Util.toggleClass(el, 'hide', isAnySelected));
	}

	/* --------------------------------------------------
	🔹 Selecció de files
	-------------------------------------------------- */
	initSelectAll() {
		if (!this.selectAll) return;

		this.selectAll.addEventListener('click', () => this.toggleSelectAll());
		this.body?.addEventListener('change', e => {
			if (e.target.closest('.js-int-table__select-row')) this.updateRowSelection();
		});

		this.updateRowSelection();
	}

	toggleSelectAll() {
		const isChecked = this.selectAll.checked;

		this.selectRow.forEach(row => {
			row.checked = isChecked;
			Util.toggleClass(row.closest('.int-table__row'), 'int-table__row--checked', isChecked);
		});

		this.updateActions(isChecked);
	}

	updateRowSelection() {
		let allChecked = true;
		let anyChecked = false;

		this.selectRow.forEach(row => {
			const checked = row.checked;
			anyChecked = anyChecked || checked;
			if (!checked) allChecked = false;
			Util.toggleClass(row.closest('.int-table__row'), 'int-table__row--checked', checked);
		});

		this.selectAll.checked = anyChecked;
		this.selectAll.indeterminate = anyChecked && !allChecked;

		this.updateActions(anyChecked);
	}

	/* --------------------------------------------------
	🔹 Ordenació de columnes
	-------------------------------------------------- */
	initSortableCols() {
		if (!this.sortableCols.length) return;
		this.setInitialOrder();

		this.header.addEventListener('click', e => this.handleSortClick(e));
		this.header.addEventListener('change', e => this.handleSortChange(e));
		this.header.addEventListener('keydown', e => this.handleSortKeydown(e));
		this.header.addEventListener('focusin', () => this.toggleSortFocus(true));
		this.header.addEventListener('focusout', () => this.toggleSortFocus(false));
	}

	setInitialOrder() {
		this.body?.querySelectorAll('tr').forEach((row, i) => row.dataset.order = i);
	}

	handleSortClick(e) {
		const target = e.target.closest('.js-int-table__cell--sort');
		if (target && e.target.tagName.toLowerCase() !== 'input') this.sortTable(target);
	}

	handleSortChange(e) {
		const target = e.target.closest('.js-int-table__cell--sort');
		if (target) this.sortTable(target, e.target.value);
	}

	handleSortKeydown(e) {
		if (e.key === 'Enter') {
			const target = e.target.closest('.js-int-table__cell--sort');
			if (target) this.sortTable(target);
		}
	}

	toggleSortFocus(active) {
		this.sortableCols.forEach(col => Util.toggleClass(col, 'int-table__cell--focus', active));
	}

	/* --------------------------------------------------
	🔹 Lògica d’ordenació
	-------------------------------------------------- */
	sortTable(target, order) {
		const currentOrder =
			order ||
			(target.classList.contains('int-table__cell--asc')
				? 'desc'
				: target.classList.contains('int-table__cell--desc')
					? 'none'
					: 'asc');

		const colIndex = Util.getIndexInArray(target.parentNode.children, target);

		this.sortRows(currentOrder, colIndex, target);

		// netegem classes anteriors
		this.headerCols.forEach(col => Util.removeClass(col, 'int-table__cell--asc int-table__cell--desc'));

		// marquem la nova direcció
		if (currentOrder === 'asc') Util.addClass(target, 'int-table__cell--asc');
		else if (currentOrder === 'desc') Util.addClass(target, 'int-table__cell--desc');

		// actualitza l’input si existeix
		if (!order) {
			const input = target.querySelector(`input[value="${currentOrder}"]`);
			if (input) input.checked = true;
		}
	}

	sortRows(order, colIndex, target) {
		const rows = Array.from(this.body.querySelectorAll('tr'));

		const sorted = [...rows].sort((a, b) => {
			const x = this.getCellValue(a, colIndex, order);
			const y = this.getCellValue(b, colIndex, order);
			return this.compareValues(x, y, order, target);
		});

		sorted.forEach(row => this.body.appendChild(row));
	}

	getCellValue(row, colIndex, order) {
		return order === 'none'
			? row.dataset.order
			: row.children[colIndex].textContent.trim();
	}

	compareValues(x, y, order, target) {
		const dateFormat = target.dataset.dateFormat;

		// 📅 si és una data
		if (dateFormat && order !== 'none') {
			const xDate = IntTable.parseDate(x, dateFormat);
			const yDate = IntTable.parseDate(y, dateFormat);
			return order === 'asc' ? xDate - yDate : yDate - xDate;
		}

		// 🔢 si són números
		if (!isNaN(x) && !isNaN(y)) {
			return order === 'asc' ? x - y : y - x;
		}

		// 🔤 si són text
		return order === 'asc' ? x.localeCompare(y) : y.localeCompare(x);
	}

	static parseDate(dateString, format) {
		const parts = dateString.match(/\d+/g);
		if (!parts) return new Date(NaN);
		const map = {};
		let i = 0;
		format.replace(/(yyyy|mm|dd)/g, part => (map[part] = i++));
		return new Date(parts[map.yyyy], parts[map.mm] - 1, parts[map.dd]);
	}
}

/* --------------------------------------------------
🔹 Lazy initialization (IntersectionObserver)
-------------------------------------------------- */
function initTable(el) {
	if (!el.dataset.interTableInitialized) {
		new IntTable(el);
		el.dataset.interTableInitialized = 'true';
	}
}

function initInteractiveTables() {
	const tables = document.querySelectorAll('.js-int-table');
	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				initTable(entry.target);
				observer.unobserve(entry.target);
			}
		});
	});

	tables.forEach(el => observer.observe(el));
}

export {IntTable, initInteractiveTables};
