import { mergeMap, tap } from 'rxjs/operators';
// RxJS
import { delay, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectCustomersInStore, selectCustomersPageLoading, selectCustomersShowInitWaitingMessage } from '../_selectors/customer.selectors';

export class CustomersDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectCustomersPageLoading),
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCustomersShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCustomersInStore),
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
