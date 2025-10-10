// _1_table-of-contents
// https://codepen.io/cgurski/pen/qBrNrPo?editors=0010
// https://codepen.io/cuquet/pen/oNQGbvm?editors=1010
// https://www.tj.ie/building-a-table-of-contents-with-the-intersection-observer-api/
// https://codepen.io/tjFogarty/embed/yxPdqe?default-tab=result&theme-id=light

import { tools as Util } from '@modules';

class DynamicToC {
    constructor(element, opts) {
        Object.assign(this, Util.extend(DynamicToC.defaults, opts));
        this.element = element;
        this.element.innerHTML = this.mobileBtnToC;
        this.container = document.querySelector(".".concat(this.containerClass));
        this.output = this.element.querySelector(".".concat(this.outputClass));
        this.toc = "";
        this.renderTocList();
    }

    get getHeadings() {
        const headingsraw = this.container.querySelectorAll("h1, h2, h3, h4, h5");
        const headings = Array.prototype.slice.call(headingsraw, 0).filter(function(el) {
            return !(el.classList.contains("toc-skip"));
        });
        return headings;
    }

    get mobileBtnToC() {
        return `
        <button class="toc__control padding-sm js-toc__control" aria-controls="toc">
            <span class="toc__control-text">
                <i class="js-toc__control-label">${this.btnText}<span class="sr-only">${this.btn_sronly}</span></i>
                <i aria-hidden="true">${this.btnHead}</i>
            </span>
            <svg class="toc__icon-arrow icon icon--xs margin-left-3xs" viewBox="0 0 16 16" aria-hidden="true">
                <g class="icon__group" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="M3 3l10 10"></path>
                    <path d="M13 3L3 13"></path>
                </g>
            </svg>
        </button>
        <nav class="${this.outputClass}"></nav>`;
    }

