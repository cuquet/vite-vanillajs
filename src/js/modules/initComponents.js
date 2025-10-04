// src/js/modules/initComponents.js
import {
    initCustomSelect,
    initMultipleCustomSelect,
    initMultipleCustomSelectV2,
    initAdvSelect,
    initDatePicker,
    initDatePickerRange,
} from '@components/forms';

import { LanguagePicker } from '@components/forms/picker-language';

export function initComponents(context = document) {
    // select custom
    initCustomSelect(context);
    initMultipleCustomSelect(context);
    initMultipleCustomSelectV2(context);
    initAdvSelect(context);
    initDatePicker(context);
    initDatePickerRange(context);

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