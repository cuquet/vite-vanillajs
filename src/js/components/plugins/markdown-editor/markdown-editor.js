/* -------------------------------- 

File#: markdown-editor
Title: Markdown Editor
Descr: Un editor minimalista per crear contingut Markdown.
Usage: https://codyhouse.co/ds/components/info/markdown-editor
Dependencies:
    _1_tooltip
    marked: npm install marked

-------------------------------- */
import { tools as Util } from '@modules';
import { Tooltip } from '@/js/components/controls';
import { marked } from 'marked';

marked.setOptions({
    gfm: true,       // habilita GitHub Flavored Markdown
    breaks: true,    // salta línies amb Enter
    headerIds: true,
    mangle: false,
    smartLists: true,
    smartypants: false,
});

class MdEditor extends Tooltip {
    constructor(element, opts = []) {
        super(element);
        this.element = element;
        this.actions = opts.length > 0 ? opts : MdEditor.defaults;

        // Troba el textarea i el wrapper d'accions
        this.textarea = this.element.querySelector('.js-md-editor__content');
        this.actionsWrapper = this.element.querySelector('.js-md-editor__actions');

        // Crea el preview lateral
        this.previewContainer = document.createElement('div');
        this.previewContainer.className = 'md-preview-content border radius-md bg-contrast-lower padding-sm';
        Object.assign(this.previewContainer.style, {
            flex: '1',
            height: '300px',
            overflowY: 'auto',
        });

        // Shadow DOM sense reset: deixa que el navegador decideixi
        this.shadow = this.previewContainer.attachShadow({ mode: 'open' });
        this.shadow.innerHTML = `<div class="md-preview-content"></div>`;

        // Crea un wrapper flex que conté textarea i preview
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'md-editor__wrapper grid gap-xs';
        this.wrapper.style.display = 'flex';
        Util.addClass(this.textarea, "col")
        this.wrapper.appendChild(this.textarea);
        this.wrapper.appendChild(this.previewContainer);
        this.element.appendChild(this.wrapper);

        // Event listeners
        this.textarea.addEventListener('input', () => this.updatePreview());
        this.textarea.addEventListener('scroll', () => this.syncScroll());
        if (this.actionsWrapper) {
            this.actionsWrapper.addEventListener('click', this.handleAction.bind(this));
        }
        // Observador de resize per ajustar alçada del preview
        this.resizeObserver = new ResizeObserver(() => {
            this.previewContainer.style.height = `${this.textarea.scrollHeight}px`;
        });
        this.resizeObserver.observe(this.textarea);
        this.tooltipContent = this.tooltip?.innerHTML || 'Tria una acció…';
        // Inicialitza preview i tooltip
        this.updatePreview();
        this.hideTooltip();
    }

    // -------------------------
    // Actualitza preview amb HTML
    // -------------------------
    updatePreview() {
        this.shadow.querySelector('.md-preview-content').innerHTML = marked.parse(this.textarea.value || '');
        this.previewContainer.style.height = `${this.textarea.scrollHeight}px`;
    }

    // -------------------------
    // Sincronitza scroll entre textarea i preview
    // -------------------------
    syncScroll() {
        const scrollHeight = this.textarea.scrollHeight - this.textarea.clientHeight;
        if (scrollHeight > 0) {
            const ratio = this.textarea.scrollTop / scrollHeight;
            this.previewContainer.scrollTop = ratio * (this.previewContainer.scrollHeight - this.previewContainer.clientHeight);
        }
    }

    // -------------------------
    // Gestiona accions (bold, heading, llistes...)
    // -------------------------
    handleAction(event) {
        const actionElement = event.target.closest('[data-md-action]');
        if (!actionElement) return;

        const action = actionElement.getAttribute('data-md-action');
        const actionDetails = this.actions.find((a) => a.action === action);
        if (!actionDetails) return;

        const { selectionStart, selectionEnd, selectionContent } = this.getSelectionDetails();
        const newText = selectionContent
            ? this.getNewText(actionDetails, selectionContent)
            : actionDetails.content;

        this.updateTextarea(newText, selectionStart, selectionEnd, actionDetails.content);

        // Actualitza preview després de modificar el textarea
        this.updatePreview();
    }

