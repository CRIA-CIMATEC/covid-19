import { Pipe } from '@angular/core';
// Angular
import { Component, OnInit, ElementRef, ViewChild, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, delay } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject, Subscription, Observable, of } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { AppState } from '../../../../../../../../core/reducers';
// CRUD
import { QueryParamsModel, LayoutUtilsService, MessageType } from '../../../../../../../../core/_base/crud';
// Services and models
import {
	ProductSpecificationModel,
	ProductSpecificationsDataSource,
	ProductSpecificationsPageRequested,
	OneProductSpecificationDeleted,
	ManyProductSpecificationsDeleted,
	ProductSpecificationUpdated,
	ProductSpecificationOnServerCreated,
	selectLastCreatedProductSpecificationId
} from '../../../../../../../../core/e-commerce';
// Components
import { SpecificationEditDialogComponent } from '../specification-edit/specification-edit-dialog.component';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-specifications-list',
	templateUrl: './specifications-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecificationsListComponent implements OnInit, OnDestroy {
	// Public properties

	// Incoming data
	@Input() productId$: Observable<number>;
	productId: number;

	// Table fields
	dataSource: ProductSpecificationsDataSource;
	displayedColumns = ['select', '_specificationName', 'value', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild(MatSort, {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<ProductSpecificationModel>(true, []);
	productSpecificationsResult: ProductSpecificationModel[] = [];

	// Private properties
	private componentSubscriptions: Subscription;

	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState></AppState>
	 * @param dialog: MatDialog
	 * @param layoutUtilsService: LayoutUtilsService
	 */
	constructor(private store: Store<AppState>,
		           public dialog: MatDialog,
		           private layoutUtilsService: LayoutUtilsService) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadSpecsList();
				})
			)
			.subscribe();

		// Filtration, bind to searchInput
		fromEvent(this.searchInput.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadSpecsList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new ProductSpecificationsDataSource(this.store);
		this.dataSource.entitySubject.subscribe(res => this.productSpecificationsResult = res);
		this.productId$.subscribe(res => {
			if (!res) {
				return;
			}

			this.productId = res;
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadSpecsList();
			}); // Remove this line, just loading imitation
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	/**
	 * Load Specs List
	 */
	loadSpecsList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new ProductSpecificationsPageRequested({
			page: queryParams,
			productId: this.productId
		}));
	}

	/**
	 * Retirns object for filter
	 */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter._specificationName = searchText;
		filter.value = searchText;
		return filter;
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productSpecificationsResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productSpecificationsResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/**
	 * Delete spec
	 *
	 * @param _item: ProductSpecificationModel
	 */
	deleteSpec(_item: ProductSpecificationModel) {
		const _title = 'Specification Delete';
		const _description = 'Are you sure to permanently delete this specification?';
		const _waitDesciption = 'Specification is deleting...';
		const _deleteMessage = `Specification has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneProductSpecificationDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.loadSpecsList();
		});
	}

	/**
	 * Delete specs
	 */
	deleteSpecs() {
		const _title = 'Specifications Delete';
		const _description = 'Are you sure to permanently delete selected specifications?';
		const _waitDesciption = 'Specifications are deleting...';
		const _deleteMessage = 'Selected specifications have been deleted';

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			const length = this.selection.selected.length;
			const idsForDeletion: number[] = [];
			for (let i = 0; i < length; i++) {
				idsForDeletion.push(this.selection.selected[i].id);
			}
			this.store.dispatch(new ManyProductSpecificationsDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}


	/**
	 * Fetch selected specs
	 */
	fetchSpecs() {
		const messages = [];
		this.selection.selected.forEach(elem => {
			messages.push({
				text: `${elem._specificationName}: ${elem.value}`, id: elem.id
			});
		});
		this.layoutUtilsService.fetchElements(messages);
	}


	/**
	 * Open add spec dialog and save data
	 */
	addSpec() {
		// tslint:disable-next-line:prefer-const
		let newSpec = new ProductSpecificationModel();
		newSpec.clear(this.productId);
		const dialogRef = this.dialog.open(SpecificationEditDialogComponent, {
			data: {
				specId: undefined,
				value: '',
				isNew: true
			},
			width: '450px'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.isUpdated) {
				newSpec._specificationName = res._specificationName;
				newSpec.specId = res.specId;
				newSpec.value = res.value;
				this.store.dispatch(new ProductSpecificationOnServerCreated({ productSpecification: newSpec }));
				this.componentSubscriptions = this.store.pipe(select(selectLastCreatedProductSpecificationId)).subscribe(result => {
					if (!result) {
						return;
					}

					const saveMessage = `Specification has been created`;
					this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Create, 10000, true, true);
				});
			}
		});
	}

	/**
	 * Edit add spec dialog ans save data
	 *
	 * @param item: ProductSpecificationModel
	 */
	editSpec(item: ProductSpecificationModel) {
		const _item = Object.assign({}, item);
		const dialogRef = this.dialog.open(SpecificationEditDialogComponent, {
			data: {
				specId: _item.specId,
				value: _item.value,
				isNew: false
			},
			width: '450px'
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.isUpdated) {
				_item._specificationName = res._specificationName;
				_item.specId = res.specId;
				_item.value = res.value;

				const updateProductSpecification: Update<ProductSpecificationModel> = {
					id: _item.id,
					changes: _item
				};
				this.store.dispatch(new ProductSpecificationUpdated({
					partialProductSpecification: updateProductSpecification,
					productSpecification: _item
				}));
				const saveMessage = `Specification has been updated`;
				this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, true);
			}
		});
	}
}
