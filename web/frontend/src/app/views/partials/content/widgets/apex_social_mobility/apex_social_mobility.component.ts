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
    ApexAnnotations
  } from "ng-apexcharts";
  
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SimulationService } from '../../../../../services/simulation.service';
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
	selector: 'apex_social_mobility',
	templateUrl: './apex_social_mobility.component.html',
	styleUrls: ['./apex_social_mobility.component.scss']
})

export class ApexSocialMobilityComponent implements OnInit {

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
        DashboardService.CountryResponse2.subscribe(
          y => this.getdashboard(y)
        )
         
        this.chartOptions = {
            series: [
              {
                name: this.translateService.instant('DASHBOARD.groceryandpharmacy_CHART'),
                data: []
              },
              {
                name: this.translateService.instant('DASHBOARD.retailandrecreation_CHART'),
                data: []
              },
              {
                name: this.translateService.instant('DASHBOARD.parks_CHART'),
                data: []
              },
              {
                name: this.translateService.instant('DASHBOARD.transitstations_CHART'),
                data: []
              },
              {
                name: this.translateService.instant('DASHBOARD.workplaces_CHART'),
                data: []
              },
              {
                name: this.translateService.instant('DASHBOARD.residential_CHART'),
                data: []
              }
            ],
            chart: {
              height: 350,
              type: "line"
            },
            xaxis: {
              categories: []
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'straight'
            },         
          };
          // this.getdashboard();
          
      }
    
      getdashboard(obj?) {

        // this.dashboardService.getMobility().subscribe(obj => {
        //   console.log(obj)
        
          //var _labels = obj.groceryandpharmacy.date;
          // var _labels = obj['grocery and pharmacy'].date;
          var _labels = obj['Varejo e Recreação']['date']
          .concat(obj['Mercearia e Farmácia']['date']);
          // .concat(obj['parks'].date)
          // .concat(obj['transit stations'].date)
          // .concat(obj['workplaces'].date)
          // .concat(obj['residential'].date);

          var groceryandpharmacyLength = obj['Mercearia e Farmácia'].date.length;
          var percent_retailandrecreation = obj['Varejo e Recreação'].percent;
          var percent_groceryandpharmacy = obj['Mercearia e Farmácia'].percent;
          var percent_parks = obj['Parques'].percent;
          var percent_transitstations = obj['Estações de Transporte'].percent;
          var percent_workplaces = obj['Locais de Trabalho'].percent;
          var percent_residential = obj['Residencial'].percent;
          
          
          
          this.apexChart = this.chart;
          this.apexupdate(percent_retailandrecreation,percent_groceryandpharmacy,percent_parks,percent_transitstations,percent_workplaces,percent_residential, _labels);
          this.apexChart.hideSeries('Mercearia e Farmácia');
          this.apexChart.hideSeries('Varejo e Recreação');
          this.apexChart.hideSeries('Parques');
          this.apexChart.hideSeries('Estações de Transporte');
          this.apexChart.hideSeries('Locais de Trabalho')
      // });
      
      
      

    };
    apexupdate(percent_retailandrecreation,percent_groceryandpharmacy,percent_parks,percent_transitstations,percent_workplaces,percent_residential, label){     
      this.chart.updateSeries([
        { name: "Varejo e Recreação", data: percent_retailandrecreation }, 
        { name: "Mercearia e Farmácia", data: percent_groceryandpharmacy }, 
        { name: "Parques", data: percent_parks }, 
        { name: "Estações de Transporte", data: percent_transitstations }, 
        { name: "Locais de Trabalho", data: percent_workplaces }, 
        { name: "Residencial", data: percent_residential }
        
        
      ])
      this.chart.updateOptions(
        { 
          xaxis: 
            { categories: label },
          
        }
      )
      this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        this.chart.updateSeries([
          { name: this.translateService.instant('DASHBOARD.retailandrecreation_CHART'), data: percent_retailandrecreation },
          { name: this.translateService.instant('DASHBOARD.groceryandpharmacy_CHART'), data: percent_groceryandpharmacy },
          { name: this.translateService.instant('DASHBOARD.parks_CHART'), data: percent_parks },
          { name: this.translateService.instant('DASHBOARD.transitstations_CHART'), data: percent_transitstations },
          { name: this.translateService.instant('DASHBOARD.workplaces_CHART'), data: percent_workplaces },
          { name: this.translateService.instant('DASHBOARD.residential_CHART'), data: percent_residential }
          
         
        ])
      })
    }    
}