/* -------------------------------- 
File#: _1_responsive-sidebar
Usage: https://codyhouse.co/ds/components/info/responsive-sidebar
Refactoritzat amb ajut del ChatGPT
-------------------------------- */

import { tools as Util } from '@modules';

class SideNav {
    nav = null;
    navItems = [];
    layout = 'mobile'; // 'mobile' | 'static'
    customClasses = null; // opcional per sobreescriure classes

    constructor(root = document) {
        // no fem querySelector aquí — renderSideNav() ho farà quan s'invoca
        this.root = root;
    }

    // util
    static getByTagName(el, tagName) {
        return Array.from(el.getElementsByTagName(tagName));
    }

    // ------------ parsing del DOM original en estructura JS ----------------
    #parseNavList() {
        if (!this.nav) return [];
        const ul = this.nav.querySelector('ul');
        if (!ul) return [];

        const parseList = (listEl) => {
            const items = [];
            for (const li of Array.from(listEl.children)) {
                // etiqueta label -> primer fill <span>
                const firstChild = li.firstElementChild;
                if (firstChild && firstChild.tagName === 'SPAN') {
                    items.push({ node: li, type: 'label', text: firstChild.innerHTML });
                    continue;
                }

                // divisor (sense fills)
                if (!li.hasChildNodes()) {
                    items.push({ node: li, type: 'divider' });
                    continue;
                }

                // link item
                const link = li.querySelector('a');
                if (!link) continue;

                const spans = SideNav.getByTagName(link, 'SPAN');
                const text = spans[0]?.innerHTML ?? null;
                const counter = spans[1]?.textContent ?? null;
                const use = link.querySelector('use');
                const icon = use ? use.getAttribute('href') : (link.querySelector('svg') || null);
                const url = link.getAttribute('href');
                const current = ['page', 'true'].includes(link.getAttribute('aria-current'));
                const subUl = li.querySelector('ul, .dropdown__menu, .dropdown-container');
                let sub = undefined;
                if (subUl) sub = parseList(subUl);

                items.push({ node: li, type: 'link', text, url, icon, current, counter, ...(sub ? { sub } : {}) });
            }
            return items;
        };

