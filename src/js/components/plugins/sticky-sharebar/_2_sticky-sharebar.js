/* -------------------------------- 

File#: _2_sticky-sharebar
Title: Sticky social sharing bar.
Descr: 
Usage: https://codyhouse.co/ds/components/info/sticky-sharebar
Dependencies
    https://codyhouse.co/ds/components/app/social-sharing

-------------------------------- */
import { tools as Util } from '@modules';

class StickySharebar {
    constructor(element) {
        this.element = element;
        this.contentTarget = document.getElementsByClassName('js-sticky-sharebar-target');
        this.contentTargetOut = document.getElementsByClassName('js-sticky-sharebar-target-out');
        this.showClass = 'sticky-sharebar--on-target';
        this.threshold = '50%';
        this.init();
    }

    init() {
        // Inicialitza l'observador per mostrar la barra
        this.initShowObserver();
        // Inicialitza l'observador per amagar la barra
        this.initHideObserver();
    }

    initShowObserver() {
        if (this.contentTarget.length < 1) {
            this.showSharebar = true;
            Util.addClass(this.element, this.showClass);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                this.showSharebar = entries[0].isIntersecting;
                this.toggleSharebar();
            },
            {
                rootMargin: `0px 0px -${this.threshold} 0px`,
            },
        );

        observer.observe(this.contentTarget[0]);
    }

    initHideObserver() {
        if (this.contentTargetOut.length < 1) return;

        const observer = new IntersectionObserver((entries) => {
            this.hideSharebar = entries[0].isIntersecting;
            this.toggleSharebar();
        });

        observer.observe(this.contentTargetOut[0]);
    }

    toggleSharebar() {
        Util.toggleClass(this.element, this.showClass, this.showSharebar && !this.hideSharebar);
    }
}

// Inicialitza totes les barres de compartir
document.addEventListener('DOMContentLoaded', () => {
    const sharebars = Array.from(document.getElementsByClassName('js-sticky-sharebar'));
    if (sharebars.length > 0) {
        sharebars.forEach((sharebar) => {
            new StickySharebar(sharebar);
        });
    }
});

// Classe per gestionar la compartició social
class SocialShare {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.element.addEventListener('click', (event) => {
            event.preventDefault();
            const socialType = this.element.getAttribute('data-social');
            const url = this.buildUrl(socialType);
            if (socialType === 'mail') {
                window.location.href = url;
            } else {
                window.open(url, `${socialType}-share-dialog`, 'width=626,height=436');
            }
        });
    }

    buildUrl(socialType) {
        const params = this.getParams(socialType);
        let url = this.element.getAttribute('href') + '?';
        params.forEach((param) => {
            let value = this.element.getAttribute(`data-${param}`);
            if (param === 'hashtags') {
                value = encodeURI(value.replace(/#| /g, ''));
            }
            if (value) {
                url += `${param}=${encodeURIComponent(value)}&`;
            }
        });
        if (socialType === 'linkedin') {
            url = 'mini=true&' + url;
        }
        return url;
    }

    getParams(socialType) {
        switch (socialType) {
            case 'twitter':
                return ['text', 'hashtags'];
            case 'facebook':
            case 'linkedin':
                return ['url'];
            case 'pinterest':
                return ['url', 'media', 'description'];
            case 'mail':
                return ['subject', 'body'];
            default:
                return [];
        }
    }
}

// Inicialitza tots els botons de compartir social
document.addEventListener('DOMContentLoaded', () => {
    const socialButtons = Array.from(document.getElementsByClassName('js-social-share'));
    socialButtons.forEach((element) => { new SocialShare(element) });
});

export { SocialShare, StickySharebar };
