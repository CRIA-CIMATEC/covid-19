// Angular
import { Component } from '@angular/core';
// Layout
import { OffcanvasOptions } from '../../../../core/_base/layout';

@Component({
	selector: 'kt-quick-panel',
	templateUrl: './quick-panel.component.html',
	styleUrls: ['./quick-panel.component.scss']
})
export class QuickPanelComponent {
	// Public properties
	offcanvasOptions: OffcanvasOptions = {
		overlay: true,
		baseClass: 'kt-quick-panel',
		closeBy: 'kt_quick_panel_close_btn',
		toggleBy: 'kt_quick_panel_toggler_btn'
	};
}
