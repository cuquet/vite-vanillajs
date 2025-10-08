/* -------------------------------- 
    File#: _1_side-navigation
    Usage: https://codyhouse.co/ds/components/info/side-navigation
-------------------------------- */
import { tools as Util } from '@modules';

class SideNav {
	constructor(element) {
		this.element = element;
		this.sublistTriggers = this.element.querySelectorAll('.js-sidenav__sublist-control');
		this.initEvents();
	}

	initEvents() {
		this.element.addEventListener('click', (event) => {
			const btn = event.target.closest('.js-sidenav__sublist-control');
			if (!btn) return;

			const listItem = btn.closest('.sidenav__item');
			if (!listItem) return;

			const isExpanded = Util.hasClass(listItem, 'sidenav__item--expanded');
			btn.setAttribute('aria-expanded', String(!isExpanded));
			Util.toggleClass(listItem, 'sidenav__item--expanded', !isExpanded);
		});
	}
}

function initSidenav(context = document) {
	const navElements = context.querySelectorAll('.js-sidenav');
	navElements.forEach((navEl) => {
		if (!navEl.dataset.sidenavInitialized) {
			new SideNav(navEl);
			navEl.dataset.sidenavInitialized = 'true';
		}
	});
}

export { SideNav, initSidenav };

