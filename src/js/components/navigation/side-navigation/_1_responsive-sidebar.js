// File#: _1_responsive-sidebar
// Usage: https://codyhouse.co/ds/components/info/responsive-sidebar

import { tools as Util } from '@modules';

class SideNav {
    constructor() {
        this.navItems = [];
        this.layout = 'mobile';
        this.Sidebar = document.querySelector('.js-sidebar');
    }

    static getbytagname(element, children_tag_name) {
        // Utilitza Array.from i filter per millor llegibilitat i rendiment
        return Array.from(element.children).filter((child) => child.tagName === children_tag_name);
    }

    #parseNavList() {
        if (!this.nav) return [];
        const ul = this.nav.querySelector('ul');
        if (!ul) return [];

        function parseList(ul) {
            const items = [];
            for (const li of ul.children) {
                // Etiqueta 'sidenav__label'
                if (li.firstElementChild && li.firstElementChild.tagName === 'SPAN') {
                    items.push({ node: li, type: 'label', text: li.firstElementChild.innerHTML });
                }
                // Divisor 'sidenav__divider'
                else if (!li.hasChildNodes()) {
                    items.push({ node: li, type: 'divider' });
                }
                // Element amb enllaç 'sidenav__item' o 'dropdown__wrapper'
                else if (li.querySelector('a')) {
                    const link = li.querySelector('a');
                    if (!link) continue;
                    let spans = SideNav.getbytagname(link, 'SPAN');
                    /*
                    Aquesta línia de codi utilitza l'operador d'encadenament opcional (`?.`) i l'operador de coalescència nul·la (`??`). Primer, intenta accedir a la propietat `innerHTML` del primer element de l'array `spans` (`spans[0]`). Si `spans[0]` existeix, retorna el seu contingut HTML. Si `spans[0]` és `undefined` o `null`, l'operador `?.` evita un error i retorna `undefined` en lloc de provocar una excepció.

                    Després, l'operador `??` comprova si el resultat anterior és `null` o `undefined`. Si ho és, assigna el valor `null` a la constant `text`. Això garanteix que `text` només tindrà el contingut HTML si existeix un element vàlid a `spans[0]`; en cas contrari, serà `null`. Aquesta combinació fa el codi més segur i llegible, evitant errors quan l'array pot estar buit o no tenir l'estructura esperada.
                    */
                    const text = spans[0]?.innerHTML ?? null;
                    const counter = spans[1]?.textContent ?? null;
                    const iconUse = link.querySelector('use');
                    const icon = iconUse ? iconUse.getAttribute('href') : link.querySelector('svg');
                    const url = link.getAttribute('href');
                    const current = ['page', 'true'].includes(link.getAttribute('aria-current'));
                    // Comprova si hi ha submenú
                    const subUl = li.querySelector('ul, .dropdown__menu, .dropdown-container');
                    let sub = undefined;
                    if (subUl) {
                        sub = parseList(subUl);
                    }
                    items.push({
                        node: li,
                        type: 'link',
                        text,
                        url,
                        icon,
                        current,
                        counter,
                        ...(sub ? { sub } : {}),
                    });
                }
            }
            return items;
        }
        return parseList(ul);
    }

    #renderNavList(list, isSub = false) {
        // Defineix les classes una sola vegada fora del bucle
        const layoutType = this.layout === 'static' ? 'static' : 'mobile';
        // Classes per defecte segons layout
        const defaultClasses = {
            mobile: {
                ITEM_CLASS: 'sidenav__item',
                ITEM_CLASS_xSUB: 'sidenav__item',
                LINK_CLASS: 'sidenav__link',
                LINK_CLASS_xSUB: 'sidenav__link',
                ITEM_CLASS_SUB_xSUB: 'sidenav__item',
                LINK_CLASS_SUB_xSUB: 'sidenav__link',
                LABEL_CLASS: 'sidenav__label',
                LABEL_CLASS_SUB: 'sidenav__label',
                DIVIDER_CLASS: 'sidenav__divider',
                TEXT_CLASS: 'sidenav__text',
                TEXT_CLASS_SUB: 'dropdown__text',
                COUNTER_CLASS: 'sidenav__notification-marker',
                SUB_CONTAINER_CLASS: 'dropdown-container',
                BTN_CLASS: 'dropdown-btn',
                TOOLTIP_CLASS: 'sidenav__tooltip',
            },
            static: {
                ITEM_CLASS: 'sidenav__item',
                ITEM_CLASS_xSUB: 'sidenav__item dropdown__wrapper',
                LINK_CLASS: 'sidenav__link',
                LINK_CLASS_xSUB: 'sidenav__link dropdown__trigger js-dropdown__trigger',
                ITEM_CLASS_SUB_xSUB: 'dropdown__sub-wrapper js-dropdown__sub-wrapper',
                LINK_CLASS_SUB_xSUB: 'dropdown__item',
                LABEL_CLASS: 'sidenav__label',
                LABEL_CLASS_SUB: 'dropdown__item--label',
                DIVIDER_CLASS: 'sidenav__divider',
                TEXT_CLASS: 'sidenav__text',
                TEXT_CLASS_SUB: 'dropdown__text',
                COUNTER_CLASS: 'sidenav__notification-marker',
                SUB_CONTAINER_CLASS: 'dropdown__menu js-dropdown__menu',
                BTN_CLASS: 'dropdown__trigger-icon',
                TOOLTIP_CLASS: 'sidenav__tooltip',
            },
        };

        // Permet sobreescriptura via this
        const classes = Util.extend({}, defaultClasses[layoutType], this.customClasses || {});
        // Utilitza for...of per evitar crear arrays temporals innecessaris
        for (let idx = 0; idx < list.length; idx++) {
            const item = list[idx];
            const listItem = item.node;

            // Neteja elements anteriors
            // Neteja elements anteriors només si existeixen
            const toRemove = listItem.querySelectorAll(
                '.dropdown__trigger-icon, .dropdown-btn, .sidenav__tooltip',
            );
            if (toRemove.length) {
                for (const el of toRemove) el.remove();
            }

            // Configura el contenidor de submenú només si cal
            if (idx == 0) {
                listItem.parentNode.className = '';
                if (isSub) {
                    Util.addClass(listItem.parentNode, classes.SUB_CONTAINER_CLASS);
                    listItem.parentNode.setAttribute('aria-label', 'submenu');
                } else if (this.layout === 'static') {
                    Util.addClass(listItem.parentNode, 'dropdown js-dropdown');
                }
            }

            switch (item.type) {
                case 'label':
                    listItem.className = isSub ? classes.LABEL_CLASS_SUB : classes.LABEL_CLASS;
                    listItem.innerHTML = isSub
                        ? `${item.text}`
                        : `<span class="text-sm color-contrast-medium text-xs@md">${item.text}</span>`;
                    break;
                case 'divider':
                    listItem.className = classes.DIVIDER_CLASS;
                    listItem.setAttribute('role', 'presentation');
                    break;
                case 'link':
                default: {
                    listItem.className = classes.ITEM_CLASS;
                    let link = listItem.querySelector('a');
                    if (!link) return;
                    link.className = isSub
                        ? classes.LINK_CLASS
                        : classes.LINK_CLASS;
                    link.removeAttribute('aria-expanded');

                    const svg = link.querySelector('svg');
                    if (svg) {
                        Util.addClass(svg, 'icon sidenav__icon');
                        svg.setAttribute('aria-hidden', 'true');
                    }
                    const spans = SideNav.getbytagname(link, 'SPAN');
                    if (item.text && spans[0]) {
                        spans[0].className = isSub ? classes.TEXT_CLASS_SUB : classes.TEXT_CLASS;
                    }
                    if (item.counter && spans[1]) {
                        spans[1].className = classes.COUNTER_CLASS;
                        spans[1].innerHTML += `<i class="sr-only">notifications</i>`;
                    }

                    // Tooltip només en mode static i sense submenú
                    if (
                        this.layout === 'static' &&
                        !isSub &&
                        !Array.isArray(item.sub) &&
                        item.text
                    ) {
                        const textTooltip = document.createElement('span');
                        textTooltip.className = classes.TOOLTIP_CLASS;
                        textTooltip.innerHTML = item.text;
                        link.appendChild(textTooltip);
                    }

                    // Submenú
                    if (item.sub && Array.isArray(item.sub)) {
                        listItem.className = isSub
                            ? classes.ITEM_CLASS_SUB_xSUB
                            : classes.ITEM_CLASS_xSUB;
                        link.className = isSub
                            ? classes.LINK_CLASS_SUB_xSUB
                            : classes.LINK_CLASS_xSUB;
                        let subUl = listItem.querySelector('ul');
                        if (this.layout === 'static') {
                            let ulId = Util.getNewId(6);
                            subUl.id = `dropdown-menu-${ulId}`;
                            link.setAttribute('aria-expanded', 'false');
                            link.setAttribute('aria-controls', subUl.id);
                            link.id = `dropdown-trigger-${ulId}`;
                            subUl.setAttribute('aria-labelledby', link.id);
                            link.innerHTML += `<svg class="${classes.BTN_CLASS} icon" aria-hidden="true" viewBox="0 0 12 12">
                                <polyline stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" points="3.5 0.5 9.5 6 3.5 11.5"></polyline>
                            </svg>`;
                        } else {
                            // Mode mòbil: afegeix botó per desplegar submenú
                            const subBtn = document.createElement('button');
                            subBtn.classList.add(classes.BTN_CLASS);
                            subBtn.setAttribute('aria-haspopup', true);
                            subBtn.setAttribute('aria-expanded', false);
                            subBtn.innerHTML = `<svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
                                    <g class="icon__group" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                        <path d="M3 3l10 10"></path>
                                        <path d="M13 3L3 13"></path>
                                    </g>
                                </svg>`;
                            subUl.insertAdjacentElement('beforebegin', subBtn);
                        }
                        this.#renderNavList(item.sub, true);
                    }
                    break;
                }
            }
        }
    }

    renderSideNav() {
        this.nav = document.querySelector('.js-sidenav') || false;
        if (!this.nav) return;
        if (this.navItems.length < 1) {
            this.navItems = this.#parseNavList();
        }
        if (!Array.isArray(this.navItems)) return;

        this.#renderNavList(this.navItems);
        if (this.layout == 'mobile') {
            this.#initStaticSideNavDropdown();
        }
    }

    #initStaticSideNavDropdown() {
        const dropdowns = Array.from(this.nav.getElementsByClassName('dropdown-btn'));
        dropdowns.forEach((element) => {
            element.addEventListener('click', () => {
                let bool = Util.hasClass(element, 'sidenav__item--expanded');
                Util.toggleClass(element, 'sidenav__item--expanded', !bool);
                element.setAttribute('aria-expanded', !bool);

                const sidenavLink = Util.getChildrenByClassName(
                    element.parentNode,
                    'sidenav__link',
                )[0];
                Util.toggleClass(sidenavLink, 'hover', !bool);

                const dropdownContent = Util.getChildrenByClassName(
                    element.parentNode,
                    'dropdown-container',
                )[0];
                dropdownContent.style.display = bool ? 'none' : 'block';
            });
        });
    }
}

