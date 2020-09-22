// Angular
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Output } from '@angular/core';
// RxJS
import { Subscription } from 'rxjs';
// Auth
import { AuthNotice, AuthNoticeService } from '../../../../core/auth/';

@Component({
	selector: 'kt-auth-notice',
	templateUrl: './auth-notice.component.html',
})
export class AuthNoticeComponent implements OnInit, OnDestroy {
	@Output() type: any;
	@Output() message: any = '';

	// Private properties
	private subscriptions: Subscription[] = [];

	/**
	 * Component Constructure
	 *
	 * @param authNoticeService
	 * @param cdr
	 */
	constructor(public authNoticeService: AuthNoticeService, private cdr: ChangeDetectorRef) {
	}

	/*
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
    */

	/**
	 * On init
	 */
	ngOnInit() {
		this.subscriptions.push(this.authNoticeService.onNoticeChanged$.subscribe(
			(notice: AuthNotice) => {
				notice = Object.assign({}, {message: '', type: ''}, notice);
				this.message = notice.message;
				this.type = notice.type;
				this.cdr.markForCheck();
			}
		));
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}
