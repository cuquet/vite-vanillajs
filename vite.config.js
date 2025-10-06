/**
 * ⚡ Configuració de Vite per projecte multipàgina amb Handlebars
 *
 * 📦 Requisits:
 *   npm install --save-dev vite chokidar fs-extra glob
 *
 * 🧰 Funcions:
 *   - Compila pàgines Handlebars abans d’iniciar Vite.
 *   - Detecta canvis a pages/ i partials/ i recompila només el fitxer afectat.
 *   - Actualitza vite.entries.json.
 *   - Recarrega correctament el navegador.
 *   - En mode build, només compila pàgines específiques.
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import path from 'path';
import chokidar from 'chokidar';

const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, 'src');
const ENTRY_FILE = path.join(ROOT, 'vite.entries.json');
const PAGES_DIR = path.join(SRC_ROOT, 'site/pages');
const PARTIALS_DIR = path.join(SRC_ROOT, 'site/partials');

// ------------------------------------------------------
// 🧱 Execució build-pages.mjs
// ------------------------------------------------------
function buildPages(file = '') {
    return new Promise((resolve, reject) => {
        const arg = file ? `"${file}"` : '';
        const proc = exec(`node build-pages.mjs ${arg}`, { stdio: 'inherit' });

        proc.stdout?.pipe(process.stdout);
        proc.stderr?.pipe(process.stderr);

        proc.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`build-pages.mjs exited with code ${code}`));
        });
    });
}

// ------------------------------------------------------
// 🔧 Plugin Handlebars watcher
// ------------------------------------------------------
function handlebarsWatcherPlugin() {
    return {
        name: 'vite-handlebars-watch',
        configureServer(server) {
            const watcher = chokidar.watch(
                ['src/site/pages/**/*.html', 'src/site/partials/**/*.hbs'],
                { ignoreInitial: true },
            );

            watcher.on('change', async (filePath) => {
                console.log(`♻️ Fitxer canviat: ${filePath}`);

                try {
                    await buildPages(filePath);
                    console.log('✅ build-pages.mjs completat, recarregant...');
                    // 👇 Espera una mica abans del reload per assegurar que el fitxer s’ha escrit
                    setTimeout(() => {
                        server.ws.send({ type: 'full-reload' });
                    }, 200);
                } catch (err) {
                    console.error('❌ Error durant la compilació Handlebars:', err);
                }
            });

            console.log('👀 Watcher Handlebars actiu (pages + partials)');
        },
    };
}

// ------------------------------------------------------
// 🚀 Config principal de Vite
// ------------------------------------------------------
export default defineConfig(({ command }) => {
    if (!fs.existsSync(ENTRY_FILE)) {
        console.log('⚙️ Generant vite.entries.json inicial...');
        buildPages();
    }

    let entries = {};
    if (fs.existsSync(ENTRY_FILE)) {
        entries = JSON.parse(fs.readFileSync(ENTRY_FILE, 'utf-8'));
    }

    // 🏗️ Mode build: només pàgines específiques
    if (command === 'build') {
        const allowed = ['index', 'dashboard'];
        entries = Object.fromEntries(
            Object.entries(entries).filter(([key]) => allowed.includes(key)),
        );
        console.log('🏗️ Compilant només pàgines:', Object.keys(entries).join(', '));
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
            },
        },
    };
});
