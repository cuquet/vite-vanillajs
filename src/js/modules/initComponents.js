// src/js/modules/initComponents.js

import * as Controls from '@components/controls';
import * as Forms from '@components/forms';
import * as Overlays from '@components/overlays';
import * as Navigation from '@components/navigation';
import * as Table from '@components/table';
import * as Plugins from '@components/plugins';

const modulesMap = {
    '@components/controls': Controls,
    '@components/forms': Forms,
    '@components/overlays': Overlays,
    '@components/navigation': Navigation,
    '@components/table': Table,
    '@components/plugins': Plugins,
};

/**
 * Inicialitza components segons el DOM i la configuració INIT_ENTRIES
 * @param {HTMLElement|Document} context
 * @param {Array} entries
 */
export async function initComponents(context = document, entries = []) {
    const isProd = import.meta.env.PROD;
    const lazyLoaders = [];
    let initializedCount = 0;

    // --- 🧩 DEBUG ---
    const ctxName = context === document ? 'document' : context.id || context.className || 'context';
    console.groupCollapsed(`🧩 initComponents dins «${ctxName}»`);
    console.groupCollapsed(`🧩 initComponents dins «${ctxName}»`);
    entries.forEach(({ selector }) => {
        const found = context.querySelectorAll(selector);
        if (found.length > 0) console.log(`✅ TROBAT ${found.length} × ${selector} dins ${ctxName}`);
    });
    console.groupEnd();

    // --- 🧭 Helper: resol dependències
    const sortedEntries = sortByDependencies(entries);

    for (const entry of sortedEntries) {
        const { selector, component, init, expose } = entry;

        const module = modulesMap[component];
        if (!module) continue;

        const nodes = [...context.querySelectorAll(selector)];
        //if (!nodes.length) continue;
        const hasNodes = nodes.length > 0;
        if (expose && typeof window !== 'undefined' && !window[expose] && module[expose]) {
            window[expose] = module[expose];
            //console.debug(`🧩 expose global creat: window.${expose}`);
        }
        if (!hasNodes) continue;

        if (isProd) {
            // PROD: assumeix que el bundle ja té tot importat
            if (init && typeof module[init] === 'function') {
                module[init](context);
                initializedCount++;
            };

        } else {
            // DEV: lazy load, però només cridem funció ja importada
            if (init && typeof module[init] === 'function') {
                const lazy = module[init](context);
                lazyLoaders.push(lazy);
                initializedCount++;
            }
        }
    }

    // --- ✅ Emet esdeveniment global ---
    const event = new CustomEvent('componentsReady', { detail: { count: initializedCount, context }, });
    window.dispatchEvent(event);
    console.info(`🧩 componentsReady emès (${initializedCount} components inicialitzats) dins «${ctxName}»`);
    console.groupEnd();
}

/**
 * Ordena els components segons el seu camp `depends`
 * (ex: AdvSelect depèn de Popover)
 */
function sortByDependencies(entries) {
    const map = new Map();
    entries.forEach((e) => map.set(e.init, e));

    const visited = new Set();
    const result = [];

    function visit(entry) {
        if (!entry || visited.has(entry.init)) return;
        visited.add(entry.init);
        if (entry.depends) {
            for (const dep of entry.depends) visit(map.get(dep));
        }
        result.push(entry);
    }

    for (const entry of entries) visit(entry);
    return result;
}

/*
Vols que et mostri una versió millorada d’aquest initComponents() amb suport de logs de diagnòstic, auto-lazy imports i sincronització amb MutationObserver (per quan apareguin nous nodes dinàmicament, sense recarregar)?
Et permetria fer que qualsevol component inserit via AJAX o SSR parcial s’inicialitzi sol.
*/
