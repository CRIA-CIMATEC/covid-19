import { Component, OnInit, Input, ViewChild, EventEmitter } from '@angular/core';
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
    ApexAnnotations
  } from "ng-apexcharts";
  
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SimulationService } from '../../../../../services/simulation.service';
import { HttpResponse } from '@angular/common/http';
import { set } from 'object-path';

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
	selector: 'apex_confirmed_cases_diary',
	templateUrl: './apex_confirmed_cases_diary.component.html',
	styleUrls: ['./apex_confirmed_cases_diary.component.scss']
})

export class ApexConfirmedDiaryComponent implements OnInit {

    // Public properties
    @ViewChild('chart', {static: true}) chart:ChartComponent;
    public chartOptions: any;
    apexChart: any;
    xAxisAnnotationArray = [];

    constructor(
        private layoutConfigService: LayoutConfigService,
          private translationService: TranslationService,
          private dashboardService: DashboardService,
        private translateService: TranslateService,
        private simulationService: SimulationService
    ) { 
        this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
    }

    

      ngOnInit(): void {
        SimulationService.emitirCases.subscribe(
          x => this.responseDashboard(x)
        )
        DashboardService.CountryResponse5.subscribe(
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
              },
              {
                name: this.translateService.instant('DASHBOARD.SIRD_CHART'),
                data: []
              }
            ],
            chart: {
              height: 350,
              type: "line",
              events: {
                // legendClick: function(apexChart) {
                //    console.log(apexChart)
                //     if(!apexChart.toggleSeries('IA')){
                //       apexChart.hideSeries('IA');
                //       apexChart.hideSeries('IA Mínimo');
                //       apexChart.hideSeries('IA Máximo');
                //     }else{
                //       apexChart.showSeries('IA')
                //       apexChart.showSeries('IA Mínimo');
                //       apexChart.showSeries('IA Máximo');
                //     }
              
                //     if(!apexChart.toggleSeries('SIRD')){
                //       apexChart.hideSeries('SIRD');
                //       apexChart.hideSeries('SIRD Mínimo');
                //       apexChart.hideSeries('SIRD Máximo');
                //     }else{
                //       apexChart.showSeries('SIRD');
                //       apexChart.showSeries('SIRD Mínimo');
                //       apexChart.showSeries('SIRD Máximo');
                //     }
                  
                // }
              },
            },
            annotations: {
              xaxis: [
                {
                  x: new Date("04 Abr 2020").getTime(),
                  strokeDashArray: 0,
                  borderColor: "#775DD0",
                  label: {
                    borderColor: "#775DD0",
                    style: {
                      color: "#fff",
                      background: "#775DD0"
                    },
                    text: "Anno Test"
                  }
                },
                {
                  x: new Date("04 Mai 2020").getTime(),
                  x2: new Date("04 Jun 2020").getTime(),
                  fillColor: "#B3F7CA",
                  opacity: 0.4,
                  label: {
                    borderColor: "#B3F7CA",
                    style: {
                      fontSize: "10px",
                      color: "#fff",
                      background: "#00E396"
                    },
                    offsetY: -10,
                    text: "X-axis range"
                  }
                }
              ],

            },
            xaxis: {
              categories: []
            },
            stroke: {
              curve: 'straight'
            },   
          };
          // this.getdashboard();
      }
    
      getdashboard(obj?) {

        // this.dashboardService.getConfirmadosDaily().subscribe(obj => {         
        
          var _labels = obj.real.data.concat(obj.IA.data);
          
          var realLength = obj.real.data.length;
          var quantidade_real = obj.real.quantidade;
          var quantidade_IA = Array(realLength-1)
                              .fill(null).concat(obj.IA.quantidade);
          var quantidade_SIRD = Array(realLength-1)
                              .fill(null).concat(obj.SIRD.quantidade);
          
          var quantidade_IA_min = Array(realLength-1).fill(null).concat(obj.IA.minimo);
          var quantidade_SIRD_min = Array(realLength-1).fill(null).concat(obj.SIRD.minimo);

          var quantidade_IA_max = Array(realLength-1).fill(null).concat(obj.IA.maximo);
          var quantidade_SIRD_max = Array(realLength-1).fill(null).concat(obj.SIRD.maximo);
          
          this.apexChart = this.chart;
          this.apexupdate(quantidade_real, quantidade_IA, _labels,quantidade_SIRD, quantidade_IA_min, quantidade_IA_max, quantidade_SIRD_min, quantidade_SIRD_max);
          this.apexChart.hideSeries('SIRD');
          // this.apexChart.hideSeries('SIRD Mínimo');
          // this.apexChart.hideSeries('SIRD Máximo');
          // this.apexChart.hideSeries('IA Mínimo');
          // this.apexChart.hideSeries('IA Máximo');

          //this.checkSeriesIfShowing(this.apexChart);
      // });
    };

    responseDashboard(cases :any): void{
      let obj = cases.Confirmed.Daily;
      //console.log(obj);
      var _labels = obj.real.date.concat(obj.IA.date)

      var realLength = obj.real.date.length;
      var quantidade_real = obj.real.quantity;
      var quantidade_IA = Array(realLength-1)
                          .fill(null).concat(obj.IA.quantity)
      var quantidade_SIRD = Array(realLength-1)
                            .fill(null).concat(obj.SIRD.quantity)
    
        var quantidade_IA_min = Array(realLength-1).fill(null).concat(obj.IA.minimo);
        var quantidade_SIRD_min = Array(realLength-1).fill(null).concat(obj.SIRD.minimo);

        var quantidade_IA_max = Array(realLength-1).fill(null).concat(obj.IA.maximo);
        var quantidade_SIRD_max = Array(realLength-1).fill(null).concat(obj.SIRD.maximo);
        
        this.apexChart = this.chart;
        this.apexupdate(quantidade_real, quantidade_IA, _labels,quantidade_SIRD, quantidade_IA_min, quantidade_IA_max, quantidade_SIRD_min, quantidade_SIRD_max);
        this.apexChart.hideSeries('SIRD');
        // this.apexChart.hideSeries('SIRD Mínimo');
        // this.apexChart.hideSeries('SIRD Máximo');
        // this.apexChart.hideSeries('IA Mínimo');
        // this.apexChart.hideSeries('IA Máximo');
    };

    apexupdate(real, IA, label, SIRD, IA_MIN, IA_MAX, SIRD_MIN, SIRD_MAX){     
      // let restrictiveDayInit = [];
      // //let restrictiveDayEnd;
      // let restrictiveType= [];
      
      // this.simulationService.getRestrictive().subscribe(obj => {
      //   console.log(obj);
        
      //   for(var x=0; x < obj.data.length; x++){
      //     // restrictiveDayInit.push(obj.data[x]);
      //     // restrictiveType.push(obj.tipo[x]);

      //     this.xAxisAnnotationArray.push({
      //       x: obj.data[x],
      //       strokeDashArray: 0,
      //       borderColor: "#775DD0",
      //       label: {
      //         borderColor: "#775DD0",
      //         style: {
      //           color: "#fff",
      //           background: "#775DD0"
      //         },
      //         text: obj.tipo[x]
      //       }
      //     })
      //   }
      // }
      // );

      //console.log(restrictiveDayInit);

      this.apexChart.updateSeries([
        { name: "Real", data: real }, 
        { name: "IA", data: IA },
        // { name: "IA Mínimo", data: IA_MIN },
        // { name: "IA Máximo", data: IA_MAX },
        { name: "SIRD", data: SIRD},
        // { name: "SIRD Mínimo", data: SIRD_MIN},
        // { name: "SIRD Máximo", data: SIRD_MAX}
      ]);
      
      this.apexChart.updateOptions(
        { 
          xaxis: 
            { categories: label.slice(1) },
          stroke: {
              curve: 'straight',
              dashArray:[0,5,5]
            },
          chart:{
            dataLabels: {
              enabled : false
            }
        },
        annotations: {
          xaxis: this.xAxisAnnotationArray,
      }
    })
      this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        this.chart.updateSeries([
          { name: this.translateService.instant('DASHBOARD.REAL_CHART'), data: real }, 
          { name: this.translateService.instant('DASHBOARD.IA_CHART'), data: IA },
          { name: this.translateService.instant('DASHBOARD.SIRD_CHART'), data: SIRD }
        ])
      })
    }

    checkSeriesIfShowing(chart){
      return true;
    }
    
}