/* -------------------------------- 

File#: _1_modal-window
Title: Modal Window
Descr: A modal dialog used to display critical information
Usage: https://codyhouse.co/ds/components/info/modal-window

-------------------------------- */
import { Resize } from './Resize';
import { Drag } from './Drag';
import { Dialog } from '@components/overlays/dialog';
import Button from '@components/button';
import { icons, tools as Util } from '@modules';

class DynamicModal {
    isDynamic;
    mimeType;
    modal;
    // refs used when moving DOM nodes into the modal
    _movedNode;
    _movedFrom;
    _movedWrapper;

    constructor(element, opts) {
        Object.assign(this, Util.extend(DynamicModal.defaults, opts));
        this.element = element;
        const d = element.dataset;
        ["minWidth","minHeight","maxWidth","maxHeight"].forEach(p => {
            const k = p.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
            // llegim primer dataset (camelCase), si no existeix, llegim attribute "data-min-width"
            const val = d[p] ?? element.getAttribute("data-" + k);
            if (val) this[p] = parseInt(val, 10);
        });
        this.dataOrigin = element.dataset.url || element.dataset.content;
        this.mimeType = this.setMimeType(this.dataOrigin);
        this.isDynamic =
            ((element.hasAttribute('data-content') || element.hasAttribute('data-url')) &&
                !element.hasAttribute('aria-controls'))
                ? true
                : false;
        this.buildModal();
        // if(this.isDynamic) {
        //     console.log(`Soc ModalDynamic => id: ${this.modal.id} => isDynamic: ${this.isDynamic} => dataOrigin: ${this.dataOrigin} => mimeType: ${this.mimeType}`);
        // } else {
        //     console.log(`Soc Modal Estàtic => id: ${this.modal.id} => isDynamic: ${this.isDynamic} => dataOrigin: ${this.dataOrigin} => mimeType: ${this.mimeType}`);
        // }
    }

    static defaults = {
        animateClass: 'modal--animate-scale',
        modalClass: 'modal flex flex-center flex-wrap bg-black bg-opacity-90% padding-md js-modal',
        contentClass: 'modal__content',
        contentClassDefault:
            'flex flex-column flex-nowrap max-height-100% overflow-auto bg radius-md inner-glow shadow-md max-width-sm',
        contentClassImg: 'flex flex-center width-100% height-100% pointer-events-none',
        contentClassVideo: 'width-100% max-width-md max-height-100% overflow-auto shadow-md',
        headerClass:
            'modal__header draggable padding-y-sm padding-x-md flex items-center justify-between flex-shrink-0 bg-contrast-lower bg-opacity-50%',
        footerClass: 'modal__footer padding-md',
        actionsClass: 'modal__actions flex flex-row justify-between gap-sm',
        bodyClass: 'modal__body padding-y-sm padding-x-md flex-grow overflow-auto momentum-scrolling',
        btnInnerClass: 'modal__close-btn modal__close-btn--inner',
        btnInnerStickyClass: 'float-right position-sticky top-0',
        btnOuterClass: 'modal__close-btn modal__close-btn--outer js-modal__close',
        headerActions: [],
        footerActions: [],
        loadingButtons: [],
        minWidth: null,
        minHeight: null,
        maxWidth: null,   // si null, es calcula automàticament
        maxHeight: null,  // si null, es calcula automàticament
    };

    buildModal() {
        if (this.isDynamic) {
            this.dataOrigin = this.element.dataset.url || this.element.dataset.content;
            this.mimeType = this.setMimeType(this.dataOrigin);
            this.ID = Util.getNewId();
            this.element.setAttribute('aria-controls', 'modal-' + this.ID);
            this.title = this.element.hasAttribute('data-title') ? this.element.dataset.title : null;
            this.modal = this.#renderDynamicModal;
            document.body.appendChild(this.modal);
        } else {
            this.modal = this.element;
        }
    }

