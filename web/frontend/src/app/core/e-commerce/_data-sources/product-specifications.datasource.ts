// RxJS
import { debounceTime } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectProductSpecificationsInStore, selectProductSpecificationsPageLoading, selectPSShowInitWaitingMessage } from '../_selectors/product-specification.selectors';
export class ProductSpecificationsDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.store.pipe(
			select(selectProductSpecificationsInStore),
			debounceTime(600)
		).subscribe((response: QueryResultsModel) => {
			this.entitySubject.next(response.items);
			this.paginatorTotalSubject.next(response.totalCount);
		});

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPSShowInitWaitingMessage)
		);

		this.loading$ = this.store.pipe(select(selectProductSpecificationsPageLoading));
	}
}
