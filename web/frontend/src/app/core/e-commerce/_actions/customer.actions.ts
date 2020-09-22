// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { CustomerModel } from '../_models/customer.model';

export enum CustomerActionTypes {
    CustomerOnServerCreated = '[Edit Customer Dialog] Customer On Server Created',
    CustomerCreated = '[Edit Customer Dialog] Customer Created',
    CustomerUpdated = '[Edit Customer Dialog] Customer Updated',
    CustomersStatusUpdated = '[Customer List Page] Customers Status Updated',
    OneCustomerDeleted = '[Customers List Page] One Customer Deleted',
    ManyCustomersDeleted = '[Customers List Page] Many Customer Deleted',
    CustomersPageRequested = '[Customers List Page] Customers Page Requested',
    CustomersPageLoaded = '[Customers API] Customers Page Loaded',
    CustomersPageCancelled = '[Customers API] Customers Page Cancelled',
    CustomersPageToggleLoading = '[Customers] Customers Page Toggle Loading',
    CustomerActionToggleLoading = '[Customers] Customers Action Toggle Loading'
}

export class CustomerOnServerCreated implements Action {
    readonly type = CustomerActionTypes.CustomerOnServerCreated;
    constructor(public payload: { customer: CustomerModel }) { }
}

export class CustomerCreated implements Action {
    readonly type = CustomerActionTypes.CustomerCreated;
    constructor(public payload: { customer: CustomerModel }) { }
}

export class CustomerUpdated implements Action {
    readonly type = CustomerActionTypes.CustomerUpdated;
    constructor(public payload: {
        partialCustomer: Update<CustomerModel>, // For State update
        customer: CustomerModel // For Server update (through service)
    }) { }
}

export class CustomersStatusUpdated implements Action {
    readonly type = CustomerActionTypes.CustomersStatusUpdated;
    constructor(public payload: {
        customers: CustomerModel[],
        status: number
    }) { }
}

export class OneCustomerDeleted implements Action {
    readonly type = CustomerActionTypes.OneCustomerDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyCustomersDeleted implements Action {
    readonly type = CustomerActionTypes.ManyCustomersDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class CustomersPageRequested implements Action {
    readonly type = CustomerActionTypes.CustomersPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class CustomersPageLoaded implements Action {
    readonly type = CustomerActionTypes.CustomersPageLoaded;
    constructor(public payload: { customers: CustomerModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class CustomersPageCancelled implements Action {
    readonly type = CustomerActionTypes.CustomersPageCancelled;
}

export class CustomersPageToggleLoading implements Action {
    readonly type = CustomerActionTypes.CustomersPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class CustomerActionToggleLoading implements Action {
    readonly type = CustomerActionTypes.CustomerActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type CustomerActions = CustomerOnServerCreated
| CustomerCreated
| CustomerUpdated
| CustomersStatusUpdated
| OneCustomerDeleted
| ManyCustomersDeleted
| CustomersPageRequested
| CustomersPageLoaded
| CustomersPageCancelled
| CustomersPageToggleLoading
| CustomerActionToggleLoading;
