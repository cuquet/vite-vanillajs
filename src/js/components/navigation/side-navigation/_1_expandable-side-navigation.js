/* -------------------------------- 

File#: _1_expandable-side-navigation
Title: Expandable Side Navigation
Descr: A side navigation with expandable sub-lists and popular links
Usage: https://codyhouse.co/ds/components/info/expandable-side-navigation

-------------------------------- */
(function () {
    // Constructor de la navegació lateral expandable
    function ExpandableSideNav(element) {
        this.element = element;
        this.controls = this.element.getElementsByClassName('js-exsidenav__control');
        this.index = 0;
        this.initControls();
        this.initEvents();
    }

    // Inicialitza els atributs aria-controls i aria-expanded
    ExpandableSideNav.prototype.initControls = function () {
        // Genera un prefix d'id aleatori per a aquesta instància de navegació
        var idPrefix = 'exsidenav-' + Math.floor(Math.random() * 1000);

        for (var i = 0; i < this.controls.length; i++) {
            var control = this.controls[i];
            var panel = control.nextElementSibling;
            var panelId = panel.getAttribute('id');

            // Si el panell no té id, assigna'n un
            if (!panelId) {
                panelId = idPrefix + '-' + this.index;
                panel.setAttribute('id', panelId);
            }

            this.index += 1;

            // Enllaça el control amb el panell
            control.setAttribute('aria-controls', panelId);

            // Assegura que aria-expanded està definit
            if (!control.hasAttribute('aria-expanded')) {
                control.setAttribute('aria-expanded', 'false');
            }
        }
    };

    // Gestiona els esdeveniments de clic per expandir/collapsar els panells
    ExpandableSideNav.prototype.initEvents = function () {
        
        this.element.addEventListener('click', function (event) {
            var control = event.target.closest('.js-exsidenav__control');
            if (!control) return;

            var expanded = control.getAttribute('aria-expanded') === 'true';
            control.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
    };

    // Inicialitza totes les navegacions laterals expandibles de la pàgina
    const navElements = Array.from(document.getElementsByClassName('js-exsidenav'));
    navElements.forEach(navElement =>{
        new ExpandableSideNav(navElement);
    })
    // Exposa el constructor a l'àmbit global
    window.Exsidenav = ExpandableSideNav;
})();
