/* -------------------------------- 

File#: _2_modal-video
Title: Modal Video
Descr: A modal window used to display a responsive video
Usage: https://codyhouse.co/ds/components/info/modal-video
Dependencies
    _1_modal-window (Modal Window)
-------------------------------- */

import './_1_modal-window';

class ModalVideo {
    constructor(element) {
        this.element = element;
        this.media = this.element.getElementsByClassName('js-modal-video__media')[0];
        this.contentIsIframe = this.media.tagName.toLowerCase() === 'iframe';
        this.modalIsOpen = false;
        this.init();
    }

    init() {
        this.addLoadListener();
        this.element.addEventListener('modalIsOpen', (e) => {
            this.modalIsOpen = true;
            this.media.setAttribute(
                'src',
                e.detail.closest('[aria-controls]').getAttribute('data-url'),
            );
        });
        this.element.addEventListener('modalIsClose', () => {
            this.modalIsOpen = false;
            this.element.classList.add('modal--is-loading');
            this.media.setAttribute('src', '');
        });
    }

    addLoadListener() {
        if (this.contentIsIframe) {
            this.media.onload = () => {
                this.revealContent();
            };
        } else {
            this.media.addEventListener('loadedmetadata', () => {
                this.revealContent();
            });
        }
    }

    revealContent() {
        if (this.modalIsOpen) {
            this.element.classList.remove('modal--is-loading');
            if (!this.element.getAttribute('data-modal-first-focus')) {
                if (this.contentIsIframe) {
                    this.media.contentWindow.focus();
                } else {
                    this.media.focus();
                }
            }
        }
    }
}

export default ModalVideo;

document.addEventListener('DOMContentLoaded', () => {
    const videoModals = Array.from(document.getElementsByClassName('js-modal-video__media'));
    if (videoModals.length > 0) {
        videoModals.forEach((videoModal) => {
            new ModalVideo(videoModal.closest('.js-modal'));
        });
    }
});
