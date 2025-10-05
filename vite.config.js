/**
 * ⚡ Configuració de Vite per projecte multipàgina amb Handlebars
 *
 * 📦 Requisits:
 *   npm install --save-dev vite chokidar fs-extra glob
 *
 * 📁 Estructura recomanada:
 *   src/ ← (arrel de Vite)
 *     ├─ js/
 *     │   └─ main.js
 *     ├─ scss/
 *     │   └─ style.scss
 *     └─ site/
 *         ├─ pages/
 *         └─ partials/   
 *
 * 🧰 Funcions:
 *   - Compila automàticament les pàgines Handlebars abans d’iniciar Vite.
 *   - Actualitza el fitxer vite.entries.json.
 *   - Esborra fitxers temporals després del build.
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import path from 'path';
import { glob } from 'glob';
import chokidar from 'chokidar';

const ROOT = process.cwd();
const ENTRY_FILE = path.join(ROOT, 'vite.entries.json');
const COMPILED_OUT_ROOT = path.join(ROOT, 'src'); // on build-pages escriu els HTML compilats
const PAGES_GLOB = path.join(ROOT, 'src/site/pages/**/*.html');
const PARTIALS_GLOB = path.join(ROOT, 'src/site/partials/**/*.hbs');

// ------------------------------------------------
//   Assegurem que hi hagi vite.entries.json abans de carregar
//   (això evita que rollupOptions.input quedi buit)
// ------------------------------------------------
if (!fs.existsSync(ENTRY_FILE)) {
  console.log('⚠️ No s’ha trobat vite.entries.json — executant build-pages.mjs per generar entrades...');
  execSync('node build-pages.mjs', { stdio: 'inherit' });
}

// ------------------------------------------------------
// 🔧 Plugin personalitzat per compilar pàgines Handlebars
//    - observa canvis a pages/ i partials/
//    - crida build-pages.mjs <fitxer> per recompilar només el que cal
//    - quan el build finalitza (command === 'build'), elimina només els fitxers llistats
// ------------------------------------------------------
function handlebarsWatcherPlugin() {
  return {
    name: 'vite-handlebars-watch',

    configureServer(server) {
      // Watch en dev: quan canvia un partial o una pàgina, re-executa build-pages per aquell fitxer
      const watcher = chokidar.watch([PAGES_GLOB, PARTIALS_GLOB], { ignoreInitial: true });

      watcher.on('change', (filePath) => {
        console.log(`♻️  Fitxer canviat: ${filePath} — recompilant...`);
        // passem la ruta del fitxer a build-pages.mjs per compilar només el necessari
        try {
          execSync(`node build-pages.mjs "${filePath}"`, { stdio: 'inherit' });
          // refresquem entries a memoria
          if (fs.existsSync(ENTRY_FILE)) {
            entries = fs.readJsonSync(ENTRY_FILE);
          }
          // forcem recàrrega completa (simple i robust)
          server.ws.send({ type: 'full-reload' });
        } catch (err) {
          console.error('Error en recompilar pàgina:', err);
        }
      });
    },

    // closeBundle s'executa al final del build; eliminarem només els arxius listats a vite.entries.json
    closeBundle() {
      // Només fer això en build de producció (Vite executa closeBundle tant en dev com build; comprovarem NODE_ENV)
      const isProd = process.env.NODE_ENV === 'production' || process.env.VITE_BUILD === 'true';
      if (!isProd) {
        // Preferim no esborrar en dev per poder inspeccionar els fitxers
        return;
      }

      if (!fs.existsSync(ENTRY_FILE)) return;

      const entriesToRemove = fs.readJsonSync(ENTRY_FILE);
      console.log('🧹 Esborrant només les pàgines compilades indicades a vite.entries.json...');
      for (const key of Object.keys(entriesToRemove)) {
        const filePath = entriesToRemove[key];
        if (fs.existsSync(filePath)) {
          try {
            fs.removeSync(filePath);
            console.log(`✅ Eliminat: ${filePath}`);
          } catch (err) {
            console.warn(`⚠️ No s'ha pogut eliminar ${filePath}:`, err.message);
          }
        }
      }
      // finalment, esborrem el fitxer d'entrades
      try {
        fs.removeSync(ENTRY_FILE);
        console.log('✅ Eliminat: vite.entries.json');
      } catch (err) {
        console.warn('⚠️ No s’ha pogut eliminar vite.entries.json:', err.message);
      }
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
    root: 'src', // arrel pública
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

    // ✅ Permet accedir a fitxers fora del root (`src/`)
    server: {
        fs: {
            // 🟢 Permet accedir a src i a la carpeta arrel del projecte
            allow: [
                path.resolve(ROOT),
                path.resolve(ROOT, 'src'),
            ],
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
