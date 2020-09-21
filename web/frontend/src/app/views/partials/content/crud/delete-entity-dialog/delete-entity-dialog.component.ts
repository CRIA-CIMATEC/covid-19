// Angular
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'kt-delete-entity-dialog',
	templateUrl: './delete-entity-dialog.component.html'
})
export class DeleteEntityDialogComponent implements OnInit {
	// Public properties
	viewLoading = false;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<DeleteEntityDialogComponent>
	 * @param data: any
	 */
	constructor(
		public dialogRef: MatDialogRef<DeleteEntityDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
	}

	/**
	 * Close dialog with false result
	 */
	onNoClick(): void {
		this.dialogRef.close();
	}

	/**
	 * Close dialog with true result
	 */
	onYesClick(): void {
		/* Server loading imitation. Remove this */
		this.viewLoading = true;
		setTimeout(() => {
			this.dialogRef.close(true); // Keep only this row
		}, 2500);
	}
}
