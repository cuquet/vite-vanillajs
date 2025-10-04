
import './components/controls';
import './components/overlays';
import './components/forms';
import './components/navigation';
import './components/plugins';
import './components/table';

import { FlexiHeader } from './components/navigation';
// Inicialitza la classe
new FlexiHeader();

import { setupCounter } from '@components/counter.js';
if (document.querySelector('#counter')) {
    setupCounter(document.querySelector('#counter'));
}

import { LanguagePicker } from '@components/forms/picker-language';
const languagePickerElements = Array.from(document.getElementsByClassName('js-language-picker'));
if (languagePickerElements.length > 0) {
    languagePickerElements.forEach((element) => {
        new LanguagePicker(element, {
            onGetLangUrl: (option) => {
                return `#${option.value}`;
            },
        });
    });
}

import { initComponents } from '@modules/initComponents';

document.addEventListener('DOMContentLoaded', () => {
    initComponents(); // inicialitza tot el que hi hagi al DOM inicial
});


