import { selectProductsInitWaitingMessage } from './../_selectors/product.selectors';
// RxJS
import { delay, distinctUntilChanged } from 'rxjs/operators';
// CRUD
import { QueryResultsModel, BaseDataSource } from '../../_base/crud';
// State
import { Store, select } from '@ngrx/store';
import { AppState } from '../../reducers';
// Selectors
import { selectProductsInStore, selectProductsPageLoading } from '../_selectors/product.selectors';

export class ProductsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();
		this.loading$ = this.store.pipe(
			select(selectProductsPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectProductsInitWaitingMessage)
		);

		this.store.pipe(
			select(selectProductsInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
