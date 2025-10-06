/* -------------------------------- 

File#: _2_slideshow
Title: Slideshow
Descr: Show a collection of items one at a time
Usage: https://codyhouse.co/ds/components/info/slideshow
Dependencies:
    _1_swipe-content Swipe Content https://codyhouse.co/ds/components/app/swipe-content
-------------------------------- */

import { tools as Util } from '@modules';
import { SwipeContent } from './_1_swipe-content';
class Slideshow {
    constructor(opts) {
        this.options = Util.extend(Slideshow.defaults, opts);
        this.element = this.options.element;
        this.items = this.element.getElementsByClassName('js-slideshow__item');

        this.selectedSlide = 0;
        this.autoplayId = false;
        this.autoplayPaused = false;
        //this.navigation = false;
        this.navCurrentLabel = false;
        this.ariaLive = false;
        this.moveFocus = false;
        this.animating = false;
        this.supportAnimation = Util.cssSupports('transition');
        this.animationOff =
            !Util.hasClass(this.element, 'slideshow--transition-fade') &&
            !Util.hasClass(this.element, 'slideshow--transition-slide') &&
            !Util.hasClass(this.element, 'slideshow--transition-prx');
        this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx')
            ? 'prx'
            : 'slide';
        this.animatingClass = 'slideshow--is-animating';
        this.init();
        this.initEvents();
        this.initAnimationEndEvents();
    }

    static defaults = {
        element: '',
        navigation: true,
        autoplay: false,
        autoplayOnHover: false,
        autoplayOnFocus: false,
        autoplayInterval: 5000,
        navigationItemClass: 'slideshow__nav-item',
        navigationClass: 'slideshow__navigation',
        swipe: false,
    };

    get renderSlideshowControls() {
        const controls = document.createElement('ul');
        controls.setAttribute('id', 'lightboxControllers');
        const controlsAction = [
            {
                ariaLabel: 'Mostra la diapositiva anterior',
                icon: '<path d="M20.768,31.395L10.186,16.581c-0.248-0.348-0.248-0.814,0-1.162L20.768,0.605l1.627,1.162L12.229,16 l10.166,14.232L20.768,31.395z"></path>',
                onClick: () => {
                    this.showPrev();
                },
            },
            {
                ariaLabel: 'Mostra la següent diapositiva',
                icon: '<path d="M11.232,31.395l-1.627-1.162L19.771,16L9.605,1.768l1.627-1.162l10.582,14.813 c0.248,0.348,0.248,0.814,0,1.162L11.232,31.395z"></path>',
                onClick: () => {
                    this.showNext();
                },
            },
        ];
        controlsAction.forEach((action) => {
            const item = `<li class="slideshow__control js-slideshow__control">
                <button class="slideshow__btn">
                <svg class="icon" viewBox="0 0 32 32"><title>${action.ariaLabel}</title>${action.icon}</svg></button>
            </li>`;
            controls.innerHTML += item;
        });
        return controls;
    }

