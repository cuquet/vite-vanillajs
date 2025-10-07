/* -------------------------------- 

File#: _1_sub-navigation
Title: Sub Navigation
Descr: Secondary navigation template.
Usage: https://codyhouse.co/ds/components/info/sub-navigation

-------------------------------- */
import { tools as Util } from '@modules';

class SubNavigation {
    constructor(element) {
        this.element = element;
        this.control = this.element.getElementsByClassName('js-subnav__control');
        this.navList = this.element.getElementsByClassName('js-subnav__wrapper');
        this.closeBtn = this.element.getElementsByClassName('js-subnav__close-btn');
        this.firstFocusable = this.getFirstFocusable();
        this.showClass = 'subnav__wrapper--is-visible';
        this.collapsedLayoutClass = 'subnav--collapsed';
        this.selectedTrigger = null;
        this.init();
        this.initEvents();
        this.initGlobalEvents();
    }

    getFirstFocusable() {
        if (this.navList.length === 0) return null;
        const focusableElements = this.navList[0].querySelectorAll(Util.focusableElString(),
        );
        for (let element of focusableElements) {
            if (element.offsetWidth || element.offsetHeight || element.getClientRects().length) {
                return element;
            }
        }
        return null;
    }

    init() {
        this.updateSubNav();
        if (this.control.length > 0 && this.navList.length > 0) {
            this.control[0].addEventListener('click', (event) => this.openNav(event));
            this.element.addEventListener('click', (event) => this.closeNav(event));
        }
    }

    initEvents() {
        this.element.addEventListener('update-sidenav', () => this.updateSubNav());
    }

    initGlobalEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(
                this.element.dispatchEvent(new CustomEvent('update-sidenav')),
                300,
            );
        });
        window.addEventListener('keyup', (event) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                this.toggleNav(event);
            }
            if (event.key === 'Tab' && !document.activeElement.closest('.js-subnav__wrapper')) {
                this.toggleNav(event, true);
            }
        });
        window.requestAnimationFrame
        ? window.requestAnimationFrame(()=>this.element.dispatchEvent(new CustomEvent('update-sidenav')))
        : this.element.dispatchEvent(new CustomEvent('update-sidenav'));
    }

    openNav(event) {
        event.preventDefault();
        this.selectedTrigger = event.target;
        this.selectedTrigger.setAttribute('aria-expanded', 'true');
        Util.addClass(this.navList[0], this.showClass);
        this.navList[0].addEventListener(
            'transitionend',
            () => {
                this.firstFocusable.focus();
            },
            { once: true },
        );
    }

    closeNav(event) {
        if (
            event.target.closest('.js-subnav__close-btn') ||
            Util.hasClass(event.target, 'js-subnav__wrapper')
        ) {
            this.toggleNav(event);
        }
    }

    toggleNav(event, focusTrigger = false) {
        if (Util.hasClass(this.navList[0], this.showClass)) {
            event && event.preventDefault();
            Util.removeClass(this.navList[0], this.showClass);
            if (this.selectedTrigger) {
                this.selectedTrigger.setAttribute('aria-expanded', 'false');
                if (!focusTrigger) this.selectedTrigger.focus();
                this.selectedTrigger = null;
            }
        }
    }

    updateSubNav() {
        const layout = getComputedStyle(this.element, ':before')
            .getPropertyValue('content')
            .replace(/'|"/g, '');
        if (layout === 'expanded' || layout === 'collapsed') {
            Util.toggleClass(this.element, this.collapsedLayoutClass, layout !== 'expanded');
        }
    }
}

function initSubNavigation(context = document) {
    const elements = context.querySelectorAll('.js-subnav');
    elements.forEach(el => {
        if (!el.dataset.subNavigationInitialized) {
            const content = getComputedStyle(el, ':before').getPropertyValue('content');
            if (content && content !== '' && content !== 'none') {
                new SubNavigation(el);
                el.dataset.subNavigationInitialized = 'true';
            }
        }
    });
}

export { SubNavigation, initSubNavigation };