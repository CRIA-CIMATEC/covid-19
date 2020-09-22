// Angular
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
// RxJS
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
// State
import { AppState } from '../../../../../../core/reducers';
// Auth
import { SocialNetworks, AuthService } from '../../../../../../core/auth';
// CRUD
import { LayoutUtilsService } from '../../../../../../core/_base/crud';


@Component({
	selector: 'kt-social-networks',
	templateUrl: './social-networks.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialNetworksComponent implements OnInit {
	// Public properties
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() socialNetworksSubject: BehaviorSubject<SocialNetworks>;
	hasFormErrors = false;
	socialNetworksForm: FormGroup;

	/**
	 * Component constructor
	 *
	 * @param fb: FormBuilser
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
		if (!this.socialNetworksSubject.value) {
			const newSocialNetworks = new SocialNetworks();
			newSocialNetworks.clear();
			this.socialNetworksSubject.next(newSocialNetworks);
		}

		this.createForm();
		this.socialNetworksForm.valueChanges
			.pipe(
				// tslint:disable-next-line:max-line-length
				debounceTime(150), // The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator, we are limiting the amount of server requests emitted to a maximum of one every 150ms
				distinctUntilChanged(), // This operator will eliminate duplicate values
				tap(() => {
					this.updateSocialNetworks();
				})
			)
			.subscribe();
	}

	// Create form
	createForm() {
		this.socialNetworksForm = this.fb.group({
			linkedIn: [this.socialNetworksSubject.value.linkedIn],
			facebook: [this.socialNetworksSubject.value.facebook],
			twitter: [this.socialNetworksSubject.value.twitter],
			instagram: [this.socialNetworksSubject.value.instagram]
		});
	}

	/**
	 * Update social networks
	 */
	updateSocialNetworks() {
		this.loadingSubject.next(true);
		this.hasFormErrors = false;
		const controls = this.socialNetworksForm.controls;
		/** check form */
		if (this.socialNetworksForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			this.loadingSubject.next(false);

			return;
		}

		const newSocialNetworks = new SocialNetworks();
		newSocialNetworks.clear();
		newSocialNetworks.linkedIn = controls.linkedIn.value;
		newSocialNetworks.facebook = controls.facebook.value;
		newSocialNetworks.twitter = controls.twitter.value;
		newSocialNetworks.instagram = controls.instagram.value;
		this.socialNetworksSubject.next(newSocialNetworks);
		this.loadingSubject.next(false);
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