    init() {
        // configuració bàsica del slideshow
        // si no s'ha seleccionat cap diapositiva -> selecciona la primera
        if (this.element.getElementsByClassName('slideshow__item--selected').length < 1)
            Util.addClass(this.items[0], 'slideshow__item--selected');
        this.selectedSlide = Util.getIndexInArray(
            this.items,
            this.element.getElementsByClassName('slideshow__item--selected')[0],
        );
        this.element.appendChild(this.renderSlideshowControls);
        this.controls = this.element.getElementsByClassName('js-slideshow__control');
        // crea un element que s'utilitzarà per anunciar la nova diapositiva visible al lector de pantalla
        const srLiveArea = document.createElement('div');
        Util.setAttributes(srLiveArea, {
            class: 'sr-only js-slideshow__aria-live',
            'aria-live': 'polite',
            'aria-atomic': 'true',
        });
        this.element.appendChild(srLiveArea);
        this.ariaLive = srLiveArea;
    }
    initEvents() {
        var slideshow = this;
        function _externalControlSlide(button) {
            // controla el slideshow utilitzant un element extern
            button.addEventListener('click', function (event) {
                var index = button.getAttribute('data-index');
                if (!index || index == slideshow.selectedSlide + 1) return;
                event.preventDefault();
                this.showNewItem(index - 1, false);
            });
        }
        function _updateAriaLive() {
            slideshow.ariaLive.innerHTML =
                'Element ' + (slideshow.selectedSlide + 1) + ' de ' + slideshow.items.length;
        }
        function _navigateSlide(event, keyNav) {
            // l'usuari ha interactuat amb la navegació del slideshow -> actualitza la diapositiva visible
            var target = Util.hasClass(event.target, 'js-slideshow__nav-item')
                ? event.target
                : event.target.closest('.js-slideshow__nav-item');
            if (keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
                slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
                slideshow.moveFocus = true;
                _updateAriaLive(slideshow);
            }
        }
        // si la navegació del slideshow està activada -> crea el HTML de navegació i afegeix els esdeveniments
        if (slideshow.options.navigation) {
            // comprova si la navegació ja s'ha inclòs
            if (slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
                var navigation = document.createElement('ol'),
                    navChildren = '';

                var navClasses = slideshow.options.navigationClass + ' js-slideshow__navigation';
                if (slideshow.items.length <= 1) {
                    navClasses = navClasses + ' hide';
                }

                navigation.setAttribute('class', navClasses);
                for (let i = 0; i < slideshow.items.length; i += 1) {
                    var className =
                            i == slideshow.selectedSlide
                                ? 'class="' +
                                  slideshow.options.navigationItemClass +
                                  ' ' +
                                  slideshow.options.navigationItemClass +
                                  '--selected js-slideshow__nav-item"'
                                : 'class="' +
                                  slideshow.options.navigationItemClass +
                                  ' js-slideshow__nav-item"',
                        navCurrentLabel =
                            i == slideshow.selectedSlide
                                ? '<span class="sr-only js-slideshow__nav-current-label">Element actual</span>'
                                : '';
                    navChildren =
                        navChildren +
                        '<li ' +
                        className +
                        '><button class="reset"><span class="sr-only">' +
                        (i + 1) +
                        '</span>' +
                        navCurrentLabel +
                        '</button></li>';
                }
                navigation.innerHTML = navChildren;
                slideshow.element.appendChild(navigation);
            }

            slideshow.navCurrentLabel = slideshow.element.getElementsByClassName(
                'js-slideshow__nav-current-label',
            )[0];
            slideshow.navigation =
                slideshow.element.getElementsByClassName('js-slideshow__nav-item');

            var dotsNavigation = slideshow.element.getElementsByClassName(
                'js-slideshow__navigation',
            )[0];

            dotsNavigation.addEventListener('click', function (event) {
                _navigateSlide(event, true);
            });
            dotsNavigation.addEventListener('keyup', function (event) {
                _navigateSlide(event, event.key.toLowerCase() == 'enter');
            });
        }
        // controls de fletxa del slideshow
        if (slideshow.controls.length > 0) {
            // amaga els controls si només hi ha un element
            if (slideshow.items.length <= 1) {
                Util.addClass(slideshow.controls[0], 'hide');
                Util.addClass(slideshow.controls[1], 'hide');
            }
            slideshow.controls[0].addEventListener('click', function (event) {
                event.preventDefault();
                slideshow.showPrev();
                _updateAriaLive(slideshow);
            });
            slideshow.controls[1].addEventListener('click', function (event) {
                event.preventDefault();
                slideshow.showNext();
                _updateAriaLive(slideshow);
            });
        }
        // esdeveniments de swipe
        if (slideshow.options.swipe) {
            // inicialitza el swipe
            new SwipeContent(slideshow.element);
            slideshow.element.addEventListener('swipeLeft', function () {
                slideshow.showNext();
            });
            slideshow.element.addEventListener('swipeRight', function () {
                slideshow.showPrev();
            });
        }
        // reproducció automàtica
        if (slideshow.options.autoplay) {
            slideshow.startAutoplay();
            // pausa la reproducció automàtica si l'usuari interactua amb el slideshow
            if (!slideshow.options.autoplayOnHover) {
                slideshow.element.addEventListener('mouseenter', function () {
                    slideshow.pauseAutoplay();
                    slideshow.autoplayPaused = true;
                });
                slideshow.element.addEventListener('mouseleave', function () {
                    slideshow.autoplayPaused = false;
                    slideshow.startAutoplay();
                });
            }
            if (!slideshow.options.autoplayOnFocus) {
                slideshow.element.addEventListener('focusin', function () {
                    slideshow.pauseAutoplay();
                    slideshow.autoplayPaused = true;
                });
                slideshow.element.addEventListener('focusout', function () {
                    slideshow.autoplayPaused = false;
                    slideshow.startAutoplay();
                });
            }
        }
        // detecta si botons externs controlen el slideshow
        var slideshowId = slideshow.element.getAttribute('id');
        if (slideshowId) {
            var externalControls = document.querySelectorAll(
                '[data-controls="' + slideshowId + '"]',
            );
            for (var i = 0; i < externalControls.length; i++) {
                (function (i) {
                    _externalControlSlide(externalControls[i]);
                })(i);
            }
        }
        // esdeveniment personalitzat per seleccionar un nou element de diapositiva
        slideshow.element.addEventListener('selectNewItem', function (event) {
            // comprova si la diapositiva ja està seleccionada
            if (event.detail) {
                if (event.detail - 1 == slideshow.selectedSlide) return;
                this.showNewItem(event.detail - 1, false);
            }
        });

        // navegació amb teclat
        slideshow.element.addEventListener('keydown', function (event) {
            if (
                (event.keyCode && event.keyCode == 39) ||
                (event.key && event.key.toLowerCase() == 'arrowright')
            ) {
                slideshow.showNext();
            } else if (
                (event.keyCode && event.keyCode == 37) ||
                (event.key && event.key.toLowerCase() == 'arrowleft')
            ) {
                slideshow.showPrev();
            }
        });
    }
    initAnimationEndEvents() {
        var slideshow = this;
        // elimina les classes d'animació al final de la transició de diapositiva
        function _resetAnimationEnd(slideshow, item) {
            setTimeout(function () {
                // afegeix un retard entre el final de l'animació i el reset del slideshow - millora el rendiment de l'animació
                if (Util.hasClass(item, 'slideshow__item--selected')) {
                    if (slideshow.moveFocus) Util.moveFocus(item);
                    slideshow.element.dispatchEvent(
                        new CustomEvent('newItemVisible', { detail: slideshow.selectedSlide }),
                    );
                    slideshow.moveFocus = false;
                }
                Util.removeClass(
                    item,
                    'slideshow__item--' +
                        slideshow.animationType +
                        '-out-left slideshow__item--' +
                        slideshow.animationType +
                        '-out-right slideshow__item--' +
                        slideshow.animationType +
                        '-in-left slideshow__item--' +
                        slideshow.animationType +
                        '-in-right',
                );
                item.removeAttribute('aria-hidden');
                slideshow.animating = false;
                Util.removeClass(slideshow.element, slideshow.animatingClass);
            }, 100);
        }
        for (let i = 0; i < slideshow.items.length; i += 1) {
            (function (i) {
                slideshow.items[i].addEventListener('animationend', function () {
                    _resetAnimationEnd(slideshow, slideshow.items[i]);
                });
                slideshow.items[i].addEventListener('transitionend', function () {
                    _resetAnimationEnd(slideshow, slideshow.items[i]);
                });
            })(i);
        }
    }
    showNewItem(index, bool) {
        var slideshow = this;
        function _getExitItemClass(oldIndex, newIndex) {
            var className = '';
            if (bool) {
                className =
                    bool == 'next'
                        ? 'slideshow__item--' + slideshow.animationType + '-out-right'
                        : 'slideshow__item--' + slideshow.animationType + '-out-left';
            } else {
                className =
                    newIndex < oldIndex
                        ? 'slideshow__item--' + slideshow.animationType + '-out-left'
                        : 'slideshow__item--' + slideshow.animationType + '-out-right';
            }
            return className;
        }
        function _getEnterItemClass(oldIndex, newIndex) {
            var className = '';
            if (bool) {
                className =
                    bool == 'next'
                        ? 'slideshow__item--' + slideshow.animationType + '-in-right'
                        : 'slideshow__item--' + slideshow.animationType + '-in-left';
            } else {
                className =
                    newIndex < oldIndex
                        ? 'slideshow__item--' + slideshow.animationType + '-in-left'
                        : 'slideshow__item--' + slideshow.animationType + '-in-right';
            }
            return className;
        }
        function _resetSlideshowNav(newIndex, oldIndex) {
            if (slideshow.navigation) {
                Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
                Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
                slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
                slideshow.navigation[newIndex]
                    .getElementsByTagName('button')[0]
                    .appendChild(slideshow.navCurrentLabel);
            }
        }
        function _resetSlideshowTheme(newIndex) {
            var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
            if (dataTheme) {
                if (slideshow.navigation)
                    slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
                if (slideshow.controls[0])
                    slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
            } else {
                if (slideshow.navigation)
                    slideshow.navigation[0].parentElement.removeAttribute('data-theme');
                if (slideshow.controls[0])
                    slideshow.controls[0].parentElement.removeAttribute('data-theme');
            }
        }

        if (slideshow.items.length <= 1) return;
        if (slideshow.animating && slideshow.supportAnimation) return;
        slideshow.animating = true;
        Util.addClass(slideshow.element, slideshow.animatingClass);
        if (index < 0) index = slideshow.items.length - 1;
        else if (index >= slideshow.items.length) index = 0;
        // salta l'element del slideshow si està amagat
        if (bool && Util.hasClass(slideshow.items[index], 'hide')) {
            slideshow.animating = false;
            index = bool == 'next' ? index + 1 : index - 1;
            this.showNewItem(index, bool);
            return;
        }
        // l'índex de la nova diapositiva és igual a l'índex de la diapositiva seleccionada
        if (index == slideshow.selectedSlide) {
            slideshow.animating = false;
            return;
        }
        var exitItemClass = _getExitItemClass(slideshow.selectedSlide, index);
        var enterItemClass = _getEnterItemClass(slideshow.selectedSlide, index);
        // transició entre diapositives
        if (!slideshow.animationOff)
            Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
        Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
        slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //amaga a lector de pantalla l'element que surt del viewport
        if (slideshow.animationOff) {
            Util.addClass(slideshow.items[index], 'slideshow__item--selected');
        } else {
            Util.addClass(slideshow.items[index], enterItemClass + ' slideshow__item--selected');
        }
        // reinicia l'aparença de la navegació del slider
        _resetSlideshowNav(index, slideshow.selectedSlide);
        slideshow.selectedSlide = index;
        // reinicia la reproducció automàtica
        slideshow.pauseAutoplay();
        slideshow.startAutoplay();
        // reinicia els temes de color dels controls/navegació
        _resetSlideshowTheme(index);
        // emet esdeveniment
        //var event = new CustomEvent('newItemSelected', { detail: slideshow.selectedSlide });
        slideshow.element.dispatchEvent(
            new CustomEvent('newItemSelected', { detail: slideshow.selectedSlide }),
        );
        if (slideshow.animationOff) {
            slideshow.animating = false;
            Util.removeClass(slideshow.element, slideshow.animatingClass);
        }
    }
    showNext() {
        this.showNewItem(this.selectedSlide + 1, 'next');
    }
    showPrev() {
        this.showNewItem(this.selectedSlide - 1, 'prev');
    }
    showItem(index) {
        this.showNewItem(index, false);
    }
    startAutoplay() {
        var self = this;
        if (this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
            self.autoplayId = setInterval(function () {
                self.showNext();
            }, self.options.autoplayInterval);
        }
    }
    pauseAutoplay() {
        var self = this;
        if (this.options.autoplay) {
            clearInterval(self.autoplayId);
            self.autoplayId = false;
        }
    }
}

