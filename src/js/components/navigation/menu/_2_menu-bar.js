/* -------------------------------- 

File#: _2_menu-bar
Title: Menu Bar
Descr: Application menu with a list of common actions that users can perform.
Usage: https://codyhouse.co/ds/components/info/menu-bar
Dependencies
_1_menu

-------------------------------- */
import Menu from './_1_menu';
//import { tools as Util } from '@modules';

class MenuBar extends Menu {
    constructor(element) {
        super(element);
        this.menuItems = this.getItems(element, 'menu-bar__item');
        this.mobHideItems = element.getElementsByClassName('menu-bar__item--hide') || false;
        this.moreItemsTrigger = element.getElementsByClassName('js-menu-bar__trigger')[0] || false;
        this.init();
        this.initMenuBarEvents();
    }

    getItems(element, className) {
        const children = element.children;
        const items = [];
        for (let i = 0; i < children.length; i++) {
            if (children[i].classList.contains(className)) {
                items.push(children[i]);
            }
        }
        return items;
    }

    init() {
        let isFirstItem = true;
        for (let i = 0; i < this.menuItems.length; i++) {
            if (i === 0 || isFirstItem) {
                this.menuItems[i].setAttribute('tabindex', '0');
            } else {
                this.menuItems[i].setAttribute('tabindex', '-1');
            }
            isFirstItem = i === 0 && this.moreItemsTrigger;
        }
        this.setupMoreItems();
        this.updateMenuBar();
        this.element.classList.add('menu-bar--loaded');

    }
    initMenuBarEvents(){
        this.element.addEventListener('update-menu-bar', () => {
            this.updateMenuBar();
            if (this.menuInstance) {
                this.menuInstance.toggleMenu(false, false);
            }
        });

        if (this.moreItemsTrigger) {
            this.moreItemsTrigger.addEventListener('keydown', (event) => {
                if (event.keyCode === 13 || event.key.toLowerCase() === 'enter') {
                    if (!this.menuInstance) return;
                    this.menuInstance.selectedTrigger = this.moreItemsTrigger;
                    this.menuInstance.toggleMenu(
                        !this.subMenu.classList.contains('menu--is-visible'),
                        true
                    );
                }
            });
            if (this.subMenu) {
                this.subMenu.addEventListener('keydown', (event) => {
                    if (event.keyCode === 27 || event.key.toLowerCase() === 'escape') {
                        if (this.menuInstance) {
                            this.menuInstance.toggleMenu(false, true);
                        }
                    }
                });
            }

        }

        this.element.addEventListener('keydown', (event) => {
            if (event.keyCode === 39 || event.key.toLowerCase() === 'arrowright') {
                this.navigateItems(event, 'next');
            } else if (event.keyCode === 37 || event.key.toLowerCase() === 'arrowleft') {
                this.navigateItems(event, 'prev');
            }
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.element.dispatchEvent(new CustomEvent('update-menu-bar'));
            }, 150);
        });

        window.addEventListener('click', (event) => {
            if (!this.menuInstance) return;
            if (
                !this.moreItemsTrigger.contains(event.target) &&
                !this.subMenu.contains(event.target)
            ) {
                this.menuInstance.toggleMenu(false, false);
            }
        });
    }

    setupMoreItems() {
        if (!this.mobHideItems) {
            if (this.moreItemsTrigger) {
                this.element.removeChild(this.moreItemsTrigger);
            }
            return;
        }

        if (this.moreItemsTrigger) {
            let menuContent = '';
            this.menuControlId = 'submenu-bar-' + Date.now();
            for (let i = 0; i < this.mobHideItems.length; i++) {
                const clone = this.mobHideItems[i].cloneNode(true);
                const link = clone.getElementsByTagName('a')[0] || clone.getElementsByTagName('button')[0];
                const svg = clone.getElementsByTagName('svg')[0];
                const label = clone.getElementsByClassName('menu-bar__label')[0];
                svg.setAttribute('class', 'icon menu__icon');
                label.setAttribute('class', '');
                // menuContent += `<li role="menuitem"><span class="menu__content js-menu__content">${svg.outerHTML}<span>${label.innerHTML}</span></span></li>`;
                let itemContent = '';
                if (link) {
                    link.innerHTML=`${svg.outerHTML}<span>${label.innerHTML}</span>`;
                    itemContent = link.outerHTML;
                }
                menuContent += `<li role="menuitem"><span class="menu__content js-menu__content">${itemContent}</span></li>`;
            }

            this.moreItemsTrigger.setAttribute('role', 'button');
            this.moreItemsTrigger.setAttribute('aria-expanded', 'false');
            this.moreItemsTrigger.setAttribute('aria-controls', this.menuControlId);
            this.moreItemsTrigger.setAttribute('aria-haspopup', 'true');

            const menu = document.createElement('menu');
            const menuClass = this.element.getAttribute('data-menu-class') || '';
            menu.setAttribute('id', this.menuControlId);
            menu.setAttribute('class', `menu js-menu ${menuClass}`);
            menu.innerHTML = menuContent;
            document.body.appendChild(menu);

            this.subMenu = menu || false;
            this.subItems = menu.getElementsByTagName('li');
            this.menuInstance = new Menu(this.subMenu);
        }
    }

    updateMenuBar() {
        const isCollapsed =
            getComputedStyle(this.element, ':before')
                .getPropertyValue('content')
                .replace(/'|"/g, '') === 'collapsed';
        this.element.classList.toggle('menu-bar--collapsed', isCollapsed);
    }

    navigateItems(event, direction, index) {
        event.preventDefault();
        let currentIndex =
            index !== undefined ? index : Array.prototype.indexOf.call(this.menuItems, event.target);
        let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex < 0) {
            newIndex = this.menuItems.length - 1;
        } else if (newIndex >= this.menuItems.length) {
            newIndex = 0;
        }

        if (this.menuItems[newIndex].offsetParent === null) {
            this.navigateItems(event, direction, newIndex);
        } else {
            this.menuItems[newIndex].focus();
            if (document.activeElement !== this.menuItems[newIndex]) {
                this.menuItems[newIndex].setAttribute('tabindex', '-1');
                this.menuItems[newIndex].focus();
            }
        }
    }
}
export default MenuBar;

document.addEventListener('DOMContentLoaded', () => {
    const menuBars = Array.from(document.getElementsByClassName('js-menu-bar'));
    if(menuBars.length > 0) {
        menuBars.forEach( element => {
            //new MenuBar(element);
            const content = getComputedStyle(element, ':before').getPropertyValue('content');
            if (content && content !== '' && content !== 'none') {
                new MenuBar(element);
            }
        });
    }
});

