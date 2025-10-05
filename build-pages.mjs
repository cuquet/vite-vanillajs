/**
 * 🛠️ Handlebars Page Compiler for Vite Projects
 *
 * Requisits:
 *   npm install handlebars fs-extra glob --save-dev
 *
 * Ús:
 * Compila pàgines Handlebars (pàgines .html amb sintaxi Handlebars)
 * i genera:
 *  - fitxers HTML a `src/...` respectant l'estructura relativa desde `src/site/pages`
 *  - `vite.entries.json` amb el mapa { <nom_relatiu_sense_ext>: <ruta_abs_html> }
 *
 * Ús:
 *  - npm run build:pages           -> compila totes les pàgines
 *  - node build-pages.mjs <path>   -> compila només el fitxer passat (pot ser .html de pages o .hbs de partial)
 */

import handlebars from 'handlebars';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';

// ---------------------------
// 📁 Paths base
// ---------------------------
const ROOT = process.cwd();
const PARTIALS = path.join(ROOT, 'src/site/partials');
const PAGES = path.join(ROOT, 'src/site/pages');
const OUT = path.join(ROOT, 'src');
const ENTRY_FILE = path.join(ROOT, 'vite.entries.json');

// ---------------------------
// 🌱 Variables d'entorn
// ---------------------------
const env = process.env.NODE_ENV || 'development';

// Argument opcional: ruta d'arxiu canviat (relativa a cwd o absoluta)
const arg = process.argv[2] ? path.resolve(process.argv[2]) : null;

// ---------------------------
// 🔄 Registra tots els partials (.hbs)
// ---------------------------
async function registerPartials() {
    const partialFiles = await glob(`${PARTIALS}/**/*.hbs`);
    for (const file of partialFiles) {
        const name = path.basename(file, '.hbs');
        const content = await fs.readFile(file, 'utf8');
        handlebars.registerPartial(name, content);
    }
}

// ---------------------------
// 📦 Compila una pàgina (fitxer .html)
// - Manté la mateixa estructura relativa dins OUT (p.ex. pages/blog/post.html -> src/blog/post.html)
// ---------------------------
async function compilePage(pageFile) {
    const rel = path.relative(PAGES, pageFile); // e.g. 'blog/post.html' o 'index.html'
    const parsed = path.parse(rel);
    const outRel = path.join(parsed.dir, `${parsed.name}.html`); // 'blog/post.html'
    const outPath = path.join(OUT, outRel);

    const templateContent = await fs.readFile(pageFile, 'utf8');
    const template = handlebars.compile(templateContent);
    const html = template({ title: parsed.name, env });

    await fs.ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, html, 'utf8');
    console.log(`✔️ Compilat: ${outPath}`);

    // claus per entries: use la ruta relativa sense extensió com a nom clau (posix)
    const key = outRel
        .split(path.sep)
        .join('/')
        .replace(/\.html$/, ''); // 'blog/post' o 'index'
    return [key, outPath];
}

// ---------------------------
//   Troba pàgines que usen un partial (simple text search)
// ---------------------------
function pagesUsingPartial(partialName) {
    const pageFiles = glob.sync(`${PAGES}/**/*.html`);
    return pageFiles.filter((file) => {
        const content = fs.readFileSync(file, 'utf8');
        // cerca variants: {{> partial}} , {{> partial }} etc.
        const re = new RegExp(`\\{\\{>\\s*${partialName}\\b`, 'g');
        return re.test(content);
    });
}

// ---------------------------
//   Lògica principal
// ---------------------------
await registerPartials();

const entries = {}; // map: name -> outPath

if (arg) {
    // Si s'ha passat un argument, o és partial o pàgina -> recompila només el necessari
    if (arg.endsWith('.hbs') && arg.startsWith(PARTIALS)) {
        // partial canviat -> compila totes les pàgines que el referencien
        const partialName = path.basename(arg, '.hbs');
        const affected = pagesUsingPartial(partialName);
        for (const page of affected) {
            const [key, outPath] = await compilePage(page);
            entries[key] = outPath;
        }
    } else if ((arg.endsWith('.html') || arg.endsWith('.hbs')) && arg.startsWith(PAGES)) {
        // pàgina canviada directament -> compilar-la
        const [key, outPath] = await compilePage(arg);
        entries[key] = outPath;
    } else {
        // argument no reconegut; fem fallback: compilar tot
        console.warn(
            '⚠️ Argument passat no és un partial ni una pàgina dins src/site. Compilant tot.',
        );
        const pageFiles = await glob(`${PAGES}/**/*.html`);
        for (const file of pageFiles) {
            const [key, outPath] = await compilePage(file);
            entries[key] = outPath;
        }
    }

    // També volem *afegir* a les entrades existents (no les sobreescrivim totes)
    if (await fs.pathExists(ENTRY_FILE)) {
        const prev = await fs.readJson(ENTRY_FILE);
        Object.assign(entries, prev);
    }
} else {
    // cap arg => compila tot
    const pageFiles = await glob(`${PAGES}/**/*.html`);
    for (const file of pageFiles) {
        const [key, outPath] = await compilePage(file);
        entries[key] = outPath;
    }
}
// ---------------------------
// 🧾 Guarda les entrades per a Vite
// ---------------------------
await fs.writeJson(ENTRY_FILE, entries, { spaces: 2 });
console.log(`📄 Fitxer d'entrades generat: ${ENTRY_FILE}`);
console.log('✨ Compilació Handlebars completada.\n');
