// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { defer, Observable, of } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
// Services
import { AuthService } from '../_services';
// Actions
import {
    AllPermissionsLoaded,
    AllPermissionsRequested,
    PermissionActionTypes
} from '../_actions/permission.actions';
// Models
import { Permission } from '../_models/permission.model';

@Injectable()
export class PermissionEffects {
    @Effect()
    loadAllPermissions$ = this.actions$
        .pipe(
            ofType<AllPermissionsRequested>(PermissionActionTypes.AllPermissionsRequested),
            mergeMap(() => this.auth.getAllPermissions()),
            map((result: Permission[]) => {
                return  new AllPermissionsLoaded({
                    permissions: result
                });
            })
          );

    @Effect()
    init$: Observable<Action> = defer(() => {
        return of(new AllPermissionsRequested());
    });

    constructor(private actions$: Actions, private auth: AuthService) { }
}
