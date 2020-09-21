// Angular
import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
	selector: 'kt-portlet-footer',
	template: `
		<ng-content></ng-content>`
})
export class PortletFooterComponent implements OnInit {
	// Public properties
	@HostBinding('class') classList = 'kt-portlet__foot';
	@Input() class: string;

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (this.class) {
			this.classList += ' ' + this.class;
		}
	}
}
