/* -------------------------------- 
File#: _1_language-picker
Title: Language Picker
Descr: A custom selector allowing users to choose their preferred language on a page
Usage: https://codyhouse.co/ds/components/info/language-picker
 -------------------------------- */
import { tools as Util } from '@modules';

class LanguagePicker {
    constructor(element, opts = {}) {
        this.opts = opts;
        this.element = element;
        this.select = this.element.querySelector('select');
        this.select.id = `language-picker-${Util.getNewId(6)}`;
        this.options = this.select.querySelectorAll('option');
        this.selectedOption = this.getSelectedOption();
        this.pickerId = this.select.id;
        this.trigger = null;
        this.dropdown = null;
        this.firstLanguage = null;
        this.debounceTimer = null;

        this.arrowSvgPath =
            '<svg viewBox="0 0 16 16"><polygon points="3,5 8,11 13,5 "></polygon></svg>';
        this.globeSvgPath =
            '<svg viewBox="0 0 16 16"><path d="M8,0C3.6,0,0,3.6,0,8s3.6,8,8,8s8-3.6,8-8S12.4,0,8,0z M13.9,7H12c-0.1-1.5-0.4-2.9-0.8-4.1 C12.6,3.8,13.6,5.3,13.9,7z M8,14c-0.6,0-1.8-1.9-2-5H10C9.8,12.1,8.6,14,8,14z M6,7c0.2-3.1,1.3-5,2-5s1.8,1.9,2,5H6z M4.9,2.9 C4.4,4.1,4.1,5.5,4,7H2.1C2.4,5.3,3.4,3.8,4.9,2.9z M2.1,9H4c0.1,1.5,0.4,2.9,0.8,4.1C3.4,12.2,2.4,10.7,2.1,9z M11.1,13.1 c0.5-1.2,0.7-2.6,0.8-4.1h1.9C13.6,10.7,12.6,12.2,11.1,13.1z"></path></svg>';

        this.init();
        this.initEvents();
    }

    init() {
        this.element.insertAdjacentHTML('beforeend', this.renderTriggerButton + this.renderDropdown);
        this.dropdown = this.element.querySelector('.language-picker__dropdown');
        this.languages = this.dropdown.querySelectorAll('.language-picker__item');
        this.firstLanguage = this.languages[0];
        this.trigger = this.element.querySelector('.language-picker__button');
        this.select.previousElementSibling.htmlFor = this.select.id;
        this.placeElement();
    }

    // ⚙️ render segur amb requestAnimationFrame
    placeElement() {
        requestAnimationFrame(() => {
            const triggerRect = this.trigger.getBoundingClientRect();
            const dropdown = this.dropdown;

            const shouldRight =
                Math.min(document.documentElement.clientWidth, window.innerWidth) <
                triggerRect.left + dropdown.offsetWidth;
            const shouldUp = window.innerHeight - triggerRect.bottom - 5 < triggerRect.top;

            dropdown.classList.toggle('language-picker__dropdown--right', shouldRight);
            dropdown.classList.toggle('language-picker__dropdown--up', shouldUp);
        });
    }

