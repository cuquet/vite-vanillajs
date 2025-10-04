/* --------------------------------  
File#: _2_password-strengh
Title: Password Strength Indicator
Descr: Password requirements and strength indicator.
Usage: https://codyhouse.co/ds/components/info/password-strength-indicator

Dependencies:
    _1_password Password Visibility Control https://codyhouse.co/ds/components/app/password-visibility-control
    zxcvbn - Password Strength Estimator https://github.com/dropbox/zxcvbn
-------------------------------- */

import { tools as Util } from '@modules';
import { PasswordVisibility } from './_1_password';
//import('https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js');

export class PasswordStrength extends PasswordVisibility {
    constructor(options) {
        super(options);
        this.options = Util.extend(PasswordStrength.defaults, options);
        //this.element = this.options.element;
        this.input = this.element.querySelector('.js-password-strength__input') || false;
        this.reqs = this.element.getElementsByClassName('js-password-strength__req');
        this.strengthSection = this.element.getElementsByClassName(
            'js-password-strength__meter-wrapper',
        );
        this.strengthValue = this.element.getElementsByClassName('js-password-strength__value');
        this.strengthMeter = this.element.getElementsByClassName('js-password-strength__meter');
        this.passwordInteracted = false;
        this.reqMetClass = 'password-strength__req--met';
        this.reqNoMetClass = 'password-strength__req--no-met';

        this.init();
    }

    static defaults = {
        strengthLevel: (value) => {
            // eslint-disable-next-line no-undef
            return zxcvbn(value).score >= 3; // score can be between 0 and 4 (score 3 -> Good)
        },
    };

    init() {
        this.checkStrength = true;
        const checkStrengthAttr = this.element.getAttribute('data-check-strength');
        if (checkStrengthAttr && checkStrengthAttr === 'off') {
            this.checkStrength = false;
        }

        this.strengthLabels = ['Bad', 'Weak', 'Good', 'Strong'];
        const strengthLabelsAttr = this.element.getAttribute('data-strength-labels');
        if (strengthLabelsAttr) {
            const labels = strengthLabelsAttr.split(',');
            if (labels.length >= 4) {
                this.strengthLabels = labels.map((label) => label.trim());
            }
        }

        if (this.input) {
            this.updateStrength();
            this.updateRequirements();
            this.initEvents();
        }
    }

    updateStrength() {
        if (this.strengthSection.length > 0) {
            Util.toggleClass(this.strengthSection[0], 'hide', this.input.value.length === 0);
        }
    }

    updateRequirements() {
        import('https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js')
        .then(() => {
            // eslint-disable-next-line no-undef
            if (this.checkStrength && zxcvbn) {
                // eslint-disable-next-line no-undef
                const result = zxcvbn(this.input.value);
                if (this.strengthValue.length > 0) {
                    this.strengthValue[0].textContent =
                        result.score >= 1
                            ? this.strengthLabels[result.score - 1]
                            : this.strengthLabels[0];
                }
                if (this.strengthMeter.length > 0) {
                    let score = result.score;
                    if (score === 0 && this.input.value.length > 0) {
                        score = 1;
                    }
                    this.strengthMeter[0].firstElementChild.style.width = `${score / 0.04}%`;
                    const meterClasses = this.strengthMeter[0].className
                        .split(' ')
                        .filter((cls) => !cls.startsWith('password-strength__meter--fill-'));
                    this.strengthMeter[0].className = meterClasses.join(' ').trim();
                    Util.addClass(
                        this.strengthMeter[0],
                        `password-strength__meter--fill-${score >= 1 ? score : 1}`,
                    );
                }
            }
        })
        .catch((error) => {
            console.error('Error loading zxcvbn:', error);
        });
        
        /*if (this.checkStrength && zxcvbn) {
            // eslint-disable-next-line no-undef
            const result = zxcvbn(this.input.value);
            if (this.strengthValue.length > 0) {
                this.strengthValue[0].textContent =
                    result.score >= 1
                        ? this.strengthLabels[result.score - 1]
                        : this.strengthLabels[0];
            }
            if (this.strengthMeter.length > 0) {
                let score = result.score;
                if (score === 0 && this.input.value.length > 0) {
                    score = 1;
                }
                this.strengthMeter[0].firstElementChild.style.width = `${score / 0.04}%`;
                const meterClasses = this.strengthMeter[0].className
                    .split(' ')
                    .filter((cls) => !cls.startsWith('password-strength__meter--fill-'));
                this.strengthMeter[0].className = meterClasses.join(' ').trim();
                Util.addClass(
                    this.strengthMeter[0],
                    `password-strength__meter--fill-${score >= 1 ? score : 1}`,
                );
            }
        }*/
    }

    checkRequirements() {
        for (let i = 0; i < this.reqs.length; i += 1) {
            const req = this.reqs[i].getAttribute('data-password-req');
            const isMet = this.options[req]
                ? this.options[req](this.input.value)
                : this.defaultCheck(this.input.value, req);
            Util.toggleClass(this.reqs[i], this.reqMetClass, isMet);
            if (this.passwordInteracted) {
                Util.toggleClass(this.reqs[i], this.reqNoMetClass, !isMet);
            }
        }
    }

    defaultCheck(value, req) {
        switch (true) {
            case req.trim() === 'uppercase':
                return value.toLowerCase() !== value;
            case req.trim() === 'lowercase':
                return value.toUpperCase() !== value;
            case req.trim() === 'number':
                return /\d/.test(value);
            case req.startsWith('length:'): {
                const [, min, max] = req.split(':').map(Number);
                return value.length >= min && (!max || value.length <= max);
            }
            case req.trim() === 'special':
                // eslint-disable-next-line no-useless-escape
                return /[!@#$%^&*=~`'"|/\?\_\-\,\;\.\:\(\)\{\}\[\]\+\>\<\\]/.test(value);
            case req.trim() === 'letter':
                return /[a-zA-Z]/.test(value);
            default:
                return false;
        }
    }

    initEvents() {
        this.input.addEventListener('input', () => {
            this.updateStrength();
            this.updateRequirements();
            this.checkRequirements();
        });

        this.input.addEventListener('blur', () => {
            this.passwordInteracted = true;
            for (let i = 0; i < this.reqs.length; i++) {
                if (!Util.hasClass(this.reqs[i], this.reqMetClass)) {
                    Util.addClass(this.reqs[i], this.reqNoMetClass);
                }
            }
        });
    }
}

export function initPasswordStrength(context = document) {
    const elements = context.querySelectorAll('.js-password-strength');
    elements.forEach(el => {
        if (!el.dataset.pwdsInitialized) {
            new PasswordStrength({element: el});
            el.dataset.pwdsInitialized = 'true';
        }
    });
}
