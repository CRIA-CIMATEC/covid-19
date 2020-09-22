import { KtDialogService, StickyDirective } from '../../../../../core/_base/layout';
// Angular
import {
	AfterViewInit,
	Component,
	ElementRef,
	HostBinding,
	HostListener,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	PLATFORM_ID,
	ViewChild
} from '@angular/core';
// RXJS
import { Observable, Subscription } from 'rxjs';

@Component({
	selector: 'kt-portlet-header',
	styleUrls: ['portlet-header.component.scss'],
	template: `
		<div class="kt-portlet__head-label" [hidden]="noTitle">
			<span class="kt-portlet__head-icon" #refIcon [hidden]="hideIcon || !icon">
				<ng-content *ngIf="!icon" select="[ktPortletIcon]"></ng-content>
				<i *ngIf="icon" [ngClass]="icon"></i>
			</span>
			<ng-content *ngIf="!title" select="[ktPortletTitle]"></ng-content>
			<h3 *ngIf="title" class="kt-portlet__head-title" [innerHTML]="title"></h3>
		</div>
		<div class="kt-portlet__head-toolbar" #refTools [hidden]="hideTools">
			<ng-content select="[ktPortletTools]"></ng-content>
		</div>`
})
export class PortletHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
	// Public properties
	// append html class to the portlet header
	@Input() class: string;
	// a simple title text
	@Input() title: string;
	// icon name to be added to the i tag
	@Input() icon: string;
	// remove title container
	@Input() noTitle: boolean;
	// enable sticky portlet header
	@Input() sticky: boolean;
	// enable loading to display
	@Input() viewLoading$: Observable<boolean>;
	viewLoading = false;

	@HostBinding('class') classes = 'kt-portlet__head';
	@HostBinding('attr.ktSticky') stickyDirective: StickyDirective;

	@ViewChild('refIcon', {static: true}) refIcon: ElementRef;
	hideIcon: boolean;

	@ViewChild('refTools', {static: true}) refTools: ElementRef;
	hideTools: boolean;

	private lastScrollTop = 0;
	private subscriptions: Subscription[] = [];
	private isScrollDown = false;

	constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: string, private ktDialogService: KtDialogService) {
		this.stickyDirective = new StickyDirective(this.el, this.platformId);
	}

	@HostListener('window:resize', ['$event'])
	onResize() {
		this.updateStickyPosition();
	}

	@HostListener('window:scroll', ['$event'])
	onScroll() {
		this.updateStickyPosition();
		const st = window.pageYOffset || document.documentElement.scrollTop;
		this.isScrollDown = st > this.lastScrollTop;
		this.lastScrollTop = st <= 0 ? 0 : st;
	}

	updateStickyPosition() {
		if (this.sticky) {
			Promise.resolve(null).then(() => {
				// get boundary top margin for sticky header
				const headerElement = document.querySelector('.kt-header') as HTMLElement;
				const subheaderElement = document.querySelector('.kt-subheader') as HTMLElement;
				const headerMobileElement = document.querySelector('.kt-header-mobile') as HTMLElement;

				let height = 0;

				if (headerElement != null) {
					// mobile header
					if (window.getComputedStyle(headerElement).height === '0px') {
						height += headerMobileElement.offsetHeight;
					} else {
						// desktop header
						if (document.body.classList.contains('kt-header--minimize-topbar')) {
							// hardcoded minimized header height
							height = 60;
						} else {
							// normal fixed header
							if (document.body.classList.contains('kt-header--fixed')) {
								height += headerElement.offsetHeight;
							}
							if (document.body.classList.contains('kt-subheader--fixed')) {
								height += subheaderElement.offsetHeight;
							}
						}
					}
				}

				this.stickyDirective.marginTop = height;
			});
		}
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		if (this.sticky) {
			this.stickyDirective.ngOnInit();
		}
	}

	ngAfterViewInit(): void {
		// append custom class
		this.classes += this.class ? ' ' + this.class : '';

		// hide icon's parent node if no icon provided
		this.hideIcon = this.refIcon.nativeElement.children.length === 0;

		// hide tools' parent node if no tools template is provided
		this.hideTools = this.refTools.nativeElement.children.length === 0;

		if (this.sticky) {
			this.updateStickyPosition();
			this.stickyDirective.ngAfterViewInit();
		}

		// initialize loading dialog
		if (this.viewLoading$) {
			const loadingSubscription = this.viewLoading$.subscribe(res => this.toggleLoading(res));
			this.subscriptions.push(loadingSubscription);
		}
	}

	toggleLoading(_incomingValue: boolean) {
		this.viewLoading = _incomingValue;
		if (_incomingValue && !this.ktDialogService.checkIsShown()) {
			this.ktDialogService.show();
		}

		if (!this.viewLoading && this.ktDialogService.checkIsShown()) {
			this.ktDialogService.hide();
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sb => sb.unsubscribe());
		if (this.sticky) {
			this.stickyDirective.ngOnDestroy();
		}
	}
}
