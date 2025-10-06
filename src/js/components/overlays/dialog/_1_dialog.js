/* -------------------------------- 

File#: _1_dialog
Title: Dialog
Descr: Overlay informing user about tasks/decisions
Usage: https://codyhouse.co/ds/components/info/dialog

-------------------------------- */
import Button from '@components/button';
import { tools as Util } from '@modules';
import { initComponents } from '@modules/initComponents';


class DynamicDialog {
    isDynamic;
    dialog;
    constructor(opts) {
        Object.assign(this, Util.extend(Dialog.defaults, opts));
        this.isDynamic = (this.element && this.element.nodeName === 'DIV') ? false : true; 
        this.isClose = false;
        this.buildDialog();
    }
    async buildDialog() {
        if(this.isDynamic) {
            this.ID = Util.getNewId();
            this.content = null;
            if(this.element) {
                this.selectedTrigger = this.element;
                this.selectedTrigger.setAttribute('aria-controls', 'dialog-' + this.ID);
            }
            this.dialog = this.#renderDynamicDialog;
            document.body.appendChild(this.dialog);
            this.open();
        } else {
            this.dialog = this.element;
            this.content = this.element.querySelector('.dialog__content');
        }
        this.cancelButton = this.dialog.querySelector('.js-dialog__close');
        this.acceptButton = this.dialog.querySelector('.btn:not(.js-dialog__close)');
        this.dialog.addEventListener('mousedown', this.checkClose.bind(this));
        this.dialog.addEventListener('touchstart', this.checkClose.bind(this), { passive: true });
        this.dialog.addEventListener('click', () => { this.close(); });
    }
    get #renderDynamicFooter() {
        const footer = document.createElement('div');
        Util.addClass(footer, this.dialogFooterClass);
        const footerActions = document.createElement('div');
        Util.addClass(footerActions, this.dialogFooterActionsClass);
        footer.appendChild(footerActions);
        const controlActions = [
            {
                arialLabel:this.cancelText,
                classes: 'btn btn--subtle js-dialog__close',
                text : this.cancelText,
                onClick: () => {
                    //this.close();
                },
            },
            {
                arialLabel:this.acceptText,
                classes: 'btn btn--accent',
                text : this.acceptText,
                onClick: () => {
                    //if(this.onAccept) this.onAccept();
                },
            },
        ]
        controlActions.forEach(action=>{
            const button = new Button('TextButton', 
            {
                text: action.text,
                type: 'button',
                ariaLabel: action.ariaLabel,
                classes: action.classes,
                icon: null,
                onClick: action.onClick,
            });
            footerActions.appendChild(button.get());
        })
        return footer;
    }
    get #renderDynamicDialog() {
        const dialog = document.createElement('div');

        Util.addClass(dialog, this.dialogClass);
        if (this.isSticky) {
            dialog.classList.add(this.dialogStickyClass);
        }
        Util.setAttributes(dialog, {
            id: 'dialog-' + this.ID,
            'data-animation': !this.isAnimated ? 'off' : 'on',
        });

        this.content = document.createElement('div');
        Util.addClass(this.content, this.dialogContentClass);
        Util.setAttributes(this.content, {
            role: 'alertdialog',
            'aria-labelledby': 'dialog-title-' + this.ID,
            'aria-describedby': 'dialog-description-' + this.ID,
        });

        const title = document.createElement('h4');
        Util.addClass(title, this.dialogTitleClass);
        Util.setAttributes(title, {
            id: 'dialog-title-' + this.ID,
        });
        title.textContent = this.title;

        const description = document.createElement('p');
        Util.addClass(description, this.dialogDescriptionClass);
        Util.setAttributes(description, {
            id: 'dialog-description-' + this.ID,
        });
        description.textContent = this.description;

        this.content.appendChild(title);
        this.content.appendChild(description);
        this.content.appendChild(this.#renderDynamicFooter);
        dialog.appendChild(this.content);

        return dialog;
    }
}

class Dialog extends DynamicDialog {
    constructor(opts) {
        super(Util.extend(Dialog.defaults, opts));
        this.triggers = document.querySelectorAll('[aria-controls="' + this.dialog.id + '"]');
        this.init();
    }