        return parseList(ul);
    }

    // ------------ renderització (recrea classes + estructura depenent layout) ------------
    #renderNavList(list, isSub = false) {
        if (!Array.isArray(list)) return;

        const layoutType = this.layout === 'static' ? 'static' : 'mobile';

        const defaults = {
            mobile: {
                ITEM_CLASS: 'sidenav__item',
                LINK_CLASS: 'sidenav__link',
                LABEL_CLASS: 'sidenav__label',
                LABEL_CLASS_SUB: 'sidenav__label font-italic',
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
                LINK_CLASS: 'sidenav__link',
                ITEM_CLASS_xSUB: 'sidenav__item dropdown__wrapper',
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

        const classes = Util.extend({}, defaults[layoutType], this.customClasses || {});

        // recorrem items
        for (let idx = 0; idx < list.length; idx++) {
            const item = list[idx];
            const li = item.node;

            // netegem elements anteriors potencials (evita duplicitats quan re-renderitzem)
            const garbage = li.querySelectorAll('.dropdown__trigger-icon, .dropdown-btn, .sidenav__tooltip');
            garbage.forEach((g) => g.remove());

            // assegura que el contenidor tingui classes correctes
            if (idx === 0) {
                const parent = li.parentNode;
                parent.className = parent.className || '';
                if (isSub) {
                    Util.addClass(parent, classes.SUB_CONTAINER_CLASS);
                    parent.setAttribute('aria-label', 'submenu');
                } else if (this.layout === 'static') {
                    Util.addClass(parent, 'dropdown js-dropdown');
                }
            }

            switch (item.type) {
                case 'label':
                    li.className = isSub ? classes.LABEL_CLASS_SUB : classes.LABEL_CLASS;
                    li.innerHTML = isSub ? `${item.text}` : `<span class="text-sm color-contrast-medium text-xs@md">${item.text}</span>`;
                    break;

                case 'divider':
                    li.className = classes.DIVIDER_CLASS;
                    li.setAttribute('role', 'presentation');
                    break;

                case 'link':
                default: {
                    li.className = classes.ITEM_CLASS;
                    const link = li.querySelector('a');
                    if (!link) break;

                    link.className = isSub ? classes.LINK_CLASS : classes.LINK_CLASS;
                    link.removeAttribute('aria-expanded');

                    const svg = link.querySelector('svg');
                    if (svg) {
                        Util.addClass(svg, 'icon sidenav__icon');
                        svg.setAttribute('aria-hidden', 'true');
                    }

                    const spans = SideNav.getByTagName(link, 'SPAN');
                    if (item.text && spans[0]) spans[0].className = isSub ? classes.TEXT_CLASS_SUB : classes.TEXT_CLASS;
                    if (item.counter && spans[1]) {
                        spans[1].className = classes.COUNTER_CLASS;
                        spans[1].innerHTML += `<i class="sr-only">notifications</i>`;
                    }

                    // tooltip (només en static i sense sub)
                    if (this.layout === 'static' && !isSub && !Array.isArray(item.sub) && item.text) {
                        const tt = document.createElement('span');
                        tt.className = classes.TOOLTIP_CLASS;
                        tt.innerHTML = item.text;
                        link.appendChild(tt);
                    }

                    // submenus
                    if (item.sub && Array.isArray(item.sub)) {
                        li.className = isSub ? (classes.ITEM_CLASS_SUB_xSUB || classes.ITEM_CLASS) : (classes.ITEM_CLASS_xSUB || classes.ITEM_CLASS);
                        link.className = isSub ? (classes.LINK_CLASS_SUB_xSUB || classes.LINK_CLASS) : (classes.LINK_CLASS_xSUB || classes.LINK_CLASS);

                        let subUl = li.querySelector('ul');
                        if (!subUl) {
                            // crea sub container si no existeix (fallback)
                            subUl = document.createElement('ul');
                            li.appendChild(subUl);
                        }

                        if (this.layout === 'static') {
                            const ulId = Util.getNewId(6);
                            subUl.id = `dropdown-menu-${ulId}`;
                            link.setAttribute('aria-expanded', 'false');
                            link.setAttribute('aria-controls', subUl.id);
                            link.id = `dropdown-trigger-${ulId}`;
                            subUl.setAttribute('aria-labelledby', link.id);

                            // afegeix icona trigger
                            link.insertAdjacentHTML('beforeend', `<svg class="${classes.BTN_CLASS} icon" aria-hidden="true" viewBox="0 0 12 12"><polyline stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" points="3.5 0.5 9.5 6 3.5 11.5"></polyline></svg>`);
                        } else {
                            // mobile: inserta botó abans del sub-ul
                            const subBtn = document.createElement('button');
                            subBtn.className = classes.BTN_CLASS;
                            subBtn.setAttribute('aria-haspopup', 'true');
                            subBtn.setAttribute('aria-expanded', 'false');
                            subBtn.type = 'button';
                            subBtn.innerHTML = `<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><g class="icon__group" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3 3l10 10"></path><path d="M13 3L3 13"></path></g></svg>`;

                            subUl.insertAdjacentElement('beforebegin', subBtn);

                            // event per toggle del botó (delegat després a init)
                            subBtn.addEventListener('click', () => {
                                const expanded = subBtn.getAttribute('aria-expanded') === 'true';
                                subBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                                const content = subUl;
                                content.style.display = expanded ? 'none' : 'block';
                            });
                        }

                        // renderitzem el sub nivell recursivament
                        this.#renderNavList(item.sub, true);
                    }

                    break;
                }
            }
        }
    }

    // inicialitza la renderització (busquem .js-sidenav a document i apliquem)
    renderSideNav(root = document) {
        this.nav = root.querySelector('.js-sidenav') || null;
        if (!this.nav) return;
        if (this.navItems.length < 1) this.navItems = this.#parseNavList();
        if (!Array.isArray(this.navItems)) return;

        this.#renderNavList(this.navItems);

        // si estem en mode mobile: inicialitza dropdowns (per click)
        if (this.layout === 'mobile') this.#initStaticSideNavDropdown();
    }

    #initStaticSideNavDropdown() {
        const dropdowns = Array.from(this.nav.getElementsByClassName('dropdown-btn'));
        dropdowns.forEach((btn) => {
            if (btn.__inited) return;
            btn.__inited = true;
            btn.addEventListener('click', () => {
                const expanded = Util.hasClass(btn, 'sidenav__item--expanded');
                Util.toggleClass(btn, 'sidenav__item--expanded', !expanded);
                btn.setAttribute('aria-expanded', (!expanded).toString());

                const parent = btn.parentNode;
                const sidenavLink = Util.getChildrenByClassName(parent, 'sidenav__link')[0];
                Util.toggleClass(sidenavLink, 'hover', !expanded);

                const dropdownContent = Util.getChildrenByClassName(parent, 'dropdown-container')[0];
                if (dropdownContent) dropdownContent.style.display = expanded ? 'none' : 'block';
            });
        });
    }
}

