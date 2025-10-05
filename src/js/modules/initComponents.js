// src/js/modules/initComponents.js
import {
    initAlert,
    initAnimMenuBtn, 
    initBack2Top,
    initCollapse,
    initDropdown,
    initTooltip,
    initPopover,
    initProgressBar,
    initCProgressBar,
    initSmoothScroll,
    initLdSwitch,
    initFullscreenBtn,
} from '@components/controls'
import {
    initChoiceTags,
    initNumberInput,
    initListFilter,
    initCustomSelect,
    initMultipleCustomSelect,
    initMultipleCustomSelectV2,
    initAdvSelect,
    initPasswordVisibility,
    initPasswordStrength,
    initDatePicker,
    initDatePickerRange,
    initTimePicker,
    initSlider,
    initSliderRange,
    initExpandableSearch,
} from '@components/forms';

import { LanguagePicker } from '@components/forms/picker-language';

export function initComponents(context = document) {
    // src/js/components/controls
    initAlert(context);
    initAnimMenuBtn(context);
    initBack2Top(context);
    initCollapse(context);
    initDropdown(context);
    initTooltip(context);
    initPopover(context);
    initProgressBar(context);
    initCProgressBar(context);
    initSmoothScroll(context);
    initLdSwitch(context);
    initFullscreenBtn(context);
    // src/js/components/forms
    initChoiceTags(context);
    initNumberInput(context);
    initListFilter(context);
    initCustomSelect(context);
    initMultipleCustomSelect(context);
    initMultipleCustomSelectV2(context);
    initAdvSelect(context);
    initPasswordVisibility(context);
    initPasswordStrength(context);
    initDatePicker(context);
    initDatePickerRange(context);
    initTimePicker(context);
    initSlider(context);
    initSliderRange(context);
    initExpandableSearch(context);

    // language picker
    const pickers = context.querySelectorAll('.js-language-picker');
    pickers.forEach(el => {
        if (!el.dataset.lpInitialized) {
            new LanguagePicker(el, {
                    onGetLangUrl: (option) => {
                        return window.location.origin + window.location.pathname + `?lang=${option.value}`;
                        //return window.location + `?lang=${option.value}`;
                    },
                })
            el.dataset.lpInitialized = 'true';
        }
    });
}