class Sidebar extends SideNav {
    constructor(element) {
        super();
        this.element = element;
        this.triggers = document.querySelectorAll(
            '[aria-controls="' + this.element.getAttribute('id') + '"]',
        );
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.selectedTrigger = null;
        this.showClass = 'sidebar--is-visible';
        this.staticClass = 'sidebar--static';
        this.customStaticClass = '';
        this.readyClass = 'sidebar--loaded';
        this.contentReadyClass = 'sidebar-loaded:show';
        this.layout = false; // això serà 'static' o 'mobile'
        this.preventScrollEl = this.getPreventScrollEl() || false;
        Sidebar.getCustomStaticClass(this); // classes personalitzades per la versió estàtica
        this._handleEvent = this._handleEvent.bind(this);
        this.init();
    }
    init() {
        this.initSidebarResize(); // gestiona els canvis de layout -> mòbil a estàtic i viceversa
        if (this.triggers) {
            // obre la barra lateral quan es fa clic als botons trigger - només en layout 'mobile'
            for (var i = 0; i < this.triggers.length; i++) {
                this.triggers[i].addEventListener('click', (event) => {
                    event.preventDefault();
                    this.toggleSidebar(event.target);
                });
            }
        }

        // utilitza l'esdeveniment 'openSidebar' per obrir la barra lateral
        this.element.addEventListener('openSidebar', (event) => {
            this.toggleSidebar(event.detail);
        });
    }

