/* -------------------------------- 
File#: _2_modal-video
Title: Modal Video
Descr: A modal window used to display a responsive video
Usage: https://codyhouse.co/ds/components/info/modal-video
Dependencies:
    _1_modal-window (Modal Window)
-------------------------------- */

import './_1_modal-window';

class ModalVideo {
    constructor(element) {
        this.element = element;
        this.media = this.element.querySelector('.js-modal-video__media');
        this.contentIsIframe = this.media?.tagName?.toLowerCase() === 'iframe';
        this.modalIsOpen = false;
        this.init();
    }

    init() {
        this.addLoadListener();

        this.element.addEventListener('modalIsOpen', (e) => {
            this.modalIsOpen = true;
            const trigger = e.detail?.closest?.('[aria-controls]');
            const videoUrl = trigger?.getAttribute('data-url');

            if (videoUrl) {
                this.media.setAttribute('src', videoUrl);
            }
        });

        this.element.addEventListener('modalIsClose', () => {
            this.modalIsOpen = false;
            this.element.classList.add('modal--is-loading');
            this.media.setAttribute('src', '');
        });
    }

    addLoadListener() {
        if (!this.media) return;

        if (this.contentIsIframe) {
            this.media.onload = () => this.revealContent();
        } else {
            this.media.addEventListener('loadedmetadata', () => this.revealContent());
        }
    }

    revealContent() {
        if (this.modalIsOpen) {
            this.element.classList.remove('modal--is-loading');

            if (!this.element.hasAttribute('data-modal-first-focus')) {
                if (this.contentIsIframe) {
                    this.media.contentWindow?.focus();
                } else {
                    this.media.focus();
                }
            }
        }
    }
}

if (typeof window !== 'undefined') {
    window.ModalVideo = ModalVideo;
}

// ✅ inicialitzador usable per `initComponents`
function initModalVideo(context = document) {
    const videoModals = context.querySelectorAll('.js-modal-video__media');
    videoModals.forEach((mediaEl) => {
        const modalEl = mediaEl.closest('.js-modal');
        if (!modalEl || modalEl.dataset.modalVideoInitialized) return;

        new ModalVideo(modalEl);
        modalEl.dataset.modalVideoInitialized = 'true';
    });
}

export { ModalVideo, initModalVideo };

