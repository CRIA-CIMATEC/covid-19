import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnInit,
	Renderer2,
	ViewChild
} from '@angular/core';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import * as objectPath from 'object-path';
// Layout
import { LayoutConfigService, MenuAsideService, MenuOptions, OffcanvasOptions } from '../../../core/_base/layout';
import { HtmlClassService } from '../html-class.service';

@Component({
	selector: 'kt-aside-left',
	templateUrl: './aside-left.component.html',
	styleUrls: ['./aside-left.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsideLeftComponent implements OnInit, AfterViewInit {

	@ViewChild('asideMenu', {static: true}) asideMenu: ElementRef;

	currentRouteUrl = '';
	insideTm: any;
	outsideTm: any;

	menuCanvasOptions: OffcanvasOptions = {
		baseClass: 'kt-aside',
		overlay: true,
		closeBy: 'kt_aside_close_btn',
		toggleBy: {
			target: 'kt_aside_mobile_toggler',
			state: 'kt-header-mobile__toolbar-toggler--active'
		}
	};

	menuOptions: MenuOptions = {
		// vertical scroll
		scroll: null,

		// submenu setup
		submenu: {
			desktop: {
				// by default the menu mode set to accordion in desktop mode
				default: 'dropdown',
			},
			tablet: 'accordion', // menu set to accordion in tablet mode
			mobile: 'accordion' // menu set to accordion in mobile mode
		},

		// accordion setup
		accordion: {
			expandAll: false // allow having multiple expanded accordions in the menu
		}
	};

	/**
	 * Component Conctructor
	 *
	 * @param htmlClassService: HtmlClassService
	 * @param menuAsideService
	 * @param layoutConfigService: LayouConfigService
	 * @param router: Router
	 * @param render: Renderer2
	 * @param cdr: ChangeDetectorRef
	 */
	constructor(
		public htmlClassService: HtmlClassService,
		public menuAsideService: MenuAsideService,
		public layoutConfigService: LayoutConfigService,
		private router: Router,
		private render: Renderer2,
		private cdr: ChangeDetectorRef
	) {
	}

	ngAfterViewInit(): void {
	}

	ngOnInit() {
		this.currentRouteUrl = this.router.url.split(/[?#]/)[0];

		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.currentRouteUrl = this.router.url.split(/[?#]/)[0];
				this.cdr.markForCheck();
			});

		const config = this.layoutConfigService.getConfig();

		if (objectPath.get(config, 'aside.menu.dropdown')) {
			this.render.setAttribute(this.asideMenu.nativeElement, 'data-ktmenu-dropdown', '1');
			// tslint:disable-next-line:max-line-length
			this.render.setAttribute(this.asideMenu.nativeElement, 'data-ktmenu-dropdown-timeout', objectPath.get(config, 'aside.menu.submenu.dropdown.hover-timeout'));
		}
	}

	/**
	 * Check Menu is active
	 * @param item: any
	 */
	isMenuItemIsActive(item): boolean {
		if (item.submenu) {
			return this.isMenuRootItemIsActive(item);
		}

		if (!item.page) {
			return false;
		}

		return this.currentRouteUrl.indexOf(item.page) !== -1;
	}

	/**
	 * Check Menu Root Item is active
	 * @param item: any
	 */
	isMenuRootItemIsActive(item): boolean {
		let result = false;

		for (const subItem of item.submenu) {
			result = this.isMenuItemIsActive(subItem);
			if (result) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Use for fixed left aside menu, to show menu on mouseenter event.
	 * @param e Event
	 */
	mouseEnter(e: Event) {
		// check if the left aside menu is fixed
		if (document.body.classList.contains('kt-aside--fixed')) {
			if (this.outsideTm) {
				clearTimeout(this.outsideTm);
				this.outsideTm = null;
			}

			this.insideTm = setTimeout(() => {
				// if the left aside menu is minimized
				if (document.body.classList.contains('kt-aside--minimize') && KTUtil.isInResponsiveRange('desktop')) {
					// show the left aside menu
					this.render.removeClass(document.body, 'kt-aside--minimize');
					this.render.addClass(document.body, 'kt-aside--minimize-hover');
				}
			}, 50);
		}
	}

	/**
	 * Use for fixed left aside menu, to show menu on mouseenter event.
	 * @param e Event
	 */
	mouseLeave(e: Event) {
		if (document.body.classList.contains('kt-aside--fixed')) {
			if (this.insideTm) {
				clearTimeout(this.insideTm);
				this.insideTm = null;
			}

			this.outsideTm = setTimeout(() => {
				// if the left aside menu is expand
				if (document.body.classList.contains('kt-aside--minimize-hover') && KTUtil.isInResponsiveRange('desktop')) {
					// hide back the left aside menu
					this.render.removeClass(document.body, 'kt-aside--minimize-hover');
					this.render.addClass(document.body, 'kt-aside--minimize');
				}
			}, 100);
		}
	}

	/**
	 * Returns Submenu CSS Class Name
	 * @param item: any
	 */
	getItemCssClasses(item) {
		let classes = 'kt-menu__item';

		if (objectPath.get(item, 'submenu')) {
			classes += ' kt-menu__item--submenu';
		}

		if (!item.submenu && this.isMenuItemIsActive(item)) {
			classes += ' kt-menu__item--active kt-menu__item--here';
		}

		if (item.submenu && this.isMenuItemIsActive(item)) {
			classes += ' kt-menu__item--open kt-menu__item--here';
		}

		// custom class for menu item
		const customClass = objectPath.get(item, 'custom-class');
		if (customClass) {
			classes += ' ' + customClass;
		}

		if (objectPath.get(item, 'icon-only')) {
			classes += ' kt-menu__item--icon-only';
		}

		return classes;
	}

	getItemAttrSubmenuToggle(item) {
		let toggle = 'hover';
		if (objectPath.get(item, 'toggle') === 'click') {
			toggle = 'click';
		} else if (objectPath.get(item, 'submenu.type') === 'tabs') {
			toggle = 'tabs';
		} else {
			// submenu toggle default to 'hover'
		}

		return toggle;
	}
}
