// File#: _1_side-navigation
// Usage: https://codyhouse.co/ds/components/info/side-navigation
import { tools as Util } from '@modules';
(function () {
    function initSideNav(nav) {
        nav.addEventListener('click', function (event) {
            var btn = event.target.closest('.js-sidenav__sublist-control');
            if (!btn) return;
            var listItem = btn.parentElement,
                bool = Util.hasClass(listItem, 'sidenav__item--expanded');
            btn.setAttribute('aria-expanded', !bool);
            Util.toggleClass(listItem, 'sidenav__item--expanded', !bool);
        });
    }
    const sideNavs = Array.from(document.getElementsByClassName('js-sidenav'));
    sideNavs.forEach((nav) => {
        initSideNav(nav);
    });
})();