class Sidebar extends SideNav {
    constructor(element) {
        super();
        if (!element) throw new Error('Sidebar: element is required');
        this.element = element;
        this.triggers = document.querySelectorAll(`[aria-controls="${this.element.getAttribute('id')}"]`);
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.selectedTrigger = null;
        this.showClass = 'sidebar--is-visible';
        this.staticClass = 'sidebar--static';
        this.customStaticClass = '';
        this.readyClass = 'sidebar--loaded';
        this.contentReadyClass = 'sidebar-loaded:show';
        this.layout = false; // 'static' | 'mobile'
        this.preventScrollEl = this.getPreventScrollEl() || false;
        Sidebar.getCustomStaticClass(this);
        this._handleEvent = this._handleEvent.bind(this);
        // deleguem la renderSideNav perquè utilitzi l'element concret
        this.renderSideNav = (root = this.element) => super.renderSideNav(root);
        this.init();
    }

    init() {
        this.initSidebarResize();

        // triggers (només existeixen si mobile)
        this.triggers.forEach((t) => t.addEventListener('click', (ev) => { ev.preventDefault(); this.toggleSidebar(ev.currentTarget); }));

        this.element.addEventListener('openSidebar', (ev) => { this.toggleSidebar(ev.detail); });
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
        Util.addClass(this.element, this.showClass);
        this.getFocusableElements();
        Util.moveFocus(this.element);
        if (this.preventScrollEl) this.preventScrollEl.style.overflow = 'hidden';
    }

    closeSidebar() {
        Util.removeClass(this.element, this.showClass);
        this.firstFocusable = null;
        this.lastFocusable = null;
        if (this.selectedTrigger) this.selectedTrigger.focus();
        this.element.removeAttribute('tabindex');
        this.cancelSidebarEvents();
        if (this.preventScrollEl) this.preventScrollEl.style.overflow = '';
    }

    initSidebarEvents() {
        this.element.addEventListener('keydown', this._handleEvent);
        this.element.addEventListener('click', this._handleEvent);
    }

    cancelSidebarEvents() {
        this.element.removeEventListener('keydown', this._handleEvent);
        this.element.removeEventListener('click', this._handleEvent);
    }

    _handleEvent(event) {
        switch (event.type) {
            case 'click': this.initClick(event); break;
            case 'keydown': this.initKeyDown(event); break;
        }
    }

    initKeyDown(event) {
        if ((event.keyCode && event.keyCode == 27) || (event.key && event.key == 'Escape')) {
            this.closeSidebar();
        } else if ((event.keyCode && event.keyCode == 9) || (event.key && event.key == 'Tab')) {
            this.trapFocus(event);
        }
    }

