// Angular
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
// Layout
import { LayoutConfigModel, LayoutConfigService } from '../../../../core/_base/layout';

@Component({
	selector: 'kt-builder',
	templateUrl: './builder.component.html',
	styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
	// Public properties
	model: LayoutConfigModel;
	@ViewChild('form', {static: true}) form: NgForm;

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
	ngOnInit(): void {
		this.model = this.layoutConfigService.getConfig();
	}

	/**
	 * Reset preview
	 *
	 * @param e: Event
	 */
	resetPreview(e: Event): void {
		e.preventDefault();
		this.layoutConfigService.resetConfig();
		location.reload();
	}

	/**
	 * Submit preview
	 *
	 * @param e: Event
	 */
	submitPreview(e: Event): void {
		this.layoutConfigService.setConfig(this.model, true);
		location.reload();
	}
}
