// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// Models
import { DataTableItemModel } from '../models/datatable-item.model';

const API_DATATABLE_URL = 'api/cars';

@Injectable()
export class DataTableService {
	/**
	 * Service Constructor
	 *
	 * @param http: HttpClient
	 */
	constructor(private http: HttpClient) { }

	/**
	 * Returns data from fake server
	 */
	getAllItems(): Observable<DataTableItemModel[]> {
		return this.http.get<DataTableItemModel[]>(API_DATATABLE_URL);
	}
}
