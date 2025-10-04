/* -------------------------------- 

File#: _1_alert
Title: Alert
Descr: Feedback message
Usage: https://codyhouse.co/ds/components/info/alert

-------------------------------- */
(function () {
    var alertClose = document.getElementsByClassName('js-alert__close-btn');
    if (alertClose.length > 0) {
        [...alertClose].forEach((element) => {
            element.addEventListener('click', function (event) {
                event.preventDefault();
                element.closest('.js-alert').classList.remove('alert--is-visible');
            });
        });
    }
})();

