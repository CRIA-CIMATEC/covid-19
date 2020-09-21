// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ProductRemarksState } from '../_reducers/product-remark.reducers';
import { ProductRemarkModel } from '../_models/product-remark.model';

export const selectProductRemarksState = createFeatureSelector<ProductRemarksState>('productRemarks');

export const selectProductRemarkById = (productRemarkId: number) => createSelector(
    selectProductRemarksState,
    productRemarksState => productRemarksState.entities[productRemarkId]
);

export const selectProductRemarksPageLoading = createSelector(
    selectProductRemarksState,
    productRemarksState => productRemarksState.loading
);

export const selectCurrentProductIdInStoreForProductRemarks = createSelector(
    selectProductRemarksState,
    productRemarksState => productRemarksState.productId
);

export const selectLastCreatedProductRemarkId = createSelector(
    selectProductRemarksState,
    productRemarksState => productRemarksState.lastCreatedProductRemarkId
);

export const selectPRShowInitWaitingMessage = createSelector(
    selectProductRemarksState,
    productRemarksState => productRemarksState.showInitWaitingMessage
);

export const selectProductRemarksInStore = createSelector(
    selectProductRemarksState,
    productRemarksState => {
        const items: ProductRemarkModel[] = [];
        each(productRemarksState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: ProductRemarkModel[] = httpExtension.sortArray(items, productRemarksState.lastQuery.sortField, productRemarksState.lastQuery.sortOrder);

        return new QueryResultsModel(items, productRemarksState.totalCount, '');
    }
);
