/* -------------------------------- 

File#: _2_flexi-header
Title: Flexi Header
Descr: Customizable header template.
Usage: https://codyhouse.co/ds/components/info/flexi-header
Dependencies: 
    _1_anim-menu-btn
    Search Input
-------------------------------- */
import { tools as Util } from '@modules';

class FlexiHeader {
    constructor() {
        this.header = document.querySelector('.js-f-header');
        if (!this.header) return;

        this.menuButton = this.header.querySelector('.js-anim-menu-btn');
        this.firstFocusableElement = this.getFirstFocusableElement();
        this.lastFocusedElement = null;

        this.initDropdownControls();
        this.initEvents();
        this.updateHeaderOffset();

        let resizeTimeout = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 500);
        });
    }

    getFirstFocusableElement() {
        const focusableSelectors = Util.focusableElString();
        const focusableElements = this.header
            .querySelector('.f-header__nav')
            .querySelectorAll(focusableSelectors);
        return (
            Array.from(focusableElements).find(
                (el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length,
            ) || null
        );
    }

    initDropdownControls() {
        const dropdownControls = this.header.querySelectorAll('.js-f-header__dropdown-control');
        dropdownControls.forEach((control, index) => {
            const dropdownId = control.nextElementSibling.id || `f-header-dropdown-${index}`;
            control.nextElementSibling.id = dropdownId;
            control.setAttribute('aria-controls', dropdownId);
        });
    }

    initEvents() {
        this.menuButton.addEventListener('anim-menu-btn-clicked', (e) =>
            this.handleMenuButtonClick(e),
        );
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.header.addEventListener('click', (e) => this.handleDropdownClick(e));
        this.header.addEventListener('mouseout', (e) => this.handleDropdownMouseOut(e));
        this.header.addEventListener('focusin', (e) => this.handleFocusIn(e));
    }

    handleMenuButtonClick(event) {
        const isExpanded = event.detail;
        const nav = this.header.querySelector('.f-header__nav');

        nav.classList.toggle('f-header__nav--is-visible', isExpanded);
        this.header.classList.toggle('f-header--expanded', isExpanded);
        this.menuButton.setAttribute('aria-expanded', isExpanded);

        if (isExpanded) {
            this.firstFocusableElement?.focus();
        } else if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
            this.lastFocusedElement = null;
        }
    }

    handleKeyUp(event) {
        // @TODO https://www.toptal.com/developers/keycode/table
        const isEscape = event.code === 'Escape' || event.key === 'Escape';
        const isTab = event.code === 'Tab' || event.key === 'Tab';

        if (isEscape && this.menuButton.getAttribute('aria-expanded') === 'true') {
            this.lastFocusedElement = this.menuButton;
            this.menuButton.click();
        }

        if (
            isTab &&
            this.menuButton.getAttribute('aria-expanded') === 'true' &&
            !document.activeElement.closest('.js-f-header')
        ) {
            this.menuButton.click();
        }
    }

    handleDropdownClick(event) {
        const control = event.target.closest('.js-f-header__dropdown-control');
        if (control) {
            const isExpanded = control.getAttribute('aria-expanded') === 'true';
            control.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        }
    }

    handleDropdownMouseOut(event) {
        const control = event.target.closest('.js-f-header__dropdown-control');
        if (control && this.getDeviceType() !== 'mobile') {
            control.removeAttribute('aria-expanded');
        }
    }

    handleFocusIn(event) {
        const control = event.target.closest('.js-f-header__dropdown-control');
        if (
            !event.target.closest('.f-header__dropdown') &&
            !(control && control.hasAttribute('aria-expanded')) &&
            this.getDeviceType() !== 'mobile'
        ) {
            const expandedControl = this.header.querySelector(
                '.js-f-header__dropdown-control[aria-expanded="true"]',
            );
            expandedControl?.removeAttribute('aria-expanded');
        }
    }

    handleResize() {
        if (
            !this.isElementVisible(this.menuButton) &&
            this.header.classList.contains('f-header--expanded')
        ) {
            this.menuButton.click();
        }
        this.updateHeaderOffset();
    }

    updateHeaderOffset() {
        document.documentElement.style.setProperty(
            '--f-header-offset',
            `${this.header.getBoundingClientRect().top}px`,
        );
    }

    isElementVisible(element) {
        return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    }

    getDeviceType() {
        return getComputedStyle(this.header, ':before')
            .getPropertyValue('content')
            .replace(/['"]/g, '');
    }
}

function initFlexiHeader(context = document) {
    /*
    | Cas                                         | Recomanació                             |
    | ------------------------------------------- | ----------------------------------------|
    | Components **lleugers o visuals**           | `dataset.*` ✅ (més semàntic, visible)  |
    | Components **modulars o amb lògica pròpia** | `__instance` ✅ (més eficient i flexible) |
    */
    const elements = context.querySelectorAll('.js-f-header');
    elements.forEach((header) => {
        // Evita duplicar instàncies
        if (header.__flexiInstance) return;

        // Inicialitza una nova instància
        const instance = new FlexiHeader();

        // Marca l'element per evitar reinit
        header.__flexiInstance = instance;
    });
}

export { FlexiHeader, initFlexiHeader };
