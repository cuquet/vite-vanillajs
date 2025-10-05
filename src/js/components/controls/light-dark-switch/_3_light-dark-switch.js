/* -------------------------------- 
File#: _3_light-dark-switch
Title: Light Dark Switch
Descr: A color theme switcher based on system preferences
-------------------------------- */

import { tools as Util } from '@modules';

export class LdSwitch {
    constructor(element) {
        this.element = element;
        this.icons = this.element.getElementsByClassName('js-ld-switch-icon');
        this.selectedIcon = 0;
        this.isSystem = false;
        this.iconClassIn = 'ld-switch-btn__icon-wrapper--in';
        this.iconClassOut = 'ld-switch-btn__icon-wrapper--out';
        this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
        this.eventBind = false;
        this.saveThemeLabels();
        this.init();
    }

    saveThemeLabels() {
        this.themes = ['light', 'dark', 'system'];
        if (this.element) {
            this.options = this.element.querySelectorAll('option');
            const lightTheme = this.options[0]?.getAttribute('data-option-theme');
            const darkTheme = this.options[1]?.getAttribute('data-option-theme');
            if (lightTheme) this.themes[0] = lightTheme;
            if (darkTheme) this.themes[1] = darkTheme;
        }
    }

    init() {
        this.setStartIcon();
        this.element.addEventListener('change', (event) => {
            this.setTheme(event.target.value);
        });
    }

    setStartIcon() {
        const selectedOptionIndex = this.element.querySelector('select').selectedIndex;
        if (selectedOptionIndex === 0) return;
        this.setTheme(selectedOptionIndex, true);
    }

    setTheme(value, init = false) {
        let theme = this.themes[0];
        let iconIndex = value;
        localStorage.setItem('ldSwitch', this.themes[value]);

        if (value == 1) {
            theme = this.themes[1];
        } else if (value == 2) {
            const isDarkTheme = this.mediaQueryList.matches;
            if (isDarkTheme) {
                iconIndex = 3;
                theme = this.themes[1];
            }
        }

        this.updateThemeValue(theme);
        this.updateIcon(iconIndex, this.selectedIcon, init);
        this.setMatchMediaEvents(value == 2, this.isSystem);
        this.isSystem = value == 2;
    }

    async updateIcon(newIcon, oldIcon, init) {
        if (init) {
            Util.removeClass(this.icons[oldIcon], this.iconClassIn);
            Util.addClass(this.icons[newIcon], this.iconClassIn);
            this.selectedIcon = newIcon;
            return;
        }
        Util.removeClass(this.icons[oldIcon], this.iconClassIn);
        Util.addClass(this.icons[oldIcon], this.iconClassOut);
        Util.addClass(this.icons[newIcon], this.iconClassIn);

        await Util.transitionend(this.icons[newIcon]);
        Util.removeClass(this.icons[oldIcon], this.iconClassOut);
        this.selectedIcon = newIcon;
    }

    updateThemeValue(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    setMatchMediaEvents(addEvent, removeEvent) {
        if (addEvent) {
            this.eventBind = this.systemUpdated.bind(this);
            this.mediaQueryList.addEventListener('change', this.eventBind);
        } else if (removeEvent) {
            this.mediaQueryList.removeEventListener('change', this.eventBind);
        }
    }

    systemUpdated() {
        const isDarkTheme = this.mediaQueryList.matches;
        const theme = isDarkTheme ? this.themes[1] : this.themes[0];
        const newIndex = isDarkTheme ? 3 : 2;
        const oldIcon = isDarkTheme ? 2 : 3;
        this.updateIcon(newIndex, oldIcon);
        this.updateThemeValue(theme);
    }
}

/**
 * Inicialitza tots els light-dark switches dins d’un context determinat.
 */
export function initLdSwitch(context = document) {
    const ldSwitches = context.querySelectorAll('.js-ld-switch');
    ldSwitches.forEach((el) => new LdSwitch(el));

    // Configura el tema inicial basat en el valor guardat
    const htmlEl = document.documentElement;
    const ldTheme = localStorage.getItem('ldSwitch');

    if (
        ldTheme === 'dark' ||
        (ldTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
        htmlEl.setAttribute('data-theme', 'dark');
    } else if (ldTheme === 'light') {
        htmlEl.setAttribute('data-theme', 'light');
    }
}
