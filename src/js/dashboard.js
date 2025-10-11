// src/js/dashboard.js

const INIT_ENTRIES = [
    // Controls
    //{ selector: '.js-alert', component: '@components/controls', init: 'initAlert' },
    { selector: '.js-anim-menu-btn', component: '@components/controls', init: 'initAnimMenuBtn' },
    { selector: '.js-back-to-top', component: '@components/controls', init: 'initBack2Top' },
    { selector: '.js-collapse', component: '@components/controls', init: 'initCollapse' },
    { selector: '.js-dropdown', component: '@components/controls', init: 'initDropdown' },
    { selector: '.js-tooltip-trigger', component: '@components/controls', init: 'initTooltip' },
    { selector: '.js-popover', component: '@components/controls', init: 'initPopover' },
    { selector: '.js-progress-bar', component: '@components/controls', init: 'initProgressBar' },
    { selector: '.js-c-progress-bar', component: '@components/controls', init: 'initCProgressBar' },
    { selector: '.js-smooth-scroll', component: '@components/controls', init: 'initSmoothScroll' },
    { selector: '.js-ld-switch', component: '@components/controls', init: 'initLdSwitch', depends: ['initAdvSelect'] },
    { selector: '.js-fullscreen-btn', component: '@components/controls', init: 'initFullscreenBtn' },

    //navigation
    { selector: '.js-accordion', component: '@components/navigation', init: 'initAccordion' },
    //{ selector: '.js-f-header', component: '@components/navigation', init: 'initFlexiHeader' },
    { selector: '.js-menu', component: '@components/navigation', init: 'initMenu', expose: 'Menu' },
    { selector: '.js-menu-bar', component: '@components/navigation', init: 'initMenuBar', depends: ['initMenu'] },
    { selector: '.js-tabs', component: '@components/navigation', init: 'initTab', expose: 'Tab' },
    { selector: '.js-sidebar', component: '@components/navigation', init: 'initSidebar', expose: 'Sidebar' },
    // { selector: '.js-sidenav', component: '@components/navigation', init: 'initSidenav' },
    { selector: '.js-subnav', component: '@components/navigation', init: 'initSubNavigation' },
    { selector: '.js-exsidenav', component: '@components/navigation', init: 'initExpandableSideNav' },
    
    // Forms
    { selector: '.js-choice-tag', component: '@components/forms', init: 'initChoiceTags' },
    { selector: '.js-number-input', component: '@components/forms', init: 'initNumberInput'},
    { selector: '.js-list-filter', component: '@components/forms', init: 'initListFilter' },
    { selector: '.js-select', component: '@components/forms', init: 'initCustomSelect', depends: ['initPopover'] },
    { selector: '.js-multi-select', component: '@components/forms', init: 'initMultipleCustomSelect' },
    { selector: '.js-multi-select-v2', component: '@components/forms', init: 'initMultipleCustomSelectV2', depends: ['initListFilter'] },
    { selector: '.js-adv-select', component: '@components/forms', init: 'initAdvSelect', depends: ['initPopover'] },
    { selector: '.js-password', component: '@components/forms', init: 'initPasswordVisibility' },
    { selector: '.js-password-strength', component: '@components/forms', init: 'initPasswordStrength', depends: ['initPasswordVisibility'] },
    //{ selector: '.js-date-picker', component: '@components/forms', init: 'initDatePicker' },
    //{ selector: '.js-date-range', component: '@components/forms', init: 'initDatePickerRange', depends: ['initDatePicker'] },
    //{ selector: '.js-time-picker', component: '@components/forms', init: 'initTimePicker' },
    { selector: '.js-slider', component: '@components/forms', init: 'initSlider' },
    { selector: '.js-slider.slider--multi-value', component: '@components/forms', init: 'initSliderRange', depends: ['initSlider'] },
    { selector: '.js-expandable-search', component: '@components/forms', init: 'initExpandableSearch' },
    // language picker export (no init function; expose class)
    { selector: '.js-language-picker', component: '@components/forms', expose: 'LanguagePicker' },

    // Tables
    { selector: '.js-table', component: '@components/table', init: 'initTable' },
    { selector: '.js-cl-table', component: '@components/table', init: 'initTableColumn' },
    { selector: '.js-row-table', component: '@components/table', init: 'initTableRow' },
    { selector: '.js-ex-table', component: '@components/table', init: 'initExpandableTable' },
    { selector: '.js-int-table', component: '@components/table', init: 'initInteractiveTables', depends: ['initCustomSelect', 'initMenuBar'] },

    // Overlays
    //{ selector: '.js-flash-message', component: '@components/overlays', init: 'initFlashMessage' },
    { selector: '.js-toast', component: '@components/overlays', init: 'initToasts', expose: 'Toasts' },
    // dialog: expose class (no init function executed here)
    { selector: '.js-dialog', component: '@components/overlays', expose: 'Dialog' },
    //{ selector: '.js-slideshow', component: '@components/overlays', init: 'initSlideshow' },
    //{ selector: '.js-lightbox', component: '@components/overlays', init: 'initLightbox' },
    { selector: '.js-modal', component: '@components/overlays', init: 'initModal', expose: 'Modal', depends: ['Dialog'] },
    // modal video: init helper + expose ModalVideo (component components/overlays/modal exports both)
    // {
    //     selector: '.js-modal-video__media',
    //     component: '@components/overlays',
    //     init: 'initModalVideo',
    //     depends: ['initModal'],
    // },
    {
        selector: '.js-modal-search',
        component: '@components/overlays',
        init: 'initFullModalSearch',
        depends: ['initModal']
    },

    // Plugins
    { selector: '.js-copy-to-clip', component: '@components/plugins', init: 'initCopyClipboard', depends: ['initTooltip'] },
    //{ selector: '.js-sticky-sharebar', component: '@components/plugins', init: 'initStickySharebars' },
    //{ selector: '.js-social-share', component: '@components/plugins', init: 'initSocialShare' },
    //{ selector: '.md-editor', component: '@components/plugins', init: 'initMdEditorLazy', expose: 'MdEditor', depends: ['initTooltip'] },
    { selector: '.js-repeater', component: '@components/plugins', init: 'initRepeater' },
    { selector: '.js-news-form', component: '@components/plugins', expose: 'NewsInput' },
    //{ selector: '.js-toc', component: '@components/plugins', init: 'initToC', expose: 'ToC' },
];

import { initComponents } from '@modules/initComponents';
// 🚀 Inicialització global
document.addEventListener('DOMContentLoaded', () => {
    initComponents(document, INIT_ENTRIES);
});
