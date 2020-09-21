// Angular
import { Injectable } from '@angular/core';
// Object-Path
import * as objectPath from 'object-path';
// RxJS
import { BehaviorSubject } from 'rxjs';
// Layout
import { LayoutConfigModel } from '../../core/_base/layout';

export interface ClassType {
	header: string[];
	header_mobile: string[];
	header_menu: string[];
	aside_menu: string[];
}

@Injectable()
export class HtmlClassService {
	// Public properties
	config: LayoutConfigModel;
	classes: ClassType;
	onClassesUpdated$: BehaviorSubject<ClassType>;
	// Private properties
	private loaded: string[] = [];

	/**
	 * Component constructor
	 */
	constructor() {
		this.onClassesUpdated$ = new BehaviorSubject(this.classes);
	}

	/**
	 * Build html element classes from layout config
	 * @param layoutConfig
	 */
	setConfig(layoutConfig: LayoutConfigModel) {
		this.config = layoutConfig;

		// scope list of classes
		this.classes = {
			header: [],
			header_mobile: [],
			header_menu: [],
			aside_menu: [],
		};

		// init base layout
		this.initLayout();
		this.initLoader();

		// init header and subheader menu
		this.initHeader();
		this.initSubheader();

		// init aside and aside menu
		this.initAside();

		// init footer
		this.initFooter();

		this.onClassesUpdated$.next(this.classes);
	}

	/**
	 * Returns Classes
	 *
	 * @param path: string
	 * @param toString boolean
	 */
	getClasses(path?: string, toString?: boolean): ClassType | string[] | string {
		if (path) {
			const classes = objectPath.get(this.classes, path) || '';
			if (toString && Array.isArray(classes)) {
				return classes.join(' ');
			}
			return classes.toString();
		}
		return this.classes;
	}

	/**
	 * Init Layout
	 */
	private initLayout() {
		if (objectPath.has(this.config, 'self.body.class')) {
			const selfBodyClass = (objectPath.get(this.config, 'self.body.class')).toString();
			if (selfBodyClass) {
				const bodyClasses: string[] = selfBodyClass.split(' ');
				bodyClasses.forEach(cssClass => document.body.classList.add(cssClass));
			}
		}

		if (objectPath.get(this.config, 'self.layout') === 'boxed' && objectPath.has(this.config, 'self.body.background-image')) {
			document.body.style.backgroundImage = 'url("' + objectPath.get(this.config, 'self.body.background-image') + '")';
		}

		// Offcanvas directions
		document.body.classList.add('kt-quick-panel--right');
		document.body.classList.add('kt-demo-panel--right');
		document.body.classList.add('kt-offcanvas-panel--right');
	}

	/**
	 * Init Loader
	 */
	private initLoader() {
	}

	/**
	 * Init Header
	 */
	private initHeader() {
		// Fixed header
		if (objectPath.get(this.config, 'header.self.fixed.desktop.enabled')) {
			document.body.classList.add('kt-header--fixed');
			objectPath.push(this.classes, 'header', 'kt-header--fixed');
			document.body.classList.add('kt-header--minimize-' + objectPath.get(this.config, 'header.self.fixed.desktop.mode'));
		} else {
			document.body.classList.add('kt-header--static');
		}

		if (objectPath.get(this.config, 'header.self.fixed.mobile')) {
			document.body.classList.add('kt-header-mobile--fixed');
			objectPath.push(this.classes, 'header_mobile', 'kt-header-mobile--fixed');
		}
	}

	/**
	 * Inin Subheader
	 */
	private initSubheader() {
		// Fixed content head
		if (objectPath.get(this.config, 'subheader.fixed')) {
			document.body.classList.add('kt-subheader--fixed');
		}

		if (objectPath.get(this.config, 'subheader.display')) {
			document.body.classList.add('kt-subheader--enabled');
		}

		if (objectPath.has(this.config, 'subheader.style')) {
			document.body.classList.add('kt-subheader--' + objectPath.get(this.config, 'subheader.style'));
		}
	}

	/**
	 * Init Aside
	 */
	private initAside() {
		if (objectPath.get(this.config, 'aside.self.display') !== true) {
			return;
		}

		document.body.classList.add('kt-aside--enabled');

		if (objectPath.get(this.config, 'aside.self.skin')) {
			objectPath.push(this.classes, 'aside', 'kt-aside--skin-' + objectPath.get(this.config, 'aside.self.skin'));
			document.body.classList.add('kt-aside--skin-' + objectPath.get(this.config, 'aside.self.skin'));
			objectPath.push(this.classes, 'aside_menu', 'kt-aside-menu--skin-' + objectPath.get(this.config, 'aside.self.skin'));

			document.body.classList.add('kt-aside__brand--skin-' + objectPath.get(this.config, 'aside.self.skin'));
			objectPath.push(this.classes, 'brand', 'kt-aside__brand--skin-' + objectPath.get(this.config, 'aside.self.skin'));
		}

		// Fixed Aside
		if (objectPath.get(this.config, 'aside.self.fixed')) {
			document.body.classList.add('kt-aside--fixed');
			objectPath.push(this.classes, 'aside', 'kt-aside--fixed');
		} else {
			document.body.classList.add('kt-aside--static');
		}

		// Default fixed
		if (objectPath.get(this.config, 'aside.self.minimize.default')) {
			document.body.classList.add('kt-aside--minimize');
		}

		// Menu
		// Dropdown Submenu
		if (objectPath.get(this.config, 'aside.self.fixed') !== true && objectPath.get(this.config, 'aside.menu.dropdown')) {
			objectPath.push(this.classes, 'aside_menu', 'kt-aside-menu--dropdown');
			// enable menu dropdown
		}
	}

	/**
	 * Init Footer
	 */
	private initFooter() {
		// Fixed header
		if (objectPath.get(this.config, 'footer.self.fixed')) {
			document.body.classList.add('kt-footer--fixed');
		}
	}
}
