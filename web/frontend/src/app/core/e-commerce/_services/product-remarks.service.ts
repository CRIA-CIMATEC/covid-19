// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
import { ProductRemarkModel } from '../_models/product-remark.model';

const API_PRODUCTREMARKS_URL = 'api/productRemarks';
// Real REST API
@Injectable()
export class ProductRemarksService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// CREATE =>  POST: add a new product remark to the server
	createProductRemark(productRemark): Observable<ProductRemarkModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ProductRemarkModel>(API_PRODUCTREMARKS_URL, productRemark, { headers: httpHeaders });
	}

	// READ
	// Server should return filtered remarks by productId
	getAllProductRemarksByProductId(productId: number): Observable<ProductRemarkModel[]> {
		const url = API_PRODUCTREMARKS_URL + '?productId=' + productId;
		return this.http.get<ProductRemarkModel[]>(url);
	}

	getProductRemarkById(productRemarkId: number): Observable<ProductRemarkModel> {
		return this.http.get<ProductRemarkModel>(API_PRODUCTREMARKS_URL + `/${productRemarkId}`);
	}

	// Server should return sorted/filtered remarks and merge with items from state
	findProductRemarks(queryParams: QueryParamsModel, productId: number): Observable<QueryResultsModel> {
		const url = API_PRODUCTREMARKS_URL + '/find?productId=' + productId;
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = {
			query: queryParams
		};
		return this.http.post<QueryResultsModel>(url, body, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product remark
	updateProductRemark(productRemark: ProductRemarkModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTREMARKS_URL, productRemark, { headers: httpHeaders });
	}

	// DELETE => delete the product remark
	deleteProductRemark(productRemarkId: number): Observable<ProductRemarkModel> {
		const url = `${API_PRODUCTREMARKS_URL}/${productRemarkId}`;
		return this.http.delete<ProductRemarkModel>(url);
	}

	deleteProductRemarks(ids: number[] = []): Observable<any> {
		const url = API_PRODUCTREMARKS_URL + '/deleteProductRemarks';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const body = { productRemarkIdsForDelete: ids };
		return this.http.put<any>(url, body, { headers: httpHeaders} );
	}
}
