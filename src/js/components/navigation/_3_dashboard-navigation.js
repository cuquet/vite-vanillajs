import { tools as Util } from '@modules';

class DashboardNavigation {
    constructor() {
        //super();
        // Selecciona l'element principal de la UI de l'aplicació
        this.appUi = document.querySelector('.js-app-ui');
        if (!this.appUi) return;

        // Botó per obrir/tancar la navegació lateral en mode mòbil
        this.menuBtnNav = this.appUi.querySelector('.js-app-ui__btn-nav');
        if (!this.menuBtnNav) return;

        this.Sidebar = document.querySelector('.js-sidebar');

        // Botó per minimitzar la barra lateral
        this.btnMin = this.appUi.querySelector('.js-app-ui__btn-mim');
        //if (!this.btnMin) return;

        // Botó per passar a pantalla complerta
        this.btnFullScreen = this.appUi.querySelector('.js-app-ui__btn-fullscreen');
        //if (!this.btnFullScreen) return;

        // Classes CSS
        this.NAV_STATIC_CLASS = 'app-ui--static';
        this.NAV_EXPANDED_CLASS = 'app-ui--nav-expanded';
        this.NAV_MINIMIZED_CLASS = 'sidenav--minified';

        this.firstFocusableNavEl = null;
        this.lastFocusedBtn = null;
        this.resizeTimeout = null;

        this.init();
    }

    init() {
        // Inicialitza l'animació del botó si té cercles SVG
        this.initMenuBtnAnimation();

        this.initEvents();
        this.checkSidebarLayout();
    }

    initEvents() {
        this.menuBtnNav.addEventListener('click', this.handleMenuBtnClick.bind(this));
        if (this.Sidebar) {
            this.Sidebar.addEventListener('sidebar-layout-changed', (e) => {
                this.layout = e.detail.layout;
                console.log('sidebar-layout-changed=>', this.layout);
                this.checkSidebarLayout();
            });
        }

        if (this.btnMin) {
            this.btnMin.addEventListener('click', this.handleMinBtnClick.bind(this));
        }

        if (this.btnFullScreen) {
            this.btnFullScreen.addEventListener('click', this.handleFullBtnClick.bind(this));
        }

        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    initMenuBtnAnimation() {
        const circles = this.menuBtnNav.getElementsByTagName('circle');
        if (circles.length > 0) {
            const circle = circles[0];
            const radius = circle.getAttribute('r');
            const circumference = (2 * Math.PI * radius).toFixed(2);
            circle.setAttribute('stroke-dashoffset', circumference);
            circle.setAttribute('stroke-dasharray', circumference);
            this.menuBtnNav.classList.add('app-ui__btn-nav--ready-to-animate');
        }
    }

    static toggleFullscreen(isEntering) {
        const elem = document.documentElement;
        if (isEntering) {
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
    }

    static isElementVisible(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    checkSidebarLayout() {
        if (this.Sidebar) {
            var layout = getComputedStyle(this.Sidebar, ':before')
                .getPropertyValue('content')
                .replace(/'|"/g, '');
            if (layout != 'static') {
                Util.removeClass(this.appUi, this.NAV_MINIMIZED_CLASS);
                //Util.removeClass(this.menuBtnMinSide, 'anim-menu-btn--state-b');
            }
            Util.toggleClass(this.appUi, this.NAV_STATIC_CLASS, layout === 'static');
            this.layout = layout;
            this.updateClasses();
        }
    }

    closeNavIfHidden() {
        if (
            !DashboardNavigation.isElementVisible(this.menuBtnNav) &&
            this.appUi.classList.contains(this.NAV_EXPANDED_CLASS)
        ) {
            this.menuBtnNav.click();
        }
    }
    updateClasses() {
        const switchlangs = Array.from(document.getElementsByClassName('js-language-picker'));
        switchlangs.forEach((element) => {
            Util.toggleClass(element, 'language-picker--hide-label', this.layout != 'static');
            Util.toggleClass(element, 'language-picker--flags', this.layout == 'static');
        });
    }

    handleMenuBtnClick() {
        const shouldExpand = !this.appUi.classList.contains(this.NAV_EXPANDED_CLASS);
        this.appUi.classList.toggle(this.NAV_EXPANDED_CLASS, shouldExpand);
        this.menuBtnNav.setAttribute('aria-expanded', shouldExpand);
        // if (shouldExpand) {
        //     //this.firstFocusableNavEl = this.getFirstFocusableInNav();
        //     //if (this.firstFocusableNavEl) this.firstFocusableNavEl.focus();
        // } else if (this.lastFocusedBtn) {
        //     this.lastFocusedBtn.focus();
        //     this.lastFocusedBtn = null;
        // }
    }

    handleMinBtnClick(event) {
        event.preventDefault();
        const entering = !this.btnMin.classList.contains('min-btn--state-b');
        this.btnMin.classList.toggle('min-btn--state-b', entering);
        const icon = this.btnMin.querySelector('svg');
        icon.classList.toggle('flip-x', entering);
        this.appUi.classList.toggle(this.NAV_MINIMIZED_CLASS, entering);
    }

    handleFullBtnClick(event) {
        event.preventDefault();
        const entering = !this.btnFullScreen.classList.contains('fullscreen-btn--state-b');
        this.btnFullScreen.classList.toggle('fullscreen-btn--state-b', entering);
        const icon = this.btnFullScreen.querySelector('use');
        if (icon) icon.setAttribute('href', `#${entering ? 'compress' : 'expand'}`);
        DashboardNavigation.toggleFullscreen(entering);
    }

    handleKeyUp(event) {
        // @TODO https://www.toptal.com/developers/keycode/table
        const isEscape = event.code === 'Escape' || event.key === 'Escape';
        const isTab = event.code === 'Tab' || event.key === 'Tab';
        const navIsOpen = this.menuBtnNav.getAttribute('aria-expanded') === 'true';

        if (isEscape && navIsOpen && DashboardNavigation.isElementVisible(this.menuBtnNav)) {
            //this.lastFocusedBtn = this.menuBtnNav;
            this.menuBtnNav.click();
        }

        if (
            isTab &&
            navIsOpen &&
            DashboardNavigation.isElementVisible(this.menuBtnNav) &&
            !document.activeElement.closest('.js-app-ui__nav')
        ) {
            this.menuBtnNav.click();
        }
    }
}
window.DashboardNavigation = DashboardNavigation;
export default DashboardNavigation;

document.addEventListener('DOMContentLoaded', () => {
    new DashboardNavigation();
});
