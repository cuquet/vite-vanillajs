/* -------------------------------- 

File#: _1_popover
Title: Popover
Descr: A pop-up box controlled by a trigger element
Usage: https://codyhouse.co/ds/components/info/popover

-------------------------------- */

import { tools as Util } from '@modules';

class Popover {
    constructor(element, opts={}) {
        this.opts= Util.extend(Popover.defaults, opts);
        this.element = element;
        this.elementId = this.element.getAttribute('id');
        this.trigger = document.querySelectorAll(`[aria-controls="${this.elementId}"]`);
        this.selectedTrigger = false;
        this.popoverVisibleClass = 'popover--is-visible';
        this.selectedTriggerClass = 'popover-control--active';
        this.popoverIsOpen = false;
        this.firstFocusable = false;
        this.lastFocusable = false;
        this.positionTarget = this.getPositionTarget();
        this.viewportGap = parseInt(getComputedStyle(this.element).getPropertyValue('--popover-viewport-gap')) || 20;

        this.init();
        this.initEvents();
    }

    togglePopover(bool, moveFocus) {
        this.togglePopoverVisibility(bool, moveFocus);
    }

    checkPopoverClick(target) {
        if (!this.popoverIsOpen) return;
        if (!this.element.contains(target) && !target.closest(`[aria-controls="${this.elementId}"]`)) {
            this.togglePopoverVisibility(false);
        }
    }

    checkPopoverFocus() {
        if (!this.popoverIsOpen) return;
        const popoverParent = document.activeElement.closest('.js-popover');
        this.togglePopoverVisibility(false, popoverParent);
    }

    getPositionTarget() {
        const positionTargetSelector = this.element.getAttribute('data-position-target');
        if (!positionTargetSelector) return false;
        return document.querySelector(positionTargetSelector);
    }

    init() {
        this.initPopoverPosition();
        for (let i = 0; i < this.trigger.length; i++) {
            Util.setAttributes(this.trigger[i], { 'aria-expanded': 'false', 'aria-haspopup': 'true' });
        }
    }

    initEvents() {
        for (let i = 0; i < this.trigger.length; i++) {
            this.trigger[i].addEventListener('click', (event) => {
                event.preventDefault();
                if (Util.hasClass(this.element, this.popoverVisibleClass) && this.selectedTrigger != this.trigger[i]) {
                    this.togglePopoverVisibility(false, false);
                }
                this.selectedTrigger = this.trigger[i];
                this.togglePopoverVisibility(!Util.hasClass(this.element, this.popoverVisibleClass), true);
            });
        }

        this.element.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                this.trapFocus(event);
            }
        });

        this.element.addEventListener('openPopover', () => {
            this.togglePopoverVisibility(true);
        });

        this.element.addEventListener('closePopover', (event) => {
            this.togglePopoverVisibility(false, event.detail);
        });
    }

    togglePopoverVisibility(bool, moveFocus) {
        Util.toggleClass(this.element, this.popoverVisibleClass, bool);
        this.popoverIsOpen = bool;
        if (bool) {
            this.selectedTrigger.setAttribute('aria-expanded', 'true');
            this.getFocusableElements();
            this.focusPopover();
            this.element.addEventListener("transitionend", () => this.focusPopover(), { once: true });
            this.positionPopover();
            Util.addClass(this.selectedTrigger, this.selectedTriggerClass);
        } else if (this.selectedTrigger) {
            this.selectedTrigger.setAttribute('aria-expanded', 'false');
            if (moveFocus) Util.moveFocus(this.selectedTrigger);
            Util.removeClass(this.selectedTrigger, this.selectedTriggerClass);
            this.selectedTrigger = false;
        }
    }

    focusPopover() {
        if (this.firstFocusable) {
            this.firstFocusable.focus();
        } else {
            Util.moveFocus(this.element);
        }
    }

    positionPopover() {
        this.resetPopoverStyle();
        const selectedTriggerPosition = this.positionTarget ? this.positionTarget.getBoundingClientRect() : this.selectedTrigger.getBoundingClientRect();
        const menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
        const left = selectedTriggerPosition.left;
        const right = (window.innerWidth - selectedTriggerPosition.right);
        const isRight = (window.innerWidth < selectedTriggerPosition.left + this.element.offsetWidth);
        let horizontal = isRight ? `right: ${right}px;` : `left: ${left}px;`;
        let vertical = menuOnTop ? `bottom: ${window.innerHeight - selectedTriggerPosition.top}px;` : `top: ${selectedTriggerPosition.bottom}px;`;
        if (isRight && (right + this.element.offsetWidth) > window.innerWidth) {
            horizontal = `left: ${parseInt((window.innerWidth - this.element.offsetWidth) / 2)}px;`;
        }
        const maxHeight = menuOnTop ? selectedTriggerPosition.top - this.viewportGap : window.innerHeight - selectedTriggerPosition.bottom - this.viewportGap;
        const initialStyle = this.element.getAttribute('style') || '';
        this.element.setAttribute('style', `${initialStyle}${horizontal}${vertical}max-height:${Math.floor(maxHeight)}px;`);
    }

    resetPopoverStyle() {
        this.element.style.maxHeight = '';
        this.element.style.top = '';
        this.element.style.bottom = '';
        this.element.style.left = '';
        this.element.style.right = '';
    }

    initPopoverPosition() {
        this.element.style.top = '0px';
        this.element.style.left = '0px';
    }

    getFocusableElements() {
        const allFocusable = this.element.querySelectorAll(this.opts.focusableElString);
        this.firstFocusable = Array.from(allFocusable).find(el => this.isVisible(el));
        this.lastFocusable = Array.from(allFocusable).reverse().find(el => this.isVisible(el));
    }

    trapFocus(event) {
        if (this.firstFocusable === document.activeElement && event.shiftKey) {
            event.preventDefault();
            this.lastFocusable.focus();
        }
        if (this.lastFocusable === document.activeElement && !event.shiftKey) {
            event.preventDefault();
            this.firstFocusable.focus();
        }
    }

    isVisible(element) {
        return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    }
}

Popover.defaults = {
    focusableElString : Util.focusableElString(),
}

export default Popover;

document.addEventListener('DOMContentLoaded', () => {
    const popovers = Array.from(document.getElementsByClassName('js-popover'));
    const popoversArray = [];
    const scrollingContainers = [];
    popovers.forEach(el => {
        const popover = new Popover(el);
        popoversArray.push(popover);
        const scrollableElement = el.getAttribute('data-scrollable-element');
        if (scrollableElement && !scrollingContainers.includes(scrollableElement)) {
            scrollingContainers.push(scrollableElement);
        }
        const handleEvent = (event) => {
            if (event.type === 'keyup' && event.key === 'Escape') {
                popover.checkPopoverFocus();
            } else if (event.type === 'click') {
                popover.checkPopoverClick(event.target);
            } else if (event.type === 'resize' || event.type === 'scroll') {
                if (popover.popoverIsOpen) popover.togglePopover(false, false);
            }
        };
        window.addEventListener('keyup', handleEvent);
        window.addEventListener('click', handleEvent);
        window.addEventListener('resize', handleEvent);
        window.addEventListener('scroll', handleEvent);
    });
    scrollingContainers.forEach(container => {
        const scrollingContainer = document.querySelector(container);
        if (scrollingContainer) {
            scrollingContainer.addEventListener('scroll', () => {
                popoversArray.forEach(element => {
                    if (element.popoverIsOpen) element.togglePopover(false, false);
                });
            });
        }
    });
});