    toggleSidebar(target) {
        this.selectedTrigger = target;
        if (Util.hasClass(this.element, this.showClass)) {
            this.closeSidebar();
            return;
        }
        this.showSidebar();
        this.initSidebarEvents();
    }

    showSidebar() {
        // només layout 'mobile'
        Util.addClass(this.element, this.showClass);
        this.getFocusableElements();
        Util.moveFocus(this.element);
        // canvia l'overflow de preventScrollEl
        if (this.preventScrollEl) this.preventScrollEl.style.overflow = 'hidden';
    }

    closeSidebar() {
        // només layout 'mobile'
        Util.removeClass(this.element, this.showClass);
        this.firstFocusable = null;
        this.lastFocusable = null;
        if (this.selectedTrigger) this.selectedTrigger.focus();
        this.element.removeAttribute('tabindex');
        //elimina listeners
        this.cancelSidebarEvents();
        // canvia l'overflow de preventScrollEl
        if (this.preventScrollEl) this.preventScrollEl.style.overflow = '';
    }

    initSidebarEvents() {
        // només layout 'mobile'
        //afegeix listeners d'esdeveniments
        this.element.addEventListener('keydown', this._handleEvent);
        this.element.addEventListener('click', this._handleEvent);
    }

    cancelSidebarEvents() {
        // només layout mòbil
        //elimina listeners d'esdeveniments
        this.element.removeEventListener('keydown', this._handleEvent);
        this.element.removeEventListener('click', this._handleEvent);
    }

