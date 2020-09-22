// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ProductRemarkActions, ProductRemarkActionTypes } from '../_actions/product-remark.actions';
// Models
import { ProductRemarkModel } from '../_models/product-remark.model';
import { QueryParamsModel } from '../../_base/crud';

export interface ProductRemarksState extends EntityState<ProductRemarkModel> {
    productId: number;
    loading: boolean;
    totalCount: number;
    lastCreatedProductRemarkId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ProductRemarkModel> = createEntityAdapter<ProductRemarkModel>();

export const initialProductRemarksState: ProductRemarksState = adapter.getInitialState({
    loading: false,
    totalCount: 0,
    productId: undefined,
    lastCreatedProductRemarkId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function productRemarksReducer(state = initialProductRemarksState, action: ProductRemarkActions): ProductRemarksState {
    switch  (action.type) {
        case ProductRemarkActionTypes.ProductRemarksPageToggleLoading:
            return {
                ...state,
                loading: action.payload.isLoading,
                lastCreatedProductRemarkId: undefined
            };
        case ProductRemarkActionTypes.ProductRemarkOnServerCreated:
            return {...state, loading: true};
        case ProductRemarkActionTypes.ProductRemarkCreated:
            return adapter.addOne(action.payload.productRemark, {
                ...state,
                lastCreatedProductRemarkId: action.payload.productRemark.id
            });
        case ProductRemarkActionTypes.ProductRemarkUpdated:
            return adapter.updateOne(action.payload.partialProductRemark, state);
        case ProductRemarkActionTypes.ProductRemarkStoreUpdated:
            return adapter.updateOne(action.payload.productRemark, state);
        case ProductRemarkActionTypes.OneProductRemarkDeleted:
            return adapter.removeOne(action.payload.id, state);
        case ProductRemarkActionTypes.ManyProductRemarksDeleted:
            return adapter.removeMany(action.payload.ids, state);
        case ProductRemarkActionTypes.ProductRemarksPageCancelled:
            return { ...state, totalCount: 0, loading: false, productId: undefined, lastQuery: new QueryParamsModel({}) };
        case ProductRemarkActionTypes.ProductRemarksPageRequested:
            return { ...state, totalCount: 0, loading: true, productId: action.payload.productId, lastQuery: action.payload.page };
        case ProductRemarkActionTypes.ProductRemarksPageLoaded:
            return adapter.addMany(action.payload.productRemarks, {
                ...initialProductRemarksState,
                totalCount: action.payload.totalCount,
                loading: false,
                productId: state.productId,
                lastQuery: state.lastQuery,
                showInitWaitingMessage: false
            });
        default:
            return state;
    }
}

export const getProductRemarlState = createFeatureSelector<ProductRemarkModel>('productRemarks');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
