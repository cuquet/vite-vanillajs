/* -------------------------------- 

File#: _1_alert
Title: Alert
Descr: Feedback message
Usage: https://codyhouse.co/ds/components/info/alert

-------------------------------- */
export class Alert {
    constructor(element) {
        this.element = element;
        this.closeBtn = this.element.querySelector('.js-alert__close-btn');
        this.init();
    }

    init() {
        if (!this.closeBtn) return;
        this.closeBtn.addEventListener('click', (event) => {
            event.preventDefault();
            this.element.classList.remove('alert--is-visible');
        });
    }
}

export function initAlert(context = document) {
    const elements = context.querySelectorAll('.js-alert');
    elements.forEach((el) => {
        if (!el.dataset.alertInitialized) {
            new Alert(el);
            el.dataset.alertInitialized = 'true';
        }
    });
}
