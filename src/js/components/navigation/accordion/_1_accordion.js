// File#: _1_accordion
// Usage: https://codyhouse.co/ds/components/info/accordion

import { tools as Util } from '@modules';
class Accordion {
    constructor(element) {
        this.element = element;
        this.items = Util.getChildrenByClassName(element, 'js-accordion__item');
        const version = element.getAttribute('data-version');
        this.version = version ? `-${version}` : '';
        this.showClass = `accordion${this.version}__item--is-open`;
        this.animateHeight = element.getAttribute('data-animation') === 'on';
        this.multiItems = element.getAttribute('data-multi-items') !== 'off';
        this.deepLinkOn = element.getAttribute('data-deep-link') === 'on';

        this.initAccordion();
    }

    initAccordion() {
        this.items.forEach((item, i) => {
            const button = item.querySelector('button');
            const content = item.querySelector('.js-accordion__panel');
            const isOpen = item.classList.contains(this.showClass);

            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            button.setAttribute('aria-controls', `accordion-content-${i}`);
            button.setAttribute('id', `accordion-header-${i}`);
            button.classList.add('js-accordion__trigger');

            content.setAttribute('aria-labelledby', `accordion-header-${i}`);
            content.setAttribute('id', `accordion-content-${i}`);
        });

        this.initAccordionEvents();
        this.initDeepLink();
    }

    initAccordionEvents() {
        this.element.addEventListener('click', (event) => {
            const trigger = event.target.closest('.js-accordion__trigger');
            if (trigger && this.items.includes(trigger.parentElement)) {
                this.triggerAccordion(trigger);
            }
        });
    }

    triggerAccordion(trigger) {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        this.animateAccordion(trigger, isOpen, false);

        if (!isOpen && this.deepLinkOn) {
            history.replaceState(null, '', `#${trigger.getAttribute('aria-controls')}`);
        }
    }

    animateAccordion(trigger, isOpen, deepLink) {
        const item = trigger.closest('.js-accordion__item');
        const content = item.querySelector('.js-accordion__panel');
        const ariaValue = isOpen ? 'false' : 'true';

        if (!isOpen) item.classList.add(this.showClass);
        trigger.setAttribute('aria-expanded', ariaValue);
        this.resetContentVisibility(item, content, isOpen);

        if ((!this.multiItems && !isOpen) || deepLink) {
            this.closeSiblings(item);
        }
    }

    resetContentVisibility(item, content, isOpen) {
        Util.toggleClass(item, this.showClass, !isOpen);
        content.removeAttribute('style');
        if (isOpen && !this.multiItems) this.moveContent();
    }

    closeSiblings(currentItem) {
        this.items.forEach((item) => {
            if (item !== currentItem && item.classList.contains(this.showClass)) {
                const trigger = item.querySelector('.js-accordion__trigger');
                this.animateAccordion(trigger, true, false);
            }
        });
    }

    moveContent() {
        const openItem = this.element.querySelector(`.${this.showClass}`);
        if (!openItem) return;
        const rect = openItem.getBoundingClientRect();
        if (rect.top < 0 || rect.top > window.innerHeight) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            Util.scrollTo(rect.top + scrollTop, 300);
        }
    }

    initDeepLink() {
        if (!this.deepLinkOn) return;

        const hash = window.location.hash.slice(1);
        if (!hash) return;

        const trigger = this.element.querySelector(
            `.js-accordion__trigger[aria-controls="${hash}"]`,
        );
        if (trigger && trigger.getAttribute('aria-expanded') !== 'true') {
            this.animateAccordion(trigger, false, true);
            setTimeout(() => trigger.scrollIntoView(true));
        }
    }
}

export default Accordion;

// Inicialitza els menús
document.addEventListener('DOMContentLoaded', () => {
    const accordions = Array.from(document.getElementsByClassName('js-accordion'));
    if(accordions.length > 0) {
        accordions.forEach(element => new Accordion(element));   
    }
});
