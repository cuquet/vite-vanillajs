/* -------------------------------- 

File#: _1_flash-message
Title: Flash Message
Descr: Modeless, non-interactive message to alert the user of a status change.
Usage: https://codyhouse.co/ds/components/info/flash-messages

-------------------------------- */

//import { tools as Util } from '@modules';

export class FlashMessage {
    constructor(element) {
        this.element = element;
        this.showClass = 'flash-message--is-visible';
        this.messageDuration = parseInt(this.element.getAttribute('data-duration')) || 3000;
        this.triggers = document.querySelectorAll(
            `[aria-controls="${this.element.getAttribute('id')}"]`,
        );
        this.timeoutId = null;
        this.isVisible = false;
        this.initFlashMessage();
    }

    initFlashMessage() {
        if (this.triggers) {
            this.triggers.forEach((trigger) => {
                trigger.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.showFlashMessage();
                });
            });
        }
        this.element.addEventListener('showFlashMessage', () => {
            this.showFlashMessage();
        });
    }

    showFlashMessage() {
        this.element.classList.add(this.showClass);
        this.isVisible = true;
        this.hideOtherFlashMessages();
        if (this.messageDuration > 0) {
            this.timeoutId = setTimeout(() => {
                this.hideFlashMessage();
            }, this.messageDuration);
        }
    }

    hideFlashMessage() {
        this.element.classList.remove(this.showClass);
        this.isVisible = false;
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }

    hideOtherFlashMessages() {
        const event = new CustomEvent('flashMessageShown', {
            detail: this.element,
        });
        window.dispatchEvent(event);
    }

    checkFlashMessage(element) {
        if (this.isVisible && this.element !== element) {
            this.hideFlashMessage();
        }
    }
}

export function initFlashMessage(context = document) {
    const flashMessages = context.querySelectorAll('.js-flash-message');

    const instances = Array.from(flashMessages)
        .map((el) => {
            if (!el.dataset.flashMessageInitialized) {
                el.dataset.flashMessageInitialized = 'true';
                return new FlashMessage(el);
            }
            return null;
        })
        .filter(Boolean);

    // 🔒 Evitem múltiples listeners globals
    if (!window._flashMessageListenerAdded) {
        window.addEventListener('flashMessageShown', (event) => {
            instances.forEach((instance) => {
                instance.checkFlashMessage(event.detail);
            });
        });
        window._flashMessageListenerAdded = true;
    }
}
