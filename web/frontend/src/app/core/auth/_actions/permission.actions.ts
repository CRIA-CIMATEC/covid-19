// NGRX
import { Action } from '@ngrx/store';
// Models
import { Permission } from '../_models/permission.model';

export enum PermissionActionTypes {
    AllPermissionsRequested = '[Init] All Permissions Requested',
    AllPermissionsLoaded = '[Init] All Permissions Loaded'
}

export class AllPermissionsRequested implements Action {
    readonly type = PermissionActionTypes.AllPermissionsRequested;
}

export class AllPermissionsLoaded implements Action {
    readonly type = PermissionActionTypes.AllPermissionsLoaded;
    constructor(public payload: { permissions: Permission[] }) { }
}

export type PermissionActions = AllPermissionsRequested | AllPermissionsLoaded;
