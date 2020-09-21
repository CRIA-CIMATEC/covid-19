// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectUsersInStore, selectUsersPageLoading, selectUsersShowInitWaitingMessage } from '../_selectors/user.selectors';


export class UsersDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectUsersPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectUsersShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectUsersInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
