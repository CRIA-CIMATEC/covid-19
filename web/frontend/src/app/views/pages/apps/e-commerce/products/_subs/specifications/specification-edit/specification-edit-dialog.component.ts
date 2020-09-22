import { ChangeDetectorRef } from '@angular/core';
// Angular
import {Component, Inject, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// RxJS
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
// Services and Models
import { SPECIFICATIONS_DICTIONARY } from '../../../../../../../../core/e-commerce';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-specification-edit-dialog',
	templateUrl: './specification-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecificationEditDialogComponent implements OnInit {
	// Public properties
	specificationEditForm: FormGroup;
	viewLoading = true;
	loadingAfterSubmit = false;
	specificationsDictionary: string[] = SPECIFICATIONS_DICTIONARY;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<SpecificationEditDialogComponent>
	 * @param data: any
	 */
	constructor(
		public dialogRef: MatDialogRef<SpecificationEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.initSpecificationForm();
		/* Server loading imitation. Remove this on real code */
		of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line
			this.viewLoading = false; // Remove this line
			this.cdr.detectChanges(); // Remove this line
		}); // Remove this line
	}

	/**
	 * Form initalization
	 * Default params, validators
	 */
	initSpecificationForm() {
		const specName: string = !this.data.specId ? '' : this.specificationsDictionary[this.data.specId];
		const specText: string = this.data.value;
		this.specificationEditForm = this.fb.group({
			name: [specName, [ Validators.required]],
			text: [specText, Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(100)
			])]
		});
	}

	/**
	 * Close dialog
	 */
	onNoClick(): void {
		this.dialogRef.close({ isUpdated : false });
	}

	/**
	 * Save specification
	 */
	save() {
		const controls = this.specificationEditForm.controls;
		/** check form */
		if (this.specificationEditForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		const specId = this.getSpecificationIndexByName(controls.name.value);
		const specName = controls.name.value;
		const specValue = controls.text.value;
		/* Server loading imitation. Remove this on real code */
		of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line
			this.viewLoading = false;
			this.closeDialog(specId, specName, specValue);
		}); // Remove this line
	}

	/**
	 * Close dialog
	 *
	 * @param specId: any
	 */
	closeDialog(specId, specName, specValue) {
		this.dialogRef.close({
			isUpdated: true,
			value: specValue,
			specId,
			_specificationName: specName
		});
	}

	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.specificationEditForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	private getSpecificationIndexByName(name: string): number {
		return this.specificationsDictionary.findIndex(el => el === name);
	}
}
