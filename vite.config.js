// vite.config.js
/**
 * ⚡ Configuració de Vite per projecte multipàgina amb Handlebars
 *
 * 📦 Requisits:
 *   npm install --save-dev vite fs-extra
 *
 * 🧰 Funcions:
 *   - Compila pàgines Handlebars abans d’iniciar Vite.
 *   - Detecta canvis a pages/ i partials/ i recompila només el fitxer afectat.
 *   - Actualitza vite.entries.json.
 *   - Recarrega correctament el navegador.
 *   - En mode build, només compila pàgines específiques.
 */

import { defineConfig } from 'vite';
import path from 'path';
import { resolve } from 'path';
import fs from 'fs-extra';
import { execSync} from 'child_process';


const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, 'src');
const ENTRY_FILE = path.join(ROOT, 'vite.entries.json');
const PAGES_DIR = path.join(SRC_ROOT, 'site/pages');
const PARTIALS_DIR = path.join(SRC_ROOT, 'site/partials');

// ------------------------------------------------------
// 🧱 Execució build-pages.mjs
// ------------------------------------------------------
function buildPages(file = '') {
    try {
        // 🧮 Converteix el path absolut (si existeix) a relatiu respecte a ROOT
        const relPath = file ? path.relative(ROOT, file) : '';
        const arg = relPath ? `"${relPath}"` : '';
        console.log(`🏗️ Executant build-pages.mjs ${arg || '(totes les pàgines)'}`);

        // 🧱 Executa build-pages.mjs sempre amb cwd = ROOT
        execSync(`node build-pages.mjs ${arg}`, {
            cwd: ROOT,
            stdio: 'inherit',
        });
    } catch (err) {
        console.error('❌ Error executant build-pages.mjs:', err.message);
    }
}

// ------------------------------------------------------
// 🔧 Plugin Handlebars watcher
// ------------------------------------------------------
function handlebarsWatcherPlugin() {
    return {
        name: 'vite-handlebars-watch',
        configureServer(server) {
            console.log('👀 Watcher Handlebars actiu (pages + partials)');
            // Indica explícitament a Vite que estigui atent a aquests patterns
            const pagesGlob = path.join(PAGES_DIR, '**/*.html');
            const partialsGlob = path.join(PARTIALS_DIR, '**/*.hbs');
            server.watcher.add([pagesGlob, partialsGlob]);

            // Debounce per evitar múltiples builds immediats
            let pendingTimer = null;
            const DEBOUNCE_MS = 120;

            server.watcher.on('change', (filePath) => {
                if (!filePath) return;
                console.log(`♻️ Fitxer canviat: ${filePath}`);

                const normalized = path.normalize(filePath);
                const rel = path.relative(ROOT, normalized);

                // Comparacions robustes: comprova si el fitxer està dins pages o partials
                const pagesRelPrefix = path.relative(ROOT, PAGES_DIR);
                const partialsRelPrefix = path.relative(ROOT, PARTIALS_DIR);

                const isPage = rel.startsWith(pagesRelPrefix + path.sep) || rel === pagesRelPrefix;
                const isPartial = rel.startsWith(partialsRelPrefix + path.sep) || rel === partialsRelPrefix;

                if (!isPage && !isPartial) return; // no és del nostre interès

                console.log(`♻️ Handlebars canviat: ${filePath} (recompilaré)`);
                if (pendingTimer) clearTimeout(pendingTimer);
                pendingTimer = setTimeout(() => {
                    pendingTimer = null;
                    try {
                        // regenéra només el fitxer canviat
                        buildPages(filePath);
                        console.log('✅ build-pages.mjs completat, forçant recarrega del navegador...');
                        // Dona un petit marge perquè el fs estigui net
                        setTimeout(() => server.ws.send({ type: 'full-reload' }), 120);
                    } catch (err) {
                        console.error('❌ Error durant la compilació Handlebars:', err);
                    }
                }, DEBOUNCE_MS);
            });
        },
    };
}

// ------------------------------------------------------
// 🚀 Config principal de Vite
// ------------------------------------------------------
export default defineConfig(({ command }) => {
    // ⚙️ Genera vite.entries.json si no existeix
    if (!fs.existsSync(ENTRY_FILE)) {
        console.log('⚙️ Generant vite.entries.json inicial...');
        buildPages();
    }

    // 📦 Llegeix entrades
    let entries = {};
    if (fs.existsSync(ENTRY_FILE)) {
        entries = JSON.parse(fs.readFileSync(ENTRY_FILE, 'utf-8'));
    }

    // 🏗️ Mode build: només pàgines específiques
    if (command === 'build') {
        buildPages(); // 🧱 reconstrueix tot abans del build
        const allowed = ['index', 'dashboard', 'overlay-modal', 'overlay-dialog'];
        entries = Object.fromEntries(
            Object.entries(entries).filter(([key]) => allowed.includes(key)),
        );
        console.log('🏗️ Compilant només pàgines:', Object.keys(entries).join(', '));
    }

    // 🚀 Mode serve —> sempre fer buildPages() abans d’arrencar
    if (command === 'serve') {
        console.log('🚀 Iniciant Vite (mode desenvolupament): regenerant pàgines...');
        buildPages();
    }

    return {
        root: SRC_ROOT,
        plugins: [handlebarsWatcherPlugin()],
        resolve: {
            alias: {
                '@': path.resolve(SRC_ROOT),
                '@components': path.resolve(SRC_ROOT, 'js/components'),
                '@modules': path.resolve(SRC_ROOT, 'js/modules'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: [
                        'mixed-decls',
                        'color-functions',
                        'global-builtin',
                        'import',
                    ],
                },
            },
        },
        server: {
            fs: { allow: [SRC_ROOT] },
        },
        build: {
            outDir: '../dist',
            emptyOutDir: true,
            rollupOptions: {
                input: Object.fromEntries(
                    Object.entries(entries).map(([name, file]) => [name, resolve(file)]),
                ),
                output: {
                    manualChunks: undefined, // 💥 força un sol chunk per bundle
                },
            },
            minify: 'esbuild',
            esbuild: {
                drop: ['console', 'debugger'],
            },
        },
    };
});
