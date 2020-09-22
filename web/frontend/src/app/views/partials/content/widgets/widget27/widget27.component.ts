import { Component, Input, OnInit } from '@angular/core';
import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';
import { TranslationService } from '../../../../../core/_base/layout';


@Component({
	selector: 'kt-widget27',
	templateUrl: './widget27.component.html',
	styleUrls: ['./widget27.component.scss']
})
export class Widget27Component implements OnInit {

	@Input() percentValue: string | number;
	@Input() leftText: string;
	@Input() rightText: string;
	@Input() type: string;
	@Input() boolHidden: string;

	constructor(
		private translationService: TranslationService
		) { 
			this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
		}


	ngOnInit() {
	}

}
