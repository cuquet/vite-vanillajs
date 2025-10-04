/*
File#: _1_language-picker
Title: Language Picker
Descr: A custom selector allowing users to choose their preferred language on a page
Usage: https://codyhouse.co/ds/components/info/language-picker
*/
import { tools as Util } from '@modules';

class LanguagePicker {
    constructor(element, opts = {}) {
        this.opts = opts;
        this.element = element;
        this.select = this.element.getElementsByTagName('select')[0];
        this.select.id = `language-picker-${Util.getNewId(6)}`;
        this.options = this.select.getElementsByTagName('option');
        this.selectedOption = this.getSelectedOption();
        this.pickerId = this.select.getAttribute('id');
        this.trigger = false;
        this.dropdown = false;
        this.firstLanguage = false;
        this.arrowSvgPath =
            '<svg viewBox="0 0 16 16"><polygon points="3,5 8,11 13,5 "></polygon></svg>';
        this.globeSvgPath =
            '<svg viewBox="0 0 16 16"><path d="M8,0C3.6,0,0,3.6,0,8s3.6,8,8,8s8-3.6,8-8S12.4,0,8,0z M13.9,7H12c-0.1-1.5-0.4-2.9-0.8-4.1 C12.6,3.8,13.6,5.3,13.9,7z M8,14c-0.6,0-1.8-1.9-2-5H10C9.8,12.1,8.6,14,8,14z M6,7c0.2-3.1,1.3-5,2-5s1.8,1.9,2,5H6z M4.9,2.9 C4.4,4.1,4.1,5.5,4,7H2.1C2.4,5.3,3.4,3.8,4.9,2.9z M2.1,9H4c0.1,1.5,0.4,2.9,0.8,4.1C3.4,12.2,2.4,10.7,2.1,9z M11.1,13.1 c0.5-1.2,0.7-2.6,0.8-4.1h1.9C13.6,10.7,12.6,12.2,11.1,13.1z"></path></svg>';
        this.init();
        this.initEvents();
    }

    init() {
        this.element.insertAdjacentHTML(
            'beforeend',
            this.renderTriggerButton + this.renderDropdown,
        );
        this.dropdown = this.element.getElementsByClassName('language-picker__dropdown')[0];
        this.languages = this.dropdown.getElementsByClassName('language-picker__item');
        this.firstLanguage = this.languages[0];
        this.trigger = this.element.getElementsByClassName('language-picker__button')[0];
        this.select.previousElementSibling.htmlFor = this.select.id;
        this.placeElement();
    }

    initEvents() {
        var svgs = this.trigger.getElementsByTagName('svg');
        svgs[0].classList.add('icon');
        svgs[1].classList.add('icon');
        this.initLanguageSelection();

        this.trigger.addEventListener('click', () => {
            this.toggleLanguagePicker(false);
        });

        this.dropdown.addEventListener('keydown', (event) => {
            if (
                (event.code && event.code == 38) ||
                (event.key && event.key.toLowerCase() == 'arrowup')
            ) {
                this.keyboardNavigatePicker('prev');
            } else if (
                (event.code && event.code == 40) ||
                (event.key && event.key.toLowerCase() == 'arrowdown')
            ) {
                this.keyboardNavigatePicker('next');
            }
        });
        window.addEventListener('keyup', (event) => {
            if (((event.code && event.code == 27) || (event.key && event.key.toLowerCase() === 'escape')) ) {
                this.moveFocusToPickerTrigger();
                this.toggleLanguagePicker('false');
            }
        });
        
        window.addEventListener('click', (event) => {
            if (!this.element.contains(event.target)) this.toggleLanguagePicker('false');
        });
    }

