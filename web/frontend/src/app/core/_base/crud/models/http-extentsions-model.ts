// CRUD
import { QueryParamsModel } from './query-models/query-params.model';
import { QueryResultsModel } from './query-models/query-results.model';

export class HttpExtenstionsModel {

	/**
	 * Filtration with sorting
	 * First do Sort then filter
	 *
	 * @param _entities: any[]
	 * @param _queryParams: QueryParamsModel
	 * @param _filtrationFields: string[]
	 */
	baseFilter(_entities: any[], _queryParams: QueryParamsModel, _filtrationFields: string[] = []): QueryResultsModel {
		// Filtration
		let entitiesResult = this.searchInArray(_entities, _queryParams.filter, _filtrationFields);

		// Sorting
		// start
		if (_queryParams.sortField) {
			entitiesResult = this.sortArray(entitiesResult, _queryParams.sortField, _queryParams.sortOrder);
		}
		// end

		// Paginator
		// start
		const totalCount = entitiesResult.length;
		const initialPos = _queryParams.pageNumber * _queryParams.pageSize;
		entitiesResult = entitiesResult.slice(initialPos, initialPos + _queryParams.pageSize);
		// end

		const queryResults = new QueryResultsModel();
		queryResults.items = entitiesResult;
		queryResults.totalCount = totalCount;
		return queryResults;
	}

	/**
	 * Sort array by field name and order-type
	 * @param _incomingArray: any[]
	 * @param _sortField: string
	 * @param _sortOrder: string
	 */
	sortArray(_incomingArray: any[], _sortField: string = '', _sortOrder: string = 'asc'): any[] {
		if (!_sortField) {
			return _incomingArray;
		}

		let result: any[] = [];
		result = _incomingArray.sort((a, b) => {
			if (a[_sortField] < b[_sortField]) {
				return _sortOrder === 'asc' ? -1 : 1;
			}

			if (a[_sortField] > b[_sortField]) {
				return _sortOrder === 'asc' ? 1 : -1;
			}

			return 0;
		});
		return result;
	}

	/**
	 * Filter array by some fields
	 *
	 * @param _incomingArray: any[]
	 * @param _queryObj: any
	 * @param _filtrationFields: string[]
	 */
	searchInArray(_incomingArray: any[], _queryObj: any, _filtrationFields: string[] = []): any[] {
		const result: any[] = [];
		let resultBuffer: any[] = [];
		const indexes: number[] = [];
		let firstIndexes: number[] = [];
		let doSearch = false;

		_filtrationFields.forEach(item => {
			if (item in _queryObj) {
				_incomingArray.forEach((element, index) => {
					if (element[item] === _queryObj[item]) {
						firstIndexes.push(index);
					}
				});
				firstIndexes.forEach(element => {
					resultBuffer.push(_incomingArray[element]);
				});
				_incomingArray = resultBuffer.slice(0);
				resultBuffer = [].slice(0);
				firstIndexes = [].slice(0);
			}
		});

		Object.keys(_queryObj).forEach(key => {
			const searchText = _queryObj[key].toString().trim().toLowerCase();
			if (key && !_filtrationFields.some(e => e === key) && searchText) {
				doSearch = true;
				try {
					_incomingArray.forEach((element, index) => {
						if (element[key]) {
							const _val = element[key].toString().trim().toLowerCase();
							if (_val.indexOf(searchText) > -1 && indexes.indexOf(index) === -1) {
								indexes.push(index);
							}
						}
					});
				} catch (ex) {
					console.log(ex, key, searchText);
				}
			}
		});

		if (!doSearch) {
			return _incomingArray;
		}

		indexes.forEach(re => {
			result.push(_incomingArray[re]);
		});

		return result;
	}
}
