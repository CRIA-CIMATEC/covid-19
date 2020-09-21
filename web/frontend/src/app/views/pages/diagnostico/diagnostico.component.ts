// Angular
import { Component, OnInit, ChangeDetectorRef, Injector } from '@angular/core';

// Services
import { LayoutConfigService } from '../../../core/_base/layout';
import { TranslationService } from '../../../core/_base/layout';

import { locale as ptLang } from '../../../core/_config/i18n/pt';
import { locale as enLang } from '../../../core/_config/i18n/en';

// @Component({
// 	selector: 'kt-diagnostico',
// 	templateUrl: './diagnostico.component.html',
// 	styleUrls: ['./diagnostico.component.scss'],
// })
export abstract class DiagnosticoComponent implements OnInit {
	title: string;
	descricao: string;
	inputType: string;

	clear: any;
	fluid: any;

	IsLamina: boolean = false;
	data = [];

	hideElement = true;

	protected layoutConfigService: LayoutConfigService;
	protected translationService: TranslationService;
	protected _cdr: ChangeDetectorRef;

	constructor(injector: Injector) { 
		this.layoutConfigService = injector.get(LayoutConfigService);
		this.translationService = injector.get(TranslationService);
		this._cdr = injector.get(ChangeDetectorRef);

		this.translationService.loadTranslations(enLang, ptLang);
	}

	onResult(result: any){

		//console.log(this.IsLamina)
		
		let reader = new FileReader();
		reader.onloadend = (e: any) => {
			if(result.diagnostic[2]){
				this.data.push(
					{
						pic: e.target.result,
						imageName: result.image.name,
						imageUrl: e.target.result,
						normal: 100 - result.diagnostic[0],
						covid: result.diagnostic[1],
						isRegular: result.diagnostic[2]
					}
				);
			}else if(!result.diagnostic[2]){
				this.data.push(
					{
						pic: e.target.result,
						imageName: result.image.name,
						imageUrl: e.target.result,
						normal: 0,
						covid: 0,
						isRegular: result.diagnostic[2]
					}
				);
			}
			console.log(this.data)
			
			this._cdr.detectChanges();
		}
		this.hideElement = true;
    	reader.readAsDataURL(result.image);
	}

	clearOldList(){
		this.hideElement = false;
		this.data = [];
	}

	ngOnInit(): void {
	}
}