    // -------------------------
    // Dades de selecció actual
    // -------------------------
    getSelectionDetails() {
        const selectionStart = this.textarea.selectionStart;
        const selectionEnd = this.textarea.selectionEnd;
        const selectionContent = this.textarea.value.slice(selectionStart, selectionEnd);
        return { selectionStart, selectionEnd, selectionContent };
    }

    // -------------------------
    // Text nou segons l'acció
    // -------------------------
    getNewText(actionDetails, selectionContent) {
        let content = actionDetails.content.replace('content', selectionContent);
        if (actionDetails.newLine && this.shouldAddNewLine()) {
            content = '\n' + content;
        }
        // Accions que necessiten línia nova després
        const actionsNeedingExtraLine = ['blockquote', 'uList', 'oList', 'tList'];
        if (actionsNeedingExtraLine.includes(actionDetails.action)) {
            content += '\n'; // afegeix línia buida després
        }
        return content;
    }

    shouldAddNewLine() {
        const charBefore = this.textarea.value[this.textarea.selectionStart - 1];
        return charBefore && !charBefore.match(/\n/);
    }

    // -------------------------
    // Actualitza textarea
    // -------------------------
    updateTextarea(newText, selectionStart, selectionEnd, actionContent) {
        const textBefore = this.textarea.value.slice(0, selectionStart);
        const textAfter = this.textarea.value.slice(selectionEnd);
        this.textarea.value = textBefore + newText + textAfter;

        this.textarea.focus();
        this.textarea.selectionEnd = selectionStart + newText.length;
        this.textarea.selectionStart =
            this.textarea.selectionEnd - (actionContent.length - 'content'.length);
    }

    // -------------------------
    // Inicialització estàtica
    // -------------------------
    static initMdEditor() {
        const mdEditors = document.querySelectorAll('.md-editor');
        mdEditors.forEach((el) => {
            if (!el.dataset.mdEditorInitialized) {
                el.dataset.mdEditorInitialized = 'true';
                new MdEditor(el);
            }
        });
    }

    // -------------------------
    // Inicialització lazy amb IntersectionObserver
    // -------------------------
    static initMdEditorLazy() {
        const mdEditors = document.querySelectorAll('.md-editor');
        if (mdEditors.length === 0) return;

        const observer = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        if (!el.dataset.mdEditorInitialized) {
                            el.dataset.mdEditorInitialized = 'true';
                            new MdEditor(el);
                        }
                        observer.unobserve(el);
                    }
                });
            },
            { rootMargin: '100px' }
        );

        mdEditors.forEach((el) => observer.observe(el));
    }
}

// -------------------------
// Accions Markdown per defecte
// -------------------------
MdEditor.defaults = [
    { action: 'heading', content: '### content', newLine: false },
    { action: 'code', content: '`content`', newLine: false },
    { action: 'link', content: '[content](url)', newLine: false },
    { action: 'blockquote', content: '> content', newLine: true },
    { action: 'bold', content: '**content**', newLine: false },
    { action: 'italic', content: '_content_', newLine: false },
    { action: 'uList', content: '- Item 1\n- Item 2\n- Item 3', newLine: true },
    { action: 'oList', content: '1. Item 1\n2. Item 2\n3. Item 3', newLine: true },
    { action: 'tList', content: '- [ ] Item 1\n- [x] Item 2\n- [ ] Item 3', newLine: true },
];

export { MdEditor };
export function initMdEditorLazy() {
    MdEditor.initMdEditorLazy();
}

// /* --------------------------------
//     🚀 Auto-inicialització
// -------------------------------- */
// // Pots triar una de les dues opcions segons la teva app:
// document.addEventListener('DOMContentLoaded', () => {
// 	// Inicialitza de manera immediata
// 	// MdEditor.initMdEditor();
// 	// O bé, inicialitza amb lazy loading (millor rendiment)
// 	MdEditor.initMdEditorLazy();
// });