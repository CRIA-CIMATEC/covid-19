// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { CustomerModel } from '../_models/customer.model';

const API_CUSTOMERS_URL = 'api/customers';

@Injectable()
export class CustomersService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new customer to the server
	createCustomer(customer: CustomerModel): Observable<CustomerModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<CustomerModel>(API_CUSTOMERS_URL, customer, { headers: httpHeaders});
	}

	// READ
	getAllCustomers(): Observable<CustomerModel[]> {
		return this.http.get<CustomerModel[]>(API_CUSTOMERS_URL);
	}

	getCustomerById(customerId: number): Observable<CustomerModel> {
		return this.http.get<CustomerModel>(API_CUSTOMERS_URL + `/${customerId}`);
	}

	// Method from server should return QueryResultsModel(items: any[], totalsCount: number)
	// items => filtered/sorted result
	// Server should return filtered/sorted result
	findCustomers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);

		const url = API_CUSTOMERS_URL + '/find';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params:  httpParams
		});
	}

	// UPDATE => PUT: update the customer on the server
	updateCustomer(customer: CustomerModel): Observable<any> {
		const httpHeader = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_CUSTOMERS_URL, customer, { headers: httpHeader });
	}

	// UPDATE Status
	updateStatusForCustomer(customers: CustomerModel[], status: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			customersForUpdate: customers,
			newStatus: status
		};
		const url = API_CUSTOMERS_URL + '/updateStatus';
		return this.http.put(url, body, { headers: httpHeaders });
	}

	// DELETE => delete the customer from the server
	deleteCustomer(customerId: number): Observable<CustomerModel> {
		const url = `${API_CUSTOMERS_URL}/${customerId}`;
		return this.http.delete<CustomerModel>(url);
	}

	deleteCustomers(ids: number[] = []): Observable<any> {
		const url = API_CUSTOMERS_URL + '/deleteCustomers';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { customerIdsForDelete: ids };
		return this.http.put<QueryResultsModel>(url, body, { headers: httpHeaders} );
	}
}
