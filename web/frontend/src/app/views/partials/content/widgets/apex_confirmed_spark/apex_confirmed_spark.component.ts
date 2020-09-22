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
import { set } from 'object-path';

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
	selector: 'apex_confirmed_spark',
	templateUrl: './apex_confirmed_spark.component.html',
	styleUrls: ['./apex_confirmed_spark.component.scss']
})

export class ApexConfirmedSparkComponent implements OnInit {

    // Public properties
    @ViewChild('chart', {static: true}) chart:ChartComponent;
    public chartOptions: any;
    apexChart: any;
    

    constructor(
        private layoutConfigService: LayoutConfigService,
          private translationService: TranslationService,
          private dashboardService: DashboardService,
        private translateService: TranslateService
    ) { 
        this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
    }

    

      ngOnInit(): void {
        DashboardService.CountryResponse8.subscribe(
          y => this.getdashboard(y)
        )
         
        this.chartOptions = {
            series: [
              { 
                name: this.translateService.instant('DASHBOARD.REAL_CHART'),
                data: []
              },
              {
                name: this.translateService.instant('DASHBOARD.IA_CHART'),
                data: []
              }
            ],
          
            chart: {
              id: 'apex_confirmed_spark',
              group: 'spark',
              height: 160,
              type: "line",
              sparkline: {
                enabled: "true"
              }
            },
            colors: ['#259FFB'],
            fill: {
              opacity: 0.3,
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
          this.getdashboard();
          
      }
    
      getdashboard(obj?) {

        // this.dashboardService.getSummary().subscribe(obj => {
        //   console.log()
        
          var _labels = obj.confirmed.date;
          
          var confirmedLength = obj.confirmed.date.length;
          var quantidade_confirmed = obj.confirmed.value;
          
          
          this.apexChart = this.chart;
          this.apexupdate(quantidade_confirmed, _labels);
          
      // });
      
      
      

    };
    apexupdate(confirmed, label){     
      this.chart.updateSeries([
        { name: "Real", data: confirmed } 
        
      ])
      this.chart.updateOptions(
        { 
          xaxis: 
          { categories: label 
             },
          
        }
      )
      this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        this.chart.updateSeries([
          { name: this.translateService.instant('DASHBOARD.REAL_CHART'), data: confirmed } 
         
        ])
      })
    } 
}