# 🪟 Modal Window Component

> Component per mostrar contingut crític o contextual dins d’una finestra modal amb suport per contingut dinàmic, confirmació de tancament i accessibilitat completa.

---

## ✨ Característiques principals

- Suport per **modals estàtics** i **dinàmics** (`data-content`, `data-url`).
- Detecció automàtica del tipus de contingut (`dom`, `html`, `image`, `video`, `url`, etc.).
- **Capçalera i peu de pàgina** generats dinàmicament amb botons configurables.
- Control de focus i accessibilitat (`aria-*`) integrat.
- Confirmació opcional de tancament amb component `Dialog`.
- Recol·locació automàtica de nodes DOM originals quan el modal es tanca.
- Integració amb components interns: `Dialog`, `Button`, `Resize`, i `Drag`.

---

## 🚀 Inicialització

Els modals es detecten automàticament si tenen les classes `.js-modal.modal`.

```js
import { initModal } from '@components/overlays/modal';

// Inicialitza tots els modals del document
initModal();

// O només dins d’un context concret
initModal(document.querySelector('#content'));
```

---

## ⚙️ Atributs de dades

| Atribut | Descripció | Exemple |
|----------|-------------|----------|
| `data-url` | URL remota per carregar contingut dins del modal | `data-url="/ajax/details.html"` |
| `data-content` | Selector DOM o contingut HTML inline | `data-content="#form-template"` |
| `data-title` | Títol del modal | `data-title="Detalls"` |
| `data-fullscreen` | Desactiva el mode de pantalla completa si es posa `"off"` | `data-fullscreen="off"` |
| `data-confirm-close` | Mostra diàleg de confirmació abans de tancar | `data-confirm-close="on"` |

---

## 🧩 Exemple bàsic

```html
<button aria-controls="modal-info" class="btn js-modal__trigger">Obrir modal</button>

<div id="modal-info" class="modal js-modal">
  <div class="modal__content">
    <header class="modal__header">
      <h1>Informació</h1>
      <button class="modal__close-btn js-modal__close">Tancar</button>
    </header>
    <div class="modal__body">
      Contingut del modal.
    </div>
  </div>
</div>
```

---

## 🧠 Exemple avançat (modal dinàmic)

El modal es crearà automàticament quan s’activi el botó.

```html
<button
  class="btn"
  data-url="/partials/details.html"
  data-title="Detalls"
  data-confirm-close="on"
  aria-controls="modal-dynamic"
>
  Obre modal dinàmic
</button>
```

---

## ⚙️ Opcions del constructor

Quan inicialitzes manualment un modal:

```js
const modal = new Modal(document.querySelector('#modal-id'), {
  fullscreen: true,
  confirmClose: true,
  dialogDefaults: {
    title: 'Vols tancar?',
    description: 'Aquesta acció no es pot desfer.',
    accept: 'Sí, tancar',
    cancel: 'Cancel·lar',
  },
});
```

### Opcions disponibles

| Propietat | Tipus | Valor per defecte | Descripció |
|------------|-------|------------------|-------------|
| `fullscreen` | `boolean` | `true` | Mostra el modal en mode pantalla completa |
| `confirmClose` | `boolean` | `false` | Activa el diàleg de confirmació en tancar |
| `dialogDefaults.title` | `string` | `Estàs segur que vols tancar finestra?` | Títol del diàleg de confirmació |
| `dialogDefaults.description` | `string` | `Les dades que no s'hagin guardat es perdran.` | Text explicatiu |
| `dialogDefaults.accept` | `string` | `Tancar` | Etiqueta del botó d’acceptar |
| `dialogDefaults.cancel` | `string` | `Cancel·lar` | Etiqueta del botó de cancel·lar |
| `preventScroll` | `string` | `'body'` | Selector del contenidor on bloquejar l’scroll |
| `loadingClass` | `string` | `'modal--is-loading'` | Classe aplicada durant el carregament |
| `animateClass` | `string` | `'modal--animate-scale'` | Classe aplicada durant el carregament. Es mostra la lau per defecte |
| `showClass` | `string` | `'modal--is-visible'` | Classe aplicada quan el modal és visible |
| `closeClass` | `string` | `'js-modal__close'` | Classe que tanca el modal en fer clic |
| `focusableElString` | `string` | Auto-generada per `Util.focusableElString()` | Selector d’elements enfocables |
| `dialogDefaults` | `object` | — | Objecte amb textos per defecte del `Dialog` |

