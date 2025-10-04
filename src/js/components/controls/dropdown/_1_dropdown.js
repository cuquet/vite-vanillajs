/* -------------------------------- 

File#: _1_dropdown
Title: Dropdown
Descr: A hoverable link that toggles the visibility of a dropdown list.
Usage: https://codyhouse.co/ds/components/info/dropdown
Dependencies
    _1_diagonal-movement
-------------------------------- */

//import { tools as Util } from '@modules';

import './_1_diagonal-movement.js';

class DropDown {
    constructor(element) {
        this.MainMenu = element;
        this.trigger = this.MainMenu.getElementsByClassName('js-dropdown__trigger')[0];
        this.dropdown = this.MainMenu.getElementsByClassName('js-dropdown__menu')[0];
        this.hasFocus = false;
        this.hideInterval = false;
        this.dropdownSubElements = this.MainMenu.getElementsByClassName('js-dropdown__sub-wrapper');
        this.prevFocus = false;
        this.init();
    }

    init() {
        this.placeElement();
        this.MainMenu.addEventListener('placeDropdown', () => {
            this.placeElement();
        });
        if (this.trigger) {
            this.trigger.setAttribute('aria-controls', this.dropdown.id);
            this.trigger.setAttribute('aria-haspopup', true);
            this.initEvents(this.trigger);
        }

        if (this.dropdown) {
            this.dropdown.setAttribute('role', 'menu');
            this.dropdown.setAttribute('aria-labelledby', this.trigger.id);
            this.dropdown.setAttribute('tabindex', -1);
            this.dropdown.setAttribute('aria-hidden', !this.trigger.getAttribute('aria-expanded'));
            this.initEvents(this.dropdown);
        }
        this.initSublevels();
    }

    placeElement() {
        if (this.dropdown) {
            this.dropdown.removeAttribute('style');
        }
        const rect = this.trigger.getBoundingClientRect();
        const style =
            window.innerWidth <
            rect.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width'))
                ? 'right: 0px; left: auto;'
                : 'left: 0px; right: auto;';
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
        if (this.trigger) {
            this.trigger.setAttribute('aria-expanded', 'true');
            this.dropdown.setAttribute('aria-hidden', 'false');
        }
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
                if (this.trigger) {
                    this.trigger.setAttribute('aria-expanded', 'false');
                    this.dropdown.setAttribute('aria-hidden', 'true');
                }
            }
        }, 300);
    }

    initSublevels() {
        const menus = this.MainMenu.getElementsByClassName('js-dropdown__menu');
        for (let i = 0; i < menus.length; i++) {
            new window.menuAim({
                menu: menus[i],
                activate: (row) => {
                    const submenu = row.getElementsByClassName('js-dropdown__menu')[0];
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
                    const submenu = row.getElementsByClassName('js-dropdown__menu')[0];
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
            if ((event.keyCode && event.keyCode === 9) || (event.key && event.key === 'Tab')) {
                this.prevFocus = document.activeElement;
            }
        });
        this.MainMenu.addEventListener('keyup', (event) => {
            if ((event.keyCode && event.keyCode === 9) || (event.key && event.key === 'Tab')) {
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
                const prevNextElement = this.prevFocus.nextElementSibling;
                if (!prevMenu) return;
                if (menu && menu === prevMenu) {
                    if (prevNextElement) this.hideLevel(prevNextElement);
                    return;
                }
                if (prevNextElement && menu && menu === prevNextElement) return;
                if (nextElement && prevMenu && nextElement === prevMenu) return;
                const parentMenu = menu.parentNode.closest('.js-dropdown__menu');
                if (parentMenu && parentMenu === prevMenu) {
                    if (prevNextElement) this.hideLevel(prevNextElement);
                    return;
                }
                if (prevMenu.classList.contains('dropdown__menu--is-visible')) {
                    this.hideLevel(prevMenu);
                }
            }
        });
    }

    hideSubLevels() {
        const visibleMenus = this.dropdown.getElementsByClassName('dropdown__menu--is-visible');
        while (visibleMenus[0]) {
            this.hideLevel(visibleMenus[0]);
        }
        const hoveredItems = this.dropdown.getElementsByClassName('dropdown__item--hover');
        while (hoveredItems[0]) {
            hoveredItems[0].classList.remove('dropdown__item--hover');
        }
    }

    showLevel(menu, isVisible) {
        if (isVisible == null) {
            menu.classList.remove('dropdown__menu--left');
            const rect = menu.getBoundingClientRect();
            if (window.innerWidth - rect.right < 5 && rect.left + window.scrollX > 2 * rect.width) {
                menu.classList.add('dropdown__menu--left');
            }
        }
        menu.classList.add('dropdown__menu--is-visible');
        menu.classList.remove('dropdown__menu--hide');
    }

    hideLevel(menu, isVisible) {
        if (menu.classList.contains('dropdown__menu--is-visible')) {
            menu.classList.remove('dropdown__menu--is-visible');
            menu.classList.add('dropdown__menu--hide');
            menu.addEventListener('transitionend', function onTransitionEnd(event) {
                if (event.propertyName === 'opacity') {
                    menu.removeEventListener('transitionend', onTransitionEnd);
                    if (menu.classList.contains('dropdown__menu--is-hidden')) {
                        menu.classList.remove('dropdown__menu--is-hidden', 'dropdown__menu--left');
                    }
                    if (isVisible && !menu.classList.contains('dropdown__menu--is-visible')) {
                        menu.setAttribute('style', 'width: 0px; overflow: hidden;');
                    }
                }
            });
        }
    }
}

class DropDowns extends DropDown {
    // Inicialitza tots els dropdowns de la pàgina
    static init() {
        const dropdowns = Array.from(document.getElementsByClassName('js-dropdown'));
        dropdowns.forEach((dropdown) => {
            const triggers = Array.from(dropdown.getElementsByClassName('js-dropdown__trigger'));
            triggers.forEach((trigger) => {
                new DropDown(trigger.parentElement);
                const q = trigger.parentElement.getElementsByClassName('js-dropdown__menu')[0];
                q.setAttribute('style', 'width: 0px; overflow: hidden;');
            });
        });
    }
}

window.DropDown = DropDown;
export default DropDown;

document.addEventListener('DOMContentLoaded', () => {
    DropDowns.init();
});
