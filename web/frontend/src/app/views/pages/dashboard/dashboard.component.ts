// Angular
import { Component, OnInit, ViewChild} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core/public_api';
// Lodash
import { shuffle } from 'lodash';
// Services

// Widgets model
import { LayoutConfigService, SparklineChartOptions } from '../../../core/_base/layout';
import { Widget4Data } from '../../partials/content/widgets/widget4/widget4.component';

import { DashboardService } from '../../../services/dashboard.service';
import { Dashboard } from '../../../models/dashboard';

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
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
     
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
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	clear: any;
	fluid: any;

	//form = new FormGroup(
	//	{
	//	  country: new FormControl('Brazil'),
	//	  state: new FormControl(''),
	//	}
	 // );
	
	chartOptions1: SparklineChartOptions;
	chartOptions2: SparklineChartOptions;
	chartOptions3: SparklineChartOptions;
	chartOptions4: SparklineChartOptions;
	widget4_1: Widget4Data;
	widget4_2: Widget4Data;
	widget4_3: Widget4Data;
	widget4_4: Widget4Data;

	_confirmados: any;
	_letalidade: any;
	_mortes: any;
	_inflexup: any;
	_inflexdown: any;
	_peak: any;

	chartOptions: { series: { name: string; data: number[]; }[]; chart: { height: number; type: string; }; title: { text: string; }; xaxis: { categories: string[]; }; };
	formErrors: any;
	validationMessages: any;
	
	Country = 'Brazil';
    State = 'Bahia';

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;

	
	constructor(
		//private translationService: TranslationService,
		private layoutConfigService: LayoutConfigService,
		private formBuilder: FormBuilder,
		private dashboardService: DashboardService
	) 
	{
		
		// register translations
		//this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang);
	}
	
	ngOnInit(): void { 
		
		this.chartOptions1 = {
			data: [],
			color: this.layoutConfigService.getConfig('colors.state.brand'),
			border: 3
		};
		this.chartOptions2 = {
			data: [],
			color: this.layoutConfigService.getConfig('colors.state.danger'),
			border: 3
		};
		this.chartOptions3 = {
			data: [],
			color: this.layoutConfigService.getConfig('colors.state.brand'),
			border: 3
		};
		//this.buildForm();

	}

	//buildForm() {
	//	this.form = this.formBuilder.group(
	// 	  {
	// 		country: new FormControl(),
	// 		state: new FormControl()
	// 	  }
	// 	);
	// 	this.form.valueChanges.subscribe( data => this.OnChangesCountry(data) );
	// 	this.OnChangesCountry();
		
	//   }
	
}
	