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
	selector: 'apex_NF_Quantity',
	templateUrl: './apex_NF_Quantity.component.html',
	styleUrls: ['./apex_NF_Quantity.component.scss']
})

export class ApexNFQuantityComponent implements OnInit {

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

        SimulationService.emitirInvoices.subscribe(
          x => this.responseDashboard(x)
        )
        DashboardService.CountryResponse1.subscribe(
          y => this.getdashboard(y)
        )
         
        this.chartOptions = {
            series: [
              // {
              //   name: this.translateService.instant('DASHBOARD.REAL_CHART'),
              //   data: []
              // },
              // {
              //   name: this.translateService.instant('DASHBOARD.IA_CHART'),
              //   data: []
              // }
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

        // this.dashboardService.getInvoicesQuantity().subscribe(obj => {
          //console.log()
        
          //var _labels = obj.real.data.concat(obj.IA.data);
          
          // var realLength = obj.real.data.length;
          // var quantidade_real = obj.real.quantidade;
          // var quantidade_IA = Array(realLength-1).fill(null).concat(obj.IA.quantidade);

          //console.log("obj['BP-e'].date:",obj['BP-e'].date);
            
          var _labels = obj['NFC-e']
              .date;
      
          //var realLength = obj['BP-e'].date.length;
          
          var nfc_real = obj['NFC-e'].quantity;
          

          this.apexChart = this.chart;
          this.apexupdate(nfc_real, _labels);
          

      // });
    };
    apexupdate(nfc_real, label){     
      this.chart.updateSeries([
         
        { name: "NFC-e", data: nfc_real }
       
      ])
      this.chart.updateOptions(
        { 
          xaxis: 
            { categories: label }
          
        }
      )
      // this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      //   this.chart.updateSeries([
      //     //{ name: this.translateService.instant('DASHBOARD.REAL_CHART'), data: real }, 
      //     //{ name: this.translateService.instant('DASHBOARD.IA_CHART'), data: real2 }
          
      //   ])
      // })
    }
    
    responseDashboard(invoices :any): void{
      let obj = invoices.NFQuantity.Daily;
      console.log(obj);
      // var _labels = obj.real.data.concat(obj.IA.data)

      // var realLength = obj.real.data.length;
      // var quantidade_real = obj.real.quantity;
      // var quantidade_IA = Array(realLength-1)
      //                     .fill(null).concat(obj.IA.quantity)

      //console.log("obj['BP-e'].date:",obj['BP-e'].date);
            
      var _labels = obj['NFC-e'].date;
      
      //var realLength = obj['BP-e'].data.length;
      
      var nfc_real = obj['NFC-e'].quantity;

      this.apexChart = this.chart;
      this.apexupdate(nfc_real, _labels);
    
    };

  //   getdashboard() {
  //     this.dashboardService.getInvoicesQuantity().subscribe(obj => {
  //       //console.log()
      
  //       //var _labels = obj.real.data.concat(obj.IA.data);
        
  //       // var realLength = obj.real.data.length;
  //       // var quantidade_real = obj.real.quantidade;
  //       // var quantidade_IA = Array(realLength-1).fill(null).concat(obj.IA.quantidade);

  //       //console.log("obj['BP-e'].date:",obj['BP-e'].date);
          
  //       var _labels = obj['BP-e']
  //           .date.concat(obj['CT-e'].date)
  //           .concat(obj['CT-e OS'].date)
  //           .concat(obj['MDF-e'].date)
  //           .concat(obj['NF-e'].date)
  //           .concat(obj['NFC-e'].date);
    
  //       //var realLength = obj['BP-e'].date.length;
  //       var bpe_real = obj['BP-e'].quantity;
  //       var cte_real = obj['CT-e'].quantity;
  //       var cteos_real = obj['CT-e OS'].quantity;
  //       var mdfe_real = obj['MDF-e'].quantity;
  //       var nfe_real = obj['NF-e'].quantity;
  //       var nfc_real = obj['NFC-e'].quantity;
        

  //       this.apexChart = this.chart;
  //       this.apexupdate(bpe_real,cte_real,cteos_real,mdfe_real,nfe_real,nfc_real, _labels);
  //       this.apexChart.hideSeries('BP-e');
  //       this.apexChart.hideSeries('CT-e');
  //       this.apexChart.hideSeries('CT-e OS');
  //       this.apexChart.hideSeries('MDF-e');
  //       this.apexChart.hideSeries('NF-e')

  //   });
  // };
  // apexupdate(bpe_real,cte_real,cteos_real,mdfe_real,nfe_real,nfc_real, label){     
  //   this.chart.updateSeries([
  //     { name: "BP-e", data: bpe_real  }, 
  //     { name: "CT-e", data: cte_real },
  //     { name: "CT-e OS", data: cteos_real  }, 
  //     { name: "MDF-e", data: mdfe_real },
  //     { name: "NF-e", data: nfe_real  }, 
  //     { name: "NFC-e", data: nfc_real }
     
  //   ])
  //   this.chart.updateOptions(
  //     { 
  //       xaxis: 
  //         { categories: label.slice(1) }
        
  //     }
  //   )
  //   this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
  //     this.chart.updateSeries([
  //       //{ name: this.translateService.instant('DASHBOARD.REAL_CHART'), data: real }, 
  //       //{ name: this.translateService.instant('DASHBOARD.IA_CHART'), data: real2 }
        
  //     ])
  //   })
  // }
  
  // responseDashboard(invoices :any): void{
  //   let obj = invoices.NFQuantity.Daily;
  //   console.log(obj);
  //   // var _labels = obj.real.data.concat(obj.IA.data)

  //   // var realLength = obj.real.data.length;
  //   // var quantidade_real = obj.real.quantity;
  //   // var quantidade_IA = Array(realLength-1)
  //   //                     .fill(null).concat(obj.IA.quantity)

  //   //console.log("obj['BP-e'].date:",obj['BP-e'].date);
          
  //   var _labels = obj['BP-e'].date
  //       .concat(obj['CT-e'].date)
  //       .concat(obj['CT-e OS'].date)
  //       .concat(obj['MDF-e'].date)
  //       .concat(obj['NF-e'].date)
  //       .concat(obj['NFC-e'].date);
    
  //   //var realLength = obj['BP-e'].data.length;
  //   var bpe_real = obj['BP-e'].quantity;
  //   var cte_real = obj['CT-e'].quantity;
  //   var cteos_real = obj['CT-e OS'].quantity;
  //   var mdfe_real = obj['MDF-e'].quantity;
  //   var nfe_real = obj['NF-e'].quantity;
  //   var nfc_real = obj['NFC-e'].quantity;

  //   this.apexChart = this.chart;
  //   this.apexupdate(bpe_real,cte_real,cteos_real,mdfe_real,nfe_real,nfc_real, _labels);
  //   this.apexChart.hideSeries('BP-e');
  //   this.apexChart.hideSeries('CT-e');
  //   this.apexChart.hideSeries('CT-e OS');
  //   this.apexChart.hideSeries('MDF-e');
  //   this.apexChart.hideSeries('NF-e')
  // };
}