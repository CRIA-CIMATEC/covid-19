// Angular
import { Component, Input, OnInit } from '@angular/core';
// Lodash
import { shuffle } from 'lodash';

export interface Widget5Data {
	pic?: string;
	title: string;
	desc: string;
	url?: string;
	info?: string;
	largeInfo?: string;
}

@Component({
	selector: 'kt-widget5',
	templateUrl: './widget5.component.html',
	styleUrls: ['./widget5.component.scss']
})
export class Widget5Component implements OnInit {
	// Public properties
	@Input() data: Widget5Data[];

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (!this.data) {
			this.data = shuffle([
				{
					pic: './assets/media/products/product6.jpg',
					title: 'Great Logo Designn',
					desc: 'Metronic admin themes.',
					info: '<span>Author:</span><span class="kt-font-info">Keenthemes</span>' +
						'<span>Released:</span><span class="kt-font-info">23.08.17</span>',
					largeInfo: '<div class="kt-widget5__stats">\n' +
						' <span class="kt-widget5__number">19,200</span>\n' +
						' <span class="kt-widget5__sales">sales</span>\n' +
						' </div>\n' +
						' <div class="kt-widget5__stats">\n' +
						' <span class="kt-widget5__number">1046</span>\n' +
						' <span class="kt-widget5__votes">votes</span>\n' +
						' </div>'
				},
				{
					pic: './assets/media/products/product10.jpg',
					title: 'Branding Mockup',
					desc: 'Metronic bootstrap themes.',
					info: '<span>Author:</span><span class="kt-font-info">Fly themes</span>' +
						'<span>Released:</span><span class="kt-font-info">23.08.17</span>',
					largeInfo: '<div class="kt-widget5__stats">\n' +
						' <span class="kt-widget5__number">24,583</span>\n' +
						' <span class="kt-widget5__sales">sales</span>\n' +
						' </div>\n' +
						' <div class="kt-widget5__stats">\n' +
						' <span class="kt-widget5__number">3809</span>\n' +
						' <span class="kt-widget5__votes">votes</span>\n' +
						' </div>'
				},
				{
					pic: './assets/media/products/product11.jpg',
					title: 'Awesome Mobile App',
					desc: 'Metronic admin themes. Lorem Ipsum Amet.',
					info: '<span>Author:</span><span class="kt-font-info">Fly themes</span>' +
						'<span>Released:</span><span class="kt-font-info">23.08.17</span>',
					largeInfo: '<div class="kt-widget5__stats">\n' +
						' <span class="kt-widget5__number">210,054</span>\n' +
						' <span class="kt-widget5__sales">sales</span>\n' +
						' </div>\n' +
						' <div class="kt-widget5__stats">\n' +
						' <span class="kt-widget5__number">1103</span>\n' +
						' <span class="kt-widget5__votes">votes</span>\n' +
						' </div>'
				},
			]);
		}
	}
}
