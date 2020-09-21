// RxJS
import { debounceTime } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectProductRemarksInStore, selectProductRemarksPageLoading, selectPRShowInitWaitingMessage } from '../_selectors/product-remark.selectors';
export class ProductRemarksDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.store.pipe(
			select(selectProductRemarksInStore),
			debounceTime(600)
		).subscribe((response: QueryResultsModel) => {
			this.entitySubject.next(response.items);
			this.paginatorTotalSubject.next(response.totalCount);
		});

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPRShowInitWaitingMessage)
		);

		this.loading$ = this.store.pipe(select(selectProductRemarksPageLoading));
	}
}