    setMimeType(url) {
        const isVideo = (v) => (/\.(mp4|3gp|ogg|wmv|webm|flv|avi*|wav|vob*)$/i).test(v);
        const isImage = (v) => (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(v);
        const isHTMLcontent = (v) => {
            var Pattern = new RegExp('<([A-Za-z][A-Za-z0-9]*)\\b[^>]*>(.*?)</\\1>');
            return !!Pattern.test(v);
        };
        const isDOMcontent = (v) => {
            const isSelectorValid = ((dummyElement) => (selector) => {
                try {
                    dummyElement.querySelector(selector);
                } catch {
                    return false;
                }
                return true;
            })(document.createDocumentFragment());

            if (!isSelectorValid(v)) return false;
            var elem = document.querySelector(v);
            return elem !== null;
        };
        const isValidUrl = (urlString, base) => {
            let givenURL;
            try {
                givenURL = new URL(urlString, base);
            } catch {
                return false;
            }
            return givenURL.protocol === 'http:' || givenURL.protocol === 'https:';
        };
        // https://player.vimeo.com/video/nnnnnnnn
        const isVimeo = (v) => /^(http:\/\/|https:\/\/)?(player\.)?(vimeo\.com\/video\/)([0-9]+)$/.test(v);
        // https://www.youtube.com/embed/nnnnnnnn
        const isYouTube = (v) =>
            /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/.test(v);

        if (isDOMcontent(url)) return 'dom';
        if (isHTMLcontent(url)) return 'html';
        if (isImage(url)) return 'image';
        if (isVideo(url)) return 'video';
        if (isValidUrl(url) || isValidUrl(url, window.location.origin)) {
            if (isVimeo(url)) return 'vimeo';
            if (isYouTube(url)) return 'youtube';
            return 'url';
        }
        return 'unknown';
    }

    get renderDynamicFooter() {
        if (this.footerActions.length > 0) {
            const footer = document.createElement('footer');
            Util.addClass(footer, this.footerClass);
            const footerActions = document.createElement('div');
            Util.addClass(footerActions, 'flex justify-end gap-xs');
            footer.appendChild(footerActions);

            const Actions = [
                {
                    text: 'Tancar',
                    type: 'button',
                    ariaLabel: 'Tancar modal',
                    classes: 'btn btn--subtle',
                    onClick: () => {
                        this.handleClose();
                    },
                },
            ];
            const c = Actions.concat(this.footerActions);
            c.forEach((action) => {
                const button = new Button(
                    action.loading ? 'LoadingButton' : 'TextButton',
                    {
                        text: action.text,
                        type: action.type,
                        ariaLabel: action.ariaLabel,
                        classes: action.classes,
                        icon: action.icon ? icons.get(action.icon) : null,
                        onClick: action.onClick,
                    },
                );
                footerActions.appendChild(button.get());
                if (action.loading) {
                    this.loadingButtons.push(button);
                }
            });
            return footer;
        }
        return false;
    }

    get renderDynamicHeader() {
        const header = document.createElement('header');
        Util.addClass(header, this.headerClass);

        const title = document.createElement('h1');
        Util.addClass(title, 'text-truncate text-md');
        title.id = 'modal-title-' + this.ID;
        title.innerHTML = this.title || '';
        const actions = document.createElement('div');
        Util.addClass(actions, this.actionsClass);

        const actionsArray = [];
        if (this.headerActions) actionsArray.push(...this.headerActions);
        if (this.fullscreen) {
            actionsArray.push({
                icon: '#expand',
                ariaLabel: 'Pantalla complerta',
                onClick: () => {
                    this.isFullscreen = !this.isFullscreen;
                    Util.toggleClass(this.modal, 'fullscreen', this.isFullscreen);
                    if (this.isFullscreen) {
                        this.modal.querySelector('.modal__content').removeAttribute('style');
                    }
                    this.modal.dispatchEvent(
                        new CustomEvent("modal:fullscreen", {
                            detail: { fullscreen: this.isFullscreen }
                        })
                    );
                    if (this.onFullscreen) {
                        this.onFullscreen(this.isFullscreen);
                    }
                },
            });
        }
        actionsArray.push({
            icon: '#close',
            ariaLabel: 'Tancar modal',
            classes: 'hide@md'.concat(' ', this.closeClass),
            onClick: () => {
                this.handleClose();
            },
        });

        actionsArray.forEach((action) => {
            const button = new Button('IconButton', {
                icon: icons.get(action.icon),
                classes:
                    this.mimeType === 'image'
                        ? this.btnInnerClass.trim().concat(' ', this.btnInnerStickyClass, action.classes)
                        : this.btnInnerClass.trim().concat(' ', action.classes),
                buttonSize: 'small',
                svgSize: 'xs',
                ariaLabel: action.ariaLabel,
                onClick: action.onClick,
            });
            actions.appendChild(button.get());
        });

        header.appendChild(title);
        header.appendChild(actions);
        return header;
    }

    get renderDynamicContent() {
        let modalContent;
        switch (this.mimeType) {
            case 'dom': {
                const source = document.querySelector(this.dataOrigin);
                if (source) {
                    // Creem un wrapper amb la classe de body i movem l'element original dins d'aquest wrapper.
                    // Això evita duplicar (no fem innerHTML) i preserva formularis amb ids i listeners.
                    modalContent = document.createElement('div');
                    Util.addClass(modalContent, this.bodyClass);

                    // Guardem informació per poder retornar el node en tancar
                    this._movedNode = source;
                    this._movedFrom = {
                        parent: source.parentNode,
                        nextSibling: source.nextSibling,
                    };

                    // guardem el wrapper per poder eliminar-lo posteriorment
                    this._movedWrapper = modalContent;
                    Util.removeClass(this._movedNode, "hide");
                    // mou l'element original dins del wrapper (efecte appendChild = move)
                    modalContent.appendChild(this._movedNode);
                }
                break;
            }
            case 'html':
                modalContent = document.createElement('div');
                Util.addClass(modalContent, this.bodyClass);
                modalContent.innerHTML = this.dataOrigin;
                break;
            case 'image':
                modalContent = document.createElement('img');
                modalContent.src = this.dataOrigin;
                modalContent.classList.add('radius-md', 'draggable', 'shadow-md', 'max-height-100%', 'max-width-100%');
                break;
            case 'video':
                modalContent = document.createElement('figure');
                modalContent.classList.add('media-wrapper-16:9');
                modalContent.innerHTML = '<video class="js-modal-video__media" controls src=""></video>';
                break;
            case 'vimeo':
            case 'youtube':
                modalContent = document.createElement('figure');
                modalContent.classList.add('media-wrapper-16:9');
                modalContent.innerHTML =
                    '<iframe class="js-modal-video__media" width="640" height="360" src="" frameborder="0" allow="autoplay" allowfullscreen webkitallowfullscreen mozallowfullscreen ></iframe>';
                break;
            case 'url':
                modalContent = document.createElement('div');
                Util.addClass(modalContent, this.bodyClass);
                (async () =>
                    await fetch(this.dataOrigin, { method: 'GET', headers: { 'Access-Control-Allow-Origin': '*' } })
                        .then((response) => {
                            if (!response.ok) throw new Error(response.status);
                            return response.text();
                        })
                        .then((data) => { modalContent.innerHTML = data; })
                        .catch((err) => {
                            modalContent.innerHTML = err.message;
                        }))();
                break;
            case 'unknown':
            default:
                modalContent = document.createElement('div');
                Util.addClass(modalContent, this.bodyClass);
                modalContent.innerText = this.dataOrigin;
        }

        setTimeout(() => {
            this.modal.dispatchEvent(new CustomEvent('loadedModal'));
        }, 500);
        return modalContent;
    }

    get #renderDynamicModal() {

        const modal = document.createElement('div');
        Util.addClass(modal, this.modalClass);
        modal.classList.add(this.animateClass);
        Util.setAttributes(modal, {
            'data-modal-prevent-scroll': this.preventScroll,
            id: 'modal-' + this.ID,
        });

        let content = document.createElement('div');
        Util.setAttributes(content, {
            role: 'alertdialog',
            'aria-labelledby': this.title ? 'modal-title-' + this.ID : '',
            'aria-describedby': '',
        });

        switch (this.mimeType) {
            case 'dom':
            case 'html':
            case 'url':
            case 'unknown':
                this.contentClass = this.contentClassDefault
                    ? this.contentClass.concat(' ', this.contentClassDefault)
                    : this.contentClass;

                if (this.contentClassDefault) {
                    content.appendChild(this.renderDynamicHeader);

                    if (this.isFullscreen) {
                        modal.classList.add('fullscreen');
                        content.removeAttribute('style');
                    } else {
                        modal.classList.remove('fullscreen');
                        // Derivem màxims equivalents a fullscreen:
                        const viewportW = window.innerWidth;
                        const viewportH = window.innerHeight;
                        
                        const maxW = this.maxWidth ?? viewportW * 0.95;
                        const maxH = this.maxHeight ?? viewportH * 0.95;
                        
                        content.style.maxWidth = maxW + "px";
                        content.style.maxHeight = maxH + "px";
                        
                        // Aplicar mínims si existeixen
                        if (this.minWidth)  content.style.minWidth  = this.minWidth  + "px";
                        if (this.minHeight) content.style.minHeight = this.minHeight + "px";
                    }
                    const viewportW = window.innerWidth;
                    const viewportH = window.innerHeight;

                    const maxW = this.maxWidth ?? viewportW * 0.95;
                    const maxH = this.maxHeight ?? viewportH * 0.95;

                    // --- AUTOFULLSCREEN LOGIC ---
                    /*
                    Mesura el modal generat
                    getBoundingClientRect() després de renderitzar (per això fem requestAnimationFrame).
                    ✔️ Compara amb el viewport
                    Si el contingut ocupa gairebé tota la pantalla (>= 98%):
                    Activa .fullscreen
                    Elimina límits de mida (content.removeAttribute('style'))
                    Envia l’event modal:fullscreen
                    Executa callbacks si existeixen
                    */
                    requestAnimationFrame(() => {
                        const rect = content.getBoundingClientRect();

                        const viewportW = window.innerWidth;
                        const viewportH = window.innerHeight;

                        const exceedsW = rect.width  >= viewportW * 0.98;
                        const exceedsH = rect.height >= viewportH * 0.98;

                        if (exceedsW || exceedsH) {
                            this.isFullscreen = true;
                            modal.classList.add("fullscreen");
                            content.removeAttribute("style");

                            // Notifiquem event com si hagués clicat el botó fullscreen
                            modal.dispatchEvent(new CustomEvent("modal:fullscreen", {
                                detail: { fullscreen: true }
                            }));

                            if (this.onFullscreen) this.onFullscreen(true);
                        }
                    });

                    new Resize({
                        el: modal,
                        maxWidth: maxW,
                        maxHeight: maxH,
                        onResizeStart: () => {
                            modal.dispatchEvent(new CustomEvent("modal:resizestart"));
                        },
                        onResize: (detail) => {
                            modal.dispatchEvent(
                                new CustomEvent("modal:resize", { detail })
                            );
                        },
                        onResizeEnd: () => {
                            modal.dispatchEvent(new CustomEvent("modal:resizeend"));
                        }
                    });
                    new Drag({
                        el: modal,
                        maxWidth: maxW,
                        maxHeight: maxH,
                        onDragStart: () => {
                            modal.dispatchEvent(new CustomEvent("modal:dragstart"));
                        },
                        onDrag: (detail) => {
                            modal.dispatchEvent(
                                new CustomEvent("modal:drag", { detail })
                            );
                        },
                        onDragEnd: () => {
                            modal.dispatchEvent(new CustomEvent("modal:dragend"));
                        }
                    });
                }

                if (this.footerActions.length > 0) {
                    content.appendChild(this.renderDynamicFooter);
                }
                break;
            case 'image':
                this.contentClass = this.contentClass.concat(' ', this.contentClassImg);
                break;
            case 'video':
            case 'vimeo':
            case 'youtube':
                this.contentClass = this.contentClass.concat(' ', this.contentClassVideo);
                content.appendChild(this.renderDynamicContent);
                break;
        }

        Util.addClass(content, this.contentClass);
        modal.appendChild(content);

        const closeOuterIconButton = new Button('IconButton', {
            icon: icons.get('#close'),
            classes: this.btnOuterClass.concat(' ', this.closeClass),
            buttonSize: 'small',
            svgSize: 'small',
            ariaLabel: 'Tancar modal',
            onClick: () => {
                this.handleClose();
            },
        });
        modal.appendChild(closeOuterIconButton.get());

        return modal;
    }
}

