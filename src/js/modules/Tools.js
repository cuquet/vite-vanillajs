export const tools = (() => {
    const animationend = (target) => {
        return new Promise((resolve) => {
            const animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'animationend',
                WebkitAnimation: 'webkitAnimationEnd',
            };
            let found = false;
            for (const a in animations) {
                if (target.style[a] !== undefined) {
                target.addEventListener(animations[a], resolve, { once: true });
                found = true;
                break;
                }
            }
            if (!found) {
                requestAnimationFrame(resolve);
            }
        });
    };
    const transitionend = (target) => {
        return new Promise((resolve) => {
            const transitions = {
                transition: 'transitionend',
                OTransition: 'oTransitionEnd',
                MozTransition: 'transitionend',
                WebkitTransition: 'webkitTransitionEnd',
            };
            let found = false;
            for (const t in transitions) {
                if (target.style[t] !== undefined) {
                target.addEventListener(transitions[t], resolve, { once: true });
                found = true;
                break;
                }
            }
            if (!found) {
                // fallback si el navegador no suporta o no hi ha transició
                requestAnimationFrame(resolve);
            }
        });
    };
    /** 
    * fusiona un conjunt d'opcions d'usuari amb els valors per defecte del plugin
    * https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    **/
    const extend = function(){
        // Variables
        let extended = {};
        let deep = false;
        let i = 0;
        let length = arguments.length;

        // Check if a deep merge
        if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
            deep = arguments[0];
            i += 1;
        }

        // Merge the object into the extended object
        // let merge = (obj) => {
        let merge = function (obj) {
            for (let prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    // If deep merge and property is an object, merge properties
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = extend(true, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for (; i < length; i += 1) {
            let obj = arguments[i];
            merge(obj);
        }

        return extended;
    }
    const getNewId = (length=16) => {
        // https://codepen.io/cuquet/pen/xbKYELX
        //const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        let text = "";
        for (let i = 0; i < length; ++i)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
        //return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""));
        //return parseInt(Math.ceil(Math.random() * Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""));
        //return Date.now().toString(36) + Math.random().toString(36).substring(2, 12).padStart(10, 0);
    }
    /**
     * Retorna una cadena de selectors CSS que identifica els elements focusables dins del DOM.
     * Aquesta constant s'utilitza per seleccionar tots els elements que poden rebre el focus,
     * com ara en la navegació amb teclat o la gestió de l'accessibilitat.
     *
     * @returns {string} Cadena de selectors CSS per a elements focusables.
     */
    const focusableElString = () =>{
        return '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
    }
    /**
     * Comprova si el navegador suporta una propietat CSS amb un valor específic.
     *
     * @param {string} property - La propietat CSS a verificar.
     * @param {string} value - El valor de la propietat CSS.
     * @returns {boolean} - Retorna `true` si el navegador suporta la propietat i el valor, en cas contrari `false`.
     */
    const cssSupports = (property, value) => {
        return CSS.supports(property, value);
    }
    /**
     * Verifica si un element té una classe específica.
     *
     * @param {HTMLElement} node - L'element DOM a verificar.
     * @param {string} className - El nom de la classe a buscar.
     * @returns {boolean} - Retorna `true` si l'element té la classe, en cas contrari `false`.
     */
    const hasClass = (node, className) => {
        return node.classList.contains(className);
    }
    /**
     * Afegeix una classe a l'element
     *
     * @param {HTMLElement} node - L'element DOM a verificar.
     * @param {string} className - El nom de la classe a buscar o noms separats per espais.
     */
    const addClass = (node, className) => {
        return className.split(' ').forEach((item) => node.classList.add(item));
    }
    /**
     * Elimina una classe a l'element
     *
     * @param {HTMLElement} node - L'element DOM a verificar.
     * @param {string} className - El nom de la classe a buscar o noms separats per espais.
     */
    const removeClass = (node, className) => {
        return className.split(' ').forEach((item) => node.classList.remove(item));
    }
    /**
     * Alterna una classe CSS en un element si es dona una condició
     *
     * @param {HTMLElement} node - L'element DOM a verificar.
     * @param {string} className - El nom de la classe a buscar.
     * @param {boolean} bool - La condició per a afegir o eliminar la classe.
     */
    const toggleClass = (node, className, bool) => {
        return ((bool) ? addClass(node, className) : removeClass(node, className));
    }
    const setAttributes = (el, attrs) => {
        for (const key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }
    const getIndexInArray = (array, el) => {
        return Array.prototype.indexOf.call(array, el);
    }
    const scrollTo = (final, duration, cb, scrollEl) => {
        var element = scrollEl || window;
        var start = element.scrollTop || document.documentElement.scrollTop;
        var currentTime = null;
        if (!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
    
        const animateScroll = function (timestamp) {
            if (!currentTime) currentTime = timestamp;
            let progress = timestamp - currentTime;
            if (progress > duration) progress = duration;
            const val = Math.easeInOutQuad(progress, start, final - start, duration);
            element.scrollTo(0, val);
            if (progress < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                cb && cb();
            }
        };
        window.requestAnimationFrame(animateScroll);
    }
    const moveFocus = (element) => {
        if (!element) { element = document.getElementsByTagName('body')[0]; }
        element.focus();
        if (document.activeElement !== element) {
            element.setAttribute('tabindex', '-1');
            element.focus();
        }
    }
    const osHasReducedMotion = () => {
        if (!window.matchMedia) return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    const getChildrenByClassName = (el, className) =>{
        var { children } = el;
        var childrenByClass = [];
        for (let i = 0; i < children.length; i += 1) {
            if (hasClass(children[i], className)) childrenByClass.push(children[i]);
        }
        return childrenByClass;
    }
    const getScrollbarWidth = () => { 
        // https://stackoverflow.com/questions/13382516/how-to-get-scrollbar-width-using-javascript
        // const outer = document.createElement('div');
        // outer.style.visibility = 'hidden';
        // outer.style.overflow = 'scroll'; // Force scrollbar to appear
        // outer.style.msOverflowStyle = 'scrollbar'; // Needed for WinJS apps
        // document.body.appendChild(outer);
        // const widthNoScroll = outer.offsetWidth;
        // outer.style.overflow = 'hidden';
        // const widthWithScroll = outer.offsetWidth;
        // outer.parentNode.removeChild(outer);
        // return widthNoScroll - widthWithScroll;
        // Cache the value, since it's unlikely to change
        // Create box to measure scrollbar
        const measure = document.createElement('div');
        // Make sure it triggers overflow
        measure.style.width = 100;
        measure.style.height = 100;
        measure.style.overflow = 'scroll';
        measure.style.position = 'absolute';
        measure.style.top = -9999;
        // Add the measure element
        document.body.appendChild(measure);
        // Measure the difference between with/without the scrollbar
        const width = measure.offsetWidth - measure.clientWidth;
        // Remove from DOM
        document.body.removeChild(measure);

        // Update our best guess at the width
        return width;
    }
    return {
        getNewId, focusableElString, extend, cssSupports, hasClass, addClass, removeClass, toggleClass, setAttributes, getIndexInArray, getChildrenByClassName, scrollTo, moveFocus, animationend, transitionend, osHasReducedMotion,getScrollbarWidth,
    };
})();

Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function(t, b, c, d) {
    t /= d;
    return c * t * t * t * t + b;
};

Math.easeOutQuart = function(t, b, c, d) {
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
};

Math.easeInOutQuart = function(t, b, c, d) {
    t /= d / 2;
    if (t < 1)
        return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
};

Math.easeOutElastic = function(t, b, c, d) {
    var s = 1.70158;
    var p = d * 0.7;
    var a = c;
    if (t == 0)
        return b;
    if ((t /= d) == 1)
        return b + c;
    if (!p)
        p = d * .3;
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    }
    else
        s = p / (2 * Math.PI) * Math.asin(c / a);
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
};

