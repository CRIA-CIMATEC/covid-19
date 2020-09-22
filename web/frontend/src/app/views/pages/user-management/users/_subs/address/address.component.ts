// Angular
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, fromEvent } from 'rxjs';
// NGRX
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
// Auth
import { Address, AuthService } from '../../../../../../core/auth';
// State
import { AppState } from '../../../../../../core/reducers';
// Layout
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'kt-address',
	templateUrl: './address.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressComponent implements OnInit {
	// Public properties
	// Incoming data
	@Input() addressSubject: BehaviorSubject<Address>;
	hasFormErrors = false;
	addressForm: FormGroup;

	/**
	 * Component Costructor
	 *
	 * @param fb: FormBuilder
	 * @param auth: AuthService
	 * @param store: Store<AppState>
	 * @param layoutUtilsService: LayoutUtilsService
	 */
	constructor(private fb: FormBuilder,
		           private auth: AuthService,
		           private store: Store<AppState>,
		           private layoutUtilsService: LayoutUtilsService) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (!this.addressSubject.value) {
			const newAddress = new Address();
			newAddress.clear();
			this.addressSubject.next(newAddress);
		}

		this.createForm();
		this.addressForm.valueChanges
			.pipe(
				// tslint:disable-next-line:max-line-length
				debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
				distinctUntilChanged(), // This operator will eliminate duplicate values
				tap(() => {
					this.updateAddress();
				})
			)
			.subscribe();
	}

	/**
	 * Init form
	 */
	createForm() {
		this.addressForm = this.fb.group({
			addressLine: [this.addressSubject.value.addressLine, Validators.required],
			city: [this.addressSubject.value.city, Validators.required],
			state: [this.addressSubject.value.state, Validators.required],
			postCode: [this.addressSubject.value.postCode, Validators.required]
		});
	}

	/**
	 * Update address
	 */
	updateAddress() {
		this.hasFormErrors = false;
		const controls = this.addressForm.controls;
		/** check form */
		if (this.addressForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;

			return;
		}

		const newAddress = new Address();
		newAddress.clear();
		newAddress.addressLine = controls.addressLine.value;
		newAddress.city = controls.city.value;
		newAddress.postCode = controls.postCode.value;
		newAddress.state = controls.state.value;
		this.addressSubject.next(newAddress);
	}

	/**
	 * Close alert
	 *
	 * @param $event: Event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
