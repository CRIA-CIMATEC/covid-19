// Angular
import {Component} from '@angular/core';
// Layout
import {LayoutConfigService, OffcanvasOptions} from '../../../../core/_base/layout';

@Component({
	selector: 'kt-sticky-toolbar',
	templateUrl: './sticky-toolbar.component.html',
	styleUrls: ['./sticky-toolbar.component.scss'],
})
export class StickyToolbarComponent {
	// Public properties
	demoPanelOptions: OffcanvasOptions = {
		overlay: true,
		baseClass: 'kt-demo-panel',
		closeBy: 'kt_demo_panel_close',
		toggleBy: 'kt_demo_panel_toggle',
	};

	baseHref: string;

	constructor(private layoutConfigService: LayoutConfigService) {
		this.baseHref = 'https://keenthemes.com/metronic/preview/angular/';
	}

	isActiveDemo(demo) {
		return demo === this.layoutConfigService.getConfig('demo');
	}
}
