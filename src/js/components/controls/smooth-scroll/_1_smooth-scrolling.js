
/* -------------------------------- 

File#: _1_smooth-scrolling
Title: Smooth Scrolling
Descr: Replace the default browser behaviour (jump) with a smooth scrolling transition.
Usage: https://codyhouse.co/ds/components/info/smooth-scrolling

-------------------------------- */

import { tools as Util } from '@modules';

class SmoothScroll {
	constructor(element) {
		if (!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
		this.element = element;
		this.scrollDuration = parseInt(this.element.getAttribute('data-duration')) || 300;
		this.dataElementY = this.element.getAttribute('data-scrollable-element-y') || this.element.getAttribute('data-scrollable-element') || this.element.getAttribute('data-element');
		this.scrollElementY = this.dataElementY ? document.querySelector(this.dataElementY) : window;
		this.dataElementX = this.element.getAttribute('data-scrollable-element-x');
		this.scrollElementX = this.dataElementY ? document.querySelector(this.dataElementX) : window;
		this.init();
	}

	init() {
		this.element.addEventListener('click', (event) => {
			event.preventDefault();
			const targetId = event.target.closest('.js-smooth-scroll').getAttribute('href').replace('#', '');
			const target = document.getElementById(targetId);
			const targetTabIndex = target.getAttribute('tabindex');
			let windowScrollTop = this.scrollElementY.scrollTop || document.documentElement.scrollTop;

			if (!this.dataElementY) windowScrollTop = window.scrollY || document.documentElement.scrollTop;

			const scrollElementY = this.dataElementY ? this.scrollElementY : false;
			const fixedHeight = this.getFixedElementHeight();

			Util.scrollTo(target.getBoundingClientRect().top + windowScrollTop - fixedHeight, this.scrollDuration, () => {
				this.scrollHorizontally(target, fixedHeight);
				Util.moveFocus(target);
				history.pushState(false, false, `#${targetId}`);
				this.resetTarget(target, targetTabIndex);
			}, scrollElementY);
		});
	}

	scrollHorizontally(target, delta) {
		const scrollEl = this.dataElementX ? this.scrollElementX : false;
		const windowScrollLeft = this.scrollElementX ? this.scrollElementX.scrollLeft : document.documentElement.scrollLeft;
		const final = target.getBoundingClientRect().left + windowScrollLeft - delta;
		const duration = this.scrollDuration;
		const element = scrollEl || window;
		let start = element.scrollLeft || document.documentElement.scrollLeft;
		let currentTime = null;

		if (!scrollEl) start = window.scrollX || document.documentElement.scrollLeft;
		if (Math.abs(start - final) < 5) return;

		const animateScroll = (timestamp) => {
			if (!currentTime) currentTime = timestamp;
			let progress = timestamp - currentTime;
			if (progress > duration) progress = duration;
			const val = Math.easeInOutQuad(progress, start, final - start, duration);
			element.scrollTo({ left: val });
			if (progress < duration) {
				window.requestAnimationFrame(animateScroll);
			}
		};

		window.requestAnimationFrame(animateScroll);
	}

	resetTarget(target, tabindex) {
		if (parseInt(target.getAttribute('tabindex')) < 0) {
			target.style.outline = 'none';
			!tabindex && target.removeAttribute('tabindex');
		}
	}

	getFixedElementHeight() {
		const scrollElementY = this.dataElementY ? this.scrollElementY : document.documentElement;
		let fixedElementDelta = parseInt(getComputedStyle(scrollElementY).getPropertyValue('scroll-padding'));
		if (isNaN(fixedElementDelta)) {
			fixedElementDelta = 0;
			const fixedElement = document.querySelector(this.element.getAttribute('data-fixed-element'));
			if (fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
		}
		return fixedElementDelta;
	}
}
export default SmoothScroll;

// Initialize the Smooth Scroll objects
document.addEventListener('DOMContentLoaded', () => {
	const smoothScrollLinks = Array.from(document.getElementsByClassName('js-smooth-scroll'));
	if (smoothScrollLinks.length > 0 && !Util.cssSupports('scroll-behavior', 'smooth') && window.requestAnimationFrame) {
		smoothScrollLinks.forEach((element) => {
			new SmoothScroll(element);
		});
	}
});
