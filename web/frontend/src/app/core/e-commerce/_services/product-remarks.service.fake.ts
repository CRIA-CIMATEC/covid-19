// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, of, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models
import { ProductRemarkModel } from '../_models/product-remark.model';

const API_PRODUCTREMARKS_URL = 'api/productRemarks';
// Fake REST API (Mock)
// This code emulates server calls
@Injectable()
export class ProductRemarksService {
	constructor(
		private http: HttpClient,
		private httpUtils: HttpUtilsService
	) {}

	// CREATE =>  POST: add a new product remark to the server
	createProductRemark(productRemark): Observable<ProductRemarkModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ProductRemarkModel>(
			API_PRODUCTREMARKS_URL,
			productRemark,
			{ headers: httpHeaders }
		);
	}

	// READ
	getAllProductRemarksByProductId(
		productId: number
	): Observable<ProductRemarkModel[]> {
		return this.http
			.get<ProductRemarkModel[]>(API_PRODUCTREMARKS_URL)
			.pipe(
				map(productRemarks => {
					return productRemarks.filter(rem => rem.carId === productId);
				})
			);
	}

	getProductRemarkById(productRemarkId: number): Observable<ProductRemarkModel> {
		return this.http.get<ProductRemarkModel>(
			API_PRODUCTREMARKS_URL + `/${productRemarkId}`
		);
	}

	findProductRemarks(
		queryParams: QueryParamsModel,
		productId: number
	): Observable<QueryResultsModel> {
		return this.getAllProductRemarksByProductId(productId).pipe(
			mergeMap(res => {
				const result = this.httpUtils.baseFilter(res, queryParams, []);
				return of(result);
			})
		);
	}

	// UPDATE => PUT: update the product remark
	updateProductRemark(productRemark: ProductRemarkModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTREMARKS_URL, productRemark, {
			headers: httpHeaders
		});
	}

	// DELETE => delete the product remark
	deleteProductRemark(productRemarkId: number): Observable<ProductRemarkModel> {
		const url = `${API_PRODUCTREMARKS_URL}/${productRemarkId}`;
		return this.http.delete<ProductRemarkModel>(url);
	}

	deleteProductRemarks(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteProductRemark(ids[i]));
		}
		return forkJoin(tasks$);
	}
}