    _handleEvent(event) {
        // només layout 'mobile'
        switch (event.type) {
            case 'click': {
                this.initClick(event);
                break;
            }
            case 'keydown': {
                this.initKeyDown(event);
                break;
            }
        }
    }

    initKeyDown(event) {
        // només layout 'mobile'
        if ((event.keyCode && event.keyCode == 27) || (event.key && event.key == 'Escape')) {
            //tanca la barra lateral amb 'esc'
            this.closeSidebar();
        } else if ((event.keyCode && event.keyCode == 9) || (event.key && event.key == 'Tab')) {
            //manté el focus dins la barra lateral
            this.trapFocus(event);
        }
    }

    initClick(event) {
        // només layout mòbil
        //tanca la barra lateral quan es fa clic al botó de tancar o a la capa de fons
        if (
            !event.target.closest('.js-sidebar__close-btn') &&
            !Util.hasClass(event.target, 'js-sidebar')
        )
            return;
        event.preventDefault();
        this.closeSidebar();
    }

    trapFocus(event) {
        // només layout 'mobile'
        if (this.firstFocusable == document.activeElement && event.shiftKey) {
            //amb Shift+Tab -> focus a l'últim element focusable quan el focus surt de la barra lateral
            event.preventDefault();
            this.lastFocusable.focus();
        }
        if (this.lastFocusable == document.activeElement && !event.shiftKey) {
            //amb Tab -> focus al primer element focusable quan el focus surt de la barra lateral
            event.preventDefault();
            this.firstFocusable.focus();
        }
    }

