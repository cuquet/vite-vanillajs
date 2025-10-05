/**
 * 🛠️ Handlebars Page Compiler per a projectes Vite
 *
 * 📦 Requisits:
 *   npm install handlebars fs-extra glob --save-dev
 *
 * 📂 Estructura:
 *   src/
 *     ├── site/
 *     │    ├── pages/      → Pàgines amb sintaxi Handlebars (.html)
 *     │    └── partials/   → Fragments Handlebars (.hbs)
 *     ├── js/
 *     └── scss/
 *
 * 🧮 Sortida:
 *   - Compila les pàgines Handlebars a `src/...` mantenint l’estructura relativa
 *   - Actualitza `vite.entries.json` amb el mapa { <relatiu>: <ruta> }
 *
 * 🧭 Ús:
 *   - npm run build:pages             → compila totes les pàgines
 *   - node build-pages.mjs <fitxer>   → recompila la pàgina o els fitxers afectats
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
const arg = process.argv[2] ? path.resolve(process.argv[2]) : null;

// ---------------------------
// 🔄 Registra tots els partials
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
// 📦 Compila una pàgina HTML
// ---------------------------
async function compilePage(pageFile) {
  const rel = path.relative(PAGES, pageFile); // ex: blog/post.html
  const outPath = path.join(OUT, rel);

  const templateContent = await fs.readFile(pageFile, 'utf8');
  const template = handlebars.compile(templateContent);
  const html = template({ title: path.parse(pageFile).name, env });

  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, html, 'utf8');

  console.log(`✔️ Compilat: ${outPath}`);

  const key = rel.replace(/\\/g, '/').replace(/\.html$/, '');
  return [key, outPath];
}

// ---------------------------
// 🔍 Troba pàgines que usen un partial
// ---------------------------
function pagesUsingPartial(partialName) {
  const pageFiles = glob.sync(`${PAGES}/**/*.html`);
  return pageFiles.filter((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const re = new RegExp(`\\{\\{>\\s*${partialName}\\b`, 'g');
    return re.test(content);
  });
}

// ---------------------------
// 🚀 Lògica principal
// ---------------------------
await registerPartials();
const entries = (await fs.pathExists(ENTRY_FILE))
  ? await fs.readJson(ENTRY_FILE)
  : {};

if (arg) {
  if (arg.startsWith(PARTIALS) && arg.endsWith('.hbs')) {
    // Si ha canviat un partial
    const name = path.basename(arg, '.hbs');
    const affected = pagesUsingPartial(name);
    if (affected.length === 0) {
      console.log(`ℹ️ Cap pàgina fa servir el partial "${name}".`);
    }
    for (const page of affected) {
      const [key, outPath] = await compilePage(page);
      entries[key] = outPath;
    }
  } else if (arg.startsWith(PAGES) && arg.endsWith('.html')) {
    // Si ha canviat una pàgina
    const [key, outPath] = await compilePage(arg);
    entries[key] = outPath;
  } else {
    console.warn('⚠️ Fitxer desconegut, compilant tot.');
    const files = await glob(`${PAGES}/**/*.html`);
    for (const file of files) {
      const [key, outPath] = await compilePage(file);
      entries[key] = outPath;
    }
  }
} else {
  // Sense arguments → compila tot
  const files = await glob(`${PAGES}/**/*.html`);
  for (const file of files) {
    const [key, outPath] = await compilePage(file);
    entries[key] = outPath;
  }
}

// ---------------------------
// 🧾 Escriu vite.entries.json
// ---------------------------
await fs.writeJson(ENTRY_FILE, entries, { spaces: 2 });
console.log(`📄 Fitxer d'entrades generat: ${ENTRY_FILE}`);
console.log('✨ Compilació Handlebars completada.\n');
