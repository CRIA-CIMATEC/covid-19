// Angular
import { Component, OnInit, ElementRef, ViewChild, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap, delay } from 'rxjs/operators';
import { fromEvent, merge, BehaviorSubject, Subscription, Observable, of } from 'rxjs';
// NGRX
import { Store, select } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// State
import { AppState } from '../../../../../../../../core/reducers';
// CRUD
import { TypesUtilsService, QueryParamsModel, LayoutUtilsService, MessageType } from '../../../../../../../../core/_base/crud';
// Services and Models
import {
	ProductRemarkModel,
	ProductRemarksDataSource,
	ProductRemarksPageRequested,
	ProductRemarkUpdated,
	ProductRemarkStoreUpdated,
	OneProductRemarkDeleted,
	ManyProductRemarksDeleted,
	selectLastCreatedProductRemarkId,
	ProductRemarkOnServerCreated
} from '../../../../../../../../core/e-commerce';

// Table with EDIT item in new page
// ARTICLE for table with sort/filter/paginator
// https://blog.angular-university.io/angular-material-data-table/
// https://v5.material.angular.io/components/table/overview
// https://v5.material.angular.io/components/sort/overview
// https://v5.material.angular.io/components/table/overview#sorting
// https://www.youtube.com/watch?v=NSt9CI3BXv4
@Component({
	// tslint:disable-next-line:component-selector
	selector: 'kt-remarks-list',
	templateUrl: './remarks-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemarksListComponent implements OnInit, OnDestroy {
	// Public properties
	// Incoming data
	@Input() productId$: Observable<number>;
	productId: number;
	// Table fields
	dataSource: ProductRemarksDataSource;
	displayedColumns = ['select', 'id', 'text', 'type', 'dueDate', 'actions'];
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
	@ViewChild(MatSort, {static: true}) sort: MatSort;
	// Filter fields
	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;
	// Selection
	selection = new SelectionModel<ProductRemarkModel>(true, []);
	productRemarksResult: ProductRemarkModel[] = [];
	// Add and Edit
	isSwitchedToEditMode = false;
	loadingAfterSubmit = false;
	formGroup: FormGroup;
	remarkForEdit: ProductRemarkModel;
	remarkForAdd: ProductRemarkModel;
	// Private properties
	private componentSubscriptions: Subscription;

	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 * @param fb: FormBuilder
	 * @param dialog: MatDialog
	 * @param typesUtilsService: TypeUtilsService
	 * @param layoutUtilsService: LayoutUtilsService
	 */
	constructor(private store: Store<AppState>,
		           private fb: FormBuilder,
		           public dialog: MatDialog,
		           public typesUtilsService: TypesUtilsService,
		           private layoutUtilsService: LayoutUtilsService) {}

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
					this.loadRemarksList();
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
					this.loadRemarksList();
				})
			)
			.subscribe();

		// Init DataSource
		this.dataSource = new ProductRemarksDataSource(this.store);
		this.dataSource.entitySubject.subscribe(res => this.productRemarksResult = res);
		this.productId$.subscribe(res => {
			if (!res) {
				return;
			}

			this.productId = res;
			of(undefined).pipe(delay(1000)).subscribe(() => { // Remove this line, just loading imitation
				this.loadRemarksList();
			}); // Remove this line, just loading imitation
			this.createFormGroup();
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
	 * Loading Remarks list
	 */
	loadRemarksList() {
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);
		// Call request from server
		this.store.dispatch(new ProductRemarksPageRequested({
			page: queryParams,
			productId: this.productId
		}));
	}

	/**
	 * Create Reactive Form
	 * @param _item: remark
	 */
	createFormGroup(_item = null) {
		// 'edit' prefix - for item editing
		// 'add' prefix - for item creation
		this.formGroup = this.fb.group({
			editText: ['', Validators.compose([Validators.required])],
			editType: ['0'],
			editDueDate: [this.typesUtilsService.getDateFromString(), Validators.compose([Validators.required])],
			newText: ['', Validators.compose([Validators.required])],
			newType: ['0'],
			newDueDate: [this.typesUtilsService.getDateFromString(), Validators.compose([Validators.required])]
		});
		this.clearAddForm();
		this.clearEditForm();
	}

	// ADD REMARK FUNCTIONS: clearAddForm | checkAddForm | addRemarkButtonOnClick | cancelAddButtonOnClick | saveNewRemark
	clearAddForm() {
		const controls = this.formGroup.controls;
		controls.newText.setValue('');
		controls.newText.markAsPristine();
		controls.newText.markAsUntouched();
		controls.newType.setValue('0');
		controls.newType.markAsPristine();
		controls.newType.markAsUntouched();
		controls.newDueDate.setValue(this.typesUtilsService.getDateFromString());
		controls.newDueDate.markAsPristine();
		controls.newDueDate.markAsUntouched();

		this.remarkForAdd = new ProductRemarkModel();
		this.remarkForAdd.clear(this.productId);
		this.remarkForAdd.dueDate = this.typesUtilsService.getDateStringFromDate();
		this.remarkForAdd._isEditMode = false;
	}

	/**
	 * Check if Add Form is Valid
	 */
	checkAddForm() {
		const controls = this.formGroup.controls;
		if (controls.newText.invalid || controls.newType.invalid || controls.newDueDate.invalid) {
			controls.newText.markAsTouched();
			// controls['newType'].markAsTouched();
			controls.newDueDate.markAsTouched();
			return false;
		}

		return true;
	}

	/**
	 * Open Remark Add Form
	 */
	addRemarkButtonOnClick() {
		this.clearAddForm();
		this.remarkForAdd._isEditMode = true;
		this.isSwitchedToEditMode = true;
	}

	/**
	 * Close Remark Add Form
	 */
	cancelAddButtonOnClick() {
		this.remarkForAdd._isEditMode = false;
		this.isSwitchedToEditMode = false;
	}

	/**
	 *  Create new remark
	 */
	saveNewRemark() {
		if (!this.checkAddForm()) {
			return;
		}

		const controls = this.formGroup.controls;
		this.loadingAfterSubmit = false;
		this.remarkForAdd._isEditMode = false;
		this.remarkForAdd.text = controls.newText.value;
		this.remarkForAdd.type = +controls.newType.value;
		const _date = new Date(controls.newDueDate.value);
		this.remarkForAdd.dueDate = this.typesUtilsService.getDateStringFromDate(_date);
		this.remarkForAdd._updatedDate = this.typesUtilsService.getDateStringFromDate();
		this.remarkForAdd._createdDate = this.remarkForEdit._updatedDate;
		this.remarkForAdd._userId = 1; // Admin TODO: Get from user servics
		this.store.dispatch(new ProductRemarkOnServerCreated({ productRemark: this.remarkForAdd }));
		this.componentSubscriptions = this.store.pipe(
				select(selectLastCreatedProductRemarkId)
			).subscribe(res => {
				if (!res) {
					return;
				}

				const _saveMessage = `Remark has been created`;
				this.isSwitchedToEditMode = false;
				this.layoutUtilsService.showActionNotification(_saveMessage, MessageType.Create, 10000, true, true);
				this.clearAddForm();
			});
	}

	// EDIT REMARK FUNCTIONS: clearEditForm | checkEditForm | editRemarkButtonOnClick | cancelEditButtonOnClick |
	clearEditForm() {
		const controls = this.formGroup.controls;
		controls.editText.setValue('');
		// controls['editText'].markAsPristine();
		// controls['editText'].markAsUntouched();
		controls.editType.setValue('0');
		// controls['editType'].markAsPristine();
		// controls['editType'].markAsUntouched();
		controls.editDueDate.setValue(this.typesUtilsService.getDateFromString());
		// controls['editDueDate'].markAsPristine();
		// controls['editDueDate'].markAsUntouched();

		this.remarkForEdit = new ProductRemarkModel();
		this.remarkForEdit.clear(this.productId);
		this.remarkForEdit.dueDate = this.typesUtilsService.getDateStringFromDate();
		this.remarkForEdit._isEditMode = false;
	}

	/**
	 * Check is Edit Form valid
	 */
	checkEditForm() {
		const controls = this.formGroup.controls;
		if (controls.editText.invalid || controls.editType.invalid || controls.editDueDate.invalid) {
			// controls['editText'].markAsTouched();
			// controls['editType'].markAsTouched();
			// controls['editDueDate'].markAsTouched();
			return false;
		}

		return true;
	}

	/**
	 * Update remark
	 *
	 * @param _item: ProductRemarkModel
	 */
	editRemarkButtonOnClick(_item: ProductRemarkModel) {
		const controls = this.formGroup.controls;
		controls.editText.setValue(_item.text);
		controls.editType.setValue(_item.type.toString());
		controls.editDueDate.setValue(this.typesUtilsService.getDateFromString(_item.dueDate));
		const updateProductReamrk: Update<ProductRemarkModel> = {
			id: _item.id,
			changes: {
				_isEditMode: true
			}
		};
		this.store.dispatch(new ProductRemarkStoreUpdated({ productRemark: updateProductReamrk }));
		this.isSwitchedToEditMode = true;
	}

	/**
	 * Cancel remark
	 *
	 * @param _item: ProductRemarkModel
	 */
	cancelEditButtonOnClick(_item: ProductRemarkModel) {
		const updateProductReamrk: Update<ProductRemarkModel> = {
			id: _item.id,
			changes: {
				_isEditMode: false
			}
		};
		this.store.dispatch(new ProductRemarkStoreUpdated({ productRemark: updateProductReamrk }));
		this.isSwitchedToEditMode = false;
	}

	/**
	 * Save remark
	 *
	 * @param _item: ProductRemarkModel
	 */
	saveUpdatedRemark(_item: ProductRemarkModel) {
		if (!this.checkEditForm()) {
			return;
		}

		this.loadingAfterSubmit = true;
		const controls = this.formGroup.controls;
		this.loadingAfterSubmit = false;
		const objectForUpdate = new ProductRemarkModel();
		objectForUpdate.id = _item.id;
		objectForUpdate.carId = _item.carId;
		objectForUpdate._isEditMode = _item._isEditMode;
		objectForUpdate.text = controls.editText.value;
		objectForUpdate.type = +controls.editType.value;
		const _date = new Date(controls.editDueDate.value);
		objectForUpdate.dueDate = this.typesUtilsService.getDateStringFromDate(_date);
		objectForUpdate._updatedDate = this.typesUtilsService.getDateStringFromDate();
		objectForUpdate._isEditMode = false;
		const updateProductReamrk: Update<ProductRemarkModel> = {
			id: _item.id,
			changes: objectForUpdate
		};

		this.store.dispatch(new ProductRemarkUpdated({
			partialProductRemark: updateProductReamrk,
			productRemark: objectForUpdate
		}));
		const saveMessage = `Remark has been updated`;
		this.isSwitchedToEditMode = false;
		this.layoutUtilsService.showActionNotification(saveMessage, MessageType.Update, 10000, true, true);
	}

	/**
	 * Returns object for filtration
	 */
	filterConfiguration(): any {
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;

		filter.text = searchText;
		return filter;
	}

	/**
	 * Check all rows are selected
	 */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productRemarksResult.length;
		return numSelected === numRows;
	}

	/**
	 * Selects all rows if they are not all selected; otherwise clear selection
	 */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productRemarksResult.forEach(row => this.selection.select(row));
		}
	}

	/** ACTIONS */
	/**
	 * Delete remark
	 *
	 * @param _item: ProductRemarkModel
	 */
	deleteRemark(_item: ProductRemarkModel) {
		const _title = 'Remark Delete';
		const _description = 'Are you sure to permanently delete this remark?';
		const _waitDesciption = 'Remark is deleting...';
		const _deleteMessage = `Remark has been deleted`;

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.store.dispatch(new OneProductRemarkDeleted({ id: _item.id }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		});
	}

	/**
	 * Delete selected remarks
	 */
	deleteRemarks() {
		const _title = 'Remarks Delete';
		const _description = 'Are you sure to permanently delete selected remarks?';
		const _waitDesciption = 'Remarks are deleting...';
		const _deleteMessage = 'Selected remarks have been deleted';

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
			this.store.dispatch(new ManyProductRemarksDeleted({ ids: idsForDeletion }));
			this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
			this.selection.clear();
		});
	}

	/**
	 * Fetch selected remarks
	 */
	fetchRemarks() {
		const messages = [];
		this.selection.selected.forEach(elem => { messages.push({ text: `${elem.text}`, id: elem.id }); });
		this.layoutUtilsService.fetchElements(messages);
	}

	/* UI **/
	/**
	 * Returns type in string
	 *
	 * @param _remark: ProductRemarkModel
	 */
	getTypeStr(_remark: ProductRemarkModel): string {
		switch (_remark.type) {
			case 0: return 'Info';
			case 1: return 'Note';
			case 2: return 'Reminder';
			default: return '';
		}
	}
}
