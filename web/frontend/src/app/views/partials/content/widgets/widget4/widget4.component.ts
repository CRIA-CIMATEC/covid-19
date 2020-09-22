// Angular
import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
// Lodash
import { shuffle } from 'lodash';
// Layout
import { LayoutConfigService } from '../../../../../core/_base/layout';

export interface Widget4Data {
	icon?: string;
	pic?: string;
	title?: string;
	username?: string;
	desc?: string;
	url?: string;
}

@Component({
	selector: 'kt-widget4',
	templateUrl: './widget4.component.html',
	styleUrls: ['./widget4.component.scss']
})
export class Widget4Component implements OnInit {
	// Public properties
	@Input() data: Widget4Data[];

	@ContentChild('actionTemplate', {static: true}) actionTemplate: TemplateRef<any>;

	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(private layoutConfigService: LayoutConfigService) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// dummy data
		if (!this.data) {
			this.data = shuffle([
				{
					pic: './assets/media/files/doc.svg',
					title: 'Metronic Documentation',
					url: 'https://keenthemes.com.my/metronic',
				}, {
					pic: './assets/media/files/jpg.svg',
					title: 'Project Launch Evgent',
					url: 'https://keenthemes.com.my/metronic',
				}, {
					pic: './assets/media/files/pdf.svg',
					title: 'Full Developer Manual For 4.7',
					url: 'https://keenthemes.com.my/metronic',
				}, {
					pic: './assets/media/files/javascript.svg',
					title: 'Make JS Development',
					url: 'https://keenthemes.com.my/metronic',
				}, {
					pic: './assets/media/files/zip.svg',
					title: 'Download Ziped version OF 5.0',
					url: 'https://keenthemes.com.my/metronic',
				}, {
					pic: './assets/media/files/pdf.svg',
					title: 'Finance Report 2016/2017',
					url: 'https://keenthemes.com.my/metronic',
				},
			]);
		}
	}
}
