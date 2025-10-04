/* -------------------------------- 

File#: _1_menu
Title: Menu
Descr: Application menu that provides access to a set of functionalities.
Usage: https://codyhouse.co/ds/components/info/menu

-------------------------------- */
//import { tools as Util } from '@modules';

class Menu {
    constructor(element) {
        this.element = element;
        this.elementId = this.element.getAttribute('id') || false; 
        this.menuItems = this.element.getElementsByClassName('js-menu__content');
        this.trigger = this.elementId ? document.querySelectorAll(`[aria-controls="${this.elementId}"]`) : false;
        this.selectedTrigger = null;
        this.menuIsOpen = false;
        this.init();
        this.initEvents();
        this.initGlobalEvents();
    }

    // Inicialitza el menú
    init() {
        for (let i = 0; i < this.trigger.length; i++) {
            this.trigger[i].setAttribute('aria-expanded', 'false');
            this.trigger[i].setAttribute('aria-haspopup', 'true');
        }
        for (let i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].setAttribute('tabindex', '0');
        }
    }

    // Inicialitza els esdeveniments del menú
    initEvents() {
        for (let i = 0; i < this.trigger.length; i++) {
            this.trigger[i].addEventListener('click', (event) => {
                event.preventDefault();
                if (
                    this.element.classList.contains('menu--is-visible') &&
                    this.selectedTrigger !== this.trigger[i]
                ) {
                    this.toggleMenu(false, false);
                }
                this.selectedTrigger = this.trigger[i];
                this.toggleMenu(!this.element.classList.contains('menu--is-visible'), true);
            });
        }

        this.element.addEventListener('keydown', (event) => {
            if (event.target.classList.contains('js-menu__content')) {
                if (event.key === 'ArrowDown') {
                    this.navigateItems(event, 'next');
                } else if (event.key === 'ArrowUp') {
                    this.navigateItems(event, 'prev');
                }
            }
        });
    }

    // Inicialitza els esdeveniments globals
    initGlobalEvents() {
        window.addEventListener('keyup', (event) => {
            if (event.key === 'Tab') {
                this.checkMenuFocus();
            } else if (event.key === 'Escape') {
                this.toggleMenu(false, false);
            }
        });

        window.addEventListener('click', (event) => {
            if (
                !this.element.contains(event.target) &&
                !event.target.closest(`[aria-controls="${this.elementId}"]`)
            ) {
                this.toggleMenu(false, false);
            }
        });

        window.addEventListener('resize', () => {
            this.toggleMenu(false, false);
        });

        window.addEventListener('scroll', () => {
            if (this.menuIsOpen) {
                this.toggleMenu(false, false);
            }
        });

        const scrollableElement = this.element.getAttribute('data-scrollable-element');
        if (scrollableElement) {
            const element = document.querySelector(scrollableElement);
            if (element) {
                element.addEventListener('scroll', () => {
                    if (this.menuIsOpen) {
                        this.toggleMenu(false, false);
                    }
                });
            }
        }
    }

    // Canvia l'estat del menú
    toggleMenu(isOpen, setFocus) {
        this.element.classList.toggle('menu--is-visible', isOpen);
        this.menuIsOpen = isOpen;

        if (isOpen) {
            this.selectedTrigger.setAttribute('aria-expanded', 'true');
            this.focusElement(this.menuItems[0]);
            this.element.addEventListener(
                'transitionend',
                () => {
                    this.focusElement(this.menuItems[0]);
                },
                { once: true },
            );
            this.positionMenu();
            this.selectedTrigger.classList.add('menu-control--active');
        } else {
            if (this.selectedTrigger) {
                this.selectedTrigger.setAttribute('aria-expanded', 'false');
                if (setFocus) {
                    this.focusElement(this.selectedTrigger);
                }
                this.selectedTrigger.classList.remove('menu-control--active');
                this.selectedTrigger = null;
            }
        }
    }

    // Posiciona el menú
    positionMenu() {
        const triggerRect = this.selectedTrigger.getBoundingClientRect();
        const isBottom = window.innerHeight - triggerRect.bottom < triggerRect.top;
        const left = triggerRect.left;
        const right = window.innerWidth - triggerRect.right;
        const isRight = window.innerWidth < triggerRect.left + this.element.offsetWidth;
        const horizontalPosition = isRight ? `right: ${right}px;` : `left: ${left}px;`;
        const verticalPosition = isBottom
            ? `bottom: ${window.innerHeight - triggerRect.top}px;`
            : `top: ${triggerRect.bottom}px;`;
        const maxHeight = isBottom
            ? triggerRect.top - 20
            : window.innerHeight - triggerRect.bottom - 20;

        this.element.setAttribute(
            'style',
            `${horizontalPosition} ${verticalPosition} max-height: ${Math.floor(maxHeight)}px;`,
        );
    }

    // Navega pels elements del menú
    navigateItems(event, direction) {
        event.preventDefault();
        const currentIndex = Array.prototype.indexOf.call(this.menuItems, event.target);
        let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex < 0) {
            newIndex = this.menuItems.length - 1;
        } else if (newIndex >= this.menuItems.length) {
            newIndex = 0;
        }

        this.focusElement(this.menuItems[newIndex]);
    }

    // Comprova si el focus està dins del menú
    checkMenuFocus() {
        const focusedElement = document.activeElement.closest('.js-menu');
        if (!focusedElement || !this.element.contains(focusedElement)) {
            this.toggleMenu(false, false);
        }
    }

    // Comprova si el clic està dins del menú
    checkMenuClick(target) {
        if (
            !this.element.contains(target) &&
            !target.closest(`[aria-controls="${this.elementId}"]`)
        ) {
            this.toggleMenu(false);
        }
    }

    // Posa el focus en un element
    focusElement(element) {
        element.focus();
        if (document.activeElement !== element) {
            element.setAttribute('tabindex', '-1');
            element.focus();
        }
    }
}

export default Menu;

// Inicialitza els menús
document.addEventListener('DOMContentLoaded', () => {
    const menus = Array.from(document.getElementsByClassName('js-menu'));
    if(menus.length > 0) {
        menus.forEach(element => new Menu(element));   
    }
});
