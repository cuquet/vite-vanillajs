/* -------------------------------- 

File#: _1_fullscreen-btn
Title: Fullscreen Button
Descr: toggle fullscreen browser mode.
Usage: 
-------------------------------- */

(function() {
    const btns = document.querySelectorAll('.js-fullscreen-btn');
    const elem = document.documentElement;

    function toggleFullscreen(isEntering) {
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

    btns.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const entering = !btn.classList.contains('fullscreen-btn--state-b');
            btn.classList.toggle('fullscreen-btn--state-b', entering);
            const icon = btn.querySelector('use');
            if (icon) icon.setAttribute('href', `#${entering ? 'compress' : 'expand'}`);
            toggleFullscreen(entering);
        });
    });
}());
