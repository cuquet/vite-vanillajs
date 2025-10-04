/* -------------------------------- 

File#: _1_newsletter-input
Title: Newsletter Input
Descr: Animated newsletter form.
Usage: https://codyhouse.co/ds/components/info/newsletter-input

-------------------------------- */

import { tools as Util } from '@modules';

class NewsInput {
    constructor(options) {
        this.options = Util.extend(NewsInput.defaults, options);
        this.element = this.options.element;
        this.input = this.element.getElementsByClassName('js-news-form__input');
        this.button = this.element.getElementsByClassName('js-news-form__btn');
        this.submitting = false;
        this.init();
    }

    init() {
        if (this.input.length < 1 || this.button.length < 1) return;
        this.input[0].addEventListener('input', this.handleInput.bind(this));
        this.element.addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleInput() {
        const value = this.input[0].value;
        const atIndex = value.indexOf('@');
        const dotIndex = value.lastIndexOf('.');
        this.element.classList.remove('news-form--success', 'news-form--error');
        if (atIndex >= 1 && atIndex + 2 <= dotIndex && dotIndex < value.length - 1) {
            this.element.classList.add('news-form--enabled');
            this.button[0].removeAttribute('disabled');
        } else {
            this.element.classList.remove('news-form--enabled');
            this.button[0].setAttribute('disabled', true);
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.submitting) return;
        this.submitting = true;
        this.response = false;
        this.element.classList.add('news-form--loading', 'news-form--circle-loop');
        this.element.addEventListener('animationend', this.handleAnimationEnd.bind(this));
        this.options.submit(this.input[0].value, (response) => {
            this.response = response;
            this.submitting = false;
            this.handleResponse(response);
        });
    }

    handleAnimationEnd() {
        if (this.response) {
            this.element.removeEventListener('animationend', this.handleAnimationEnd.bind(this));
            this.handleResponse(this.response);
        } else {
            this.element.classList.remove('news-form--circle-loop');
            this.element.offsetWidth;
            this.element.classList.add('news-form--circle-loop');
        }
    }

    handleResponse(response) {
        this.element.classList.remove('news-form--loading', 'news-form--circle-loop');
        if (response === 'success') {
            this.element.classList.add('news-form--success');
        } else {
            this.element.classList.add('news-form--error');
        }
    }
}

NewsInput.defaults = {
    element: '',
    submit: false,
};

window.NewsInput = NewsInput;
export default NewsInput;

// document.addEventListener('DOMContentLoaded', () => {
//     const news = Array.from(document.getElementsByClassName('js-news-form'));
//     //import('../_1_input-newsletter.scss');
// });
