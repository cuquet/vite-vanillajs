/* -------------------------------- 

File#: _1_repeater
Title: Repeater
Descr: A plugin to repeat groups of elements.
Usage: https://codyhouse.co/ds/components/info/repeater

-------------------------------- */

class Repeater {
    constructor(element) {
        this.element = element;
        this.blockWrapper = this.element.getElementsByClassName('js-repeater__list');
        if (this.blockWrapper.length < 1) return;
        this.blocks = [];
        this.firstBlock = null;
        this.addNew = this.element.getElementsByClassName('js-repeater__add');
        this.cloneClass = this.element.getAttribute('data-repeater-class');
        this.inputName = this.element.getAttribute('data-repeater-input-name');

        this.init();
    }

    init() {
        if (this.addNew.length < 1 || this.blockWrapper.length < 1) return;

        this.updateBlocks();
        this.firstBlock = this.blocks[0].cloneNode(true);

        this.element.addEventListener('click', (event) => {
            const removeButton = event.target.closest('.js-repeater__remove');
            if (removeButton) {
                event.preventDefault();
                this.removeBlock(removeButton);
            }
        });

        this.addNew[0].addEventListener('click', (event) => {
            event.preventDefault();
            this.addBlock();
        });
    }

    updateBlocks() {
        this.blocks = Array.from(this.blockWrapper[0].children).filter((child) =>
            child.classList.contains('js-repeater__item'),
        );
    }

    removeBlock(button) {
        const block = button.closest('.js-repeater__item');
        if (block) {
            const index = this.blocks.indexOf(block);
            block.remove();
            this.updateBlocks();
            for (let i = index; i < this.blocks.length; i++) {
                this.updateAttributes(
                    this.blocks[i],
                    this.inputName.replace('[n]', `[${i + 1}]`),
                    this.inputName.replace('[n]', `[${i}]`),
                );
            }
        }
    }

    addBlock() {
        let newBlock;
        let oldName, newName;

        if (this.blocks.length > 0) {
            newBlock = this.blocks[this.blocks.length - 1].cloneNode(true);
            oldName = this.inputName.replace('[n]', `[${this.blocks.length - 1}]`);
            newName = this.inputName.replace('[n]', `[${this.blocks.length}]`);
        } else {
            newBlock = this.firstBlock.cloneNode(true);
            oldName = this.inputName.replace('[n]', '[0]');
            newName = this.inputName.replace('[n]', '[0]');
        }

        if (this.cloneClass) {
            newBlock.classList.add(this.cloneClass);
        }

        this.updateAttributes(newBlock, oldName, newName, true);
        this.blockWrapper[0].appendChild(newBlock);
        this.element.dispatchEvent(new CustomEvent('itemCloned', { detail: newBlock }));
        this.updateBlocks();
    }

    updateAttributes(block, oldName, newName, resetValues = false) {
        const inputs = block.querySelectorAll(`[name^="${oldName}"]`);
        const labels = block.querySelectorAll(`[for^="${oldName}"]`);
        const ids = block.querySelectorAll(`[id^="${oldName}"]`);

        inputs.forEach((input) => {
            const name = input.getAttribute('name');
            input.setAttribute('name', name.replace(oldName, newName));
            if (resetValues) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = !!input.getAttribute('data-default');
                } else if (input.value) {
                    input.value = input.getAttribute('data-default') || '';
                }
            }
        });

        labels.forEach((label) => {
            const htmlFor = label.getAttribute('for');
            label.setAttribute('for', htmlFor.replace(oldName, newName));
        });

        ids.forEach((idElement) => {
            const id = idElement.getAttribute('id');
            idElement.setAttribute('id', id.replace(oldName, newName));
        });
    }
    static initLazyRepeater() {
        const repeaters = document.querySelectorAll('.js-repeater');
        repeaters.forEach((el) => {
            if (!el.dataset.repeaterInitialized) {
                el.dataset.repeaterInitialized = 'true';
                new Repeater(el);
            }
        });
    }

}

export { Repeater };
export function initRepeater(){ Repeater.initLazyRepeater()}