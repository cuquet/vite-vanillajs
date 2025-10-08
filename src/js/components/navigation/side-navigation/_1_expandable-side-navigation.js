/* -------------------------------- 
File#: _1_expandable-side-navigation
Title: Expandable Side Navigation
Descr: A side navigation with expandable sub-lists and popular links
Usage: https://codyhouse.co/ds/components/info/expandable-side-navigation
-------------------------------- */

class ExpandableSideNav {
    constructor(element) {
        this.element = element;
        this.controls = element.querySelectorAll('.js-exsidenav__control');
        this.index = 0;

        this.initControls();
        this.initEvents();
    }

    // Inicialitza els atributs aria-controls i aria-expanded
    initControls() {
        const idPrefix = `exsidenav-${Math.floor(Math.random() * 1000)}`;

        this.controls.forEach((control) => {
            const panel = control.nextElementSibling;
            let panelId = panel?.id;

            if (!panelId) {
                panelId = `${idPrefix}-${this.index++}`;
                panel.id = panelId;
            }

            control.setAttribute('aria-controls', panelId);

            if (!control.hasAttribute('aria-expanded')) {
                control.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Gestiona els clics per expandir/collapsar
    initEvents() {
        this.element.addEventListener('click', (e) => {
            const control = e.target.closest('.js-exsidenav__control');
            if (!control) return;

            const expanded = control.getAttribute('aria-expanded') === 'true';
            control.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
    }

    // Inicialitza totes les navegacions de la pàgina
    static initAll(context = document) {
        const navElements = context.querySelectorAll('.js-exsidenav');
        navElements.forEach((el) => {
            if (!el.__exsidenavInstance) {
                el.__exsidenavInstance = new ExpandableSideNav(el);
            }
        });
    }
}

// // ✅ O inicialitza automàticament si ho vols global (com l'antic)
// document.addEventListener('DOMContentLoaded', () => {
//     ExpandableSideNav.initAll();
// });

function initExpandableSideNav(context = document) {
    const navElements = context.querySelectorAll('.js-exsidenav');
    navElements.forEach((el) => {
        if (!el.__exsidenavInstance) {
            el.__exsidenavInstance = new ExpandableSideNav(el);
        }
    });
}

// ✅ Export per a mòduls ESM
export { ExpandableSideNav, initExpandableSideNav };