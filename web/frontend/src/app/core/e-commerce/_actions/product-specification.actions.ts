// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ProductSpecificationModel } from '../_models/product-specification.model';

export enum ProductSpecificationActionTypes {
    ProductSpecificationOnServerCreated = '[Edit ProductSpecification Dialog] Product Specification On Server Created',
    ProductSpecificationCreated = '[Edit ProductSpecification Dialog] Product Specification Created',
    ProductSpecificationUpdated = '[Edit SpecificationSpecification Dialog] Product Specification Updated',
    OneProductSpecificationDeleted = '[Product Specification List Page]  One Product Specification Deleted',
    ManyProductSpecificationsDeleted = '[Product Specifications List Page] Many Product Specifications Deleted',
    ProductSpecificationsPageRequested = '[Product Specifications List Page] Product Specifications Page Requested',
    ProductSpecificationsPageLoaded = '[Product Specifications API] Product Specifications Page Loaded',
    ProductSpecificationsPageCancelled = '[Product Specifications API] Product Specifications Page Cancelled',
    ProductSpecificationsPageToggleLoading = '[Product Specifications] Product Specifications Page Toggle Loading'
}

export class ProductSpecificationOnServerCreated implements Action {
    readonly type = ProductSpecificationActionTypes.ProductSpecificationOnServerCreated;
    constructor(public payload: { productSpecification: ProductSpecificationModel }) { }
}

export class ProductSpecificationCreated implements Action {
    readonly type = ProductSpecificationActionTypes.ProductSpecificationCreated;
    constructor(public payload: { productSpecification: ProductSpecificationModel }) { }
}

export class ProductSpecificationUpdated implements Action {
    readonly type = ProductSpecificationActionTypes.ProductSpecificationUpdated;
    constructor(public payload: {
        partialProductSpecification: Update<ProductSpecificationModel>, // For State update
        productSpecification: ProductSpecificationModel // For Server update (through service)
    }) { }
}

export class OneProductSpecificationDeleted implements Action {
    readonly type = ProductSpecificationActionTypes.OneProductSpecificationDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyProductSpecificationsDeleted implements Action {
    readonly type = ProductSpecificationActionTypes.ManyProductSpecificationsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ProductSpecificationsPageRequested implements Action {
    readonly type = ProductSpecificationActionTypes.ProductSpecificationsPageRequested;
    constructor(public payload: { page: QueryParamsModel, productId: number }) { }
}

export class ProductSpecificationsPageLoaded implements Action {
    readonly type = ProductSpecificationActionTypes.ProductSpecificationsPageLoaded;
    constructor(public payload: { productSpecifications: ProductSpecificationModel[], totalCount: number }) { }
}

export class ProductSpecificationsPageCancelled implements Action {
    readonly type = ProductSpecificationActionTypes.ProductSpecificationsPageCancelled;
}

export class ProductSpecificationsPageToggleLoading implements Action {
    readonly type = ProductSpecificationActionTypes.ProductSpecificationsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type ProductSpecificationActions = ProductSpecificationOnServerCreated
| ProductSpecificationCreated
| ProductSpecificationUpdated
| OneProductSpecificationDeleted
| ManyProductSpecificationsDeleted
| ProductSpecificationsPageRequested
| ProductSpecificationsPageLoaded
| ProductSpecificationsPageCancelled
| ProductSpecificationsPageToggleLoading;
