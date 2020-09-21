import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SparklineChartOptions, LayoutConfigService, TranslationService } from '../../../../../core/_base/layout';

import { DashboardService } from '../../../../../services/dashboard.service';

import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';

import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexDataLabels,
    ApexTitleSubtitle,
    ApexStroke,
    ApexGrid,
    ApexAnnotations,
    ApexYAxis
  } from "ng-apexcharts";
  
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SimulationService } from '../../../../../services/simulation.service';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    annotations: ApexAnnotations;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    labels: string[];
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
  };
  
  @Component({
	selector: 'apex_confirmados',
	templateUrl: './apex_confirmados.component.html',
	styleUrls: ['./apex_confirmados.component.scss']
})

export class ApexConfirmadosComponent implements OnInit {

    // Public properties
    @ViewChild('chart', {static: true}) chart:ChartComponent;
    public chartOptions: any;
    apexChart: any;
    

    constructor(
        private layoutConfigService: LayoutConfigService,
          private translationService: TranslationService,
          private simulationService: SimulationService,
        private translateService: TranslateService
    ) { 
        this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
    }

    

      ngOnInit(): void {
         
        this.chartOptions = {
            series: [
              { 
                name: this.translateService.instant('DASHBOARD.REAL_CHART'),
                data: []
              },
              {
                name: this.translateService.instant('DASHBOARD.PREDICT_CHART'),
                data: []
              }
            ],
          
            chart: {
              height: 350,
              type: "line",
              sparkline: {
                enabled: "true"
              }
            },
            
            xaxis: {
              categories: [],
            },
            dataLabels: {
              enabled: "false"
            },
            stroke: {
              curve: 'straight'
            },         
          };
          // this.getdashboard();
          
      }
    
      getdashboard() {
      //   this.simulationService.getAll().subscribe(obj => {
          
      //     var _labels = obj.real.data.concat(obj.previsto.data);
          
      //     var realLength = obj.real.data.length;
      //     var quantidade_real = obj.real.quantidade;
      //     var quantidade_previsto = Array(realLength-1).fill(null).concat(obj.previsto.quantidade);
          
          
      //     this.apexChart = this.chart;
      //     this.apexupdate(quantidade_real, quantidade_previsto, _labels);
      // });
      
      

//     };
//     apexupdate(real ,previsto, label){     
//       this.chart.updateSeries([
//         { name: "Real", data: real }, 
//         { name: "Predito", data: previsto }
//       ])
//       this.chart.updateOptions(
//         { 
//           xaxis: 
//             { categories: label.slice(1) },
          
//         }
//       )
//       this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
//         this.chart.updateSeries([
//           { name: this.translateService.instant('DASHBOARD.REAL_CHART'), data: real }, 
//           { name: this.translateService.instant('DASHBOARD.PREDICT_CHART'), data: previsto }
//         ])
//       })
    }    
}