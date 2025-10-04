
import './components/controls';
import './components/overlays';
// import './components/forms';
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

import { initComponents } from '@modules/initComponents';

document.addEventListener('DOMContentLoaded', () => {
    initComponents(); // inicialitza tot el que hi hagi al DOM inicial
});


