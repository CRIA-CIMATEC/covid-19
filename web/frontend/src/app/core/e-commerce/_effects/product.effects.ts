import { forkJoin } from 'rxjs';
// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel, QueryParamsModel } from '../../_base/crud';
// Services
import { ProductsService } from '../_services/';
// State
import { AppState } from '../../../core/reducers';
// Actions
import {
    ProductActionTypes,
    ProductsPageRequested,
    ProductsPageLoaded,
    ManyProductsDeleted,
    OneProductDeleted,
    ProductsPageToggleLoading,
    ProductsStatusUpdated,
    ProductUpdated,
    ProductCreated,
    ProductOnServerCreated
} from '../_actions/product.actions';
import { defer, Observable, of } from 'rxjs';

@Injectable()
export class ProductEffects {
    showPageLoadingDistpatcher = new ProductsPageToggleLoading({ isLoading: true });
    showLoadingDistpatcher = new ProductsPageToggleLoading({ isLoading: true });
    hideActionLoadingDistpatcher = new ProductsPageToggleLoading({ isLoading: false });

    @Effect()
    loadProductsPage$ = this.actions$
        .pipe(
            ofType<ProductsPageRequested>(ProductActionTypes.ProductsPageRequested),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showPageLoadingDistpatcher);
                const requestToServer = this.productsService.findProducts(payload.page);
                const lastQuery = of(payload.page);
                return forkJoin(requestToServer, lastQuery);
            }),
            map(response => {
                const result: QueryResultsModel = response[0];
                const lastQuery: QueryParamsModel = response[1];
                return new ProductsPageLoaded({
                    products: result.items,
                    totalCount: result.totalCount,
                    page: lastQuery
                });
            }),
        );

    @Effect()
    deleteProduct$ = this.actions$
        .pipe(
            ofType<OneProductDeleted>(ProductActionTypes.OneProductDeleted),
            mergeMap(( { payload } ) => {
                    this.store.dispatch(this.showLoadingDistpatcher);
                    return this.productsService.deleteProduct(payload.id);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    deleteProducts$ = this.actions$
        .pipe(
            ofType<ManyProductsDeleted>(ProductActionTypes.ManyProductsDeleted),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.productsService.deleteProducts(payload.ids);
                }
            ),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateProductsStatus$ = this.actions$
        .pipe(
            ofType<ProductsStatusUpdated>(ProductActionTypes.ProductsStatusUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.productsService.updateStatusForProduct(payload.products, payload.status);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    updateProduct$ = this.actions$
        .pipe(
            ofType<ProductUpdated>(ProductActionTypes.ProductUpdated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.productsService.updateProduct(payload.product);
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    @Effect()
    createProduct$ = this.actions$
        .pipe(
            ofType<ProductOnServerCreated>(ProductActionTypes.ProductOnServerCreated),
            mergeMap(( { payload } ) => {
                this.store.dispatch(this.showLoadingDistpatcher);
                return this.productsService.createProduct(payload.product).pipe(
                    tap(res => {
                        this.store.dispatch(new ProductCreated({ product: res }));
                    })
                );
            }),
            map(() => {
                return this.hideActionLoadingDistpatcher;
            }),
        );

    // @Effect()
    // init$: Observable<Action> = defer(() => {
    //     const queryParams = new QueryParamsModel({});
    //     return of(new ProductsPageRequested({ page: queryParams }));
    // });

    constructor(private actions$: Actions, private productsService: ProductsService, private store: Store<AppState>) { }
}
