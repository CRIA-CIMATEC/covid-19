// Angular
import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
	selector: 'kt-portlet-body',
	template: `
		<ng-content></ng-content>`
})
export class PortletBodyComponent implements OnInit {
	// Public properties
	@HostBinding('class') classList = 'kt-portlet__body';
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
