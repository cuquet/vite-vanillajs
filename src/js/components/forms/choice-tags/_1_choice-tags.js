/* -------------------------------- 

File#: _1_choice-tags
Title: Choice tags
Descr: Custom, "tag-looking" radio/checkbox buttons
Usage: https://codyhouse.co/ds/components/info/choice-tags

-------------------------------- */

export class ChoiceTags {
    constructor(element) {
        this.element = element;
        this.labels = this.element.getElementsByClassName('js-choice-tag');
        this.inputs = this.getInputs;
        this.isRadio = this.inputs[0].type === 'radio';
        this.checkedClass = 'choice-tag--checked';
        this.initChoiceTags();
        this.initEvents();
    }

    get getInputs() {
        let inputs = [];
        for (let i = 0; i < this.labels.length; i++) {
            inputs.push(this.labels[i].getElementsByTagName('input')[0]);
        }
        return inputs;
    }

    initChoiceTags() {
        for (let i = 0; i < this.inputs.length; i++) {
            this.labels[i].classList.toggle(this.checkedClass, this.inputs[i].checked);
        }
    }

    initEvents() {
        this.element.addEventListener('change', (event) => {
            let index = Array.prototype.indexOf.call(this.inputs, event.target);
            if (index < 0) return;
            this.labels[index].classList.toggle(this.checkedClass, event.target.checked);
            if (this.isRadio && event.target.checked) {
                this.uncheckOtherTags(index);
            }
        });
    }

    uncheckOtherTags(checkedIndex) {
        for (let i = 0; i < this.labels.length; i++) {
            if (i !== checkedIndex) {
                this.labels[i].classList.remove(this.checkedClass);
            }
        }
    }
}

export function initChoiceTags(context = document) {
    const elements = context.querySelectorAll('.js-choice-tag');
    elements.forEach(el => {
        if (!el.dataset.choiceTagsInitialized) {
            new ChoiceTags(el);
            el.dataset.choiceTagsInitialized = 'true';
        }
    });
}
