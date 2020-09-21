
// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ProductActions, ProductActionTypes } from '../_actions/product.actions';
// CRUD
import { QueryParamsModel } from '../../_base/crud';
// Models
import { ProductModel } from '../_models/product.model';

export interface ProductsState extends EntityState<ProductModel> {
    listLoading: boolean;
    actionsloading: boolean;
    totalCount: number;
    lastQuery: QueryParamsModel;
    lastCreatedProductId: number;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ProductModel> = createEntityAdapter<ProductModel>();

export const initialProductsState: ProductsState = adapter.getInitialState({
    listLoading: false,
    actionsloading: false,
    totalCount: 0,
    lastQuery:  new QueryParamsModel({}),
    lastCreatedProductId: undefined,
    showInitWaitingMessage: true
});

export function productsReducer(state = initialProductsState, action: ProductActions): ProductsState {
    switch  (action.type) {
        case ProductActionTypes.ProductsPageToggleLoading: return {
            ...state, listLoading: action.payload.isLoading, lastCreatedProductId: undefined
        };
        case ProductActionTypes.ProductsActionToggleLoading: return {
            ...state, actionsloading: action.payload.isLoading
        };
        case ProductActionTypes.ProductOnServerCreated: return {
            ...state
        };
        case ProductActionTypes.ProductCreated: return adapter.addOne(action.payload.product, {
             ...state, lastCreatedProductId: action.payload.product.id
        });
        case ProductActionTypes.ProductUpdated: return adapter.updateOne(action.payload.partialProduct, state);
        case ProductActionTypes.ProductsStatusUpdated: {
            const _partialProducts: Update<ProductModel>[] = [];
            for (let i = 0; i < action.payload.products.length; i++) {
                _partialProducts.push({
				    id: action.payload.products[i].id,
				    changes: {
                        status: action.payload.status
                    }
			    });
            }
            return adapter.updateMany(_partialProducts, state);
        }
        case ProductActionTypes.OneProductDeleted: return adapter.removeOne(action.payload.id, state);
        case ProductActionTypes.ManyProductsDeleted: return adapter.removeMany(action.payload.ids, state);
        case ProductActionTypes.ProductsPageCancelled: return {
            ...state, listLoading: false, lastQuery: new QueryParamsModel({})
        };
        case ProductActionTypes.ProductsPageLoaded:
            return adapter.addMany(action.payload.products, {
                ...initialProductsState,
                totalCount: action.payload.totalCount,
                listLoading: false,
                lastQuery: action.payload.page,
                showInitWaitingMessage: false
            });
        default: return state;
    }
}

export const getProductState = createFeatureSelector<ProductModel>('products');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