    initClick(event) {
        // tanca si el click és al close btn o a la overlay
        if (!event.target.closest('.js-sidebar__close-btn') && !Util.hasClass(event.target, 'js-sidebar')) return;
        event.preventDefault();
        this.closeSidebar();
    }

    trapFocus(event) {
        if (this.firstFocusable == document.activeElement && event.shiftKey) {
            event.preventDefault();
            this.lastFocusable.focus();
        }
        if (this.lastFocusable == document.activeElement && !event.shiftKey) {
            event.preventDefault();
            this.firstFocusable.focus();
        }
    }

    initSidebarResize() {
        const beforeContent = getComputedStyle(this.element, ':before').getPropertyValue('content');
        if (beforeContent && beforeContent !== '' && beforeContent !== 'none') {
            this.checkSidebarLayout();
            this.element.addEventListener('update-sidebar', () => this.checkSidebarLayout());
        }

        // renderitza la side nav interna
        this.renderSideNav(this.element);

        // marcar ready
        const mainContent = document.getElementsByClassName(this.contentReadyClass);
        if (mainContent.length > 0) Util.removeClass(mainContent[0], this.contentReadyClass);
        Util.addClass(this.element, this.readyClass);
    }

    checkSidebarLayout() {
        const layout = getComputedStyle(this.element, ':before').getPropertyValue('content').replace(/'|"/g, '');
        if (layout === this.layout) return;
        this.layout = layout;
        this.element.dispatchEvent(new CustomEvent('sidebar-layout-changed', { detail: { layout } }));

        if (layout !== 'static') Util.addClass(this.element, 'hide');

        Util.toggleClass(this.element, this.staticClass + this.customStaticClass, layout === 'static');

        if (layout !== 'static') setTimeout(() => Util.removeClass(this.element, 'hide'));

        if (layout === 'static') this.element.removeAttribute('role'); else this.element.setAttribute('role', 'alertdialog');

        if (layout === 'static' && Util.hasClass(this.element, this.showClass)) this.closeSidebar();

        // quan canvia layout, re-renderitza la side nav per ajustar triggers/submenus
        this.renderSideNav(this.element);
    }

    getPreventScrollEl() {
        const querySelector = this.element.getAttribute('data-sidebar-prevent-scroll') || 'body';
        return querySelector ? document.querySelector(querySelector) : false;
    }

    static getCustomStaticClass(instance) {
        const custom = instance.element.getAttribute('data-static-class');
        if (custom) instance.customStaticClass = ' ' + custom;
    }

    static isElementVisible(el) {
        return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
    }

    getFocusableElements() {
        const all = this.element.querySelectorAll(Util.focusableElString());
        this.getFirstFocusable(all);
        this.getLastFocusable(all);
    }

    getFirstFocusable(elements) {
        for (let i = 0; i < elements.length; i++) {
            if (Sidebar.isElementVisible(elements[i])) {
                this.firstFocusable = elements[i];
                return true;
            }
        }
    }

    getLastFocusable(elements) {
        for (let i = elements.length - 1; i >= 0; i--) {
            if (Sidebar.isElementVisible(elements[i])) {
                this.lastFocusable = elements[i];
                return true;
            }
        }
    }
}

if (typeof window !== 'undefined') {
    if (!window.Sidebar) window.Sidebar = Sidebar;
}

function initSidebar(context = document) {
    const sidebarEls = Array.from(context.querySelectorAll('.js-sidebar'));
    sidebarEls.forEach((el) => {
        if (!el.__sidebarInstance) {
            el.__sidebarInstance = new Sidebar(el);
        }
    });

    const customEvent = new CustomEvent('update-sidebar');

    function resetLayout() {
        sidebarEls.forEach((el) => el.dispatchEvent(customEvent));
    }

    window.addEventListener('resize', () => {
        if (!window.requestAnimationFrame) setTimeout(resetLayout, 250);
        else window.requestAnimationFrame(resetLayout);
    });

    if (window.requestAnimationFrame) window.requestAnimationFrame(resetLayout);
    else resetLayout();
}

export { Sidebar, initSidebar };
