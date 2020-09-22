// Angular
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'kt-cart',
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, AfterViewInit {
	// Public properties

	// Set icon class name
	@Input() icon = 'flaticon2-shopping-cart-1';
	@Input() iconType: '' | 'brand';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	/**
	 * Component constructor
	 */
	constructor() {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * After view init
	 */
	ngAfterViewInit(): void {
	}

	/**
	 * On init
	 */
	ngOnInit(): void {
	}
}
