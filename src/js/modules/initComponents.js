// src/js/modules/initComponents.js
// Carrega automàticament només els components necessaris segons el DOM

export async function initComponents(context = document) {
    const lazyLoaders = [];

    // 🧭 Controls
    if (context.querySelector('.js-alert')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initAlert(context)));
    }
    if (context.querySelector('.js-anim-menu-btn')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initAnimMenuBtn(context)));
    }
    if (context.querySelector('.js-back-to-top')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initBack2Top(context)));
    }
    if (context.querySelector('.js-collapse')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initCollapse(context)));
    }
    if (context.querySelector('.js-dropdown')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initDropdown(context)));
    }
    if (context.querySelector('.js-tooltip')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initTooltip(context)));
    }
    if (context.querySelector('.js-popover')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initPopover(context)));
    }
    if (context.querySelector('.js-progress-bar')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initProgressBar(context)));
    }
    if (context.querySelector('.js-c-progress-bar')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initCProgressBar(context)));
    }
    if (context.querySelector('.js-smooth-scroll')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initSmoothScroll(context)));
    }
    if (context.querySelector('.js-ld-switch')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initLdSwitch(context)));
    }
    if (context.querySelector('.js-fullscreen-btn')) {
        lazyLoaders.push(import('@components/controls').then((m) => m.initFullscreenBtn(context)));
    }

    // 🧩 Forms
    if (context.querySelector('.js-choice-tag')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initChoiceTags(context)));
    }
    if (context.querySelector('.js-number-input')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initNumberInput(context)));
    }
    if (context.querySelector('.js-list-filter')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initListFilter(context)));
    }
    if (context.querySelector('.js-select')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initCustomSelect(context)));
    }
    if (context.querySelector('.js-multi-select')) {
        lazyLoaders.push(
            import('@components/forms').then((m) => m.initMultipleCustomSelect(context)),
        );
    }
    if (context.querySelector('.js-multi-select-v2')) {
        lazyLoaders.push(
            import('@components/forms').then((m) => m.initMultipleCustomSelectV2(context)),
        );
    }
    if (context.querySelector('.js-adv-select')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initAdvSelect(context)));
    }
    if (context.querySelector('.js-password')) {
        lazyLoaders.push(
            import('@components/forms').then((m) => m.initPasswordVisibility(context)),
        );
    }
    if (context.querySelector('.js-password-strength')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initPasswordStrength(context)));
    }
    if (context.querySelector('.js-date-picker')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initDatePicker(context)));
    }
    if (context.querySelector('.js-date-range')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initDatePickerRange(context)));
    }
    if (context.querySelector('.js-time-picker')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initTimePicker(context)));
    }
    if (context.querySelector('.js-slider')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initSlider(context)));
    }
    if (context.querySelector('.slider--multi-value.js-slider')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initSliderRange(context)));
    }
    if (context.querySelector('.js-expandable-search')) {
        lazyLoaders.push(import('@components/forms').then((m) => m.initExpandableSearch(context)));
    }

    // Overlays
    if (context.querySelector('.js-flash-message')) {
        lazyLoaders.push(import('@components/overlays').then((m) => m.initFlashMessage(context)));
    }
    if (context.querySelector('.js-toast')) {
        lazyLoaders.push(import('@components/overlays').then((m) => m.initToasts(context)));
    }



    // 🌐 Language picker
    if (context.querySelector('.js-language-picker')) {
        lazyLoaders.push(
            import('@components/forms/picker-language').then(({ LanguagePicker }) => {
                const pickers = context.querySelectorAll('.js-language-picker');
                pickers.forEach((el) => {
                    if (!el.dataset.lpInitialized) {
                        new LanguagePicker(el, {
                            onGetLangUrl: (option) =>
                                window.location.origin +
                                window.location.pathname +
                                `?lang=${option.value}`,
                        });
                        el.dataset.lpInitialized = 'true';
                    }
                });
            }),
        );
    }

    // Espera que tots els components s’hagin inicialitzat
    if (import.meta.env.DEV) {
        console.info(`🧩 initComponents: carregant ${lazyLoaders.length} components`);
        // console.group('🧩 initComponents: components carregats');
        // lazyLoaders.forEach((_, i) => console.log(`→ Component #${i + 1}`));
        // console.groupEnd();
    }
    await Promise.all(lazyLoaders);
}

import { Dialog } from '@components/overlays/dialog';