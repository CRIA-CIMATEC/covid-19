// Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Layout
import { LayoutConfigService, TranslationService } from '../../../core/_base/layout';
// Object-Path
import * as objectPath from 'object-path';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NewsletterService } from '../../../services/newsletter.service'
import { async } from 'rxjs/internal/scheduler/async';
import { TranslateService } from '@ngx-translate/core';

import { locale as enLang } from '../../../core/_config/i18n/en';
import { locale as chLang } from '../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../core/_config/i18n/de';
import { locale as frLang } from '../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../core/_config/i18n/pt';
import { HttpResponse } from '@angular/common/http';


@Component({
	selector: 'kt-footer',
	templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
	// Public properties
	today: number = Date.now();
	fluid: boolean;

	hasFormErrors = false;
	submitSuccess = false;

	form = new FormGroup({ email: new FormControl('')});

	public formErrors = {email: ''};
	public submitMsg = '';
	
	public validationMessages = {
		email: {
			required: this.translateService.instant('DASHBOARD.EMAIL_REQUIRED'),
			email: this.translateService.instant('DASHBOARD.EMAIL_INVALID')
		}
	}



	/**
	 * Component constructor
	 *
	 * @param layoutConfigService: LayouConfigService
	 */
	constructor(
		private layoutConfigService: LayoutConfigService,
		private formBuilder: FormBuilder,
		private newsletterService: NewsletterService,
		private translationService: TranslationService,
		private translateService: TranslateService,
		private _cdr: ChangeDetectorRef
	) {	
		this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
	}


	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		
		this.buildForm();
		const config = this.layoutConfigService.getConfig();

		// footer width fluid
		this.fluid = objectPath.get(config, 'footer.self.width') === 'fluid';
	}

	// buildForm() {
	// 	this.form = this.formBuilder.group({email: ['', Validators.required]});
	// 	this.form.valueChanges.subscribe(data => this.onValueChanged(data));
	// 	this.onValueChanged();
	// }

	buildForm() {
		this.form = this.formBuilder.group(
			{ email: ['', [Validators.required, Validators.email]] }
		);
		this.form.valueChanges.subscribe( data => this.onValueChanged(data) );
		this.onValueChanged();
	}

	onValueChanged(data?: any) {
		this.onAlertClose();
        if (!this.form) { return; }
        const form = this.form;

        for (const field in this.formErrors) {
			this.formErrors[field] = '';
						
			const control = form.get(field);

            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];

                for (const key in control.errors) {
                    this.formErrors[field] = messages[key];
                    break;
                }
            }
        }
	}
	
	onSubmit() {
		this.hasFormErrors = false;
		if(!this.form.valid){
			if(this.form.value.email == ''){
				this.formErrors.email = this.translateService.instant('DASHBOARD.EMAIL_REQUIRED')
			}else{
				this.formErrors.email = this.translateService.instant('DASHBOARD.EMAIL_INVALID')
			}
			this.hasFormErrors = true;
			return;
		 }
		this.newsletterService.submit(this.form.value)
			.subscribe((response: HttpResponse<any>) => {
				// console.log(response);
				if (response.status == 200) {
					this.submitMsg = this.translateService.instant('FORM.SUBMIT_SUCCESS');
					this.form.reset();
					this.submitSuccess = true;
					this._cdr.detectChanges();
				}
			});
	}
	
	/** Alect Close event */
	onAlertClose() {
		this.hasFormErrors = false;
		this.submitSuccess = false;
	}
}
