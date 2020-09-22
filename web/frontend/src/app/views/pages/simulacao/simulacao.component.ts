// Angular
import { Component, OnInit} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core/public_api';
// Lodash
import { shuffle } from 'lodash';
// Services
// Widgets model
import { LayoutConfigService, SparklineChartOptions } from '../../../core/_base/layout';
import { Widget4Data } from '../../partials/content/widgets/widget4/widget4.component';




import { locale as enLang } from '../../../core/_config/i18n/en';
import { locale as chLang } from '../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../core/_config/i18n/de';
import { locale as frLang } from '../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../core/_config/i18n/pt';

import { TranslationService } from '../../../core/_base/layout';
import { from } from 'rxjs';
import {
	ChartComponent,
	ApexAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexDataLabels,
	ApexTitleSubtitle,
	ApexStroke,
	ApexGrid,
	ApexAnnotations
  } from "ng-apexcharts";
//import { SimulationService } from '../.././../services/simulation.service';
     
  export type ChartOptions = {
	series: ApexAxisChartSeries;
	annotations: ApexAnnotations;
	chart: ApexChart;
	xaxis: ApexXAxis;
	dataLabels: ApexDataLabels;
	grid: ApexGrid;
	labels: string[];
	stroke: ApexStroke;
	title: ApexTitleSubtitle;
  };
@Component({
	selector: 'kt-simulacao',
	templateUrl: './simulacao.component.html',
	styleUrls: ['simulacao.component.scss'],
})
export class SimulacaoComponent implements OnInit {
	clear: any;
	fluid: any;
	

	_confirmados: any;
	_letalidade: any;
	_mortes: any;
	chartOptions: { series: { name: string; data: number[]; }[]; chart: { height: number; type: string; }; title: { text: string; }; xaxis: { categories: string[]; }; };

	constructor(
		//private translationService: TranslationService,
		private layoutConfigService: LayoutConfigService,
		//private simulationService: SimulationService
	) 
	{
		
		// register translations
		//this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang);
	}
	
	ngOnInit(): void { 
		

	}
}
