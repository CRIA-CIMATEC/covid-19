// Angular
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// RXJS
import { Subscription } from 'rxjs';
// Layout
import { LayoutConfigService } from '../../../../core/_base/layout';

@Component({
	selector: 'kt-error-page',
	templateUrl: './error-page.component.html',
	styleUrls: ['./error-page.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ErrorPageComponent implements OnInit, OnDestroy {
	// Public properties
	// type of error template to be used, accepted values; error-v1 | error-v2 | error-v3 | error-v4 | error-v5 | error-v6
	@Input() type = 'error-v1';
	// full background image
	@Input() image: string;
	// error code, some error types template has it
	@Input() code = '404';
	// error title
	@Input() title: string;
	// error subtitle, some error types template has it
	@Input() subtitle: string;
	// error descriptions
	@Input() desc = 'Oops! Something went wrong!';
	// return back button title
	@Input() return = 'Return back';

	private sub: Subscription;

	/**
	 * Component constructor
	 *
	 * @param route: ActivatedRoute
	 * @param layoutConfigService: LayoutConfigService
	 */
	constructor(private route: ActivatedRoute, private layoutConfigService: LayoutConfigService) {
		// set temporary values to the layout config on this page
		this.layoutConfigService.setConfig({self: {layout: 'blank'}});
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.type = this.route.snapshot.paramMap.get('type');
		this.sub = this.route.data.subscribe(param => {
			if (param.type) {
				this.type = param.type;
			}
			if (param.image) {
				this.image = param.image;
			}
			if (param.code) {
				this.code = param.code;
			}
			if (param.title) {
				this.title = param.title;
			}
			if (param.subtitle) {
				this.subtitle = param.subtitle;
			}
			if (param.desc) {
				this.desc = param.desc;
			}
			if (param.return) {
				this.return = param.return;
			}
		});

		switch (this.type) {
			case 'error-v1':
				if (!this.image) {
					this.image = './assets/media/error/bg1.jpg';
				}
				if (!this.code) {
					this.code = '404';
				}
				if (!this.desc) {
					this.desc = 'OOPS! Something went wrong here';
				}
				break;
			case 'error-v2':
				if (!this.image) {
					this.image = './assets/media/error/bg2.jpg';
				}
				if (!this.code) {
					this.code = '404';
				}
				if (!this.title) {
					this.title = 'OOPS!';
				}
				if (!this.desc) {
					this.desc = 'Something went wrong here';
				}
				break;
			case 'error-v3':
				if (!this.code) {
					this.code = '404';
				}
				if (!this.title) {
					this.title = 'How did you get here';
				}
				if (!this.subtitle) {
					this.subtitle = 'Sorry we can\'t seem to find the page you\'re looking for.';
				}
				if (!this.desc) {
					this.desc = 'There may be amisspelling in the URL entered,<br>' + 'or the page you are looking for may no longer exist.';
				}
				if (!this.image) {
					this.image = './assets/media/error/bg3.jpg';
				}
				break;
			case 'error-v4':
				if (!this.code) {
					this.code = '404';
				}
				if (!this.title) {
					this.title = 'ERROR';
				}
				if (!this.desc) {
					this.desc = 'Nothing left to do here';
				}
				if (!this.image) {
					this.image = './assets/media/error/bg4.jpg';
				}
				break;
			case 'error-v5':
				if (!this.title) {
					this.title = 'Oops!';
				}
				if (!this.subtitle) {
					this.subtitle = 'Something went wrong here';
				}
				if (!this.desc) {
					this.desc = 'We\'re working on it and we\'ll get it fixed<br>' + 'as soon possible.<br>' + 'You can back or use our Help Center.';
				}
				if (!this.image) {
					this.image = './assets/media/error/bg5.jpg';
				}
				break;
			case 'error-v6':
				if (!this.title) {
					this.title = 'Oops...';
				}
				if (!this.desc) {
					this.desc = 'Looks like something went wrong.<br>' + 'We\'re working on it';
				}
				if (!this.image) {
					this.image = './assets/media/error/bg6.jpg';
				}
				break;
			default:
				if (!this.image) {
					this.image = './assets/media/error/bg1.jpg';
				}
		}
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		// reset config from any temporary values
		this.layoutConfigService.reloadConfigs();
		this.sub.unsubscribe();
	}
}
