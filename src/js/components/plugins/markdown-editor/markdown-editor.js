/* -------------------------------- 

File#: markdown-editor
Title: Markdown Editor
Descr: A minimal editor to create markdown content.
Usage: https://codyhouse.co/ds/components/info/markdown-editor
Dependencies
    _1_tooltip
-------------------------------- */


import { Tooltip } from '@/js/components/controls';

class MdEditor extends Tooltip {
    constructor(element, opts=[]) {
        super(element);
        this.actions = opts.length > 0 ? opts : MdEditor.defaults;
        this.element = element;
        this.textarea = this.element.getElementsByClassName('js-md-editor__content')[0];
        this.actionsWrapper = this.element.getElementsByClassName('js-md-editor__actions')[0];
        this.hideTooltip();
        if (this.textarea && this.actionsWrapper) {
            this.actionsWrapper.addEventListener('click', this.handleAction.bind(this));
        }
    }

    handleAction(event) {
        const actionElement = event.target.closest('[data-md-action]');
        if (!actionElement) return;

        const action = actionElement.getAttribute('data-md-action');
        
        const actionDetails = this.getActionDetails(action);
        if (!actionDetails) return;

        const { selectionStart, selectionEnd, selectionContent } = this.getSelectionDetails();
        const newText = this.getNewText(actionDetails, selectionContent);

        this.updateTextarea(newText, selectionStart, selectionEnd, actionDetails.content);
    }

    getActionDetails(action) {
        return this.actions.find((a) => a.action === action);
    }

    getSelectionDetails() {
        const selectionStart = this.textarea.selectionStart;
        const selectionEnd = this.textarea.selectionEnd;
        const selectionContent = this.textarea.value.slice(selectionStart, selectionEnd);

        return { selectionStart, selectionEnd, selectionContent };
    }

    getNewText(actionDetails, selectionContent) {
        let content = actionDetails.content.replace('content', selectionContent);
        if (actionDetails.newLine && this.shouldAddNewLine()) {
            content = '\n' + content;
        }
        return content;
    }

    shouldAddNewLine() {
        const charBeforeSelection = this.textarea.value[this.textarea.selectionStart - 1];
        return charBeforeSelection && !charBeforeSelection.match(/\n/);
    }

    updateTextarea(newText, selectionStart, selectionEnd, actionContent) {
        const textBefore = this.textarea.value.slice(0, selectionStart);
        const textAfter = this.textarea.value.slice(selectionEnd);
        this.textarea.value = textBefore + newText + textAfter;

        this.textarea.focus();
        this.textarea.selectionEnd = selectionStart + newText.length;
        this.textarea.selectionStart =
            this.textarea.selectionEnd - (actionContent.length - 'content'.length);
    }
}

MdEditor.defaults = [
    { action: 'heading', content: '###content', newLine: false },
    { action: 'code', content: '`content`', newLine: false },
    { action: 'link', content: '[content](url)', newLine: false },
    { action: 'blockquote', content: '> content', newLine: true },
    { action: 'bold', content: '**content**', newLine: false },
    { action: 'italic', content: '_content_', newLine: false },
    { action: 'uList', content: '- Item 1\n- Item 2\n- Item 3', newLine: true },
    { action: 'oList', content: '1. Item 1\n2. Item 2\n3. Item 3', newLine: true },
    { action: 'tList', content: '- [ ] Item 1\n- [x] Item 2\n- [ ] Item 3', newLine: true },
];

window.MdEditor = MdEditor;
export default MdEditor;


document.addEventListener('DOMContentLoaded', () => {
    const mdEditors= Array.from(document.getElementsByClassName('md-editor'));
    mdEditors.forEach(element => new MdEditor(element));   
});