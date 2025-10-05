/**
 * ⚡ Configuració de Vite per projecte multipàgina amb Handlebars
 *
 * 📦 Requisits:
 *   npm install --save-dev vite chokidar fs-extra glob
 *
 * 📁 Estructura recomanada:
 *   src/
 *     ├─ js/
 *     ├─ scss/
 *     └─ site/
 *         ├─ pages/
 *         └─ partials/
 *
 * 🧰 Funcions:
 *   - Compila automàticament Handlebars abans d’iniciar Vite.
 *   - Recompila pàgines o partials al vol amb watcher.
 *   - Actualitza vite.entries.json.
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';
import path from 'path';
import { spawnSync } from 'child_process';
import chokidar from 'chokidar';

const ROOT = process.cwd();
const ENTRY_FILE = path.join(ROOT, 'vite.entries.json');
const COMPILED_OUT_ROOT = path.join(ROOT, 'src');
const PAGES_GLOB = path.join(ROOT, 'src/site/pages/**/*.html');
const PARTIALS_GLOB = path.join(ROOT, 'src/site/partials/**/*.hbs');

// ------------------------------------------------
// Generem vite.entries.json si no existeix
// ------------------------------------------------
if (!fs.existsSync(ENTRY_FILE)) {
    console.log('⚠️ No s’ha trobat vite.entries.json — executant build-pages.mjs...');
    spawnSync('node', ['build-pages.mjs'], { stdio: 'inherit', shell: true });
}

// ------------------------------------------------------
// 🔧 Plugin personalitzat per recompilar Handlebars al vol
// ------------------------------------------------------
function handlebarsWatcherPlugin() {
    return {
        name: 'vite-handlebars-watch',

        configureServer(server) {
            const watcher = chokidar.watch([PAGES_GLOB, PARTIALS_GLOB], { ignoreInitial: true });

            watcher.on('change', async (filePath) => {
                console.log(`♻️  Fitxer canviat: ${filePath}`);

                try {
                    // 🧱 1. Recompilar
                    spawnSync('node', ['build-pages.mjs', filePath], {
                        stdio: 'inherit',
                        shell: true,
                    });

                    // 🕒 2. Esperar que el fitxer compilat existeixi abans del reload
                    const fileName = path.basename(filePath);
                    const compiledPath = path.join(ROOT, 'src', fileName);

                    const waitForFile = (target, tries = 10) =>
                        new Promise((resolve, reject) => {
                            const check = () => {
                                if (fs.existsSync(target)) return resolve(true);
                                if (tries-- <= 0)
                                    return reject(new Error(`No s'ha trobat ${target}`));
                                setTimeout(check, 100);
                            };
                            check();
                        });

                    await waitForFile(compiledPath);

                    console.log(`✅ Pàgina compilada: ${compiledPath}`);

                    // 🔁 3. Refrescar el navegador
                    setTimeout(() => {
                        console.log('🔁 Refrescant navegador...');
                        server.ws.send({ type: 'full-reload' });
                    }, 200);
                } catch (err) {
                    console.error('❌ Error recompilant pàgina Handlebars:', err.message);
                }
            });

            console.log('👀 Watcher Handlebars actiu (pages + partials).');
        },
    };
}

// ------------------------------------------------------
// 🚀 Configuració principal de Vite
// ------------------------------------------------------
let entries = {};
if (fs.existsSync(ENTRY_FILE)) {
    entries = JSON.parse(fs.readFileSync(ENTRY_FILE, 'utf-8'));
} else {
    console.warn('⚠️ No s’ha trobat vite.entries.json. Es generarà automàticament.');
}

export default defineConfig({
    root: 'src',
    plugins: [handlebarsWatcherPlugin()],
    resolve: {
        alias: {
            '@': path.resolve(ROOT, 'src'),
            '@components': path.resolve(ROOT, 'src/js/components'),
            '@modules': path.resolve(ROOT, 'src/js/modules'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
            },
        },
    },
    server: {
        fs: {
            allow: [path.resolve(ROOT), path.resolve(ROOT, 'src')],
        },
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: Object.fromEntries(
                Object.entries(entries).map(([name, file]) => [name, resolve(file)]),
            ),
        },
    },
});
