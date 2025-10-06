// src/js/modules/allComponents.js

import * as Controls from '@components/controls';
import * as Forms from '@components/forms';
import * as Overlays from '@components/overlays';

export function initAllComponents(context = document) {
    // Controls
    if (context.querySelector('.js-alert')) Controls.initAlert(context);
    if (context.querySelector('.js-anim-menu-btn')) Controls.initAnimMenuBtn(context);
    if (context.querySelector('.js-back-to-top')) Controls.initBack2Top(context);
    if (context.querySelector('.js-collapse')) Controls.initCollapse(context);
    if (context.querySelector('.js-dropdown')) Controls.initDropdown(context);
    if (context.querySelector('.js-tooltip-trigger')) Controls.initTooltip(context);
    if (context.querySelector('.js-popover')) Controls.initPopover(context);
    if (context.querySelector('.js-progress-bar')) Controls.initProgressBar(context);
    if (context.querySelector('.js-c-progress-bar')) Controls.initCProgressBar(context);
    if (context.querySelector('.js-smooth-scroll')) Controls.initSmoothScroll(context);
    if (context.querySelector('.js-ld-switch')) Controls.initLdSwitch(context);
    if (context.querySelector('.js-fullscreen-btn')) Controls.initFullscreenBtn(context);

    // Forms
    if (context.querySelector('.js-choice-tag')) Forms.initChoiceTags(context);
    if (context.querySelector('.js-number-input')) Forms.initNumberInput(context);
    if (context.querySelector('.js-list-filter')) Forms.initListFilter(context);
    if (context.querySelector('.js-select')) Forms.initCustomSelect(context);
    if (context.querySelector('.js-multi-select')) Forms.initMultipleCustomSelect(context);
    if (context.querySelector('.js-multi-select-v2')) Forms.initMultipleCustomSelectV2(context);
    if (context.querySelector('.js-adv-select')) Forms.initAdvSelect(context);
    if (context.querySelector('.js-password')) Forms.initPasswordVisibility(context);
    if (context.querySelector('.js-password-strength')) Forms.initPasswordStrength(context);
    if (context.querySelector('.js-date-picker')) Forms.initDatePicker(context);
    if (context.querySelector('.js-date-range')) Forms.initDatePickerRange(context);
    if (context.querySelector('.js-time-picker')) Forms.initTimePicker(context);
    if (context.querySelector('.js-slider')) Forms.initSlider(context);
    if (context.querySelector('.slider--multi-value.js-slider')) Forms.initSliderRange(context);
    if (context.querySelector('.js-expandable-search')) Forms.initExpandableSearch(context);

    // Overlays
    if (context.querySelector('.js-flash-message')) Overlays.initFlashMessage(context);
    if (context.querySelector('.js-toast')) Overlays.initToasts(context);
    if (context.querySelector('.js-dialog')) {
        if (!window.Dialog) window.Dialog = Overlays.Dialog;
    }
    if (context.querySelector('.js-slideshow')) Overlays.initSlideshow(context);
    if (context.querySelector('.js-lightbox')) Overlays.initLightbox(context);
    if (context.querySelector('.js-modal')) Overlays.initModal(context);
    if (context.querySelector('.js-modal-video__media')) Overlays.initModalVideo(context);
    if (context.querySelector('.js-modal-search')) Overlays.initFullModalSearch(context);

    // expose globals
    if (typeof window !== 'undefined') {
        if (!window.Modal) window.Modal = Overlays.Modal;
        if (!window.ModalVideo) window.ModalVideo = Overlays.ModalVideo;
        if (!window.Dialog) window.Dialog = Overlays.Dialog;
    }
}
