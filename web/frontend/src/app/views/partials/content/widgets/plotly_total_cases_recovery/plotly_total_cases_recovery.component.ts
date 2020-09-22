import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LayoutConfigService, TranslationService } from '../../../../../core/_base/layout';
import { DashboardService } from '../../../../../services/dashboard.service';
import { SimulationService } from '../../../../../services/simulation.service';
import { CenarioService } from '../../../../../services/cenario.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';
 
@Component({
    selector: 'plotly-total-cases-recovery',
    templateUrl: './plotly_total_cases_recovery.component.html'
})

export class PlotlyTotalCasesRecoveryComponent implements OnInit {
 

  school: any;
  public: any;
  travel: any;
  stay: any;
  work: any;
  gather: any;
  transport: any;
  domestic: any;
    //@ViewChild('SchoolClosure') SchoolClosure;
  constructor(
        private layoutConfigService: LayoutConfigService,
        private translationService: TranslationService,
        private dashboardService: DashboardService,
        private simulationService: SimulationService,
        private cenarioService: CenarioService,
        private httpClient: HttpClient,
        private translateService: TranslateService,
        private _changeDetectorRef: ChangeDetectorRef
    ) { 
        this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
    }
    
   
    layout = {
      legend:  { orientation: 'h',
      y:-0.5},
      autosize: true,
      paper_bgcolor: "rgb(255,255,255)", 
      plot_bgcolor: "rgb(255,255,255)", 
      xaxis: {
        gridcolor: "rgb(255,255,255)", 
        //range: [0, 9], 
        showgrid: true, 
        showline: false, 
        showticklabels: true, 
        tickcolor: "rgb(127,127,127)", 
        ticks: "outside", 
        zeroline: false
      }, 
      yaxis: {
        gridcolor: "rgb(255,255,255)", 
        showgrid: true, 
        showline: false, 
        showticklabels: true, 
        tickcolor: "rgb(127,127,127)", 
        ticks: "outside", 
        zeroline: false
      }
    }
    config = {
      'displaylogo': false
  }
    public graph = {
        //data: [this.trace2, this.trace5],
        data: [],
        layout: this.layout,
        config: this.config,
    };
    

    ngOnInit(){
      CenarioService.ResponseModerate.subscribe(
        x => this.getDashboard(x)
      )
    }
   
    getDashboard(obj?) {

      // this.dashboardService.getConfirmadosTotal().subscribe(obj => {
        console.log(obj)
        let resp = obj.Confirmados.Acumulado;
        var _labels = resp.real.data.concat(resp.IA.data);
        var _reverseLabel = resp.real.data.concat(resp.IA.data).reverse()
        
        var realLength = resp.real.data.length;
        var quantidade_real = resp.real.quantidade;
        var quantidade_IA = Array(realLength).fill(null).concat(resp.IA.quantidade);
        
        
        var quantidade_IA_min = Array(realLength).fill(null).concat(resp.IA.minimo);
        
  
        var quantidade_IA_max = Array(realLength).fill(null).concat(resp.IA.maximo);
        
        
        // this.apexChart = this.chart;
        this.chartUpdate(quantidade_real, quantidade_IA, _labels,_reverseLabel, quantidade_IA_min, quantidade_IA_max);
        this._detectChanges();
        // this.apexChart.hideSeries('SIRD')
    // });
  };

    // responseDashboard(resp :any): void{
    //   // console.log("response dashboard total cases rd")
    //   // console.log(resp);
    //   //let obj = resp.body.Confirmados.Acumulado;
    //   let obj = resp.Confirmados.Acumulado;
    //   // console.log(obj)
      
    //   var _labels = obj.real.data.concat(obj.IA.data)
    //   var _reverseLabel = obj.real.data.concat(obj.IA.data).reverse()

    //   var realLength = obj.real.data.length;
    //   var quantidade_real = obj.real.quantidade;
    //   var quantidade_IA = Array(realLength)
    //                       .fill(null).concat(obj.IA.quantidade)
    // //   var quantidade_SIRD = Array(realLength)
    // //                         .fill(null).concat(obj.SIRD.quantidade)
    //   var quantidade_IA_min = Array(realLength).fill(null).concat(obj.IA.minimo);
    // //   var quantidade_SIRD_min = Array(realLength).fill(null).concat(obj.SIRD.minimo);

