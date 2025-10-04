/* -------------------------------- 

File#: _1_tooltip
Title: Tooltip
Descr: A popup displaying additional text information
Usage: https://codyhouse.co/ds/components/info/tooltip

-------------------------------- */

import { tools as Util } from '@modules';

class Tooltip {
    constructor(element) {
        this.element = element;
        this.tooltip = false;
        this.tooltipIntervalId = false;
        this.tooltipContent = this.element.getAttribute('title');
        this.tooltipPosition = this.element.getAttribute('data-tooltip-position') || 'top';
        this.tooltipClasses = this.element.getAttribute('data-tooltip-class') || false;
        this.tooltipId = 'js-tooltip-element'; 
        // id de l'element tooltip -> el trigger tindrà el mateix atribut aria-describedby
        // hi ha casos on només necessites l'atribut aria-label -> els lectors de pantalla no necessiten llegir el contingut del tooltip (per exemple, notes a peu de pàgina)
        
        //this.tooltipDescription = this.element.getAttribute('data-tooltip-describedby') !== 'false';
        this.tooltipDescription = (this.element.getAttribute('data-tooltip-describedby') && this.element.getAttribute('data-tooltip-describedby') == 'false') ? false : true;

        this.tooltipDelay = parseInt(this.element.getAttribute('data-tooltip-delay')) || 300;
        this.tooltipDelta = parseInt(this.element.getAttribute('data-tooltip-gap')) || 10;

        this.tooltipTriggerHover = false;

        this.tooltipSticky = (this.tooltipClasses && this.tooltipClasses.indexOf('tooltip--sticky') > -1);
        this.tooltipHover = false;
        

        if (this.tooltipSticky) {
            this.tooltipHoverInterval = false;
        }
        this.tooltipTriangleVar = '--tooltip-triangle-translate';

        this.resetTooltipContent();
        this.init();
    }

    resetTooltipContent() {
        const htmlContent = this.element.getAttribute('data-tooltip-title');
        if (htmlContent) {
            this.tooltipContent = htmlContent;
        }
    }

    init() {
        //this.element.removeAttribute('title');
        this.element.setAttribute('tabindex', '0');
        this.element.addEventListener('mouseenter', this.handleEvent.bind(this));
        this.element.addEventListener('focus', this.handleEvent.bind(this));
    }

    removeTooltipEvents() {
        this.element.removeEventListener('mouseleave', this.handleEvent.bind(this));
        this.element.removeEventListener('blur', this.handleEvent.bind(this));
    }

    handleEvent(event) {
        switch (event.type) {
            case 'mouseenter':
            case 'focus':
                this.showTooltip();
                break;
            case 'mouseleave':
            case 'blur':
                this.checkTooltip();
                break;
            case 'newContent':
                this.changeTooltipContent(event);
                break;
        }
    }

    showTooltip() {
        if (this.tooltipIntervalId) return;
        this.tooltipTriggerHover = true;
        this.element.addEventListener('mouseleave', this.handleEvent.bind(this));
        this.element.addEventListener('blur', this.handleEvent.bind(this));
        this.element.addEventListener('newContent', this.handleEvent.bind(this));

        this.tooltipIntervalId = setTimeout(() => {
            this.createTooltip();
        }, this.tooltipDelay);
    }

    createTooltip() {
        this.tooltip = document.getElementById(this.tooltipId);

        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            document.body.appendChild(this.tooltip);
        }

        this.tooltip.removeAttribute('data-reset');
        Util.setAttributes(this.tooltip, { id: this.tooltipId, class: 'tooltip tooltip--hide js-tooltip', role: 'tooltip' });
        this.tooltip.innerHTML = this.tooltipContent;
        if (this.tooltipDescription) this.element.setAttribute('aria-describedby', this.tooltipId);
        if (this.tooltipClasses) Util.addClass(this.tooltip, this.tooltipClasses);
        if (this.tooltipSticky) Util.addClass(this.tooltip, 'tooltip--sticky');
        this.placeTooltip();
        Util.removeClass(this.tooltip, 'tooltip--hide');

