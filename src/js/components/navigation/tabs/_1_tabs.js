/* -------------------------------- 

File#: _1_tabs
Title: Tabs
Descr: A list of content sections (panels), accessible one at a time using control labels
Usage: https://codyhouse.co/ds/components/info/tabs

-------------------------------- */

import { tools as Util } from '@modules';

class Tab {
    constructor(element) {
        this.element = element;
        this.tabList = this.element.querySelector('.js-tabs__controls');
        this.listItems = this.tabList.getElementsByTagName('li');
        this.triggers = this.tabList.getElementsByTagName('a');
        this.panelsList = this.element.querySelector('.js-tabs__panels');
        this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
        this.hideClass = this.element.getAttribute('data-hide-panel-class') || 'hide';
        this.customShowClass = this.element.getAttribute('data-show-panel-class') || false;
        this.layout = this.element.getAttribute('data-tabs-layout') || 'horizontal';
        this.deepLinkOn = this.element.getAttribute('data-deep-link') === 'on';
        this.init();
    }

    init() {
        this.tabList.setAttribute('role', 'tablist');
        Util.addClass(this.element, 'tabs--no-interaction');

        Array.from(this.triggers).forEach((trigger, i) => {
            const isSelected = trigger.getAttribute('aria-selected') === 'true';
            const panelId = this.panels[i].getAttribute('id');
            this.listItems[i].setAttribute('role', 'presentation');
            Util.setAttributes(trigger, { role: 'tab', 'aria-selected': isSelected, 'aria-controls': panelId, id: 'tab-' + panelId });
            Util.addClass(trigger, 'js-tabs__trigger');
            Util.setAttributes(this.panels[i], { role: 'tabpanel', 'aria-labelledby': 'tab-' + panelId });
            Util.toggleClass(this.panels[i], this.hideClass, !isSelected);

            if (isSelected && this.customShowClass) Util.addClass(this.panels[i], this.customShowClass);
            trigger.setAttribute('tabindex', isSelected ? '0' : '-1');
        });

        this.initEvents();
        this.initDeepLink();
    }

    initEvents() {
        this.tabList.addEventListener('click', (event) => {
            const trigger = event.target.closest('.js-tabs__trigger');
            if (trigger) this.triggerTab(trigger, event);
        });

        this.tabList.addEventListener('keydown', (event) => {
            const trigger = event.target.closest('.js-tabs__trigger');
            if (!trigger) return;

            if (this.tabNavigateNext(event)) {
                event.preventDefault();
                this.selectNewTab('next');
            } else if (this.tabNavigatePrev(event)) {
                event.preventDefault();
                this.selectNewTab('prev');
            }
        });
    }

    selectNewTab(direction) {
        const selectedTab = this.tabList.querySelector('[aria-selected="true"]');
        let index = Util.getIndexInArray(this.triggers, selectedTab);
        index = direction === 'next' ? index + 1 : index - 1;

        if (index < 0) index = this.listItems.length - 1;
        if (index >= this.listItems.length) index = 0;

        this.triggerTab(this.triggers[index]);
        this.triggers[index].focus();
    }

    triggerTab(tabTrigger, event) {
        if (event) event.preventDefault();
        const index = Util.getIndexInArray(this.triggers, tabTrigger);

        if (this.triggers[index].getAttribute('aria-selected') === 'true') return;

        Util.removeClass(this.element, 'tabs--no-interaction');
        Array.from(this.triggers).forEach((trigger, i) => {
            const isSelected = i === index;
            Util.toggleClass(this.panels[i], this.hideClass, !isSelected);
            if (this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, isSelected);
            trigger.setAttribute('aria-selected', isSelected);
            trigger.setAttribute('tabindex', isSelected ? '0' : '-1');
        });

        if (this.deepLinkOn) {
            history.replaceState(null, '', '#' + tabTrigger.getAttribute('aria-controls'));
        }
    }

    initDeepLink() {
        if (!this.deepLinkOn) return;
        const hash = window.location.hash.substr(1);
        if (!hash) return;

        Array.from(this.panels).forEach((panel, i) => {
            if (panel.getAttribute('id') === hash) {
                this.triggerTab(this.triggers[i], false);
                setTimeout(() => { panel.scrollIntoView(true); });
            }
        });
    }

    tabNavigateNext(event) {
        return (this.layout === 'horizontal' && (event.key === 'ArrowRight' || event.code === 39)) ||
               (this.layout === 'vertical' && (event.key === 'ArrowDown' || event.code === 40));
    }

    tabNavigatePrev(event) {
        return (this.layout === 'horizontal' && (event.key === 'ArrowLeft' || event.code === 37)) ||
               (this.layout === 'vertical' && (event.key === 'ArrowUp' || event.code === 38));
    }
}

window.Tab = Tab;

function initTab(context = document) {
    const elements = context.querySelectorAll('.js-tabs');
    elements.forEach(el => {
        if (!el.dataset.tabInitialized) {
            new Tab(el);
            el.dataset.tabInitialized = 'true';
        }
    });
}

export { Tab, initTab };