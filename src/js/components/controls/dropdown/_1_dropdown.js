/* -------------------------------- 
File#: _1_dropdown
Title: Dropdown
Descr: A hoverable link that toggles the visibility of a dropdown list.
Usage: https://codyhouse.co/ds/components/info/dropdown
Dependencies: _1_diagonal-movement
-------------------------------- */

import './_1_diagonal-movement.js';

export class DropDown {
    constructor(element) {
        this.MainMenu = element;
        this.trigger = this.MainMenu.querySelector('.js-dropdown__trigger');
        this.dropdown = this.MainMenu.querySelector('.js-dropdown__menu');
        this.hasFocus = false;
        this.hideInterval = null;
        this.dropdownSubElements = this.MainMenu.getElementsByClassName('js-dropdown__sub-wrapper');
        this.prevFocus = false;

        this.init();
    }

    init() {
        if (!this.trigger || !this.dropdown) return;

        this.placeElement();
        this.MainMenu.addEventListener('placeDropdown', () => this.placeElement());

        this.trigger.setAttribute('aria-controls', this.dropdown.id);
        this.trigger.setAttribute('aria-haspopup', true);

        this.dropdown.setAttribute('role', 'menu');
        this.dropdown.setAttribute('aria-labelledby', this.trigger.id);
        this.dropdown.setAttribute('tabindex', -1);
        this.dropdown.setAttribute('aria-hidden', !this.trigger.getAttribute('aria-expanded'));

        this.initEvents(this.trigger);
        this.initEvents(this.dropdown);
        this.initSublevels();
    }

    placeElement() {
        if (!this.dropdown) return;
        this.dropdown.removeAttribute('style');
        const rect = this.trigger.getBoundingClientRect();
        const dropdownWidth = parseInt(getComputedStyle(this.dropdown).getPropertyValue('width'));
        const fitsRight = window.innerWidth >= rect.left + dropdownWidth;
        const style = fitsRight ? 'left: 0px; right: auto;' : 'right: 0px; left: auto;';
        this.dropdown.setAttribute('style', style);
    }

    initEvents(element) {
        element.addEventListener('mouseenter', () => {
            this.hasFocus = true;
            this.showDropdown();
        });
        element.addEventListener('focus', () => {
            this.hasFocus = true;
            this.showDropdown();
        });
        element.addEventListener('mouseleave', () => {
            this.hasFocus = false;
            this.hideDropdown();
        });
        element.addEventListener('focusout', () => {
            this.hasFocus = false;
            this.hideDropdown();
        });
    }

    showDropdown() {
        if (this.hideInterval) clearInterval(this.hideInterval);
        this.dropdown.removeAttribute('style');
        this.placeElement();
        this.showLevel(this.dropdown, true);
        this.trigger?.setAttribute('aria-expanded', 'true');
        this.dropdown.setAttribute('aria-hidden', 'false');
    }

    hideDropdown() {
        if (this.hideInterval) clearInterval(this.hideInterval);
        this.hideInterval = setTimeout(() => {
            const activeElement = document.activeElement.closest('.js-dropdown');
            const isActive = activeElement && activeElement === this.MainMenu;
            if (!this.hasFocus && !isActive) {
                this.hideLevel(this.dropdown, true);
                this.hideSubLevels();
                this.prevFocus = false;
                this.trigger?.setAttribute('aria-expanded', 'false');
                this.dropdown.setAttribute('aria-hidden', 'true');
            }
        }, 300);
    }

    initSublevels() {
        const menus = this.MainMenu.getElementsByClassName('js-dropdown__menu');
        for (let i = 0; i < menus.length; i++) {
            new window.menuAim({
                menu: menus[i],
                activate: (row) => {
                    const submenu = row.querySelector('.js-dropdown__menu');
                    if (submenu) {
                        const link = row.querySelector('a');
                        if (link) {
                            link.classList.add('dropdown__item--hover');
                            link.setAttribute('aria-expanded', 'true');
                        }
                        this.showLevel(submenu);
                    }
                },
                deactivate: (row) => {
                    const submenu = row.querySelector('.js-dropdown__menu');
                    if (submenu) {
                        const link = row.querySelector('a');
                        if (link) {
                            link.classList.remove('dropdown__item--hover');
                            link.setAttribute('aria-expanded', 'false');
                        }
                        this.hideLevel(submenu);
                    }
                },
                submenuSelector: '.js-dropdown__sub-wrapper',
            });
        }

        this.MainMenu.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') this.prevFocus = document.activeElement;
        });

        this.MainMenu.addEventListener('keyup', (event) => {
            if (event.key !== 'Tab') return;
            const activeElement = document.activeElement;
            const menu = activeElement.closest('.js-dropdown__menu');
            const nextElement = activeElement.nextElementSibling;

            if (menu && !menu.classList.contains('dropdown__menu--is-visible')) {
                this.showLevel(menu);
            }
            if (nextElement && !nextElement.classList.contains('dropdown__menu--is-visible')) {
                this.showLevel(nextElement);
            }

            if (!this.prevFocus) return;
            const prevMenu = this.prevFocus.closest('.js-dropdown__menu');
            if (!prevMenu) return;
            if (menu && menu !== prevMenu) this.hideLevel(prevMenu);
        });
    }

    hideSubLevels() {
        const visibleMenus = this.dropdown.querySelectorAll('.dropdown__menu--is-visible');
        visibleMenus.forEach((menu) => this.hideLevel(menu));

        const hoveredItems = this.dropdown.querySelectorAll('.dropdown__item--hover');
        hoveredItems.forEach((item) => item.classList.remove('dropdown__item--hover'));
    }

    showLevel(menu) {
        menu.classList.remove('dropdown__menu--left');
        const rect = menu.getBoundingClientRect();
        if (window.innerWidth - rect.right < 5 && rect.left + window.scrollX > 2 * rect.width) {
            menu.classList.add('dropdown__menu--left');
        }
        menu.classList.add('dropdown__menu--is-visible');
        menu.classList.remove('dropdown__menu--hide');
    }

    hideLevel(menu) {
        if (!menu.classList.contains('dropdown__menu--is-visible')) return;
        menu.classList.remove('dropdown__menu--is-visible');
        menu.classList.add('dropdown__menu--hide');
        menu.addEventListener('transitionend', function onTransitionEnd(event) {
            if (event.propertyName === 'opacity') {
                menu.removeEventListener('transitionend', onTransitionEnd);
                menu.classList.remove('dropdown__menu--is-hidden', 'dropdown__menu--left');
            }
        });
    }
}

export function initDropdown(context = document) {
    const dropdowns = context.querySelectorAll('.js-dropdown');
    dropdowns.forEach((el) => {
        if (!el.dataset.dropdownInitialized) {
            new DropDown(el);
            el.dataset.dropdownInitialized = 'true';
        }
    });
}
