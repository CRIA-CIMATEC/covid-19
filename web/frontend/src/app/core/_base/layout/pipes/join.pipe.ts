// Angular
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns string from Array
 */
@Pipe({
	name: 'join'
})
export class JoinPipe implements PipeTransform {
	/**
	 * Transform
	 *
	 * @param value: any
	 * @param args: any
	 */
	transform(value: any, args?: any): any {
		if (Array.isArray(value)) {
			return value.join(' ');
		}
		return value;
	}
}
