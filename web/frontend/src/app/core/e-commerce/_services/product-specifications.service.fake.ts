// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
// CRUD
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../_base/crud';
// Models and Consts
import { ProductSpecificationModel } from '../_models/product-specification.model';
import { SPECIFICATIONS_DICTIONARY } from '../_consts/specification.dictionary';

const API_PRODUCTSPECS_URL = 'api/productSpecs';

// Fake REST API (Mock)
// This code emulates server calls
@Injectable()
export class ProductSpecificationsService {
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) {}

	// CREATE =>  POST: add a new product specification to the server
	createProductSpec(productSpec): Observable<ProductSpecificationModel> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<ProductSpecificationModel>(
			API_PRODUCTSPECS_URL,
			productSpec,
			{ headers: httpHeaders }
		);
	}

	// READ
	getAllProductSpecsByProductId(
		productId: number
	): Observable<ProductSpecificationModel[]> {
		const prodSpecs = this.http
			.get<ProductSpecificationModel[]>(API_PRODUCTSPECS_URL)
			.pipe(
				map(productSpecifications =>
					productSpecifications.filter(ps => ps.carId === productId)
				)
			);

		return prodSpecs.pipe(
			map(res => {
				const _prodSpecs = res;
				const result: ProductSpecificationModel[] = [];
				_prodSpecs.forEach(item => {
					const _item = Object.assign({}, item);
					const specName = SPECIFICATIONS_DICTIONARY[_item.specId];
					if (specName) {
						_item._specificationName = specName;
					}
					result.push(_item);
				});
				return result;
			})
		);
	}

	getProductSpecById(productSpecId: number): Observable<ProductSpecificationModel> {
		return this.http.get<ProductSpecificationModel>(
			API_PRODUCTSPECS_URL + `/${productSpecId}`
		);
	}

	findProductSpecs(
		queryParams: QueryParamsModel,
		productId: number): Observable<QueryResultsModel> {
		return this.getAllProductSpecsByProductId(productId).pipe(
			mergeMap(res => {
				const result = this.httpUtils.baseFilter(
					res,
					queryParams,
					[]
				);
				return of(result);
			})
		);
	}

	// UPDATE => PUT: update the product specification on the server
	updateProductSpec(productSpec: ProductSpecificationModel): Observable<any> {
		return this.http.put(API_PRODUCTSPECS_URL, productSpec, {
			headers: this.httpUtils.getHTTPHeaders()
		});
	}

	// DELETE => delete the product specification from the server
	deleteProductSpec(productSpecId: number): Observable<any> {
		const url = `${API_PRODUCTSPECS_URL}/${productSpecId}`;
		return this.http.delete<any>(url);
	}

	deleteProductSpecifications(ids: number[] = []): Observable<any> {
		const tasks$ = [];
		const length = ids.length;
		// tslint:disable-next-line:prefer-const
		for (let i = 0; i < length; i++) {
			tasks$.push(this.deleteProductSpec(ids[i]));
		}
		return forkJoin(tasks$);
	}

	getSpecs(): string[] {
		return SPECIFICATIONS_DICTIONARY;
	}
}