    initSidebarResize() {
        // esdeveniment personalitzat emès quan es redimensiona la finestra - només si s'ha afegit la classe sidebar--static@{breakpoint}
        var beforeContent = getComputedStyle(this.element, ':before').getPropertyValue('content');
        if (beforeContent && beforeContent != '' && beforeContent != 'none') {
            this.checkSidebarLayout();

            this.element.addEventListener('update-sidebar', () => {
                this.checkSidebarLayout();
            });
        }
        this.renderSideNav();
        // comprova si hi ha un element 'main' per mostrar
        var mainContent = document.getElementsByClassName(this.contentReadyClass);
        if (mainContent.length > 0) Util.removeClass(mainContent[0], this.contentReadyClass);
        Util.addClass(this.element, this.readyClass);
    }

    checkSidebarLayout() {
        var layout = getComputedStyle(this.element, ':before')
            .getPropertyValue('content')
            .replace(/'|"/g, '');
        if (layout == this.layout) return;
        this.layout = layout;
        // Notifica el canvi de layout
        this.element.dispatchEvent(new CustomEvent('sidebar-layout-changed', {
            detail: { layout }
        }));
        if (layout != 'static') Util.addClass(this.element, 'hide');
        Util.toggleClass(
            this.element,
            this.staticClass + this.customStaticClass,
            layout == 'static',
        );
        if (layout != 'static')
            setTimeout(() => {
                Util.removeClass(this.element, 'hide');
            });
        // reinicia el rol de l'element
        layout == 'static'
            ? this.element.removeAttribute('role', 'alertdialog')
            : this.element.setAttribute('role', 'alertdialog');
        // reinicia el comportament 'mobile'
        if (layout == 'static' && Util.hasClass(this.element, this.showClass)) this.closeSidebar();
    }

    getPreventScrollEl() {
        var scrollEl = false;
        var querySelector = this.element.getAttribute('data-sidebar-prevent-scroll') || 'body';
        if (querySelector) scrollEl = document.querySelector(querySelector);
        return scrollEl;
    }

    static getCustomStaticClass(instance) {
        var customClasses = instance.element.getAttribute('data-static-class');
        if (customClasses) instance.customStaticClass = ' ' + customClasses;
    }

    static isElementVisible(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    getFocusableElements() {
        //obté tots els elements focusable dins
        const allFocusable = this.element.querySelectorAll(Util.focusableElString());
        this.getFirstFocusable(allFocusable);
        this.getLastFocusable(allFocusable);
    }

    getFirstFocusable(elements) {
        //obté el primer element focusable visible dins la barra lateral
        for (var i = 0; i < elements.length; i++) {
            if (Sidebar.isElementVisible(elements[i])) {
                this.firstFocusable = elements[i];
                return true;
            }
        }
    }

    getLastFocusable(elements) {
        for (var i = elements.length - 1; i >= 0; i--) {
            if (Sidebar.isElementVisible(elements[i])) {
                this.lastFocusable = elements[i];
                return true;
            }
        }
    }
}

window.Sidebar = Sidebar;

document.addEventListener('DOMContentLoaded', () => {
    //inicialitza els objectes Sidebar
    const sidebarEls = Array.from(document.getElementsByClassName('js-sidebar'));
    sidebarEls.forEach(sidebarEl => {
        new Sidebar(sidebarEl);
    })
    // canvia de layout mòbil a estàtic
    const customEvent = new CustomEvent('update-sidebar');
    window.addEventListener('resize', function () {
        !window.requestAnimationFrame
            ? setTimeout(function () {
                  resetLayout();
              }, 250)
            : window.requestAnimationFrame(resetLayout);
    });

    window.requestAnimationFrame // inicialitza el layout de la barra lateral
        ? window.requestAnimationFrame(resetLayout)
        : resetLayout();

    function resetLayout() {
        sidebarEls.forEach(el => {el.dispatchEvent(customEvent)});
    }
});

