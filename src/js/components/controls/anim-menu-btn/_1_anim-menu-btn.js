/* -------------------------------- 

File#: _1_anim-menu-btn
Title: Animated Menu Button
Descr: Custom Select with advanced structure options.
Usage: https://codyhouse.co/ds/components/info/animated-menu-button
-------------------------------- */

(function() {
    const animMenuBtns = Array.from(document.getElementsByClassName('js-anim-menu-btn'));
    animMenuBtns.forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const e = !element.classList.contains('anim-menu-btn--state-b');
            element.classList.toggle('anim-menu-btn--state-b', e);
            event = new CustomEvent('anim-menu-btn-clicked', {
                detail: e
            });
            element.dispatchEvent(event);
        });
    });
}());
