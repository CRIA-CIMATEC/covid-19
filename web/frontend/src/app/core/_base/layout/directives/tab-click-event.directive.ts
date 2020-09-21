import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

/**
 * Listen Tab click
 */
@Directive({
	selector: '[ktTabClickEvent]'
})
export class TabClickEventDirective {
	/**
	 * Directive Constructor
	 * @param el: ElementRef
	 * @param render: Renderer2
	 */
	constructor(private el: ElementRef, private render: Renderer2) { }

	/**
	 * A directive handler the tab click event for active tab
	 * @param target
	 */
	@HostListener('click', ['$event.target'])
	onClick(target: HTMLElement) {
		// remove previous active tab
		const parent = target.closest('[role="tablist"]');
		const activeLink = parent.querySelector('[role="tab"].active');
		if (activeLink) {
			this.render.removeClass(activeLink, 'active');
		}
		// set active tab
		const link = target.closest('[role="tab"]');
		if (link) {
			this.render.addClass(link, 'active');
		}
	}
}
