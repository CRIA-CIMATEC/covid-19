// NGRX
import { Action } from '@ngrx/store';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ProductModel } from '../_models/product.model';
import { Update } from '@ngrx/entity';

export enum ProductActionTypes {
    ProductOnServerCreated = '[Edit Product Component] Product On Server Created',
    ProductCreated = '[Edit Product Component] Product Created',
    ProductUpdated = '[Edit Product Component] Product Updated',
    ProductsStatusUpdated = '[Products List Page] Products Status Updated',
    OneProductDeleted = '[Products List Page] One Product Deleted',
    ManyProductsDeleted = '[Products List Page] Many Selected Products Deleted',
    ProductsPageRequested = '[Products List Page] Products Page Requested',
    ProductsPageLoaded = '[Products API] Products Page Loaded',
    ProductsPageCancelled = '[Products API] Products Page Cancelled',
    ProductsPageToggleLoading = '[Products] Products Page Toggle Loading',
    ProductsActionToggleLoading = '[Products] Products Action Toggle Loading'
}

export class ProductOnServerCreated implements Action {
    readonly type = ProductActionTypes.ProductOnServerCreated;
    constructor(public payload: { product: ProductModel }) { }
}

export class ProductCreated implements Action {
    readonly type = ProductActionTypes.ProductCreated;
    constructor(public payload: { product: ProductModel }) { }
}

export class ProductUpdated implements Action {
    readonly type = ProductActionTypes.ProductUpdated;
    constructor(public payload: {
        partialProduct: Update<ProductModel>, // For State update
        product: ProductModel // For Server update (through service)
    }) { }
}

export class ProductsStatusUpdated implements Action {
    readonly type = ProductActionTypes.ProductsStatusUpdated;
    constructor(public payload: {
        products: ProductModel[],
        status: number
    }) { }
}

export class OneProductDeleted implements Action {
    readonly type = ProductActionTypes.OneProductDeleted;
    constructor(public payload: { id: number }) {}
}

export class ManyProductsDeleted implements Action {
    readonly type = ProductActionTypes.ManyProductsDeleted;
    constructor(public payload: { ids: number[] }) {}
}

export class ProductsPageRequested implements Action {
    readonly type = ProductActionTypes.ProductsPageRequested;
    constructor(public payload: { page: QueryParamsModel }) { }
}

export class ProductsPageLoaded implements Action {
    readonly type = ProductActionTypes.ProductsPageLoaded;
    constructor(public payload: { products: ProductModel[], totalCount: number, page: QueryParamsModel }) { }
}

export class ProductsPageCancelled implements Action {
    readonly type = ProductActionTypes.ProductsPageCancelled;
}

export class ProductsPageToggleLoading implements Action {
    readonly type = ProductActionTypes.ProductsPageToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export class ProductsActionToggleLoading implements Action {
    readonly type = ProductActionTypes.ProductsActionToggleLoading;
    constructor(public payload: { isLoading: boolean }) { }
}

export type ProductActions = ProductOnServerCreated
| ProductCreated
| ProductUpdated
| ProductsStatusUpdated
| OneProductDeleted
| ManyProductsDeleted
| ProductsPageRequested
| ProductsPageLoaded
| ProductsPageCancelled
| ProductsPageToggleLoading
| ProductsActionToggleLoading;
