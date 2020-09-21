import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LayoutConfigService, TranslationService } from '../../../../../core/_base/layout';
import { DashboardService } from '../../../../../services/dashboard.service';
import { SimulationService } from '../../../../../services/simulation.service';
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
    selector: 'plotly-daily-deaths',
    templateUrl: './plotly_daily_deaths.component.html'
})

export class PlotlyDailyDeathsComponent {
    
      constructor(
        private layoutConfigService: LayoutConfigService,
        private translationService: TranslationService,
        private dashboardService: DashboardService,
        private simulationService: SimulationService,
        private httpClient: HttpClient,
        private translateService: TranslateService,
        private _changeDetectorRef: ChangeDetectorRef
    ) { 
        this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
    }
    
     
    // trace5 = {
    //   x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 
    //   y: [5, 2.5, 5, 7.5, 5, 2.5, 7.5, 4.5, 5.5, 5], 
    //   line: {color: "rgb(0,176,246)"}, 
    //   mode: "lines", 
    //   name: "Premium", 
    //   type: "scatter"
    // };

    // trace2 = {
    //   x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
    //      9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 
    //   y: [5.5, 3, 5.5, 8, 6, 3, 8, 5, 6, 5.5, //MAXIMO
    //       4.75, 5, 4, 7, 2, 4, 7, 4.4, 2, 4.5], //MINIMO
    //   fill: "tozerox", 
    //   fillcolor: "rgba(0,176,246,0.2)", 
    //   line: {color: "transparent"}, 
    //   name: "Premium", 
    //   //showlegend: false, 
    //   type: "scatter"
    // };
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
    public graph = {
        //data: [this.trace2, this.trace5],
        data: [],
        layout: this.layout,
    };

    ngOnInit(){
      SimulationService.emitirCases.subscribe(
        x => this.responseDashboard(x)
      )
      DashboardService.CountryResponse3.subscribe(
        y => this.getDashboard(y)
      )
    }

    getDashboard(obj?) {

      // this.dashboardService.getMortesDaily().subscribe(obj => {
      //   console.log()
      
        var _labels = obj.real.data.concat(obj.IA.data);
        var _reverseLabel = obj.real.data.concat(obj.IA.data).reverse()

        var realLength = obj.real.data.length;
        var quantidade_real = obj.real.quantidade;
        var quantidade_IA = Array(realLength).fill(null).concat(obj.IA.quantidade);
        var quantidade_SIRD = Array(realLength).fill(null).concat(obj.SIRD.quantidade);
        
        var quantidade_IA_min = Array(realLength).fill(null).concat(obj.IA.minimo);
        var quantidade_SIRD_min = Array(realLength).fill(null).concat(obj.SIRD.minimo);

        var quantidade_IA_max = Array(realLength).fill(null).concat(obj.IA.maximo);
        var quantidade_SIRD_max = Array(realLength).fill(null).concat(obj.SIRD.maximo);
        
        // this.apexChart = this.chart;
        this.chartUpdate(quantidade_real, quantidade_IA, _labels, _reverseLabel,quantidade_SIRD, quantidade_IA_min, quantidade_IA_max, quantidade_SIRD_min, quantidade_SIRD_max);
        this._detectChanges();
        // this.apexChart.hideSeries('SIRD')
  };

    responseDashboard(resp :any): void{
      //console.log("response dashboard")
      //console.log(resp);
      let obj = resp.Obitos.Diario;
      var _labels = obj.real.data.concat(obj.IA.data)
      var _reverseLabel = obj.real.data.concat(obj.IA.data).reverse()

      var realLength = obj.real.data.length;
      var quantidade_real = obj.real.quantidade;
      var quantidade_IA = Array(realLength)
                          .fill(null).concat(obj.IA.quantidade)
      var quantidade_SIRD = Array(realLength)
                            .fill(null).concat(obj.SIRD.quantidade)
      var quantidade_IA_min = Array(realLength).fill(null).concat(obj.IA.minimo);
      var quantidade_SIRD_min = Array(realLength).fill(null).concat(obj.SIRD.minimo);

      var quantidade_IA_max = Array(realLength).fill(null).concat(obj.IA.maximo);
      var quantidade_SIRD_max = Array(realLength).fill(null).concat(obj.SIRD.maximo);

      this.chartUpdate(quantidade_real, quantidade_IA, _labels, _reverseLabel,quantidade_SIRD, quantidade_IA_min, quantidade_IA_max, quantidade_SIRD_min, quantidade_SIRD_max);
      this._detectChanges();
    };

       // chartUpdate(real, IA, label, reverseLabel, SIRD, IA_MIN, IA_MAX, SIRD_MIN, SIRD_MAX){ 
    //   console.log("Chart Update") 

       // var iaLowerError = {
    //   x: label, 
    //   y: IA_MIN,
    //   // fill: "tonexty", 
    //   fillcolor: "rgba(0,0,0, 1)",  
    //   line: {width: 0}, 
    //   marker: {color: "144"}, 
    //   mode: "lines",
    //   //showlegend: false,
    //   name: this.translateService.instant('PLOT_ERROR.error_sird_min'), 
    //   type: "scatter"
    // };

      // var iaMeasurement = {
    //   x: label, 
    //   y: IA,
    //   fill: "tonexty", 
    //   fillcolor: "rgba(227, 30, 30, 0.3)", 
    //   line: {color: "rgb(127,50,77)"}, 
    //   mode: "lines", 
    //   name: "IA", 
    //   type: "scatter"
    // };

