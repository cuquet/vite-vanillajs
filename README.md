![Vite](src/assets/vite.svg)
![Javascript](src/assets/javascript.svg)

# Vite VanillaJS — CodyFrame demo
Projecte multipàgina basat en Vite que compila plantilles Handlebars i publica una col·lecció de components SCSS i JS (CodyFrame fork/plantilla).

## Resum
Aquest repositori inclou:
- Pàgines Handlebars a [src/site/pages](src/site/pages/) i partials a [src/site/partials](src/site/partials/).
- Components JS modulars a [src/js/components](src/js/components/) i un loader d'inicialització a [`initComponents`](src/js/modules/initComponents.js).
- Estils SCSS a [src/scss](src/scss/).
- Un script que compila les pàgines Handlebars a HTML abans d'executar Vite: [build-pages.mjs](build-pages.mjs).
- Configuració de Vite a [vite.config.js](vite.config.js).

## Requisits
- Node >= 16
- npm

## Instal·lació i desenvolupament
```bash
git clone <repo-url>
cd <project-root>
npm install
npm run dev
```
* `npm run dev` genera primer les pàgines amb `build-pages.mjs` i després arrenca Vite en mode dev. 
* Per producció, utilitza `npm run build` (genera les pàgines i fa el build de Vite). Revisa els scripts i la configuració a `package.json` i `build-pages.mjs`.

## Arquitectura de pàgines Handlebars
- Pàgines originals: `src/site/pages/`
- Partials: `src/site/partials/`
- El watcher de Vite recompila només la pàgina o partial canviat (veure `vite.config.js`).

## Arquitectura JS
- Entrades multipàgina: `src/js/main.js`.
- Components: `src/js/components/`
- Inicialització dinàmica: `src/js/modules/initComponents.js`
- Exemple: `src/js/dashboard.js` registra `INIT_ENTRIES` per inicialitzar components com Sidebar, Modal, etc.

## Desenvolupar components
1. Afegir el fitxer JS a `src/js/components/...`.
2. Exportar-lo des de l'index corresponent (p. ex. `src/js/components/plugins/index.js`).
3. Registrar l'entrada a `INIT_ENTRIES` a `src/js/main.js` o `src/js/dashboard.js` si es vol inicialització automàtica.
4. Actualitzar partials/pàgines a `src/site/partials` o `src/site/pages` i deixar que `build-pages.mjs` regenere l'HTML.

## Comandes útils
- `npm run dev` — Compila pàgines i inicia servidor dev (Vite).
- `npm run build` — Compila pàgines i empaqueta per producció.
- `npm run build:pages` — Només genera HTML des de les plantilles Handlebars.
- `npm run lint` — Executa ESLint a `src/`.
- `npm run prettier:fix` — Aplica Prettier als fitxers (veure `package.json`).

## Fitxers destacats
- `vite.config.js` — Configuració de Vite i plugin per vigilar partials/pages.
- `build-pages.mjs` — Compilador Handlebars i generador de `vite.entries.json`.
- `src/js/modules/initComponents.js` — Loader i sistema d'inicialització per components.
- `src/site/pages/*`, `src/site/partials/*`, `src/js/components/*`, `src/scss/*`.


## Llicència
Veure `LICENSE` (MIT).


## License

[MIT](https://choosealicense.com/licenses/mit/)

[![PayPal - Donate](https://img.shields.io/badge/PayPal-Donate-005EA6?logo=paypal&logoColor=white)](https://www.paypal.me/cuquet74)
