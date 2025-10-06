/* -------------------------------- 
File#: _3_lightbox
Title: Lightbox
Descr: A modal gallery used to display media assets and content.
Usage: https://codyhouse.co/ds/components/info/lightbox
Dependencies
    _1_menu (Menu)
    _2_menu-bar (Menu Bar)
    _1_modal-window (Modal Window)
    _1_swipe-content (Swipe Content)
    _2_slideshow (Slideshow)
-------------------------------- */

//import { tools as Util } from '@modules';
import { Slideshow } from '@components/overlays/slideshow';

class Lightbox {
    constructor(element) {
        this.element = element;
        this.id = this.element.getAttribute('id');
        this.slideshow = this.element.querySelector('.js-lightbox__body');
        this.slides = this.slideshow.querySelectorAll('.js-slideshow__item');
        this.thumbWrapper = this.element.querySelector('.js-lightbox_thumb-list');
        this.selectedSlide = 0;
        this.slideshowObj = null;
        this.thumbSlides = null;

        this.init();
    }

    init() {
        this.element.classList.add('lightbox--no-transition');
        this.initEvents();
        this.initSlideshow();
        this.initThumbnails();
    }

    initEvents() {
        this.element.addEventListener('modalIsOpen', (event) => {
            this.handleModalOpen(event);
        });

        this.element.addEventListener('modalIsClose', () => {
            this.element.classList.add('lightbox--no-transition');
        });

        this.slideshow.addEventListener('newItemSelected', (event) => {
            this.handleNewItemSelected(event);
        });
    }

    handleModalOpen(event) {
        this.updateSelectedSlide(event);
        this.preloadMedia();
        this.updateThumbnails();
        this.element.classList.remove('lightbox--no-transition');
    }

    handleNewItemSelected(event) {
        const previousSlide = this.selectedSlide;
        this.selectedSlide = event.detail;
        this.preloadMedia();
        this.pausePreviousMedia(previousSlide);
        this.updateThumbnails();
    }

    initSlideshow() {
        if (this.slides.length <= 1) {
            this.hideControlsAndFooter();
            return;
        }

        const swipeEnabled = this.slideshow.getAttribute('data-swipe') === 'on';
        this.slideshowObj = new Slideshow({
            element: this.slideshow,
            navigation: false,
            autoplay: false,
            swipe: swipeEnabled,
        });
    }

    hideControlsAndFooter() {
        const controls = this.element.querySelectorAll('.js-slideshow__control');
        controls.forEach((control) => control.classList.add('hide'));

        const footer = this.element.querySelector('.js-lightbox_footer');
        if (footer) footer.classList.add('hide');
    }

    initThumbnails() {
        if (!this.thumbWrapper) return;

        this.renderThumbnails();
        this.thumbSlides = this.thumbWrapper.querySelectorAll('.js-lightbox__thumb');

        this.thumbWrapper.addEventListener('click', (event) => {
            const thumb = event.target.closest('.js-lightbox__thumb');
            if (thumb && !thumb.classList.contains('lightbox__thumb--active')) {
                const index = Array.from(this.thumbSlides).indexOf(thumb);
                this.slideshowObj.showItem(index);
            }
        });
    }

    renderThumbnails() {
        const thumbnails = Array.from(this.slides)
            .map((slide) => {
                const isActive = slide.classList.contains('slideshow__item--selected')
                    ? ' lightbox__thumb--active'
                    : '';
                const thumbSrc = slide.querySelector('[data-thumb]').getAttribute('data-thumb');
                return `<li class="lightbox__thumb js-lightbox__thumb ${isActive}"><img src="${thumbSrc}"></li>`;
            })
            .join('');

        this.thumbWrapper.innerHTML = thumbnails;
    }

    updateSelectedSlide(event) {
        const trigger = event.detail?.closest(`[aria-controls="${this.id}"]`);
        const itemId = trigger?.getAttribute('data-lightbox-item');
        if (itemId) {
            const targetSlide = document.getElementById(itemId);
            if (targetSlide) {
                this.slideshow
                    .querySelector('.slideshow__item--selected')
                    ?.classList.remove('slideshow__item--selected');
                targetSlide.classList.add('slideshow__item--selected');
            }
        }

        const selectedSlide = this.slideshow.querySelector('.slideshow__item--selected');
        this.selectedSlide = Array.from(this.slides).indexOf(selectedSlide);
        if (this.slideshowObj) {
            this.slideshowObj.selectedSlide = this.selectedSlide;
        }
    }

    preloadMedia() {
        this.loadMedia(this.selectedSlide);
        this.loadMedia(this.selectedSlide + 1);
        this.loadMedia(this.selectedSlide - 1);
    }

    loadMedia(index) {
        if (index < 0) index = this.slides.length - 1;
        if (index >= this.slides.length) index = 0;

        const slide = this.slides[index];
        this.loadImages(slide);
        this.loadVideos(slide);
        this.loadIframes(slide);
    }

    loadImages(slide) {
        const images = slide.querySelectorAll('img[data-src]');
        images.forEach((img) => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
    }

    loadVideos(slide) {
        const videos = slide.querySelectorAll('video[data-src]');
        videos.forEach((video) => {
            video.src = video.getAttribute('data-src');
            video.removeAttribute('data-src');
        });
    }

    loadIframes(slide) {
        const iframes = slide.querySelectorAll('iframe[data-src]');
        iframes.forEach((iframe) => {
            iframe.src = iframe.getAttribute('data-src');
            iframe.removeAttribute('data-src');
        });
    }

    pausePreviousMedia(previousSlide) {
        if (previousSlide !== undefined) {
            const previousVideo = this.slides[previousSlide].querySelector('video');
            if (previousVideo) previousVideo.pause();

            const previousIframe = this.slides[previousSlide].querySelector('iframe');
            if (previousIframe) {
                previousIframe.setAttribute('data-src', previousIframe.src);
                previousIframe.removeAttribute('src');
            }
        }

        const currentVideo = this.slides[this.selectedSlide].querySelector('video');
        if (currentVideo) currentVideo.play();
    }

    updateThumbnails() {
        if (!this.thumbWrapper) return;

        const activeThumb = this.thumbWrapper.querySelector('.lightbox__thumb--active');
        if (activeThumb) activeThumb.classList.remove('lightbox__thumb--active');

        const currentThumb = this.thumbSlides[this.selectedSlide];
        currentThumb.classList.add('lightbox__thumb--active');

        this.scrollToActiveThumbnail(currentThumb);
    }

    scrollToActiveThumbnail(currentThumb) {
        const thumbRect = currentThumb.getBoundingClientRect();
        const wrapperRect = this.thumbWrapper.getBoundingClientRect();

        if (thumbRect.left < wrapperRect.left) {
            this.thumbWrapper.scrollTo(currentThumb.offsetLeft - wrapperRect.left, 0);
        } else if (thumbRect.right > wrapperRect.right) {
            this.thumbWrapper.scrollTo(
                thumbRect.right - wrapperRect.right + this.thumbWrapper.scrollLeft,
                0,
            );
        }
    }
}
if (typeof window !== 'undefined') {
    window.Lightbox = Lightbox;
}


function initLightbox(context = document) {
    const elements = context.querySelectorAll('.js-lightbox');
    elements.forEach(el => {
        if (!el.dataset.lightboxInitialized) {
            new Lightbox(el);
            el.dataset.lightboxInitialized = 'true';
        }
    });
}

export { Lightbox, initLightbox };