---

#### Tipus de `animateClass`
* `'modal--animate-scale'` animació per defecte
* `'modal--animate-translate-up'`
* `'modal--animate-translate-down'`
* `'modal--animate-translate-right'`
* `'modal--animate-translate-left'`
* `'modal--animate-slide-up'`
* `'modal--animate-slide-down'`
* `'modal--animate-slide-right'`
* `'modal--animate-slide-left'`


## 🧭 Esdeveniments personalitzats

| Esdeveniment | Descripció |
|---------------|------------|
| `openModal` | Es llança abans d’obrir el modal |
| `loadedModal` | Quan el contingut dinàmic s’ha carregat |
| `modalIsOpen` | Quan l’animació d’obertura ha finalitzat |
| `closeModal` | Quan es demana el tancament del modal |
| `modalIsClose` | Quan el modal s’ha tancat completament |

```js
modal.modal.addEventListener('modalIsClose', (e) => {
  console.log('Modal tancat', e.detail);
});
```

---

## 🧼 Notes i comportament intern

- Els modals **dinàmics** amb `data-content="#selector"` **mouen** el node original dins del modal (no el copien) per preservar events i formularis.
- En tancar-se, l’element es **recol·loca automàticament** al seu lloc original i se li afegeix la classe `.hide`.
- Els modals amb contingut remot (`data-url`) es buiden després del tancament per alliberar memòria.
- Els vídeos (`video`, `youtube`, `vimeo`) es reinicien en tancar-se.
- El focus es restaura al botó o element que va obrir el modal.
- Es bloqueja l’scroll del contenidor definit a `preventScroll` mentre el modal està obert.
- Suporta animacions configurables (`modal--animate-scale`, `modal--animate-slide-up`, etc.).

---

## 🧩 Dependències

- [`Dialog`](../dialog) — per al diàleg de confirmació
- [`Button`](../button) — per a la generació de botons d’acció
- [`Resize`](../resize) — per permetre redimensionar el modal
- [`Drag`](../drag) — per arrossegar el modal
- `@modules/tools` (`Util`) — per funcions d’ajuda (focus, classes, transicions…)

---

## 🧱 Estructura del DOM generat

Quan el modal és dinàmic, la seva estructura segueix aquest patró:

```html
<div class="modal js-modal modal--animate-scale" id="modal-42" data-modal-prevent-scroll="body">
  <div class="modal__content flex flex-column">
    <header class="modal__header">
      <h1 id="modal-title-42">Títol</h1>
      <div class="modal__actions">
        <button class="modal__close-btn js-modal__close">
          <svg><use href="#close"></use></svg>
        </button>
      </div>
    </header>

    <div class="modal__body">...</div>

    <footer class="modal__footer">
      <button class="btn btn--subtle">Tancar</button>
    </footer>
  </div>
</div>
```

---

## 🧪 Exemple complet amb confirmació

```html
<button
  class="btn"
  data-url="/ajax/settings.html"
  data-title="Configuració"
  data-confirm-close="on"
  aria-controls="modal-settings"
>
  Obre configuració
</button>
```

```js
initModal();

document.addEventListener('modalIsClose', () => {
  console.log('Modal tancat correctament');
});
```

---

## 🧩 Versions i manteniment

- **Versió:** 1.3.0  
- **Autor:** cuquet@gmail.com  
- **Dependències:** `Dialog`, `Button`, `Resize`, `Drag`  
- **Llicència:** MIT

---

## 🧩 TODO

- [ ] Afegir suport per `fetch` amb `POST`.
- [ ] Opció per carregar contingut com a `module`.
- [ ] Millorar la gestió d’errors al carregar URL remotes.
- [ ] Afegir suport per múltiples instàncies obertes simultàniament.