        if (!this.tooltipSticky) return;
        this.tooltip.addEventListener('mouseenter', () => {
            this.tooltipHover = true;
            if (this.tooltipHoverInterval) {
                clearInterval(this.tooltipHoverInterval);
                this.tooltipHoverInterval = null;
            }
            this.tooltip.removeEventListener('mouseenter', this.tooltipLeaveEvent.bind(this));
            this.tooltipLeaveEvent();
        });
    }

    tooltipLeaveEvent() {
        this.tooltip.addEventListener('mouseleave', () => {
            this.tooltipHover = false;
            this.tooltip.removeEventListener('mouseleave', this.tooltipLeaveEvent.bind(this));
            this.hideTooltip();
        });
    }

    placeTooltip() {
        const dimention = [this.tooltip.offsetHeight, this.tooltip.offsetWidth];
        const positionTrigger = this.element.getBoundingClientRect();
        const position = [];
        const scrollY = window.scrollY || window.pageYOffset;

        position['top'] = [(positionTrigger.top - dimention[0] - this.tooltipDelta + scrollY), (positionTrigger.right / 2 + positionTrigger.left / 2 - dimention[1] / 2)];
        position['bottom'] = [(positionTrigger.bottom + this.tooltipDelta + scrollY), (positionTrigger.right / 2 + positionTrigger.left / 2 - dimention[1] / 2)];
        position['left'] = [(positionTrigger.top / 2 + positionTrigger.bottom / 2 - dimention[0] / 2 + scrollY), positionTrigger.left - dimention[1] - this.tooltipDelta];
        position['right'] = [(positionTrigger.top / 2 + positionTrigger.bottom / 2 - dimention[0] / 2 + scrollY), positionTrigger.right + this.tooltipDelta];

        let direction = this.tooltipPosition;
        if (direction === 'top' && position['top'][0] < scrollY) direction = 'bottom';
        else if (direction === 'bottom' && position['bottom'][0] + this.tooltipDelta + dimention[0] > scrollY + window.innerHeight) direction = 'top';
        else if (direction === 'left' && position['left'][1] < 0) direction = 'right';
        else if (direction === 'right' && position['right'][1] + dimention[1] > window.innerWidth) direction = 'left';

        this.tooltip.style.setProperty(this.tooltipTriangleVar, '0px');

        if (direction === 'top' || direction === 'bottom') {
            const deltaMarg = 5;
            if (position[direction][1] < 0) {
                position[direction][1] = deltaMarg;
                this.tooltip.style.setProperty(this.tooltipTriangleVar, (positionTrigger.left + 0.5 * positionTrigger.width - 0.5 * dimention[1] - deltaMarg) + 'px');
            }
            if (position[direction][1] + dimention[1] > window.innerWidth) {
                position[direction][1] = window.innerWidth - dimention[1] - deltaMarg;
                this.tooltip.style.setProperty(this.tooltipTriangleVar, (0.5 * dimention[1] - (window.innerWidth - positionTrigger.right) - 0.5 * positionTrigger.width + deltaMarg) + 'px');
            }
        }
        this.tooltip.style.top = position[direction][0] + 'px';
        this.tooltip.style.left = position[direction][1] + 'px';
        Util.addClass(this.tooltip, 'tooltip--' + direction);
    }

    checkTooltip() {
        this.tooltipTriggerHover = false;
        if (!this.tooltipSticky) this.hideTooltip();
        else {
            if (this.tooltipHover) return;
            if (this.tooltipHoverInterval) return;
            this.tooltipHoverInterval = setTimeout(() => {
                this.hideTooltip();
                this.tooltipHoverInterval = null;
            }, 300);
        }
    }

    hideTooltip() {
        if (this.tooltipHover || this.tooltipTriggerHover) return;
        clearInterval(this.tooltipIntervalId);
        if (this.tooltipHoverInterval) {
            clearInterval(this.tooltipHoverInterval);
            this.tooltipHoverInterval = null;
        }
        this.tooltipIntervalId = null;
        if (!this.tooltip) return;
        this.removeTooltip();
        this.removeTooltipEvents();
    }

    removeTooltip() {
        if (this.tooltipContent === this.tooltip.innerHTML || this.tooltip.getAttribute('data-reset') === 'on') {
            Util.addClass(this.tooltip, 'tooltip--hide');
            this.tooltip.removeAttribute('data-reset');
        }
        if (this.tooltipDescription) this.element.removeAttribute('aria-describedby');
    }

    changeTooltipContent(event) {
        if (this.tooltip && this.tooltipTriggerHover && event.detail) {
            this.tooltip.innerHTML = event.detail;
            this.tooltip.setAttribute('data-reset', 'on');
            this.placeTooltip();
        }
    }
}

export default Tooltip;
window.Tooltip = Tooltip;

// Inicialitzar els objectes Tooltip
document.addEventListener('DOMContentLoaded', () => {
    const tooltips = Array.from(document.getElementsByClassName('js-tooltip-trigger'));
    tooltips.forEach(element =>  new Tooltip(element));
});