class Modal extends DynamicModal {
    constructor(modalEl, opts = {}) {
        super(modalEl, Util.extend(Modal.defaults, opts));
        this.triggers = Array.from(document.querySelectorAll(`[aria-controls="${this.modal.id}"]`));
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.moveFocusEl = null; // focus will be moved to this element when modal is open
        this.modalFocus = this.modal.dataset.modalFirstFocus ? this.modal.querySelector(this.modal.dataset.modalFirstFocus) : null;
        this.scrollbarWidth = Util.getScrollbarWidth();

        this._onOpen = this.handleOpen.bind(this);
        this._onClose = this.handleClose.bind(this);
        this._onKeydown = this.handleKeyDown.bind(this);
        this._onClick = this.handleClick.bind(this);
        this._onWindowKeydown = (event) => {
            if ((event.code && event.code == 27) || (event.key && event.key == 'Escape')) {
                this.close();
            }
        };

        this.init();
    }

    static defaults = {
        preventScroll: 'body',
        loadingClass: 'modal--is-loading',
        showClass: 'modal--is-visible',
        closeClass: 'js-modal__close',
        focusableElString: Util.focusableElString(),
        fullscreen: true,
        confirmClose: false,
        dialogDefaults: {
            title: 'Estàs segur que vols tancar finestra?',
            description: "Les dades que no s'hagin guardat es perdran.",
            accept: 'Tancar',
            cancel: 'Cancel·lar',
        },
    };

