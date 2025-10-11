// src/js/modules/initComponents.js

import * as Controls from '@components/controls';
import * as Forms from '@components/forms';
import * as Overlays from '@components/overlays';
import * as Navigation from '@components/navigation';
import * as Table from '@components/table';
import * as Plugins from '@components/plugins';

const modulesStatic = {
    '@components/controls': Controls,
    '@components/forms': Forms,
    '@components/overlays': Overlays,
    '@components/navigation': Navigation,
    '@components/table': Table,
    '@components/plugins': Plugins,
};

// Lazy dynamic imports (només per Dev)
const modulesLazy = {
    '@components/controls': () => import('@components/controls'),
    '@components/forms': () => import('@components/forms'),
    '@components/overlays': () => import('@components/overlays'),
    '@components/navigation': () => import('@components/navigation'),
    '@components/table': () => import('@components/table'),
    '@components/plugins': () => import('@components/plugins'),
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

    // --- 🧭 Helper: resol dependències
    const sortedEntries = sortByDependencies(entries);

    for (const entry of sortedEntries) {
        const { selector, component, init, expose, depends } = entry;

        let module;
        try {
            module = isProd ? modulesStatic[component] : await modulesLazy[component]();
        } catch (err) {
            console.warn(`⚠️ No s'ha pogut importar ${component}`, err);
            continue
        }

        const nodes = [...context.querySelectorAll(selector)];
        if (!nodes.length && !expose) continue;
        
        console.groupCollapsed(`🧩 Tenim ${nodes.length} × "${selector}" dins «${ctxName}»`);
        
        if (depends) {console.log(`🔗 Depen de [${depends}]`);}
        
        let initializedThis = false;
        if (expose && typeof window !== 'undefined' && !window[expose] && module[expose]) {
            window[expose] = module[expose];
            console.log(`🌐 expose global creat: window.${expose}`);
            initializedThis = true;
        }
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
                initializedThis = true;
                console.log(`🧪 Component ${init} iniciat a «${ctxName}»`);
            } catch (err) {
                console.error(`❌ Error inicialitzant ${component}.${init}`, err);
            }
        }
        if (initializedThis) initializedCount++;
        console.groupEnd();
    }

    // --- ✅ Emet esdeveniment global ---
    const event = new CustomEvent('componentsReady', { detail: { count: initializedCount, context }, });
    window.dispatchEvent(event);
    console.info(`🧩 componentsReady emès (${initializedCount} components inicialitzats) dins «${ctxName}»`);
    console.groupEnd();
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
                else console.warn(`⚠️ Dependència no trobada: "${dep}"`);
            }
        }

        result.push(entry);
    }

    for (const entry of entries) visit(entry);
    return result;
}