    static defaults = {
            visibleClass: 'dialog--is-visible',
            title: 'Estàs segur que vols tancar? ',
            description: "Les dades que no s'hagin guardat es perdran.",
            acceptText: 'Acceptar',
            cancelText: 'Cancel·lar',
            dialogClass: 'dialog js-dialog',
            dialogStickyClass: 'dialog--sticky',
            dialogContentClass: 'dialog__content max-width-xs',
            dialogTitleClass: 'text-md margin-bottom-2xs toc-skip',
            dialogDescriptionClass: 'text-sm color-contrast-medium',
            dialogFooterClass: 'margin-top-md',
            dialogFooterActionsClass: 'flex justify-end gap-xs flex-wrap',
            dialogBtnCloseStickyClass: 'dialog__close-btn dialog__close-btn--inner',
            isSticky: false,
            isAnimated: true,
        };

    init() {
        if(this.triggers) {
            for (let i = 0; i < this.triggers.length; i += 1) {
                this.triggers[i].addEventListener('click', this.handleInitClick.bind(this));
            }
        }
        this.dialog.addEventListener('openDialog', this.handleOpen.bind(this));
        this.dialog.addEventListener('closeDialog', this.handleClose.bind(this));
        this.acceptButton.addEventListener('click', () => {
            if(this.onAccept) this.onAccept();
            this.close();
        });
        this.cancelButton.addEventListener('click', () => {
            if(this.onReject) this.onReject();
            this.close();
        });
    }
    async handleInitClick(e){
        e.preventDefault();
        this.selectedTrigger = e.currentTarget;
        this.open();
    }
    handleOpen(e) {
        // s'obre a través d'un event.
        if (this.dialog && this.dialog === e.target ) {
            this.open();
            this.dialog.removeEventListener('openDialog', this.handleOpen.bind(this));
        }
    }
    handleClose(e) {
        //es tanca a partir d'un event
        if (this.dialog && this.dialog === e.target ) {
            this.isClose = true;
            this.close();
            this.dialog.removeEventListener('closeDialog', this.handleClose.bind(this));
        }
    }
    checkClose(e) {
        // s'ha clicat a un botó del diàleg
        if (this.content) {
            this.isClose = this.content.contains(e.target);
        }
    }
    question() {
        return new Promise((resolve, reject) => {
            if (
                !this.dialog ||
                !this.acceptButton ||
                !this.cancelButton 
            ) {
                reject('There was a problem creating the modal window');
                return;
            }

            this.dialog.addEventListener('click', () => {
                resolve(null);
                //this.close();
            });

            this.acceptButton.addEventListener('click', () => {
                resolve(true);
                //this.close();
            });

            this.cancelButton.addEventListener('click', () => {
                resolve(false);
                //this.close();
            });
        });
    }
    async open() {
        if (
            document.body.scrollHeight >
            (window.innerHeight || document.documentElement.clientHeight)
        ) {
            if (!this.scrollbarWidth) {
                this.scrollbarWidth = Util.getScrollbarWidth();
                document.body.style.paddingRight = `${this.scrollbarWidth}px`;
                document.body.style.overflow = 'hidden';
            }
        }
        Util.addClass(this.dialog, this.visibleClass);
        await Util.transitionend(this.dialog);
        // 👇 inicialitza tots els mòduls dins del diàleg
        initComponents(this.dialog);
    }
    async close() {
        document.removeEventListener('closeDialog', this.handleClose.bind(this));
        if (this.isClose) {
            this.dialog.classList.remove(this.visibleClass);
            await Util.transitionend(this.dialog);
            //if (!this.scrollbarWidth) {
            document.body.removeAttribute('style');
                //document.querySelector('.back-to-top').removeAttribute('style');
            //}
            if(this.isDynamic) {
                if(this.selectedTrigger)
                    this.selectedTrigger.setAttribute('aria-controls', '');
                this.dialog.remove();
            }
            delete this;
        }
    }
}
if (typeof window !== 'undefined') {
    window.Dialog = Dialog;
}

export { Dialog };