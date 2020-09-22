// Angular
import { Injectable } from '@angular/core';
// RxJS
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LayoutRefService {
	// Public properties
	layoutRefs$: BehaviorSubject<any> = new BehaviorSubject<any>({});
	layoutRefs: any = {};

	/**
	 * Add element to Ref
	 *
	 * @param name: any
	 * @param element: any
	 */
	addElement(name, element) {
		const obj = {};
		obj[name] = element;

		this.layoutRefs = Object.assign({}, this.layoutRefs, obj);
		this.layoutRefs$.next(this.layoutRefs);
	}
}
