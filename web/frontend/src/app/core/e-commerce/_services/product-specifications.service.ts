// Angular
import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
// RxJS
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models and Consts
import { ProductSpecificationModel } from '../_models/product-specification.model';
import { SPECIFICATIONS_DICTIONARY } from '../_consts/specification.dictionary';

const API_PRODUCTSPECS_URL = 'api/productSpecs';
// Real REST API
@Injectable()
export class ProductSpecificationsService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new product specification to the server
	createProductSpec(productSpec): Observable<ProductSpecificationModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ProductSpecificationModel>(API_PRODUCTSPECS_URL, productSpec, { headers: httpHeaders });
	}

	// READ
	// Server should return filtered specs by productId
	getAllProductSpecsByProductId(productId: number): Observable<ProductSpecificationModel[]> {
		const url = API_PRODUCTSPECS_URL + '?productId=' + productId;
		return this.http.get<ProductSpecificationModel[]>(url);
	}

	getProductSpecById(productSpecId: number): Observable<ProductSpecificationModel> {
		return this.http.get<ProductSpecificationModel>(API_PRODUCTSPECS_URL + `/${productSpecId}`);
	}

	// Server should return sorted/filtered specs and merge with items from state
	findProductSpecs(queryParams: QueryParamsModel, productId: number): Observable<QueryResultsModel> {
		const url = API_PRODUCTSPECS_URL + '/find?productId=' + productId;
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			state: queryParams
		};
		return this.http.post<QueryResultsModel>(url, body, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product specification on the server
	updateProductSpec(productSpec: ProductSpecificationModel): Observable<any> {
		return this.http.put(API_PRODUCTSPECS_URL, productSpec, { headers: this.httpUtils.getHTTPHeaders() });
	}

	// DELETE => delete the product specification from the server
	deleteProductSpec(productSpecId: number): Observable<any> {
		const url = `${API_PRODUCTSPECS_URL}/${productSpecId}`;
		return this.http.delete<ProductSpecificationModel>(url);
	}

	deleteProductSpecifications(ids: number[] = []): Observable<any> {
		const url = API_PRODUCTSPECS_URL + '/deleteProductSpecifications';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { productSpecificationIdsForDelete: ids };
		return this.http.put<any>(url, body, { headers: httpHeaders} );
	}

	getSpecs(): string[] {
		return SPECIFICATIONS_DICTIONARY;
	}
}