    //   var quantidade_IA_max = Array(realLength).fill(null).concat(obj.IA.maximo);
    // //   var quantidade_SIRD_max = Array(realLength).fill(null).concat(obj.SIRD.maximo);

    //   this.chartUpdate(quantidade_real, quantidade_IA, _labels, _reverseLabel, quantidade_IA_min, quantidade_IA_max);
    //   this._detectChanges();
    // };


    chartUpdate(real, IA, label, reverseLabel, IA_MIN, IA_MAX){ 
      // console.log("Chart Update")
      
      //IA TRACE
      let iaTrace = {
        x: label.concat(reverseLabel),
        y: IA_MAX.concat(IA_MIN.reverse()),
        fill: "tozerox", 
        fillcolor: "rgba(0,176,246,0.2)", 
        line: {color: "transparent"}, 
        name: this.translateService.instant('PLOT_ERROR.error_IA'),
        //showlegend: false, 
        type: "scatter"
      }
      
      //console.log(iaTrace)
      let iaMeanTrace = {
        x: label,
        y: IA, 
        line: {color: "rgb(0,176,246)"}, 
        mode: "lines", 
        name: "IA", 
        type: "scatter"
      }
  
      //console.log(iaMeanTrace)
      //SIRD TRACE
    //   let sirdTrace = {
    //     x: label.concat(reverseLabel),
    //     y: SIRD_MAX.concat(SIRD_MIN.reverse()),
    //     fill: "tozerox", 
    //     fillcolor: "rgba(0,222,222,0.2)", 
    //     line: {color: "transparent"}, 
    //     name: this.translateService.instant('PLOT_ERROR.error_sird'),
    //     //showlegend: false, 
    //     type: "scatter"
    //   }
    //   let sirdMeanTrace = {
    //     x: label,
    //     y: SIRD, 
    //     line: {color: "rgb(0,222,222)"},  
    //     mode: "lines", 
    //     name: "SIRD", 
    //     type: "scatter"
     
    //   }
      //REAL TRACE
      let realTrace = {
        x: label,
        y: real, 
        line: {color: "rgb(0,111,111)"}, 
        mode: "lines", 
        name: "Real", 
        type: "scatter"
      }
 
      this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        //IA TRACE
      iaTrace = {
        x: label.concat(reverseLabel),
        y: IA_MAX.concat(IA_MIN),
        fill: "tozerox", 
        fillcolor: "rgba(0,176,246,0.2)", 
        line: {color: "transparent"}, 
        name: this.translateService.instant('PLOT_ERROR.error_IA'),
        //showlegend: false, 
        type: "scatter"
      }
      
      //console.log(iaTrace)
      iaMeanTrace = {
        x: label,
        y: IA, 
        line: {color: "rgb(0,176,246)"}, 
        mode: "lines", 
        name: "IA", 
        type: "scatter"
      }
      //console.log(iaMeanTrace)
      //SIRD TRACE
    //   sirdTrace = {
    //     x: label.concat(reverseLabel),
    //     y: SIRD_MAX.concat(SIRD_MIN),
    //     fill: "tozerox", 
    //     fillcolor: "rgba(0,222,222,0.2)", 
    //     line: {color: "transparent"}, 
    //     name: this.translateService.instant('PLOT_ERROR.error_sird'),
    //     //showlegend: false, 
    //     type: "scatter"
    //   }
    //   sirdMeanTrace = {
    //     x: label,
    //     y: SIRD, 
    //     line: {color: "rgb(0,222,222)"}, 
    //     mode: "lines", 
    //     name: "SIRD", 
    //     type: "scatter"
    //   }
      //REAL TRACE
      realTrace = {
        x: label,
        y: real, 
        line: {color: "rgb(0,111,111)"}, 
        mode: "lines", 
        name: "Real", 
        type: "scatter"
      }
      this.updateChart(realTrace, iaMeanTrace, iaTrace)
      })
      
      this.updateChart(realTrace, iaMeanTrace, iaTrace)
      this._detectChanges();
      // this._changeDetectorRef.detectChanges();
      // return;
    }
  
    updateChart(realTrace, iaMeanTrace, iaTrace){
      this.graph = {
        data: [realTrace, iaMeanTrace, iaTrace],
        layout: this.layout,
        config: this.config,
      }
      this._detectChanges();
    }
    private _detectChanges(): void {
      if (!this._changeDetectorRef['destroyed']) {
        this._changeDetectorRef.detectChanges();
      }
    }
}