    initEvents() {
        const svgs = this.trigger.getElementsByTagName('svg');
        svgs[0].classList.add('icon');
        svgs[1].classList.add('icon');
        this.initLanguageSelection();

        this._onTriggerClick = () => this.toggleLanguagePicker(false);
        this._onDropdownKey = (e) => this.onDropdownKey(e);
        this._onKeyUp = (e) => {
            if (e.key === 'Escape') {
                this.moveFocusToPickerTrigger();
                this.toggleLanguagePicker('false');
            }
        };
        this._onWindowClick = (e) => {
            if (!this.element.contains(e.target)) this.toggleLanguagePicker('false');
        };

        // 🕒 reposició automàtica amb debounce
        this._onReposition = () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                if (this.trigger.getAttribute('aria-expanded') === 'true') {
                    this.placeElement();
                }
            }, 100);
        };

        this.trigger.addEventListener('click', this._onTriggerClick);
        this.dropdown.addEventListener('keydown', this._onDropdownKey);
        window.addEventListener('keyup', this._onKeyUp);
        window.addEventListener('click', this._onWindowClick);
        window.addEventListener('resize', this._onReposition);
        window.addEventListener('scroll', this._onReposition, true);
    }

    onDropdownKey(event) {
        const actions = {
            ArrowUp: () => this.keyboardNavigatePicker('prev'),
            ArrowDown: () => this.keyboardNavigatePicker('next'),
            Escape: () => {
                this.moveFocusToPickerTrigger();
                this.toggleLanguagePicker('false');
            },
        };
        const fn = actions[event.key];
        if (fn) {
            event.preventDefault();
            fn();
        }
    }

    async toggleLanguagePicker(bool) {
        const ariaExpanded =
            bool ||
            (this.trigger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');

        this.trigger.setAttribute('aria-expanded', ariaExpanded);
        if (ariaExpanded === 'true') {
            await Util.transitionend(this.dropdown);
            this.firstLanguage.focus();
            this.placeElement();
        }
    }

    moveFocusToPickerTrigger() {
        if (this.trigger.getAttribute('aria-expanded') === 'false') return;
        if (document.activeElement.closest('.language-picker__dropdown') === this.dropdown)
            this.trigger.focus();
    }

    keyboardNavigatePicker(direction) {
        const index = Array.prototype.indexOf.call(this.languages, document.activeElement);
        let next = direction === 'next' ? index + 1 : index - 1;
        if (next < 0) next = this.languages.length - 1;
        if (next >= this.languages.length) next = 0;
        this.elMoveFocus(this.languages[next]);
    }

    elMoveFocus(element) {
        element.focus();
        if (document.activeElement !== element) {
            element.setAttribute('tabindex', '-1');
            element.focus();
        }
    }

    initLanguageSelection() {
        this.element.querySelector('.language-picker__list').addEventListener('click', (event) => {
            const language = event.target.closest('.language-picker__item');
            if (!language) return;
            if (language.getAttribute('aria-selected') === 'true') {
                event.preventDefault();
                this.trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    get renderTriggerButton() {
        const customClasses = this.element.dataset.triggerClass
            ? ' ' + this.element.dataset.triggerClass
            : '';
        let button = `<button class="language-picker__button${customClasses}" aria-label="${this.element.querySelector('label').textContent} ${this.select.value}" aria-expanded="false" aria-controls="${this.pickerId}-dropdown">`;
        button += `<span aria-hidden="true" class="language-picker__label language-picker__flag language-picker__flag--${this.select.value.substring(0, 2)}">${this.globeSvgPath}<em>${this.selectedOption}</em>${this.arrowSvgPath}</span></button>`;
        return button;
    }

    get renderDropdown() {
        let list = `<div class="language-picker__dropdown" aria-describedby="${this.pickerId}-description" id="${this.pickerId}-dropdown">`;
        list += `<p class="sr-only" id="${this.pickerId}-description">${this.element.querySelector('label').textContent}</p>`;
        list += `<ul class="language-picker__list" role="listbox">`;
        for (let i = 0; i < this.options.length; i++) {
            const selected = this.options[i].selected ? ' aria-selected="true"' : '';
            const language =
                this.options[i].getAttribute('lang') || this.options[i].value.substring(0, 2);
            list += `<li><a lang="${language}" hreflang="${language}" href="${this.getLanguageUrl(this.options[i])}" ${selected} role="option" data-value="${this.options[i].value}" class="language-picker__item language-picker__flag language-picker__flag--${language}" tabindex="0"><span>${this.options[i].text}</span></a></li>`;
        }
        list += '</ul></div>';
        return list;
    }

    getSelectedOption() {
        return 'selectedIndex' in this.select
            ? this.options[this.select.selectedIndex].text
            : this.select.querySelector('option[selected]').text;
    }

    getLanguageUrl(option) {
        // ⚠️ Important: You should replace this return value with the real link to your website in the selected language
        if (this.opts.onGetLangUrl) return this.opts.onGetLangUrl(option);
        return '#' + option.value;
    }

    // 🧹 destroy()
    destroy() {
        this.trigger?.removeEventListener('click', this._onTriggerClick);
        this.dropdown?.removeEventListener('keydown', this._onDropdownKey);
        window.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('click', this._onWindowClick);
        window.removeEventListener('resize', this._onReposition);
        window.removeEventListener('scroll', this._onReposition, true);
        clearTimeout(this.debounceTimer);
    }
}

if (typeof window !== 'undefined') {
    if (!window.LanguagePicker) window.LanguagePicker = LanguagePicker;
}

export { LanguagePicker };
