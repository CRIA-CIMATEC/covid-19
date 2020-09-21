// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// Lodash
import { each } from 'lodash';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { ProductsState } from '../_reducers/product.reducers';
import { ProductModel } from '../_models/product.model';

export const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectProductById = (productId: number) => createSelector(
    selectProductsState,
    productsState => productsState.entities[productId]
);

export const selectProductsPageLoading = createSelector(
    selectProductsState,
    productsState => productsState.listLoading
);

export const selectProductsActionLoading = createSelector(
    selectProductsState,
    customersState => customersState.actionsloading
);

export const selectProductsPageLastQuery = createSelector(
    selectProductsState,
    productsState => productsState.lastQuery
);

export const selectLastCreatedProductId = createSelector(
    selectProductsState,
    productsState => productsState.lastCreatedProductId
);

export const selectProductsInitWaitingMessage = createSelector(
    selectProductsState,
    productsState => productsState.showInitWaitingMessage
);

export const selectProductsInStore = createSelector(
    selectProductsState,
    productsState => {
        const items: ProductModel[] = [];
        each(productsState.entities, element => {
            items.push(element);
        });
        const httpExtension = new HttpExtenstionsModel();
        const result: ProductModel[] = httpExtension.sortArray(items, productsState.lastQuery.sortField, productsState.lastQuery.sortOrder);
        return new QueryResultsModel(result, productsState.totalCount, '');
    }
);

export const selectHasProductsInStore = createSelector(
    selectProductsInStore,
    queryResult => {
        if (!queryResult.totalCount) {
            return false;
        }

        return true;
    }
);
