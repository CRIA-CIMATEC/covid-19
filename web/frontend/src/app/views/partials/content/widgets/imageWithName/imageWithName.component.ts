// Angular
import { Component, Input, OnInit } from '@angular/core';
// Lodash
import { shuffle } from 'lodash';

import { PortletModule } from '../../general/portlet/portlet.module';

export interface WidgetImageWithNameData {
}

@Component({
	selector: 'kt-widget-imageWithName',
	templateUrl: './imageWithName.component.html',
	styleUrls: ['./imageWithName.component.scss']
})
export class WidgetImageWithNameComponent implements OnInit {
	@Input() pic: string;
    @Input() imageName: string;
    @Input() imageUrl: string;
	// Public properties
	@Input() data: WidgetImageWithNameData;

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		// this.data = [
		// 	{
		// 		pic: '../assets/media/imgs/OIP.jpg',
		// 		imageName: 'Tórax paciente 5',
		// 		imageUrl: '../assets/media/imgs/OIP.jpg'
		// 	}
		// ]
		// console.log(this.data);
	}
}
