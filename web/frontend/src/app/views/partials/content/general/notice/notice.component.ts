// Angular
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'kt-notice',
	templateUrl: './notice.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoticeComponent implements OnInit {
	// Public properties
	@Input() classes: any = '';
	@Input() icon: any;

	/**
	 * Component constructor
	 */
	constructor() {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (this.icon) {
			this.classes += ' kt-alert--icon';
		}
	}
}
