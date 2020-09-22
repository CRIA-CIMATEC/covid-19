// Angular
import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';
// RxJS
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
	selector: 'kt-action-natification',
	templateUrl: './action-notification.component.html',
	changeDetection: ChangeDetectionStrategy.Default

})
export class ActionNotificationComponent implements OnInit {
	/**
	 * Component constructor
	 *
	 * @param data: any
	 */
	constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (!this.data.showUndoButton || (this.data.undoButtonDuration >= this.data.duration)) {
			return;
		}

		this.delayForUndoButton(this.data.undoButtonDuration).subscribe(() => {
			this.data.showUndoButton = false;
		});
	}

	/*
	 *	Returns delay
	 *
	 * @param timeToDelay: any
	 */
	delayForUndoButton(timeToDelay) {
		return of('').pipe(delay(timeToDelay));
	}

	/**
	 * Dismiss with Action
	 */
	onDismissWithAction() {
		this.data.snackBar.dismiss();
	}

	/**
	 * Dismiss
	 */
  	public onDismiss() {
		this.data.snackBar.dismiss();
	}
}