    toggleLanguagePicker(bool) {
        // const ariaExpanded = bool
        //     ? bool
        //     : this.trigger.getAttribute('aria-expanded') == 'true'
        //     ? 'false'
        //     : 'true';

        const ariaExpanded = bool || (this.trigger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
        this.trigger.setAttribute('aria-expanded', ariaExpanded);
        if (ariaExpanded == 'true') {
            this.firstLanguage.focus();
            this.dropdown.addEventListener(
                'transitionend',
                () => {
                    this.firstLanguage.focus();
                },
                { once: true },
            );
            this.placeElement();
            //document.body.style.overflow = 'hidden';
        } //else {
            //document.body.removeAttribute('style');
            //this.dropdown.setAttribute('style', 'width: 0px; overflow: hidden;');
        //}
    }

    placeElement() {
        const triggerRect = this.trigger.getBoundingClientRect();
        
        // const style =
        //     Math.min(document.documentElement.clientWidth || 0, window.innerWidth || 0) <
        //     triggerRect.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width'))
        //         ? 'right: 0px; left: auto;'
        //         : 'left: 0px; right: auto;';
        //     this.dropdown.setAttribute('style', style);
        
        this.dropdown.classList.toggle(
            'language-picker__dropdown--right',
            //window.innerWidth < triggerRect.left + this.dropdown.offsetWidth,
            Math.min(document.documentElement.clientWidth || 0, window.innerWidth || 0) < triggerRect.left + this.dropdown.offsetWidth
        );

        this.dropdown.classList.toggle(
            'language-picker__dropdown--up',
            //window.innerHeight < triggerRect.bottom + this.dropdown.offsetHeight,
            window.innerHeight - triggerRect.bottom - 5 < triggerRect.top
        );
    }

    moveFocusToPickerTrigger() {
        if (this.trigger.getAttribute('aria-expanded') == 'false') return;
        if (document.activeElement.closest('.language-picker__dropdown') == this.dropdown)
            this.trigger.focus();
    }

    get renderTriggerButton() {
        const customClasses = this.element.getAttribute('data-trigger-class')
            ? ' ' + this.element.getAttribute('data-trigger-class')
            : '';
        let button = `<button class="language-picker__button${customClasses}" aria-label="${this.element.getElementsByTagName('label')[0].textContent} ${this.select.value}" aria-expanded="false" aria-controls="${this.pickerId}-dropdown">`;
        button += `<span aria-hidden="true" class="language-picker__label language-picker__flag language-picker__flag--${this.select.value.substring(0, 2)}">${this.globeSvgPath}<em>${this.selectedOption}</em>`;
        button += `${this.arrowSvgPath}</span></button>`;
        return button;
    }

    get renderDropdown() {
        let list = `<div class="language-picker__dropdown" aria-describedby="${this.pickerId}-description" id="${this.pickerId}-dropdown">`;
        list += `<p class="sr-only" id="${this.pickerId}-description">${this.element.getElementsByTagName('label')[0].textContent}</p>`;
        list += `<ul class="language-picker__list" role="listbox">`;
        for (var i = 0; i < this.options.length; i++) {
            const selected = this.options[i].selected ? ' aria-selected="true"' : '',
                language = this.options[i].getAttribute('lang') || this.options[i].value.substring(0, 2);
            list += `<li><a lang="${language}" hreflang="${language}" href="${this.getLanguageUrl(this.options[i])}" ${selected} role="option" data-value="${this.options[i].value}" class="language-picker__item language-picker__flag language-picker__flag--${language}" tabindex="0"><span>${this.options[i].text}</span></a></li>`;
        }
        return list;
    }

    getSelectedOption() {
        return 'selectedIndex' in this.select
            ? this.options[this.select.selectedIndex].text
            : this.select.querySelector('option[selected]').text;
    }

    getLanguageUrl(option) {
        // ⚠️ Important: You should replace this return value with the real link to your website in the selected language
        if(this.opts.onGetLangUrl){ return this.opts.onGetLangUrl(option); }
        return '#'+ option.value;
    }

    initLanguageSelection() {
        this.element
            .getElementsByClassName('language-picker__list')[0]
            .addEventListener('click', (event) => {
                var language = event.target.closest('.language-picker__item');
                if (!language) return;

                if (
                    language.hasAttribute('aria-selected') &&
                    language.getAttribute('aria-selected') == 'true'
                ) {
                    event.preventDefault();
                    this.trigger.setAttribute('aria-expanded', 'false');
                }
            });
    }

    keyboardNavigatePicker(direction) {
        var index = Array.prototype.indexOf.call(this.languages, document.activeElement);
        index = direction == 'next' ? index + 1 : index - 1;
        if (index < 0) index = this.languages.length - 1;
        if (index >= this.languages.length) index = 0;
        this.elMoveFocus(this.languages[index]);
    }

    elMoveFocus(element) {
        element.focus();
        if (document.activeElement !== element) {
            element.setAttribute('tabindex', '-1');
            element.focus();
        }
    }
}

window.LanguagePicker= LanguagePicker;
export default LanguagePicker;

// document.addEventListener('DOMContentLoaded', () => {
//     const languagePickerElements = Array.from(document.getElementsByClassName('js-language-picker'));
//         languagePickerElements.forEach((element) => {
//             new LanguagePicker(element,{
//                 onGetLangUrl: (option) => {
//                     console.log('Language selected:', option);
//                     // Add your custom logic here, e.g., redirecting to the selected language URL
//                     //window.location.href = option.getAttribute('href');
//                 },
//             });
//         });
// });

