// Angular
import { Component, OnInit, Input } from '@angular/core';
// RxJS
import { BehaviorSubject, Observable } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
// Lodash
import { each, find, remove } from 'lodash';
// State
import { AppState } from '../../../../../../core/reducers';
// Auth
import { Role, selectAllRoles } from '../../../../../../core/auth';

@Component({
	selector: 'kt-user-roles-list',
	templateUrl: './user-roles-list.component.html'
})
export class UserRolesListComponent implements OnInit {
	// Public properties
	// Incoming data
	@Input() loadingSubject = new BehaviorSubject<boolean>(false);
	@Input() rolesSubject: BehaviorSubject<number[]>;

	// Roles
	allUserRoles$: Observable<Role[]>;
	allRoles: Role[] = [];
	unassignedRoles: Role[] = [];
	assignedRoles: Role[] = [];
	roleIdForAdding: number;

	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 */
	constructor(private store: Store<AppState>) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.allUserRoles$ = this.store.pipe(select(selectAllRoles));
		this.allUserRoles$.subscribe((res: Role[]) => {
			each(res, (_role: Role) => {
				this.allRoles.push(_role);
				this.unassignedRoles.push(_role);
			});

			each(this.rolesSubject.value, (roleId: number) => {
				const role = find(this.allRoles, (_role: Role) => {
					return _role.id === roleId;
				});

				if (role) {
					this.assignedRoles.push(role);
					remove(this.unassignedRoles, (el) => el.id === role.id);
				}
			});
		});
	}

	/**
	 * Assign role
	 */
	assignRole() {

		if (this.roleIdForAdding === 0) {
			return;
		}

		const role = find(this.allRoles, (_role: Role) => {
			return _role.id === (+this.roleIdForAdding);
		});

		if (role) {
			this.assignedRoles.push(role);
			remove(this.unassignedRoles, (el) => el.id === role.id);
			this.roleIdForAdding = 0;
			this.updateRoles();
		}
	}

	/**
	 * Unassign role
	 *
	 * @param role: Role
	 */
	unassingRole(role: Role) {
		this.roleIdForAdding = 0;
		this.unassignedRoles.push(role);
		remove(this.assignedRoles, el => el.id === role.id);
		this.updateRoles();
	}

	/**
	 * Update roles
	 */
	updateRoles() {
		const _roles = [];
		each(this.assignedRoles, elem => _roles.push(elem.id));
		this.rolesSubject.next(_roles);
	}
}
