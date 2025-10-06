// src/js/main.js
import './components/navigation';
import './components/plugins';
import './components/table';

import { FlexiHeader } from './components/navigation';
new FlexiHeader();

import { setupCounter } from '@components/counter.js';
if (document.querySelector('#counter')) {
    setupCounter(document.querySelector('#counter'));
}

import { initComponents } from '@modules/initComponents';

document.addEventListener('DOMContentLoaded', () => {
    initComponents();
});

