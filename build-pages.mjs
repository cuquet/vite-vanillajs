/**
 * 🛠️ Compilador Handlebars per a projectes Vite multipàgina
 *
 * 📦 Requisits:
 *   npm install --save-dev handlebars fs-extra glob
 *
 * 📁 Estructura:
 *   src/
 *     ├─ js/
 *     ├─ scss/
 *     └─ site/
 *         ├─ pages/       → fitxers .html amb sintaxi Handlebars
 *         └─ partials/    → components .hbs
 *
 * 📜 Ús:
 *   - node build-pages.mjs
 *   - node build-pages.mjs src/site/pages/index.html
 *   - node build-pages.mjs src/site/partials/header.hbs
 */

import handlebars from 'handlebars';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const PAGES = path.join(SRC, 'site/pages');
const PARTIALS = path.join(SRC, 'site/partials');
const ENTRY_FILE = path.join(ROOT, 'vite.entries.json');

// ---------------------------
// 🔧 Helpers
// ---------------------------

// Registra tots els partials disponibles
async function registerPartials() {
    const partialFiles = await glob(`${PARTIALS}/**/*.hbs`);
    for (const file of partialFiles) {
        const name = path.basename(file, '.hbs');
        const content = await fs.readFile(file, 'utf8');
        handlebars.registerPartial(name, content);
    }
}

// Compila una sola pàgina .html a src/
async function compilePage(pageFile, env = 'development') {
    const rel = path.relative(PAGES, pageFile); // ex: blog/post.html
    const outPath = path.join(SRC, rel);

    const templateContent = await fs.readFile(pageFile, 'utf8');
    const template = handlebars.compile(templateContent);
    const html = template({ title: path.basename(pageFile, '.html'), env });

    await fs.ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, html, 'utf8');

    const key = rel.replace(/\\/g, '/').replace(/\.html$/, '');
    console.log(`✔️ Compilat: ${rel}`);
    return [key, outPath];
}

// Troba totes les pàgines que usen un partial concret
function findPagesUsingPartial(partialName) {
    const pageFiles = glob.sync(`${PAGES}/**/*.html`);
    return pageFiles.filter((file) => {
        const content = fs.readFileSync(file, 'utf8');
        return new RegExp(`\\{\\{>\\s*${partialName}\\b`).test(content);
    });
}

// Esborra HTML de src/ que ja no tenen pàgina d’origen
async function cleanOldCompiledPages() {
    const htmlFiles = await glob(`${SRC}/**/*.html`, { ignore: [`${SRC}/site/**`] });
    const currentPages = await glob(`${PAGES}/**/*.html`);
    const validTargets = currentPages.map((p) => path.join(SRC, path.relative(PAGES, p)));

    const deleted = [];
    for (const file of htmlFiles) {
        if (!validTargets.includes(file)) {
            await fs.remove(file);
            deleted.push(file);
        }
    }

    if (deleted.length) {
        console.log(`🧹 Netejats ${deleted.length} fitxers antics de src/:`);
        deleted.forEach((f) => console.log(`   🗑️ ${path.relative(ROOT, f)}`));
    }
}

// ---------------------------
// 🧠 Execució principal
// ---------------------------
const env = process.env.NODE_ENV || 'development';
const arg = process.argv[2] ? path.resolve(process.argv[2]) : null;

await registerPartials();
const entries = {};

if (arg) {
    if (arg.endsWith('.hbs') && arg.startsWith(PARTIALS)) {
        const partialName = path.basename(arg, '.hbs');
        const affectedPages = findPagesUsingPartial(partialName);
        if (!affectedPages.length) {
            console.log(`ℹ️ Cap pàgina utilitza el partial "${partialName}".`);
        } else {
            console.log(`🔁 Recompilant pàgines amb partial "${partialName}":`);
            for (const page of affectedPages) {
                const [key, out] = await compilePage(page, env);
                entries[key] = out;
            }
        }
    } else if (arg.endsWith('.html') && arg.startsWith(PAGES)) {
        const [key, out] = await compilePage(arg, env);
        entries[key] = out;
    } else {
        console.warn('⚠️ Fitxer desconegut — compilant tot.');
        const pageFiles = await glob(`${PAGES}/**/*.html`);
        for (const page of pageFiles) {
            const [key, out] = await compilePage(page, env);
            entries[key] = out;
        }
    }

    await cleanOldCompiledPages();

    const prev = (await fs.pathExists(ENTRY_FILE)) ? await fs.readJson(ENTRY_FILE) : {};
    Object.assign(prev, entries);
    await fs.writeJson(ENTRY_FILE, prev, { spaces: 2 });
} else {
    const pageFiles = await glob(`${PAGES}/**/*.html`);
    for (const page of pageFiles) {
        const [key, out] = await compilePage(page, env);
        entries[key] = out;
    }
    await cleanOldCompiledPages();
    await fs.writeJson(ENTRY_FILE, entries, { spaces: 2 });
}

console.log(`📄 Fitxer d'entrades actualitzat: ${ENTRY_FILE}`);
console.log('✨ Compilació Handlebars completada.\n');
