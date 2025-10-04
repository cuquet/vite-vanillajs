/* -------------------------------- 

File#: _1_modal-window
Title: Modal Window
Descr: A modal dialog used to display critical information
Usage: https://codyhouse.co/ds/components/info/modal-window

-------------------------------- */
import Resize from './Resize';
import Drag from './Drag';
import Dialog from '@components/overlays/dialog';
import Button from '@components/button';
import { icons, tools as Util } from '@modules';

class DynamicModal {
    isDynamic;
    mimeType;
    modal;
    constructor( element, opts) {
        Object.assign(this, Util.extend(DynamicModal.defaults, opts));
        this.element = element;
        this.dataOrigin = element.dataset.url || element.dataset.content;
        this.mimeType = this.setMimeType(this.dataOrigin);
        this.isDynamic = ((element.hasAttribute('data-content') || element.hasAttribute('data-url')) && !element.hasAttribute('aria-control')) ? true : false;
        this.buildModal();
        //if(this.isDynamic) {
        //     console.log(`Soc ModalDynamic => id: ${this.modal.id} => isDynamic: ${this.isDynamic} => dataOrigin: ${this.dataOrigin} => mimeType: ${this.mimeType}`);
        // }
    }
    buildModal() {
        if(this.isDynamic) {
            this.dataOrigin = this.element.dataset.url || this.element.dataset.content;
            this.mimeType = this.setMimeType(this.dataOrigin);
            this.ID = Util.getNewId();
            this.element.setAttribute('aria-controls','modal-' + this.ID);
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
            if (elem !== null) return true;
            else return elem;
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
        const isVimeo = (v) =>{
            // https://player.vimeo.com/video/nnnnnnnn
            return /^(http:\/\/|https:\/\/)?(player\.)?(vimeo\.com\/video\/)([0-9]+)$/.test(v);
        };
        const isYouTube = (v) => {
            // https://www.youtube.com/embed/nnnnnnnn
            return /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/.test(v);
        }

        if (isDOMcontent(url)) {
            return 'dom';
        } else {
            if (isHTMLcontent(url)) {
                return 'html';
            } else {
                if (isImage(url)) {
                    return 'image';
                } else {
                    if (isVideo(url)) {
                        return 'video';
                    } else {
                        if (isValidUrl(url) || isValidUrl(url, window.location.origin) ) {
                            if (isVimeo(url)) {
                                return 'vimeo';
                            } else {
                                if (isYouTube(url)) {
                                    return 'youtube';
                                } else {
                                    return 'url';
                                }
                            }
                        } else {
                            return 'unknown';
                        }
                    }
                }
            }
        }
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
        //title.textContent = this.title;
        title.innerHTML = this.title;

        const actions = document.createElement('div');
        Util.addClass(actions, this.actionsClass);

        const actionsArray = [];
        if (this.headerActions) {
            actionsArray.push(...this.headerActions);
        }
        if (this.fullscreen) {
            actionsArray.push({
                icon: '#expand',
                ariaLabel: 'Pantalla complerta',
                onClick: () => {
                    this.isFullscreen = !this.isFullscreen;
                    Util.toggleClass(this.modal, 'fullscreen', this.isFullscreen);
                    if(this.isFullscreen){
                        this.modal.querySelector('.modal__content').removeAttribute('style');
                    }
                    if (this.onFullscreen) {
                        this.onFullscreen(this.isFullscreen);
                    }
                },
            });
        }
        actionsArray.push({
            icon: '#close',
            ariaLabel: 'Tancar modal',
            classes: 'hide@md'.concat(' ', this.closeClass ),
            onClick: () => {
                this.handleClose();
            }, 
        });
        //}

        if (actionsArray) {
            actionsArray.forEach((action) => {
                const button = new Button('IconButton', {
                    icon: icons.get(action.icon),
                    classes: this.mimeType === 'image'
                        ? this.btnInnerClass
                            .trim()
                            .concat(
                                ' ',
                                this.btnInnerStickyClass,
                                action.classes,
                            )
                        : this.btnInnerClass
                            .trim()
                            .concat(' ', action.classes),
                    buttonSize: 'small',
                    svgSize: 'xs',
                    ariaLabel: action.ariaLabel,
                    onClick: action.onClick,
                });
                actions.appendChild(button.get());
            });
        }
        header.appendChild(title);
        header.appendChild(actions);
        return header;
    }

    get renderDynamicContent() {
        let modalContent;// = document.createElement('div');
        switch (this.mimeType) {
            case 'dom':
                if (document.querySelector(this.dataOrigin)) {
                    modalContent = document.createElement('div');
                    Util.addClass(modalContent, this.bodyClass);
                    modalContent.innerHTML = document.querySelector(this.dataOrigin).innerHTML;
                    document.querySelector(this.dataOrigin).remove();
                }

                break;
            case 'html':
                modalContent = document.createElement('div');
                Util.addClass(modalContent, this.bodyClass);
                modalContent.innerHTML = this.dataOrigin;
                break;
            case 'image':
                modalContent = document.createElement('img');
                modalContent.src = this.dataOrigin;
                modalContent.classList.add(
                    'radius-md',
                    'draggable',
                    'shadow-md',
                    'max-height-100%',
                    'max-width-100%',
                );
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
                modalContent.innerHTML = '<iframe class="js-modal-video__media" width="640" height="360" src="" frameborder="0" allow="autoplay" allowfullscreen webkitallowfullscreen mozallowfullscreen ></iframe>';
                break;
            case 'url':
                modalContent = document.createElement('div');
                Util.addClass(modalContent, this.bodyClass);
                ( async () =>
                    await fetch(this.dataOrigin, {
                        method: 'GET',
                        headers: { 'Access-Control-Allow-Origin': '*' },
                        })
                    .then((response) => { if(!response.ok) {throw new Error(response.status)} return response.text(); })
                    .then((data) =>{ modalContent.innerHTML = data; })
                    .catch((err) => {
                        //console.error('ERROR ajax: ', err.message);
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
        let resize, drag;

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
            'aria-labelledby': this.title ? 'modal-title-' + this.ID: '',
            'aria-describedby': '',
        });

        switch (this.mimeType) {
            case 'dom':
            case 'html':
            case 'url':
            case 'unknown':
                this.contentClass = this.contentClassDefault? this.contentClass.concat(' ', this.contentClassDefault): this.contentClass;
                if(this.contentClassDefault) {
                    content.appendChild(this.renderDynamicHeader)
            
                    if (this.isFullscreen) {
                        modal.classList.add('fullscreen');
                        content.removeAttribute('style');
                    } else {
                        modal.classList.remove('fullscreen');
                        content.style.maxWidth = this.maxWidth + 'px';
                        content.style.maxHeight = this.maxHeight + 'px';
                    }

                    resize = new Resize({
                        el: modal,
                        maxWidth: this.maxWidth,
                        onResize: (isResize) => {
                            drag.isResize = isResize;
                        },
                    });
                    drag = new Drag({
                        el: modal,
                        maxWidth: this.maxWidth,
                        onDrag: (isDrag) => {  
                            this.isFullscreen = false;
                            resize.isDrag = isDrag;
                        },
                    });
                };
                
                if (this.footerActions.length > 0) {
                    // console.log('this.footerActions=>', this.footerActions.length);
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
            classes: this.btnOuterClass.concat(' ', this.closeClass ),
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

DynamicModal.defaults = {
    animateClass: 'modal--animate-scale',
    //   'modal--animate-scale' default when is empty
    //   'modal--animate-translate-up'
    //   'modal--animate-translate-down'
    //   'modal--animate-translate-right'
    //   'modal--animate-translate-left'
    //   'modal--animate-slide-up'
    //   'modal--animate-slide-down'
    //   'modal--animate-slide-right'
    //   'modal--animate-slide-left'
    modalClass: 'modal flex flex-center flex-wrap bg-black bg-opacity-90% padding-md js-modal' /*padding-x-md*/ ,
    contentClass: 'modal__content',
    contentClassDefault: 'flex flex-column flex-nowrap max-height-100% overflow-auto bg radius-md inner-glow shadow-md max-width-sm',  
    //height-75%',
    contentClassImg: 'flex flex-center width-100% height-100% pointer-events-none',
    //contentClassImg: 'flex-column flex-center width-100% height-100% position-absolute pointer-events-none',
    contentClassVideo: 'width-100% max-width-md max-height-100% overflow-auto shadow-md',
    headerClass: 'modal__header draggable padding-y-sm padding-x-md flex items-center justify-between flex-shrink-0 bg-contrast-lower bg-opacity-50%',
    footerClass: 'modal__footer padding-md',
    actionsClass: 'modal__actions flex flex-row justify-between gap-sm', // 'justify-end flex-shrink-0'
    bodyClass: 'modal__body padding-y-sm padding-x-md flex-grow overflow-auto momentum-scrolling',
    btnInnerClass: 'modal__close-btn modal__close-btn--inner',
    btnInnerStickyClass: 'float-right position-sticky top-0',
    btnOuterClass: 'modal__close-btn modal__close-btn--outer js-modal__close',
    headerActions: [],
    footerActions: [],
    loadingButtons: [],
};

class Modal extends DynamicModal {
    constructor( modal, opts = {} ) {
        super(modal, Util.extend(Modal.defaults, opts));
        this.triggers = Array.from(document.querySelectorAll(`[aria-controls= ${this.modal.id}]`));
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.moveFocusEl = null; // focus will be moved to this element when modal is open
        this.modalFocus = (this.modal.dataset.modalFirstFocus)
            ? this.modal.querySelector(this.modal.dataset.modalFirstFocus)
            : null;
//        console.log(`Soc Modal => id: ${this.modal.id} => isDynamic: ${this.isDynamic}`);
        this.scrollbarWidth = Util.getScrollbarWidth();
//        console.log(`Scrollbar width: ${this.scrollbarWidth}`);
        this.init();
    }
    get renderLoader (){
        const modalLoader = document.createElement('div');
        modalLoader.setAttribute('aria-hidden', 'true');
        Util.addClass(modalLoader, 'modal__loader bg-black bg-opacity-90%');
        modalLoader.innerHTML = '<svg class="icon icon--lg color-primary icon--is-spinning" ><use href="#spinner"></use></svg>';
        return modalLoader;
    }
    get preventScrollEl () {
        return (this.modal.dataset.modalPreventScroll) ? document.querySelector(this.modal.dataset.modalPreventScroll) : document.querySelector(this.preventScroll);
    }
    isVisible (element) {
        return (
            element.offsetWidth ||
            element.offsetHeight ||
            element.getClientRects().length
        );
    }
    getFocusableElements () {
        const focusableElString = Array.from(this.modal.querySelectorAll(this.focusableElString));

        // console.log('focusableElString s=>', focusableElString);
        // obtenir tots els elements enfocables dins del modal
        // obtenir el primer element enfocable visible dins del modal
        focusableElString.forEach((element) => { 
            if (this.isVisible(element)) {
            this.firstFocusable = element;
            return;
            }
        });
        //console.log('focusableElString this.firstFocusable=>', this.firstFocusable);
        // obtenir l'últim element enfocable visible dins del modal
        focusableElString.reverse().forEach((element) => {
            if (this.isVisible(element)) {
                this.lastFocusable = element;
                return;
            }
        });
        //console.log('focusableElString this.lastFocusable=>', this.lastFocusable);
        this.getFirstFocusable();
    }
    getFirstFocusable () {
        if (!this.modalFocus || !Element.prototype.matches) {
            this.moveFocusEl = this.firstFocusable;
            return;
        }
        var containerIsFocusable = this.modalFocus.matches(this.focusableElString);
        console.log('getFirstFocusable containerIsFocusable=>', containerIsFocusable);
        if (containerIsFocusable) {
            this.moveFocusEl = this.modalFocus;
        } else {
            this.moveFocusEl = false;
            let elements = this.modalFocus.querySelectorAll(this.focusableElString);
            for (let i = 0; i < elements.length; i += 1) {
                if (this.isVisible(elements[i])) {
                    this.moveFocusEl = elements[i];
                    //console.log('getFirstFocusable false=>', this.moveFocusEl);
                    break;
                }
            }
            if (!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
        }
    }
    init () {
        if(this.triggers.length > 0){
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
                    //this.preventScrollEl;
                    this.loading();
                    this.initEvents();
                });
            });
        }

    }
    initEvents () {
        this.modal.addEventListener('openModal', this.handleOpen.bind(this));
        this.modal.addEventListener('closeModal', this.handleClose.bind(this));

        this.modal.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.modal.addEventListener('click', this.handleClick.bind(this));
        
        //tancar la finestra modal amb la tecla esc
        window.addEventListener('keydown', (event) => {
            if (
                (event.code && event.code == 27) ||
                (event.key && event.key == 'Escape')
            ) {
                this.close();
            }
        });
    }
    loading () {
        //this.preventScrollEl.style.overflow = 'hidden';
        if (this.preventScrollEl.offsetHeight > window.innerHeight) {
            this.preventScrollEl.style.overflow = 'hidden';
            this.preventScrollEl.style.marginRight = `${this.scrollbarWidth}px`;
        }
        this.modal.addEventListener('loadedModal', () => {
            Util.removeClass(this.modal, this.loadingClass);
            document.querySelectorAll('.modal__loader').forEach((el) => el.remove());
            this.modal.dispatchEvent(new CustomEvent('openModal'));
        });

        this.modal.style.visibility = 'visible';
        this.modal.style.opacity = '1';
        if(!this.isDynamic || ['video','vimeo','youtube'].includes(this.mimeType)){
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
                    header.parentNode.insertBefore(this.renderDynamicContent, header.nextSibling);
                    break;
                case 'video':
                case 'vimeo':
                case 'youtube':
                    break;
                case 'image':
                default:
                    content.appendChild(this.renderDynamicContent);
            }
        }
        this.modal.removeEventListener('loadedModal', (this));
    }
    handleOpen () {
        this.modal.removeAttribute('style');
        Util.addClass(this.modal, this.showClass);
        this.getFocusableElements();
        
        if (this.moveFocusEl) {
            this.moveFocusEl.focus();
            this.modal.addEventListener("transitionend", (event) => {
                this.moveFocusEl.focus();
                this.modal.removeEventListener("transitionend", event.currentTarget);
            });
        }
        
        this.modal.dispatchEvent(new CustomEvent('modalIsOpen', { detail: this.selectedTrigger }));

        if (this.onOpen) { this.onOpen(); }

        this.modal.removeEventListener('openModal', this.handleOpen.bind(this));
    }
    async handleClose (e) {
        if (e !== undefined) {
            e.preventDefault();
            if( e.target.classList.contains(this.closeClass)) {
                //console.log('handleClose=> hasClass');
                this.close();
            }
        }
        if (this.confirmClose) {
            const confirm = new Dialog({
                title: 'Estàs segur que vols tancar finestra?',
                description:
                    'Les dades que no s\'hagin guardat es perdran.',
                accept: 'Tancar',
                cancel: 'Cancel·lar',
                scrollbarWidth: this.scrollbarWidth,
                isDynamic: this.isDynamic,
            });
            const confirmResponse = await confirm.question();

            if (!confirmResponse) {
                this.isClose = false;
                return;
            }
        }
        if (this.onClose) { this.onClose(); }
        //this.modal.dispatchEvent(new CustomEvent('modalIsClose'), { detail: this.selectedTrigger });
        this.close();
    }
    handleKeyDown (e) {
        // const trapFocus = (event) => {
        //     if (this.firstFocusable == document.activeElement && event.shiftKey) {
        //         // Amb Shift+Tab -> enfoca l'últim element enfocable quan el focus surt del modal
        //         event.preventDefault();
        //         this.lastFocusable.focus();
        //     }
        //     if (this.lastFocusable == document.activeElement && !event.shiftKey) {
        //         // Amb Tab -> enfoca el primer element enfocable quan el focus surt del modal
        //         event.preventDefault();
        //         this.firstFocusable.focus();
        //     }
        // } 
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
        } else if (((e.code && event.code == 13) || (e.key && e.key == 'Enter')) && e.target.closest('.js-modal__close')) {
            // Tanca el modal quan es prem Enter al botó de tancar
            this.modal.dispatchEvent(new CustomEvent('closeModal'));
            e.preventDefault();
            this.close();
        }
    }
    handleClick (e) {
        if ( !e.target.closest('.'+this.closeClass) && !e.target.classList.contains('js-modal'))
            return;
        e.preventDefault();
        this.close();
    }
    async close () {
        this.loadingButtons.forEach((button) => {
            button.stop();
        });
        document.removeEventListener('closeModal', this.handleClose.bind(this));
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('click', this.handleClick.bind(this));

        Util.removeClass(this.modal, this.showClass);
        await Util.transitionend(this.modal);

        if (this.isDynamic && !['video','vimeo','youtube','dom'].includes(this.mimeType)) this.modal.querySelector('.modal__content').innerHTML='';
        if (this.selectedTrigger) this.selectedTrigger.focus();

        this.modal.dispatchEvent(new CustomEvent('modalIsClose'), { detail: this.selectedTrigger });
        this.preventScrollEl.removeAttribute('style');
        delete this;
    }
}

Modal.defaults = {
    preventScroll: 'body',
    loadingClass: 'modal--is-loading',
    showClass: 'modal--is-visible',
    closeClass: 'js-modal__close',
    focusableElString : Util.focusableElString(),
    fullscreen: true,
    confirmClose: false,
};

window.Modal = Modal;
export default Modal;

document.addEventListener('DOMContentLoaded', () => {
    const modals = Array.from(document.querySelectorAll('.js-modal.modal'));
    modals.forEach((element) => {
        new Modal(element,
            {
                fullscreen: (element.getAttribute('data-fullscreen') && element.dataset.fullscreen == 'off') ? false : true,
                confirmClose: (element.getAttribute('data-confirm-close') && element.dataset.confirmClose == 'on') ? true : false,
                // onOpen: () => {
                //     console.log('Obrir');
                // },
                // onClose: () => {
                //     console.log('Tancar');
                // },
                // onFullscreen: (isFullscreen) => {
                //     console.log(`Pantalla Complerta: ${isFullscreen}`);
                // },
            }
        );
    });
});