    renderTocList() {
        if (this.container) {
            const headings = this.getHeadings;
            let level = 0;
            let prevlevel = 0;
            if (headings.length > 0) {
                this.toc += `<ul class="toc__list js-toc__list"><li class="toc__label">${this.btnText}</li>`;
                // Recorre els encapçalaments NodeList
                for (let i = 0; i <= headings.length - 1; i += 1) {
                    // Estableix l'identificador ID del text de la capçalera, tot en minúscula amb guionets en lloc d'espais. Esborra el codi HTML.
                    // https://stackoverflow.com/questions/3790681/regular-expression-to-remove-html-tags
                    // https://regexr.com/7h2ik
                    // treu html, barres a la dreta, accents, comes, punts i comes, doble punt i geminades...
                    // /<([\w\-/]+)( +[\w\-]+(=(('[^']*')|("[^"]*")))?)* *>/g 
                    // /(<([\w\-/]+)( +[\w-]+(=(('[^']*')|("[^"]*")))?)* *>)|([/]|[.·:;,&<>+()/\]|[à-ü]|[À-Ü]|[ ])/g
                    const id = headings[i].innerHTML.toLowerCase().replace(/(<([\w\-/]+)( +[\w-]+(=(('[^']*')|("[^"]*")))?)* *>)|(\W)/g, '');
                    // Aconsegueix un nivell per a la jerarquia de la capçalera 
                    level = parseInt(headings[i].localName.replace('h', ''));
                    // Estableix el títol al text de la capçalera
                    // eslint-disable-next-line no-useless-escape
                    const titleText = headings[i].innerHTML.replace(/<([\w\-/]+)( +[\w\-]+(=(('[^']*')|("[^"]*")))?)* *>/g, '');
                    // Estableix l'ID de la capçalera amb el seu text en minúscules amb guionets en comptes d'espais.
                    headings[i].setAttribute("id", id);
                    headings[i].classList.add("toc-content__target");

                    if (prevlevel > 0 && level > prevlevel) {
                        this.toc += (new Array(level - prevlevel + 1)).join('<ul class="toc__list">');
                    } else if (level < prevlevel) {
                        this.toc += (new Array(prevlevel - level + 1)).join('</li></ul>');
                    } else {
                        this.toc += (new Array(prevlevel + 1)).join('</li>');
                    }
                    prevlevel = parseInt(level);
                    this.toc += `<li><a class="toc__link js-smooth-scroll" style="padding-left:calc(var(--space-xs) * ${level} )" data-level="${level}" href="#${id}">${titleText}</a>`;
                }
                this.output.innerHTML += this.toc;
            } else {
                this.element.remove();
            }
        }
    }
}

DynamicToC.defaults = {
    containerClass: 'toc-content',
    outputClass: 'toc__nav',
    btnText: 'En aquest article',
    btnHead: 'Selecciona',
    btn_sronly: '- press button to select new section.',
};

class ToC extends DynamicToC {
    constructor(element, opts = {}) {
        super(element, Util.extend(ToC.defaults, opts));
        this.list = this.element.querySelector('.js-toc__list') || false;
        this.sections = this.getSections;
        this.controller = this.element.getElementsByClassName('js-toc__control');
        this.controllerLabel = this.element.getElementsByClassName('js-toc__control-label');
        this.content = this.getTocContent;
        this.clickScrolling = false;
        this.isStatic = Util.hasClass(this.element, this.staticLayoutClass);
        this.layout = 'static';
        this.init();
    }

    get getSections() {
        this.links = [...this.list.querySelectorAll('a[href^="#"]')];
        return this.links.map(link => {
            let id = link.getAttribute('href');
            return document.querySelector(id)
        });
    }

    get getTocContent() {
        if (!this.sections) return false;
        return this.sections[0].closest('.js-toc-content');
    }

    init() {
        var intersectionObserverSupported;
        var observer;
        // switch between mobile and desktop layout
        this.checkTocLayout();
    
        if (this.sections.length > 0) {
            this.list.addEventListener('click', this.handleAnchorClick.bind(this));
            // comprova quan una nova secció entra al viewport
            intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
            if (intersectionObserverSupported) {
                observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (!this.clickScrolling) {
                            let link = this.links.find(l => l.getAttribute('href') === `#${entry.target.getAttribute('id')}`)
                            if (entry.isIntersecting && entry.intersectionRatio === 1) {
                                link.classList.add('is-visible');
                                this.previousSection = entry.target.getAttribute('id');
                            } else {
                                link.classList.remove('is-visible');
                            }
                            this.highlightFirstActive();
                        }
                    });
                }, { rootMargin: '0px 0px -40% 0px', threshold: [0.3, 0.6] });
                // {
                //     rootMargin: '0px',
                //     threshold: 1
                // });
                this.sections.forEach(section => observer.observe(section));
            }
            // detecta el final del desplaçament -> reactiva IntersectionObserver en desplaçament
            this.element.addEventListener('toc-scroll', this.handleTocScroll.bind(this));
        }
        // esdeveniment personalitzat emès quan la finestra es redimensiona
        this.element.addEventListener('toc-resize', this.handleTocResize.bind(this));
        // només versió col·lapsada (mòbil)
        if (this.controller.length < 1) return;
        // alterna la visibilitat de la navegació
        this.controller[0].addEventListener('click', this.handleBtnClick.bind(this));
        // tanca la versió ampliada amb esc
        this.element.addEventListener('keydown', this.handleBtnKeydown.bind(this));
    }

    highlightFirstActive() {
        let firstVisibleLink = this.list.querySelector('.is-visible');
        this.links.forEach(link => link.classList.remove('toc__link--selected'));
        if (firstVisibleLink) firstVisibleLink.classList.add('toc__link--selected');
        if (!firstVisibleLink && this.previousSection) {
            this.list.querySelector(`a[href="#${this.previousSection}"]`).classList.add('toc__link--selected');
        }
    }

    checkTocLayout() {
        if (this.isStatic) return;

        // eslint-disable-next-line no-useless-escape
        this.layout = getComputedStyle(this.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
        Util.toggleClass(this.element, this.staticLayoutClass, this.layout === 'static');
        if (this.content) Util.toggleClass(this.content, this.contentStaticLayoutClass, this.layout === 'static');
        Util.toggleClass(this.element, 'position-sticky@md', this.isSticky);
        //console.debug('ToC layout changed ->', this.layout, ' element classes: ', this.element.className);
    }

    toggleToc(bool) {
        // només versió col·lapsada (mòbil)
        if (this.controller.length < 1) return;
        // alterna la versió mòbil
        Util.toggleClass(this.element, this.expandedClass, !bool);
        bool ? this.controller[0].removeAttribute('aria-expanded') : this.controller[0].setAttribute('aria-expanded', 'true');
        if (!bool && this.links.length > 0) this.links[0].focus();
    }

    handleAnchorClick(e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        this.clickScrolling = true;
        this.toggleToc(true);
    }

    handleBtnClick(e) {
        e.preventDefault();
        const isOpen = Util.hasClass(this.element, this.expandedClass);
        this.toggleToc(isOpen);
    }

    handleBtnKeydown(e) {
        if (this.layout === 'static') return;
        if ((e.keyCode && e.keyCode === 27) || (e.key && e.key.toLowerCase() === 'escape')) {
            this.toggleToc(true);
            this.controller[0].focus();
        }
    }

    handleTocScroll() {
        this.clickScrolling = false;
    }

    handleTocResize() {
        this.checkTocLayout();
    }

    static initToCLazy() {
            // escolta el desplaçament de la finestra -> restableix la propietat clickScrolling
        var scrollId = false;
        var resizeId = false;
        const tocs = document.querySelectorAll('.js-toc');
        const tocsArray = [];
        if (!tocs.length) return;

        Array.from(tocs).forEach(toc => {
            if (!toc.dataset.tocInitialized) {
                toc.dataset.tocInitialized = 'true';
                tocsArray.push(new ToC(toc));
                window.addEventListener('scroll', function() {
                    clearTimeout(scrollId);
                    scrollId = setTimeout(doneScrolling(), 100);
                });
                window.addEventListener('resize', function() {
                    clearTimeout(resizeId);
                    scrollId = setTimeout(doneResizing(), 100);
                });
            }
        });
        function doneScrolling() {
            var scrollEvent = new CustomEvent('toc-scroll');
            for (let i = 0; i < tocsArray.length; i += 1) {
                (function() {
                    tocsArray[i].element.dispatchEvent(scrollEvent);
                }(i));
            }
        }
        function doneResizing() {
            var resizeEvent = new CustomEvent('toc-resize');
            for (let i = 0; i < tocsArray.length; i += 1) {
                (function() {
                    tocsArray[i].element.dispatchEvent(resizeEvent);
                }(i));
            }
        }
    }
}

ToC.defaults = {
    staticLayoutClass: 'toc--static',
    contentStaticLayoutClass: 'toc-content--toc-static',
    expandedClass: 'toc--expanded',
    skipClass: 'toc-skip',
    isSticky: true,
};

export { ToC };
export function initToC() {
    ToC.initToCLazy();
}