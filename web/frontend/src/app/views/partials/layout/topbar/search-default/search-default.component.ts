// Angular
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
	selector: 'kt-search-default',
	templateUrl: './search-default.component.html',
})
export class SearchDefaultComponent implements OnInit {
	// Public properties

	// Set icon class name
	@Input() icon = 'flaticon2-search-1';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	@ViewChild('searchInput', {static: true}) searchInput: ElementRef;

	data: any[];
	result: any[];
	loading: boolean;

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	constructor(private cdr: ChangeDetectorRef) {
	}

	/**
	 * On init
	 */
	ngOnInit(): void {
		// simulate result from API
		// type 0|1 as separator or item
		this.result = [
			{
				text: 'Documents',
				type: 0
			}, {
				icon: '<i class="flaticon-interface-3 kt-font-warning">',
				text: 'Annual finance report',
				type: 1
			}, {
				icon: '<i class="flaticon-share kt-font-success"></i>',
				text: 'Company meeting schedule',
				type: 1
			}, {
				icon: '<i class="flaticon-paper-plane kt-font-info"></i>',
				text: 'Project quotations',
				type: 1
			}, {
				text: 'Customers',
				type: 0
			}, {
				img: '<img src="assets/media/users/user1.jpg" alt="">',
				text: 'Amanda Anderson',
				type: 1
			}, {
				img: '<img src="assets/media/users/user2.jpg" alt="">',
				text: 'Kennedy Lloyd',
				type: 1
			}, {
				img: '<img src="assets/media/users/user3.jpg" alt="">',
				text: 'Megan Weldon',
				type: 1
			}, {
				img: '<img src="assets/media/users/user4.jpg" alt="">',
				text: 'Marc-André ter Stegen',
				type: 1
			}, {
				text: 'Files',
				type: 0
			}, {
				icon: '<i class="flaticon-lifebuoy kt-font-warning"></i>',
				text: 'Revenue report',
				type: 1
			}, {
				icon: '<i class="flaticon-coins kt-font-primary"></i>',
				text: 'Anual finance report',
				type: 1
			}, {
				icon: '<i class="flaticon-calendar kt-font-danger"></i>',
				text: 'Tax calculations',
				type: 1
			}
		];
	}

	/**
	 * Search
	 * @param e: Event
	 */
	search(e) {
		this.data = null;
		if (e.target.value.length > 2) {
			this.loading = true;
			// simulate getting search result
			setTimeout(() => {
				this.data = this.result;
				this.loading = false;
				this.cdr.markForCheck();
			}, 500);
		}
	}

	/**
	 * Clear search
	 *
	 * @param e: Event
	 */
	clear(e) {
		this.data = null;
		this.searchInput.nativeElement.value = '';
	}
}
