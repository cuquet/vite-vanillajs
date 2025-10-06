// src/js/modules/initComponents.js
import * as Controls from '@components/controls';
import * as Forms from '@components/forms';
import * as Overlays from '@components/overlays';

/**
 * Components globals que exposem a window per poder fer servir des d’HTML
 * Exemple: window.Modal
 */
const GLOBAL_EXPORTS = ['Dialog', 'Modal', 'ModalVideo', 'LanguagePicker'];

/**
 * Inicialitza components segons selectors
 * @param {HTMLElement|Document} context
 */
export async function initComponents(context = document) {
    const isProd = import.meta.env.PROD;

    const initMap = [
        // Controls
        ['.js-alert', 'initAlert', Controls],
        ['.js-anim-menu-btn', 'initAnimMenuBtn', Controls],
        ['.js-back-to-top', 'initBack2Top', Controls],
        ['.js-collapse', 'initCollapse', Controls],
        ['.js-dropdown', 'initDropdown', Controls],
        ['.js-tooltip-trigger', 'initTooltip', Controls],
        ['.js-popover', 'initPopover', Controls],
        ['.js-progress-bar', 'initProgressBar', Controls],
        ['.js-c-progress-bar', 'initCProgressBar', Controls],
        ['.js-smooth-scroll', 'initSmoothScroll', Controls],
        ['.js-ld-switch', 'initLdSwitch', Controls],
        ['.js-fullscreen-btn', 'initFullscreenBtn', Controls],

        // Forms
        ['.js-choice-tag', 'initChoiceTags', Forms],
        ['.js-number-input', 'initNumberInput', Forms],
        ['.js-list-filter', 'initListFilter', Forms],
        ['.js-select', 'initCustomSelect', Forms],
        ['.js-multi-select', 'initMultipleCustomSelect', Forms],
        ['.js-multi-select-v2', 'initMultipleCustomSelectV2', Forms],
        ['.js-adv-select', 'initAdvSelect', Forms],
        ['.js-password', 'initPasswordVisibility', Forms],
        ['.js-password-strength', 'initPasswordStrength', Forms],
        ['.js-date-picker', 'initDatePicker', Forms],
        ['.js-date-range', 'initDatePickerRange', Forms],
        ['.js-time-picker', 'initTimePicker', Forms],
        ['.js-slider', 'initSlider', Forms],
        ['.slider--multi-value.js-slider', 'initSliderRange', Forms],
        ['.js-expandable-search', 'initExpandableSearch', Forms],

        // Overlays
        ['.js-flash-message', 'initFlashMessage', Overlays],
        ['.js-toast', 'initToasts', Overlays],
        ['.js-dialog', 'Dialog', Overlays],
        ['.js-slideshow', 'initSlideshow', Overlays],
        ['.js-lightbox', 'initLightbox', Overlays],
        ['.js-modal', 'initModal', Overlays],
        ['.js-modal-video__media', 'ModalVideo', Overlays],
        ['.js-modal-search', 'initFullModalSearch', Overlays],
        ['.js-language-picker', 'LanguagePicker', Forms],
    ];

    // --- 🔧 PRODUCCIÓ: tot en un bundle únic ---
    if (isProd) {
        for (const [selector, fn, module] of initMap) {
            if (context.querySelector(selector) && typeof module[fn] === 'function') {
                module[fn](context);
                // exposar globals si cal
                if (GLOBAL_EXPORTS.includes(fn) && typeof window !== 'undefined') {
                    if (!window[fn]) window[fn] = module[fn];
                }
            }
        }
        return;
    }
    // --- ⚙️ DESENVOLUPAMENT: lazy load dinàmic ---
    const lazyLoaders = [];
    // 🧭 Controls
    if (context.querySelector('.js-alert')) {
        lazyLoaders.push(import('@components/controls/alert').then((m) => m.initAlert(context)));
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
    if (context.querySelector('.js-tooltip-trigger')) {
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
    if (context.querySelector('.js-language-picker')) {
        lazyLoaders.push(
            import('@components/forms/picker-language').then(({ LanguagePicker }) => {
                // només assegura que el mòdul estigui carregat
                if (typeof window !== 'undefined') {
                    if (!window.LanguagePicker) window.LanguagePicker = LanguagePicker;
                }
            }),
        );
    }
    // Overlays
    if (context.querySelector('.js-flash-message')) {
        lazyLoaders.push(import('@components/overlays/flash-message').then((m) => m.initFlashMessage(context)));
    }
    if (context.querySelector('.js-toast')) {
        lazyLoaders.push(import('@components/overlays/toast').then((m) => m.initToasts(context)));
    }
    if (context.querySelector('.js-dialog')) {
        lazyLoaders.push(
            import('@components/overlays/dialog').then(({ Dialog }) => {
                // només assegura que el mòdul estigui carregat
                if (typeof window !== 'undefined') {
                    if (!window.Dialog) window.Dialog = Dialog;
                }
            }),
        );
    }
    if (context.querySelector('.js-slideshow')) {
        lazyLoaders.push(
            import('@components/overlays/slideshow').then(({ initSlideshow }) => {
                initSlideshow(context); // inicialitza només els elements del context actual
            }),
        );
    }
    if (context.querySelector('.js-lightbox')) {
        lazyLoaders.push(
            import('@components/overlays/lightbox').then(({ initLightbox }) => {
                initLightbox(context); // inicialitza només els elements del context actual
            }),
        );
    }
    if (context.querySelector('.js-modal')) {
        lazyLoaders.push(
            import('@components/overlays/modal').then(({ Modal, initModal}) => {
                initModal(context); 
                if (typeof window !== 'undefined' && !window.Modal) {
                    window.Modal = Modal;
                }
            }),
        );
    }
    if (context.querySelector('.js-modal-video__media')) {
        lazyLoaders.push(
            import('@components/overlays/modal').then(({ ModalVideo, initModalVideo }) => {
                if (typeof window !== 'undefined' && !window.ModalVideo) {
                    window.ModalVideo = ModalVideo;
                }
                initModalVideo(context);
            }),
        );
    }
    if (context.querySelector('.js-modal-search')) {
        lazyLoaders.push(
            import('@components/overlays/full-screen-search').then((m) => m.initFullModalSearch(context))
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