    get renderLoader() {
        const modalLoader = document.createElement('div');
        modalLoader.setAttribute('aria-hidden', 'true');
        Util.addClass(modalLoader, 'modal__loader bg-black bg-opacity-90%');
        modalLoader.innerHTML = '<svg class="icon icon--lg color-primary icon--is-spinning" ><use href="#spinner"></use></svg>';
        return modalLoader;
    }

    get preventScrollEl() {
        return this.modal.dataset.modalPreventScroll ? document.querySelector(this.modal.dataset.modalPreventScroll) : document.querySelector(this.preventScroll);
    }

    isVisible(element) {
        return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    }

    getFocusableElements() {
        const focusableElString = Array.from(this.modal.querySelectorAll(this.focusableElString));
        // obtenir tots els elements enfocables dins del modal
        // obtenir el primer element enfocable visible dins del modal
        focusableElString.forEach((element) => {
            if (this.isVisible(element)) {
                this.firstFocusable = element;
                return;
            }
        });
        // obtenir l'últim element enfocable visible dins del modal
        focusableElString.reverse().forEach((element) => {
            if (this.isVisible(element)) {
                this.lastFocusable = element;
                return;
            }
        });
        this.getFirstFocusable();
    }

    getFirstFocusable() {
        if (!this.modalFocus || !Element.prototype.matches) {
            this.moveFocusEl = this.firstFocusable;
            return;
        }
        var containerIsFocusable = this.modalFocus.matches(this.focusableElString);
        if (containerIsFocusable) {
            this.moveFocusEl = this.modalFocus;
        } else {
            this.moveFocusEl = false;
            let elements = this.modalFocus.querySelectorAll(this.focusableElString);
            for (let i = 0; i < elements.length; i += 1) {
                if (this.isVisible(elements[i])) {
                    this.moveFocusEl = elements[i];
                    break;
                }
            }
            if (!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
        }
    }

    init() {
        if (this.triggers.length > 0) {
            this.triggers.forEach((trigger) => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.selectedTrigger = e.currentTarget;
                    if (this.modal.classList.contains(this.showClass)) {
                        this.close();
                        return;
                    }
                    this.modal.prepend(this.renderLoader);
                    this.modal.classList.add(this.loadingClass);
                    this.loading();
                    this.initEvents();
                });
            });
        }
    }

    initEvents() {
        this.modal.addEventListener('openModal', this._onOpen);
        this.modal.addEventListener('closeModal', this._onClose);
        this.modal.addEventListener('keydown', this._onKeydown);
        this.modal.addEventListener('click', this._onClick);
        window.addEventListener('keydown', this._onWindowKeydown);

        //const log = this.logModalEvent.bind(this);
        this.modal.addEventListener("modal:resizestart", (e) => {
            //log("modal:resizestart", e.detail);
            this.isResize = e.detail.isResize;
            if (this.isFullscreen) {
                this.isFullscreen = false;
                this.modal.classList.remove("fullscreen");
            }
        });
        // this.modal.addEventListener("modal:resize", (e) => {
        //     log("modal:resize", e.detail);
        // });
        this.modal.addEventListener("modal:resizeend", (e) => {
            //log("modal:resizeend", e.detail);
            this.isResize = e.detail.isResize;
        });
        
        this.modal.addEventListener("modal:dragstart", (e) => {
            //log("modal:dragstart", e.detail);
            this.isDrag=e.detail.isDrag;
            if (this.isFullscreen) {
                this.isFullscreen = false;
                this.modal.classList.remove("fullscreen");
            }
        });
        // this.modal.addEventListener("modal:drag", (e) => {
        //     log("modal:drag", e.detail);
        // });
        this.modal.addEventListener("modal:dragend", (e) => {
            //log("modal:dragend", e.detail);
            this.isDrag=e.detail.isDrag;
        });
    }

    loading() {
        if (this.preventScrollEl && this.preventScrollEl.offsetHeight > window.innerHeight) {
            this.preventScrollEl.style.overflow = 'hidden';
            this.preventScrollEl.style.marginRight = `${this.scrollbarWidth}px`;
        }

        this.modal.addEventListener('loadedModal', async () => {
            Util.removeClass(this.modal, this.loadingClass);
            document.querySelectorAll('.modal__loader').forEach((el) => el.remove());
            this.modal.dispatchEvent(new CustomEvent('openModal'));
        });

        this.modal.style.visibility = 'visible';
        this.modal.style.opacity = '1';

        if (!this.isDynamic || ['video', 'vimeo', 'youtube'].includes(this.mimeType)) {
            setTimeout(() => {
                this.modal.dispatchEvent(new CustomEvent('loadedModal'));
            }, 500);
        } else {
            let content = this.modal.querySelector('.modal__content');
            let header;

            switch (this.mimeType) {
                case 'dom':
                case 'html':
                case 'url':
                case 'unknown':
                    header = content.getElementsByTagName('header')[0] || content.appendChild(this.renderDynamicHeader);
                    if (this.footerActions.length > 0 && !content.getElementsByTagName('footer')[0]) {
                        content.appendChild(this.renderDynamicFooter);
                    }
                    if (header) header.parentNode.insertBefore(this.renderDynamicContent, header.nextSibling);
                    break;
                case 'video':
                case 'vimeo':
                case 'youtube': {
                    // aquests tipus ja tenen el contingut complet generat dins renderDynamicContent
                    content.innerHTML = ''; // neteja
                    content.appendChild(this.renderDynamicContent);

                    // afegim header amb títol (si n’hi ha)
                    if (this.title) {
                        content.prepend(this.renderDynamicHeader);
                    }
                    break;
                }
                case 'image':
                default:
                    content.appendChild(this.renderDynamicContent);
            }
        }
        this.modal.removeEventListener('loadedModal', (this));
    }

    async handleOpen() {
        this.modal.removeAttribute('style');
        Util.addClass(this.modal, this.showClass);
        this.getFocusableElements();

        if (this.moveFocusEl) {
            this.moveFocusEl.focus();
            await Util.transitionend(this.modal);
            this.moveFocusEl.focus();
        }

        this.modal.dispatchEvent(new CustomEvent('modalIsOpen', { detail: this.selectedTrigger }));

        if (this.onOpen) this.onOpen();

        this.modal.removeEventListener('openModal', this._onOpen);
    }

    async handleClose(e) {
        if (this.isResize || this.isDrag) return;
        if (e !== undefined) {
            e.preventDefault();
            if (e.target.classList && e.target.classList.contains(this.closeClass)) {
                this.close();
            }
        }

        if (this.confirmClose) {
            const { title, description, accept, cancel } = this.dialogDefaults || Modal.defaults.dialogDefaults;
            const confirm = new Dialog({
                title,
                description,
                accept,
                cancel,
                scrollbarWidth: this.scrollbarWidth,
                isDynamic: this.isDynamic,
            });
            const confirmResponse = await confirm.question();
            if (!confirmResponse) {
                this.isClose = false;
                return;
            }
        }

        if (this.onClose) this.onClose();

        this.close();
    }

    handleKeyDown(e) {
        if (this.isResize || this.isDrag) return;
        if ((e.code && e.code == 9) || (e.key && e.key == 'Tab')) {
            // Manté el focus dins del modal
            if (this.firstFocusable == document.activeElement && e.shiftKey) {
                // Amb Shift+Tab -> enfoca l'últim element enfocable quan el focus surt del modal
                e.preventDefault();
                this.lastFocusable.focus();
            }
            if (this.lastFocusable == document.activeElement && !e.shiftKey) {
                // Amb Tab -> enfoca el primer element enfocable quan el focus surt del modal
                e.preventDefault();
                this.firstFocusable.focus();
            }
        } else if (((e.code && e.code == 13) || (e.key && e.key == 'Enter')) && e.target.closest('.js-modal__close')) {
            // Tanca el modal quan es prem Enter al botó de tancar
            this.modal.dispatchEvent(new CustomEvent('closeModal'));
            e.preventDefault();
            this.close();
        }
    }

    handleClick(e) {
        if (this.isResize || this.isDrag) return;
        if (!e.target.closest('.' + this.closeClass) && !e.target.classList.contains('js-modal')) return;
        e.preventDefault();
        this.close();
    }

    async close() {
        // stop possible loading buttons
        this.loadingButtons.forEach((button) => {
            if (button && typeof button.stop === 'function') button.stop();
        });

        this.modal.removeEventListener('openModal', this._onOpen);
        this.modal.removeEventListener('closeModal', this._onClose);
        this.modal.removeEventListener('keydown', this._onKeydown);
        this.modal.removeEventListener('click', this._onClick);
        window.removeEventListener('keydown', this._onWindowKeydown);

        Util.removeClass(this.modal, this.showClass);
        await Util.transitionend(this.modal);

        // Si vam moure un node "dom" dins del modal, retornem-lo al seu lloc original
        if (this._movedNode && this._movedFrom && this._movedFrom.parent) {
            Util.addClass(this._movedNode, "hide");
            try {
                this._movedFrom.parent.insertBefore(this._movedNode, this._movedFrom.nextSibling || null);
            } catch (err) {
                console.warn('No s ha pogut reposar el node mogut dins del modal:', err);
            }
            // eliminem el wrapper si encara existeix i està buit
            if (this._movedWrapper && this._movedWrapper.parentNode) {
                this._movedWrapper.parentNode.removeChild(this._movedWrapper);
            }

            // netegem refs
            this._movedNode = null;
            this._movedFrom = null;
            this._movedWrapper = null;
        }

        if (this.isDynamic && !['video', 'vimeo', 'youtube', 'dom'].includes(this.mimeType)) {
            const content = this.modal.querySelector('.modal__content');
            if (content) content.innerHTML = '';
        }
        if (this.selectedTrigger) this.selectedTrigger.focus();

        this.modal.dispatchEvent(new CustomEvent('modalIsClose', { detail: this.selectedTrigger }));

        try {
            if (this.preventScrollEl) this.preventScrollEl.removeAttribute('style');
        } catch (err) {
            console.warn('close=>preventScrollEl no disponible per al modal:', err);
        }

        // do not `delete this;` — letting GC handle it
    }
    // logModalEvent(type, detail) {
    //     console.log(
    //         `%c[MODAL EVENT] %c${type}`,
    //         "color:#09f; font-weight:bold;",
    //         "color:#0a0; font-weight:bold;",
    //         detail ? detail : ""
    //     );
    // }
}

if (typeof window !== 'undefined') {
    if (!window.Modal) window.Modal = Modal;
}

function initModal(context = document) {
    const modals = context.querySelectorAll('.js-modal.modal');
    // console.groupCollapsed(`🖥️ initModal: trobades ${modals.length} modals`);
    // [...modals].forEach((m, i) => {
    //     console.log(`#${i}:`, m.id || '(sense id)', m);
    // });
    // console.groupEnd();
    modals.forEach((element) => {
        if (!element.dataset.modalInitialized) {
            new Modal(element, {
                fullscreen: element.dataset.fullscreen === 'off' ? false : true,
                confirmClose: element.dataset.confirmClose === 'on' ? true : false,
            });
            element.dataset.modalInitialized = 'true';
        }
    });
}

export { Modal, initModal };
