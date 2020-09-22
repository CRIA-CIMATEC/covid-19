// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ProductRemarkModel } from '../_models/product-remark.model';

export enum ProductRemarkActionTypes {
    ProductRemarkOnServerCreated = '[Edit ProductRemark Dialog] ProductRemark On Server Created',
    ProductRemarkCreated = '[Edit ProductRemark Dialog] ProductRemark Created',
    ProductRemarkUpdated = '[Edit ProductRemark Dialog] ProductRemark Updated',
    ProductRemarkStoreUpdated = '[Edit ProductRemark Dialog] ProductRemark Updated | Only on storage',
    OneProductRemarkDeleted = '[Product Remarks List Page]  One Product Remark Deleted',
    ManyProductRemarksDeleted = '[Product Remarks List Page] Many Product Remarks Deleted',
    ProductRemarksPageRequested = '[Product Remarks List Page] Product Remarks Page Requested',
    ProductRemarksPageLoaded = '[Product Remarks API] Product Remarks Page Loaded',
    ProductRemarksPageCancelled = '[Product Remarks API] Product Remarks Page Cancelled',
    ProductRemarksPageToggleLoading = '[Product Remarks] Product Remarks Page Toggle Loading'
}

export class ProductRemarkOnServerCreated implements Action {
    readonly type = ProductRemarkActionTypes.ProductRemarkOnServerCreated;
    constructor(public payload: { productRemark: ProductRemarkModel }) { }
}

export class ProductRemarkCreated implements Action {
    readonly type = ProductRemarkActionTypes.ProductRemarkCreated;
    constructor(public payload: { productRemark: ProductRemarkModel }) { }
}

export class ProductRemarkUpdated implements Action {
    readonly type = ProductRemarkActionTypes.ProductRemarkUpdated;
    constructor(public payload: {
        partialProductRemark: Update<ProductRemarkModel>, // For State update
        productRemark: ProductRemarkModel // For Server update (through service)
    }) { }
}

export class ProductRemarkStoreUpdated implements Action {
    readonly type = ProductRemarkActionTypes.ProductRemarkStoreUpdated;
    constructor(public payload: {
        productRemark: Update<ProductRemarkModel>, // For State update
    }) { }
}

export class OneProductRemarkDeleted implements Action {
    readonly type = ProductRemarkActionTypes.OneProductRemarkDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyProductRemarksDeleted implements Action {
    readonly type = ProductRemarkActionTypes.ManyProductRemarksDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ProductRemarksPageRequested implements Action {
    readonly type = ProductRemarkActionTypes.ProductRemarksPageRequested;
    constructor(public payload: { page: QueryParamsModel, productId: number }) { }
}

export class ProductRemarksPageLoaded implements Action {
    readonly type = ProductRemarkActionTypes.ProductRemarksPageLoaded;
    constructor(public payload: { productRemarks: ProductRemarkModel[], totalCount: number }) { }
}

export class ProductRemarksPageCancelled implements Action {
    readonly type = ProductRemarkActionTypes.ProductRemarksPageCancelled;
}

export class ProductRemarksPageToggleLoading implements Action {
    readonly type = ProductRemarkActionTypes.ProductRemarksPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type ProductRemarkActions = ProductRemarkOnServerCreated
| ProductRemarkStoreUpdated
| ProductRemarkCreated
| ProductRemarkUpdated
| OneProductRemarkDeleted
| ManyProductRemarksDeleted
| ProductRemarksPageRequested
| ProductRemarksPageLoaded
| ProductRemarksPageCancelled
| ProductRemarksPageToggleLoading;
