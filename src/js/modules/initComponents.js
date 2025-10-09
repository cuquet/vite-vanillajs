// src/js/modules/initComponents.js

import * as Controls from '@components/controls';
import * as Forms from '@components/forms';
import * as Overlays from '@components/overlays';
import * as Navigation from '@components/navigation';
import * as Table from '@components/table'
import * as Plugins from '@components/plugins'

/**
 * Inicialitza components segons el DOM i la configuració INIT_ENTRIES
 * @param {HTMLElement|Document} context
 * @param {Array} entries
 */
export async function initComponents(context = document, entries = []) {
    const isProd = import.meta.env.PROD;
    const lazyLoaders = [];
    let initializedCount = 0;

    for (const entry of entries) {
        const { selector, component, init, expose } = entry;

        if (!context.querySelector(selector)) continue;
        let module;
        if (component.startsWith('@components/controls')) module = Controls;
        else if (component.startsWith('@components/navigation')) module = Navigation;
        else if (component.startsWith('@components/forms')) module = Forms;
        else if (component.startsWith('@components/table')) module = Table;
        else if (component.startsWith('@components/overlays')) module = Overlays;
        else if (component.startsWith('@components/plugins')) module = Plugins;
        else {
            console.warn('Component no reconegut:', component);
            continue;
        }

        if (isProd) {
            // PROD: assumeix que el bundle ja té tot importat
            if (init && typeof module[init] === 'function') {
                module[init](context);
                initializedCount++;
            };
            if (expose && typeof window !== 'undefined' && !window[expose]) {
                window[expose] = module[expose];
            }
        } else {
          // DEV: lazy load, però només cridem funció ja importada
            if (init && typeof module[init] === 'function') {
                const lazy = module[init](context);
                lazyLoaders.push(lazy);
                initializedCount++;
            }
            if (expose && typeof window !== 'undefined' && !window[expose]) {
                window[expose] = module[expose];
            }
        }
    }

    if (!isProd && lazyLoaders.length) {
        await Promise.all(lazyLoaders);
        console.info(`🧩 initComponents: carregats ${lazyLoaders.length} components`);
    }

    // --- ✅ Emitim l’esdeveniment global ---
    window.dispatchEvent(
        new CustomEvent('componentsReady', {
        detail: { count: initializedCount, context },
        })
    );

    console.info(`✅ componentsReady emès (${initializedCount} components inicialitzats)`);
}
