// src/js/modules/initComponents.js
import {
    initCustomSelect,
    initMultipleCustomSelect,
    initMultipleCustomSelectV2,
    initAdvSelect
} from '@components/forms/select-custom';

import { LanguagePicker } from '@components/forms/picker-language';

export function initComponents(context = document) {
    // select custom
    initCustomSelect(context);
    initMultipleCustomSelect(context);
    initMultipleCustomSelectV2(context);
    initAdvSelect(context);

    // language picker
    const pickers = context.querySelectorAll('.js-language-picker');
    pickers.forEach(el => {
        if (!el.dataset.lpInitialized) {
            new LanguagePicker(el);
            el.dataset.lpInitialized = 'true';
        }
    });
}