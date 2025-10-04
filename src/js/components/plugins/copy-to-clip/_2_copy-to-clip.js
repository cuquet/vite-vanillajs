/* -------------------------------- 

File#: _2_copy-to-clip
Title: Copy To Clipboard
Descr: A Vanilla JavaScript plugin to copy content to the clipboard.
Dependencies
    _1_tooltip
Usage: https://codyhouse.co/ds/components/info/copy-to-clipboard

-------------------------------- */

import { tools as Util } from '@modules';


class CopyClipboard {
    constructor() {
        this.copyTargetClass = 'js-copy-to-clip';
        this.copyStatusClass = 'copy-to-clip--copied';
        this.resetDelay = 2000; // retard per eliminar la classe copy-to-clip--copied
        this.initEvents();
    }

    initEvents() {
        document.addEventListener('click', (event) => {
            var target = event.target.closest('.' + this.copyTargetClass);
            if (!target) return;
            this.copyContentToClipboard(target);
        });
    }

    copyContentToClipboard(target) {
        // copiar al porta-retalls
        if (navigator.clipboard == undefined) {
            this.unsecuredUrlCopyTextToClipboard(target);

            // afegeix la classe d'èxit al target
            Util.addClass(target, this.copyStatusClass);

            setTimeout(() => {
                // elimina la classe d'èxit del target
                Util.removeClass(target, this.copyStatusClass);
            }, this.resetDelay);

            // canvia el contingut del tooltip
            var newTitle = target.getAttribute('data-success-title');
            if (newTitle && newTitle != '')
                target.dispatchEvent(new CustomEvent('newContent', { detail: newTitle }));

            // envia l'esdeveniment d'èxit
            target.dispatchEvent(new CustomEvent('contentCopied'));
            return;
        } else {
            navigator.clipboard.writeText(this.getContentToCopy(target)).then(
                () => {
                    // contingut copiat correctament
                    // afegeix la classe d'èxit al target
                    Util.addClass(target, this.copyStatusClass);

                    setTimeout(() => {
                        // elimina la classe d'èxit del target
                        Util.removeClass(target, this.copyStatusClass);
                    }, this.resetDelay);

                    // canvia el contingut del tooltip
                    var newTitle = target.getAttribute('data-success-title');
                    if (newTitle && newTitle != '')
                        target.dispatchEvent(new CustomEvent('newContent', { detail: newTitle }));

                    // envia l'esdeveniment d'èxit
                    target.dispatchEvent(new CustomEvent('contentCopied'));
                },
                () => {
                    // error al copiar el codi
                    // envia l'esdeveniment d'error
                    target.dispatchEvent(new CustomEvent('contentNotCopied'));
                },
            );
        }
    }

    unsecuredUrlCopyTextToClipboard(target) {
        var textArea = document.createElement('textarea');
        textArea.value = target.ariaLabel;

        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Error de recurs: No s\'ha pogut copiar al porta-retalls', err);
        }
        document.body.removeChild(textArea);
    }

    getContentToCopy(target) {
        var content = target.innerHTML;
        var ariaControls = document.getElementById(target.getAttribute('aria-controls')),
            defaultText = target.getAttribute('data-clipboard-content');
        if (ariaControls) {
            content = ariaControls.innerText;
        } else if (defaultText && defaultText != '') {
            content = defaultText;
        }
        return content;
    }
}

window.CopyClipboard = CopyClipboard;
export default CopyClipboard;

document.addEventListener('DOMContentLoaded', () => {
    const copytoclips =  document.getElementsByClassName('js-copy-to-clip');
    Array.from(copytoclips).map(() => new CopyClipboard());
});
