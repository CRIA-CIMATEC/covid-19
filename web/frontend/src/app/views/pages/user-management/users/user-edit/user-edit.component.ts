// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJS
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../core/reducers';
// Layout
import { SubheaderService, LayoutConfigService } from '../../../../../core/_base/layout';
import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud';
// Services and Models
import {
	User,
	UserUpdated,
	Address,
	SocialNetworks,
	selectHasUsersInStore,
	selectUserById,
	UserOnServerCreated,
	selectLastCreatedUserId,
	selectUsersActionLoading
} from '../../../../../core/auth';

@Component({
	selector: 'kt-user-edit',
	templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit, OnDestroy {
	// Public properties
	user: User;
	userId$: Observable<number>;
	oldUser: User;
	selectedTab = 0;
	loading$: Observable<boolean>;
	rolesSubject = new BehaviorSubject<number[]>([]);
	addressSubject = new BehaviorSubject<Address>(new Address());
	soicialNetworksSubject = new BehaviorSubject<SocialNetworks>(new SocialNetworks());
	userForm: FormGroup;
	hasFormErrors = false;
	// Private properties
	private subscriptions: Subscription[] = [];

	/**
	 * Component constructor
	 *
	 * @param activatedRoute: ActivatedRoute
	 * @param router: Router
	 * @param userFB: FormBuilder
	 * @param subheaderService: SubheaderService
	 * @param layoutUtilsService: LayoutUtilsService
	 * @param store: Store<AppState>
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(private activatedRoute: ActivatedRoute,
		           private router: Router,
		           private userFB: FormBuilder,
		           private subheaderService: SubheaderService,
		           private layoutUtilsService: LayoutUtilsService,
		           private store: Store<AppState>,
		           private layoutConfigService: LayoutConfigService) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.loading$ = this.store.pipe(select(selectUsersActionLoading));

		const routeSubscription =  this.activatedRoute.params.subscribe(params => {
			const id = params.id;
			if (id && id > 0) {
				this.store.pipe(select(selectUserById(id))).subscribe(res => {
					if (res) {
						this.user = res;
						this.rolesSubject.next(this.user.roles);
						this.addressSubject.next(this.user.address);
						this.soicialNetworksSubject.next(this.user.socialNetworks);
						this.oldUser = Object.assign({}, this.user);
						this.initUser();
					}
				});
			} else {
				this.user = new User();
				this.user.clear();
				this.rolesSubject.next(this.user.roles);
				this.addressSubject.next(this.user.address);
				this.soicialNetworksSubject.next(this.user.socialNetworks);
				this.oldUser = Object.assign({}, this.user);
				this.initUser();
			}
		});
		this.subscriptions.push(routeSubscription);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	/**
	 * Init user
	 */
	initUser() {
		this.createForm();
		if (!this.user.id) {
			this.subheaderService.setTitle('Create user');
			this.subheaderService.setBreadcrumbs([
				{ title: 'User Management', page: `user-management` },
				{ title: 'Users',  page: `user-management/users` },
				{ title: 'Create user', page: `user-management/users/add` }
			]);
			return;
		}
		this.subheaderService.setTitle('Edit user');
		this.subheaderService.setBreadcrumbs([
			{ title: 'User Management', page: `user-management` },
			{ title: 'Users',  page: `user-management/users` },
			{ title: 'Edit user', page: `user-management/users/edit`, queryParams: { id: this.user.id } }
		]);
	}

	/**
	 * Create form
	 */
	createForm() {
		this.userForm = this.userFB.group({
			username: [this.user.username, Validators.required],
			fullname: [this.user.fullname, Validators.required],
			email: [this.user.email, Validators.email],
			phone: [this.user.phone],
			companyName: [this.user.companyName],
			occupation: [this.user.occupation]
		});
	}

	/**
	 * Redirect to list
	 *
	 */
	goBackWithId() {
		const url = `/user-management/users`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Refresh user
	 *
	 * @param isNew: boolean
	 * @param id: number
	 */
	refreshUser(isNew: boolean = false, id = 0) {
		let url = this.router.url;
		if (!isNew) {
			this.router.navigate([url], { relativeTo: this.activatedRoute });
			return;
		}

		url = `/user-management/users/edit/${id}`;
		this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
	}

	/**
	 * Reset
	 */
	reset() {
		this.user = Object.assign({}, this.oldUser);
		this.createForm();
		this.hasFormErrors = false;
		this.userForm.markAsPristine();
  this.userForm.markAsUntouched();
  this.userForm.updateValueAndValidity();
	}

	/**
	 * Save data
	 *
	 * @param withBack: boolean
	 */
	onSumbit(withBack: boolean = false) {
		this.hasFormErrors = false;
		const controls = this.userForm.controls;
		/** check form */
		if (this.userForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			this.selectedTab = 0;
			return;
		}

		const editedUser = this.prepareUser();

		if (editedUser.id > 0) {
			this.updateUser(editedUser, withBack);
			return;
		}

		this.addUser(editedUser, withBack);
	}

	/**
	 * Returns prepared data for save
	 */
	prepareUser(): User {
		const controls = this.userForm.controls;
		const _user = new User();
		_user.clear();
		_user.roles = this.rolesSubject.value;
		_user.address = this.addressSubject.value;
		_user.socialNetworks = this.soicialNetworksSubject.value;
		_user.accessToken = this.user.accessToken;
		_user.refreshToken = this.user.refreshToken;
		_user.pic = this.user.pic;
		_user.id = this.user.id;
		_user.username = controls.username.value;
		_user.email = controls.email.value;
		_user.fullname = controls.fullname.value;
		_user.occupation = controls.occupation.value;
		_user.phone = controls.phone.value;
		_user.companyName = controls.companyName.value;
		_user.password = this.user.password;
		return _user;
	}

	/**
	 * Add User
	 *
	 * @param _user: User
	 * @param withBack: boolean
	 */
	addUser(_user: User, withBack: boolean = false) {
		this.store.dispatch(new UserOnServerCreated({ user: _user }));
		const addSubscription = this.store.pipe(select(selectLastCreatedUserId)).subscribe(newId => {
			const message = `New user successfully has been added.`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 5000, true, true);
			if (newId) {
				if (withBack) {
					this.goBackWithId();
				} else {
					this.refreshUser(true, newId);
				}
			}
		});
		this.subscriptions.push(addSubscription);
	}

	/**
	 * Update user
	 *
	 * @param _user: User
	 * @param withBack: boolean
	 */
	updateUser(_user: User, withBack: boolean = false) {
		// Update User
		// tslint:disable-next-line:prefer-const

		const updatedUser: Update<User> = {
			id: _user.id,
			changes: _user
		};
		this.store.dispatch(new UserUpdated( { partialUser: updatedUser, user: _user }));
		const message = `User successfully has been saved.`;
		this.layoutUtilsService.showActionNotification(message, MessageType.Update, 5000, true, true);
		if (withBack) {
			this.goBackWithId();
		} else {
			this.refreshUser(false);
		}
	}

	/**
	 * Returns component title
	 */
	getComponentTitle() {
		let result = 'Create user';
		if (!this.user || !this.user.id) {
			return result;
		}

		result = `Edit user - ${this.user.fullname}`;
		return result;
	}

	/**
	 * Close Alert
	 *
	 * @param $event: Event
	 */
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}
