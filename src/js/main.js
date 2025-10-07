// src/js/main.js
import './components/navigation';
import './components/plugins';
import './components/table';

import { FlexiHeader } from './components/navigation';
new FlexiHeader();
import { setupCounter } from '@components/counter.js';
if (document.querySelector('#counter')) {
    setupCounter(document.querySelector('#counter'));
}

const INIT_ENTRIES = [
    // Controls
    { selector: '.js-alert', component: '@components/controls', init: 'initAlert' },
    { selector: '.js-anim-menu-btn', component: '@components/controls', init: 'initAnimMenuBtn' },
    { selector: '.js-back-to-top', component: '@components/controls', init: 'initBack2Top' },
    { selector: '.js-collapse', component: '@components/controls', init: 'initCollapse' },
    { selector: '.js-dropdown', component: '@components/controls', init: 'initDropdown' },
    { selector: '.js-tooltip-trigger', component: '@components/controls', init: 'initTooltip' },
    { selector: '.js-popover', component: '@components/controls', init: 'initPopover' },
    { selector: '.js-progress-bar', component: '@components/controls', init: 'initProgressBar' },
    { selector: '.js-c-progress-bar', component: '@components/controls', init: 'initCProgressBar' },
    { selector: '.js-smooth-scroll', component: '@components/controls', init: 'initSmoothScroll' },
    { selector: '.js-ld-switch', component: '@components/controls', init: 'initLdSwitch' },
    { selector: '.js-fullscreen-btn', component: '@components/controls', init: 'initFullscreenBtn' },

    // Forms
    { selector: '.js-choice-tag', component: '@components/forms', init: 'initChoiceTags' },
    { selector: '.js-number-input', component: '@components/forms', init: 'initNumberInput' },
    { selector: '.js-list-filter', component: '@components/forms', init: 'initListFilter' },
    { selector: '.js-select', component: '@components/forms', init: 'initCustomSelect' },
    { selector: '.js-multi-select', component: '@components/forms', init: 'initMultipleCustomSelect' },
    { selector: '.js-multi-select-v2', component: '@components/forms', init: 'initMultipleCustomSelectV2' },
    { selector: '.js-adv-select', component: '@components/forms', init: 'initAdvSelect' },
    { selector: '.js-password', component: '@components/forms', init: 'initPasswordVisibility' },
    { selector: '.js-password-strength', component: '@components/forms', init: 'initPasswordStrength' },
    { selector: '.js-date-picker', component: '@components/forms', init: 'initDatePicker' },
    { selector: '.js-date-range', component: '@components/forms', init: 'initDatePickerRange' },
    { selector: '.js-time-picker', component: '@components/forms', init: 'initTimePicker' },
    { selector: '.js-slider', component: '@components/forms', init: 'initSlider' },
    { selector: '.slider--multi-value.js-slider', component: '@components/forms', init: 'initSliderRange' },
    { selector: '.js-expandable-search', component: '@components/forms', init: 'initExpandableSearch' },
    // language picker export (no init function; expose class)
    { selector: '.js-language-picker', component: '@components/forms', expose: 'LanguagePicker' },

    // Overlays
    { selector: '.js-flash-message', component: '@components/overlays/flash-message', init: 'initFlashMessage' },
    { selector: '.js-toast', component: '@components/overlays/toast', init: 'initToasts' },
    // dialog: expose class (no init function executed here)
    { selector: '.js-dialog', component: '@components/overlays/dialog', expose: 'Dialog' },
    { selector: '.js-slideshow', component: '@components/overlays/slideshow', init: 'initSlideshow' },
    { selector: '.js-lightbox', component: '@components/overlays/lightbox', init: 'initLightbox' },
    // modal: initModal + expose Modal
    { selector: '.js-modal', component: '@components/overlays/modal', init: 'initModal', expose: 'Modal' },
    // modal video: init helper + expose ModalVideo (component components/overlays/modal exports both)
    {
        selector: '.js-modal-video__media',
        component: '@components/overlays/modal',
        init: 'initModalVideo',
        expose: 'ModalVideo',
    },
    {
        selector: '.js-modal-search',
        component: '@components/overlays',
        init: 'initFullModalSearch',
    },
];

import { initComponents } from '@modules/initComponents';
// 🚀 Inicialització global
document.addEventListener('DOMContentLoaded', () => {
    initComponents(document, INIT_ENTRIES);
});
