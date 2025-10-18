// src/js/modules/initComponents.js

import * as Controls from '@components/controls';
import * as Forms from '@components/forms';
import * as Overlays from '@components/overlays';
import * as Navigation from '@components/navigation';
import * as Table from '@components/table';
import * as Plugins from '@components/plugins';

// --- 🧩 Imports estàtics (producció)
const modulesStatic = {
    '@components/controls': Controls,
    '@components/forms': Forms,
    '@components/overlays': Overlays,
    '@components/navigation': Navigation,
    '@components/table': Table,
    '@components/plugins': Plugins,
};

// --- 🧩 Imports dinàmics (només en mode Dev)
const modulesLazy = {
    '@components/controls': () => import('@components/controls'),
    '@components/forms': () => import('@components/forms'),
    '@components/overlays': () => import('@components/overlays'),
    '@components/navigation': () => import('@components/navigation'),
    '@components/table': () => import('@components/table'),
    '@components/plugins': () => import('@components/plugins'),
};

// --- 🧠 Helper dev logger (silenciat en Prod)
const devLog = {
    log: (...a) => import.meta.env.DEV && console.log(...a),
    info: (...a) => import.meta.env.DEV && console.info(...a),
    warn: (...a) => import.meta.env.DEV && console.warn(...a),
    error: (...a) => import.meta.env.DEV && console.error(...a),
    group: (...a) => import.meta.env.DEV && console.groupCollapsed(...a),
    end: () => import.meta.env.DEV && console.groupEnd(),
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

    const ctxName = context === document ? 'document' : context.id || context.className || 'context';
    devLog.group(`🧩 initComponents dins «${ctxName}»`);

    const sortedEntries = sortByDependencies(entries);

    for (const entry of sortedEntries) {
        const { selector, component, init, expose, depends } = entry;

        let module;
        try {
            module = isProd ? modulesStatic[component] : await modulesLazy[component]();
        } catch (err) {
            devLog.warn(`⚠️ No s'ha pogut importar ${component}`, err);
            continue;
        }

        const nodes = [...context.querySelectorAll(selector)];
        if (!nodes.length && !expose) continue;

        devLog.group(`🧩 ${component}`);
        devLog.info(`🔎 Trobat ${nodes.length} × "${selector}" dins «${ctxName}»`);
        if (depends) devLog.log(`🔗 Depèn de [${depends.join(', ')}]`);

        let initializedThis = false;

        // Expose global
        if (expose && typeof window !== 'undefined' && !window[expose] && module[expose]) {
            window[expose] = module[expose];
            devLog.info(`🌐 expose global creat: window.${expose}`);
            initializedThis = true;
        }

        // Inici del component
        if (init && typeof module[init] === 'function') {
            try {
                if (isProd) {
                    // PROD: assumeix que el bundle ja té tot importat
                    module[init](context);
                } else {
                    // DEV: lazy load, però només cridem funció ja importada
                    const lazy = module[init](context);
                    lazyLoaders.push(lazy);
                }
                devLog.log(`🧪 Component ${init} iniciat a «${ctxName}»`);
                initializedThis = true;
            } catch (err) {
                devLog.error(`❌ Error inicialitzant ${component}.${init}`, err);
            }
        }

        if (initializedThis) initializedCount++;
        devLog.end();
    }

    // --- ✅ Emet esdeveniment global ---
    const event = new CustomEvent('componentsReady', { detail: { count: initializedCount, context } });
    window.dispatchEvent(event);

    devLog.info(`🧩 componentsReady emès (${initializedCount} components inicialitzats) dins «${ctxName}»`);
    devLog.end();
}

/**
 * Ordena els components segons el seu camp `depends`
 * Admet dependències tant per `init` com per `expose`
 * Exemple: Modal depèn de Dialog (que només té expose)
 */
function sortByDependencies(entries) {
    const map = new Map();
    for (const e of entries) {
        if (e.init) map.set(e.init, e);
        if (e.expose) map.set(e.expose, e);
    }

    const visited = new Set();
    const result = [];

    function visit(entry) {
        if (!entry || visited.has(entry.init || entry.expose)) return;
        visited.add(entry.init || entry.expose);

        if (entry.depends && Array.isArray(entry.depends)) {
            for (const dep of entry.depends) {
                const depEntry = map.get(dep);
                if (depEntry) visit(depEntry);
                else devLog.warn(`⚠️ Dependència no trobada: "${dep}"`);
            }
        }

        result.push(entry);
    }

    for (const entry of entries) visit(entry);
    return result;
}
