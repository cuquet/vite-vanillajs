import { tools as Util } from '@modules';

class DashboardNavigation {
    constructor() {
        // Selecciona l'element principal de la UI de l'aplicació
        this.appUi = document.querySelector('.js-app-ui');
        if (!this.appUi) return;

        // Botó per obrir/tancar la navegació lateral en mode mòbil
        this.menuBtnNav = this.appUi.querySelector('.js-app-ui__btn-nav');
        if (!this.menuBtnNav) return;

        this.Sidebar = document.querySelector('.js-sidebar');

        // Botó per minimitzar la barra lateral
        this.btnMin = this.appUi.querySelector('.js-app-ui__btn-mim');

        // Botó per passar a pantalla complerta
        this.btnFullScreen = this.appUi.querySelector('.js-app-ui__btn-fullscreen');

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
        this.restoreMinState();
        this.checkSidebarLayout();
    }

    initEvents() {
        this.menuBtnNav.addEventListener('click', this.handleMenuBtnClick.bind(this));
        if (this.Sidebar) {
            this.Sidebar.addEventListener('sidebar-layout-changed', (e) => {
                this.layout = e.detail.layout;
                //console.log('sidebar-layout-changed=>', this.layout);
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

        document.querySelector(".js-app-ui")
            .addEventListener("sidebar:minify", e => console.log("EVENT minify:", e.detail));
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
    }

    handleMinBtnClick(event) {
        event.preventDefault();
        const entering = !this.btnMin.classList.contains('min-btn--state-b');
        this.btnMin.classList.toggle('min-btn--state-b', entering);
        this.updateMinIcon(entering);
        this.appUi.classList.toggle(this.NAV_MINIMIZED_CLASS, entering);
        this.persist("dashboard.sidebar.min", entering ? "1" : "0");
        this.appUi.dispatchEvent(new CustomEvent("sidebar:minify", {
            detail: { entering }
        }));
    }

    handleFullBtnClick(event) {
        event.preventDefault();
        const entering = !this.btnFullScreen.classList.contains('fullscreen-btn--state-b');
        this.btnFullScreen.classList.toggle('fullscreen-btn--state-b', entering);
        const icon = this.btnFullScreen.querySelector('use');
        if (icon) icon.setAttribute('href', `#${entering ? 'compress' : 'expand'}`);
        DashboardNavigation.toggleFullscreen(entering);
        this.persist("dashboard.fullscreen", entering ? "1" : "0");
        this.appUi.dispatchEvent(new CustomEvent("sidebar:fullscreen", {
            detail: { entering }
        }));
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
    updateMinIcon(isMin) {
        if (!this.btnMin) return;
        const icon = this.btnMin.querySelector('svg');
        if (icon) icon.classList.toggle('flip-x', isMin);
    }
    restoreMinState() {
        const saved = this.retrieve("dashboard.sidebar.min", "0") === "1";
        //console.log("restoreMinState:", saved);
        if (saved) {
            this.appUi.classList.add(this.NAV_MINIMIZED_CLASS);
            if (this.btnMin) {
                this.btnMin.classList.add('min-btn--state-b');
                this.updateMinIcon(true);
            }
            this.appUi.dispatchEvent(new CustomEvent("sidebar:minify", {
                detail: { entering: true }
            }));
        }
    }
    restoreFullscreen() {
        const saved = this.retrieve("dashboard.fullscreen", "0") === "1";
        //console.log("restoreFullscreen:", saved);

        if (!saved) return;

        // Actualitza botó + icona
        this.btnFullScreen?.classList.add("fullscreen-btn--state-b");
        this.btnFullScreen
            ?.querySelector("use")
            ?.setAttribute("href", "#compress");

        // Entra realment en fullscreen navegador
        DashboardNavigation.toggleFullscreen(true);

        // Notifica
        this.appUi.dispatchEvent(new CustomEvent("sidebar:fullscreen", {
            detail: { entering: true }
        }));
    }
    persist(key, value) {
        try { localStorage.setItem(key, value); } catch {}
    }

    retrieve(key, fallback = null) {
        try {
            const v = localStorage.getItem(key);
            return v !== null ? v : fallback;
        } catch {
            return fallback;
        }
    }

}
window.DashboardNavigation = DashboardNavigation;
export default DashboardNavigation;

document.addEventListener('DOMContentLoaded', () => {
    new DashboardNavigation();
});
