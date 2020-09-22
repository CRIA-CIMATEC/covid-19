// Angular
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'kt-fetch-entity-dialog',
	templateUrl: './fetch-entity-dialog.component.html'
})
export class FetchEntityDialogComponent {
	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<FetchEntityDialogComponent>,
	 * @param data: any
	 */
	constructor(
		public dialogRef: MatDialogRef<FetchEntityDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	/**
	 * Close dialog with false result
	 */
	onNoClick(): void {
		this.dialogRef.close();
	}

	/** UI */
	/**
	 * Returns CSS Class Name by status type
	 * @param status: number
	 */
	getItemCssClassByStatus(status: number = 0) {
		switch (status) {
			case 0: return 'success';
			case 1: return 'metal';
			case 2: return 'danger';
			default: return 'success';
		}
	}
}