    // var iaUpperError = {
    //   x: label, 
    //   y: IA_MAX,
    //   fill: "tonexty", 
    //   fillcolor: "rgba(227, 30, 30, 0.3)", 
    //   line: {width: 0, color: "rgb(0,255,0)"}, 
    //   marker: {color: "144"}, 
    //   mode: "lines", 
    //   name: this.translateService.instant('PLOT_ERROR.error_sird_max'), 
    //   type: "scatter"
    // }
  
    //   //console.log(iaMeanTrace)
    //   //SIRD TRACE
    //   var sirdLowerError = {
    //     x: label, 
    //     y: SIRD_MIN,
    //     // fill: "tonexty", 
    //     // fillcolor: "rgba(0,76,146, 0.3)",  
    //     line: {width: 0, color: "rgb(0,0,255)"}, 
    //     marker: {color: "144"}, 
    //     mode: "lines",
    //     //showlegend: false,
    //     name: this.translateService.instant('PLOT_ERROR.error_sird_min'), 
    //     type: "scatter"
    //   };
    //   var sirdMeasurement = {
    //     x: label, 
    //     y: SIRD,
    //     fill: "tonexty", 
    //     fillcolor: "rgba(255, 168, 168, 0.3)", 
    //     line: {color: "rgb(128,60,120)"}, 
    //     mode: "lines", 
    //     name: "SIRD", 
    //     type: "scatter"
    //   };
  
    //   var sirdUpperError = {
    //     x: label, 
    //     y: SIRD_MAX,
    //     fill: "tonexty", 
    //     fillcolor: "rgba(255, 168, 168, 0.3)", 
    //     line: {width: 0,color: "rgb(128,60,120)"}, 
    //     marker: {color: "144"}, 
    //     mode: "lines", 
    //     name: this.translateService.instant('PLOT_ERROR.error_sird_max'), 
    //     type: "scatter"
    //   }
    //   //REAL TRACE
    //   let realTrace = {
    //     x: label,
    //     y: real, 
    //     line: {color: "rgb(0,111,111)"}, 
    //     mode: "lines", 
    //     name: "Real", 
    //     type: "scatter"
    //   }

    //   this.graph = {
    //     //data: [realTrace, iaMeanTrace, iaTrace, sirdMeanTrace, sirdTrace],
    //     data: [realTrace, iaLowerError, iaMeasurement, iaUpperError, sirdLowerError, sirdMeasurement, sirdUpperError],
    //     layout: this.layout
    //   }

    //   // this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
    //   //   {this.chartUpdate(real,IA, label, reverseLabel, SIRD, IA_MIN, IA_MAX, SIRD_MIN, SIRD_MAX); return;}
    //   // });
    

    //   this._changeDetectorRef.detectChanges();
    //   return;
    // }

    chartUpdate(real, IA, label, reverseLabel, SIRD, IA_MIN, IA_MAX, SIRD_MIN, SIRD_MAX){ 
      // console.log("Chart Update")
      
      //IA TRACE
      let iaTrace = {
        x: label.concat(reverseLabel),
        y: IA_MAX.concat(IA_MIN.reverse()),
        fill: "tozerox", 
        fillcolor: "rgba(0,176,246,0.2)", 
        line: {color: "transparent"}, 
        name: this.translateService.instant('PLOT_ERROR.error_IA'),
        // showlegend: false, 
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
      let sirdTrace = {
        x: label.concat(reverseLabel),
        y: SIRD_MAX.concat(SIRD_MIN.reverse()),
        fill: "tozerox", 
        fillcolor: "rgba(0,222,222,0.2)", 
        line: {color: "transparent"}, 
        name: this.translateService.instant('PLOT_ERROR.error_sird'),
        //showlegend: false, 
        type: "scatter"
      }
      let sirdMeanTrace = {
        x: label,
        y: SIRD, 
        line: {color: "rgb(0,222,222)"}, 
        mode: "lines", 
        name: "SIRD", 
        type: "scatter"
      
      }
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
        // showlegend: false, 
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
      sirdTrace = {
        x: label.concat(reverseLabel),
        y: SIRD_MAX.concat(SIRD_MIN),
        fill: "tozerox", 
        fillcolor: "rgba(0,222,222,0.2)", 
        line: {color: "transparent"}, 
        name: this.translateService.instant('PLOT_ERROR.error_sird'),
        //showlegend: false, 
        type: "scatter"
      }
      sirdMeanTrace = {
        x: label,
        y: SIRD, 
        line: {color: "rgb(0,222,222)"}, 
        mode: "lines", 
        name: "SIRD", 
        type: "scatter"
      }
      //REAL TRACE
      realTrace = {
        x: label,
        y: real, 
        line: {color: "rgb(0,111,111)"}, 
        mode: "lines", 
        name: "Real", 
        type: "scatter"        
      }
      this.updateChart(realTrace, iaMeanTrace, iaTrace, sirdMeanTrace, sirdTrace)
      this._detectChanges();  
    })
      
      this.updateChart(realTrace, iaMeanTrace, iaTrace, sirdMeanTrace, sirdTrace)
      this._detectChanges();
      // this._changeDetectorRef.detectChanges();
      // return;
    }
      
    updateChart(realTrace, iaMeanTrace, iaTrace, sirdMeanTrace, sirdTrace){
      this.graph = {
        data: [realTrace, iaMeanTrace, iaTrace, sirdMeanTrace, sirdTrace],
        layout: this.layout
      }
      this._detectChanges();
    }
    private _detectChanges(): void {
      if (!this._changeDetectorRef['destroyed']) {
        this._changeDetectorRef.detectChanges();
      }
    }
}