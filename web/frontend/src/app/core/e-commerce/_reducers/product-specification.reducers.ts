// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter, Update } from '@ngrx/entity';
// Actions
import { ProductSpecificationActions, ProductSpecificationActionTypes } from '../_actions/product-specification.actions';
// Models
import { ProductSpecificationModel } from '../_models/product-specification.model';
import { QueryParamsModel } from '../../_base/crud';

export interface ProductSpecificationsState extends EntityState<ProductSpecificationModel> {
    productId: number;
    loading: boolean;
    totalCount: number;
    lastCreatedProductSpecificationId: number;
    lastQuery: QueryParamsModel;
    showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ProductSpecificationModel> = createEntityAdapter<ProductSpecificationModel>();

export const initialProductSpecificationsState: ProductSpecificationsState = adapter.getInitialState({
    loading: false,
    totalCount: 0,
    productId: undefined,
    lastCreatedProductSpecificationId: undefined,
    lastQuery: new QueryParamsModel({}),
    showInitWaitingMessage: true
});

export function productSpecificationsReducer(state = initialProductSpecificationsState, action: ProductSpecificationActions): ProductSpecificationsState {
    switch  (action.type) {
        case ProductSpecificationActionTypes.ProductSpecificationsPageToggleLoading:
            return {
                ...state,
                loading: action.payload.isLoading,
                lastCreatedProductSpecificationId: undefined
            };
        case ProductSpecificationActionTypes.ProductSpecificationOnServerCreated:
            return {...state, loading: true};
        case ProductSpecificationActionTypes.ProductSpecificationCreated:
            return adapter.addOne(action.payload.productSpecification, {
                ...state,
                lastCreatedProductSpecificationId: action.payload.productSpecification.id
            });
        case ProductSpecificationActionTypes.ProductSpecificationUpdated:
            return adapter.updateOne(action.payload.partialProductSpecification, state);
        case ProductSpecificationActionTypes.OneProductSpecificationDeleted:
            return adapter.removeOne(action.payload.id, state);
        case ProductSpecificationActionTypes.ManyProductSpecificationsDeleted:
            return adapter.removeMany(action.payload.ids, state);
        case ProductSpecificationActionTypes.ProductSpecificationsPageCancelled:
            return { ...state, totalCount: 0, loading: false, productId: undefined, lastQuery: new QueryParamsModel({})  };
        case ProductSpecificationActionTypes.ProductSpecificationsPageRequested:
            return { ...state, totalCount: 0, loading: true, productId: action.payload.productId, lastQuery: action.payload.page };
        case ProductSpecificationActionTypes.ProductSpecificationsPageLoaded:
            return adapter.addMany(action.payload.productSpecifications, {
                ...initialProductSpecificationsState,
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

export const getProductRemarlState = createFeatureSelector<ProductSpecificationModel>('productSpecifications');

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapter.getSelectors();