function initSlideshow(context = document) {
    const elements = context.querySelectorAll('.js-slideshow');
    elements.forEach(el => {
        if (!el.dataset.slideshowInitialized) {
            let navigation =
                    el.getAttribute('data-navigation') &&
                    el.getAttribute('data-navigation') == 'off'
                        ? false
                        : true,
                autoplay =
                    el.getAttribute('data-autoplay') && el.getAttribute('data-autoplay') == 'on'
                        ? true
                        : false,
                autoplayOnHover =
                    el.getAttribute('data-autoplay-on-hover') &&
                    el.getAttribute('data-autoplay-on-hover') == 'on'
                        ? true
                        : false,
                autoplayOnFocus =
                    el.getAttribute('data-autoplay-on-focus') &&
                    el.getAttribute('data-autoplay-on-focus') == 'on'
                        ? true
                        : false,
                autoplayInterval = el.getAttribute('data-autoplay-interval')
                    ? parseInt(el.getAttribute('data-autoplay-interval'))
                    : 5000,
                swipe =
                    el.getAttribute('data-swipe') && el.getAttribute('data-swipe') == 'on'
                        ? true
                        : false,
                navigationItemClass = el.getAttribute('data-navigation-item-class')
                    ? el.getAttribute('data-navigation-item-class')
                    : 'slideshow__nav-item',
                navigationClass = el.getAttribute('data-navigation-class')
                    ? el.getAttribute('data-navigation-class')
                    : 'slideshow__navigation';
            new Slideshow({
                element: el,
                navigation: navigation,
                autoplay: autoplay,
                autoplayOnHover: autoplayOnHover,
                autoplayOnFocus: autoplayOnFocus,
                autoplayInterval: autoplayInterval,
                navigationItemClass: navigationItemClass,
                navigationClass: navigationClass,
                swipe: swipe,
            });
            el.dataset.slideshowInitialized = 'true';
        }
    });
}

if (typeof window !== 'undefined') {
    window.Slideshow = Slideshow;
}
export {Slideshow, initSlideshow};

