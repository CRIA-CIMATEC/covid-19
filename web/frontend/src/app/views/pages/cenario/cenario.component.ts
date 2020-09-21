import { Component, ViewEncapsulation, ViewChild, Output, EventEmitter, Input, Type, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Papa } from 'ngx-papaparse';
import { CenarioService } from '../../../services/cenario.service';
import {MatSelectModule} from '@angular/material/select';
import { HttpResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DashboardService } from '../../../services/dashboard.service';
import { LayoutConfigService, SparklineChartOptions } from '../../../core/_base/layout';

export interface UserData {
  //'Parameters'?: any;
  Country: any;
  State: any;
  dateSelected: any;
  Cases: any[];
  Invoices: any[];
}

// const initialSelection = [];
// const allowMultiSelect = true;
// this.selection = new SelectionModel<any>(allowMultiSelect, initialSelection);

  
@Component({
	selector: 'kt-cenario',
	templateUrl: './cenario.component.html',
    styleUrls: ['cenario.component.scss'],
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
})

export class CenarioComponent implements OnInit  { 
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
