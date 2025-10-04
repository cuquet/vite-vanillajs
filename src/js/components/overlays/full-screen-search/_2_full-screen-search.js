/* -------------------------------- 

File#: _2_full-screen-search
Title: Full-Screen Search
Descr: A full-screen window displaying a search input element.
Usage: https://codyhouse.co/ds/components/info/full-screen-search
Dependencies: 
    _1_modal-window

NOTE: te una variant dinàmica si s'utilitza la classe "js-modal-search" al botó
juntament amb data-content="#id" del div que conté el formulari de cerca:
   <div id="modal-search" class="hide"></div>
-------------------------------- */


import Modal from '@components/overlays/modal';
document.addEventListener('DOMContentLoaded', () => {
    const fullModalSearchs = Array.from(document.querySelectorAll('.js-modal-search:not(.modal)'));
    fullModalSearchs.forEach(element => {
        new Modal(element, 
            {
                modalClass: 'modal modal--search modal--animate-fade bg bg-opacity-90% flex flex-center padding-md backdrop-blur-10 js-modal',
                contentClass: 'modal__content width-100% max-width-sm max-height-100% overflow-auto',
                contentClassDefault: false,
                headerClass: 'hide',
                footerClass: 'hide',
                animateClass: 'modal--animate-fade',
            }
        );
    });
});

