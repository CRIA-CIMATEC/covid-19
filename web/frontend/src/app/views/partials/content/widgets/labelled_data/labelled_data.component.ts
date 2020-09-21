import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { SparklineChartOptions } from '../../../../../core/_base/layout';

import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';

import { TranslationService } from '../../../../../core/_base/layout';
import { DashboardService } from '../../../../../services/dashboard.service';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { from } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';


registerLocaleData(localePt, 'pt');

@Component({
	selector: 'kt-labelled_data',
	templateUrl: './labelled_data.component.html',
	styleUrls: ['./labelled_data.component.scss']
})
export class LabelledDataComponent implements OnInit {

	@Input() value: any;
	@Input() desc: any;
	@Input() options: SparklineChartOptions;
	_confirmados: any;
	_letalidade: any;
	_mortes: any;
	_inflexup: any;
	_inflexdown: any;
	_peak: any;

	lang: string;

	constructor(
		private translationService: TranslationService,
		private dashboardService: DashboardService,
		private _changeDetectorRef: ChangeDetectorRef,
		private translateService: TranslateService
	) {
		// register translations
		this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
	}
	

	ngOnInit(): void {
        DashboardService.CountryResponse8.subscribe(
          y => this.getdashboard(y)
		)
		 this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
			this.lang = this.translateService.currentLang
			if(this.lang == 'ptbr'){
                this.lang = 'pt'
            }
			// console.log(this.lang);
			this._detectChanges();
		});
		// this.getdashboard();
	}
		// this.dashboardService.getSummary().subscribe(
		// 	obj=>{
			getdashboard(obj?) {
				let listInflex_up = obj.inflex_up;
				let listInflex_down = obj.inflex_down;
				let listPeak = obj.peak;
				let listConfirmed = obj.confirmed;
				let listLethality = obj.lethality;
				let listDeaths = obj.deaths;

				// console.log(obj);
				this._inflexup = listInflex_up;
				this._inflexdown = listInflex_down;
				this._peak = listPeak;
				this._confirmados = listConfirmed.value[listConfirmed.value.length - 1];
				this._letalidade = listLethality.value[listLethality.value.length - 1];
				this._mortes = listDeaths.value[listDeaths.value.length - 1];
				// this._cdr.detectChanges();
				this._detectChanges();
			};
			private _detectChanges(): void {
				if (!this._changeDetectorRef['destroyed']) {
					this._changeDetectorRef.detectChanges();
				}
			}
		
}
