// Angular
import { Component, Input, OnInit } from '@angular/core';

import {MatProgressSpinnerModule} from '@angular/material';

// Lodash
import { shuffle } from 'lodash';
import { from } from 'rxjs';

import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';
import { TranslationService } from '../../../../../core/_base/layout';

export interface WidgetLoadResultsData {

}

@Component({
	selector: 'kt-widget-load-results',
	templateUrl: './widget_loading_results.component.html',
	styleUrls: ['./widget_loading_results.component.scss']
})
export class WidgetLoadResultsComponent implements OnInit {


	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */
	constructor(
		private translationService: TranslationService
		) { 
			this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
		}

	/**
	 * On init
	 */
	ngOnInit() {
	}

}
