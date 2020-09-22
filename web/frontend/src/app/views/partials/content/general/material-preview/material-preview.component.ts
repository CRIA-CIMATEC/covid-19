// Angular
import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'kt-material-preview',
	templateUrl: './material-preview.component.html',
	styleUrls: ['./material-preview.component.scss'],
})
export class MaterialPreviewComponent implements OnInit {
	// Public properties
	@Input() viewItem: any;

	/**
	 * Component constructor
	 */
	constructor() {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
	}

	/**
	 * Toggle visibility
	 */
	changeCodeVisibility(): void {
		this.viewItem.isCodeVisible = !this.viewItem.isCodeVisible;
	}

	/**
	 * Check examples existing
	 */
	hasExampleSource(): boolean {
		if (!this.viewItem) {
			return false;
		}

		if (!this.viewItem.cssCode && !this.viewItem.htmlCode && !this.viewItem.scssCode && !this.viewItem.tsCode) {
			return false;
		}

		return true;
	}
}
