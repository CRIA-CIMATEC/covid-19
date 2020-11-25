import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LayoutConfigService, TranslationService } from '../../../../../core/_base/layout';
import { DashboardService } from '../../../../../services/dashboard.service';
import { SimulationService } from '../../../../../services/simulation.service';
import { CenarioService } from '../../../../../services/cenario.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';
 


import { ViewEncapsulation, ViewChild, Output, EventEmitter, Input, Type } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { Papa } from 'ngx-papaparse';
import {MatSelectModule} from '@angular/material/select';
import { HttpResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
 
@Component({
    selector: 'plotly-invoices-value-recovery',
    templateUrl: './plotly_invoices_value_recovery.component.html'
})

export class PlotlyInvoicesValueRecoveryComponent implements OnInit {
    ShowMessage1 = true;
    teste: any;
    school: any;
    public: any;
    domestic: any;
    transport: any;
    gather: any;
    travel: any;
    stay: any;
    work: any;
    
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
      CenarioService.ResponseModerate.subscribe(
        x => this.getDashboard(x)
      )
    }
    
    
    
    getDashboard(obj?) {
      this.ShowMessage1 = CenarioService._showMessage;
      
        let obj1 = obj.Notas['NFC-e'].Valor;
        var _labels = obj1.real.data.concat(obj1.IA.data)
      var _reverseLabel = obj1.real.data.concat(obj1.IA.data).reverse()

      var realLength = obj1.real.data.length;
      var quantidade_real = obj1.real.valor;
      var quantidade_IA = Array(realLength)
                          .fill(null).concat(obj1.IA.valor)
      //var quantidade_SIRD = Array(realLength-1)
      //                      .fill(null).concat(obj.SIRD.quantidade)
      var quantidade_IA_min = Array(realLength).fill(null).concat(obj1.IA.minimo);
      //var quantidade_SIRD_min = Array(realLength-1).fill(null).concat(obj.SIRD.minimo);

      var quantidade_IA_max = Array(realLength).fill(null).concat(obj1.IA.maximo);
      //var quantidade_SIRD_max = Array(realLength-1).fill(null).concat(obj.SIRD.maximo);

      this.chartUpdate(quantidade_real, quantidade_IA, _labels, _reverseLabel, quantidade_IA_min, quantidade_IA_max);
      this._detectChanges();
    };

    // chartUpdate(real, IA, label, reverseLabel, IA_MIN, IA_MAX){ 

    // var iaLowerError = {
    //   x: label, 
    //   y: IA_MIN,
    //   // fill: "tonexty", 
    //   fillcolor: "rgba(0,0,0, 1)",  
    //   line: {width: 0}, 
    //   marker: {color: "144"}, 
    //   mode: "lines",
    //   //showlegend: false,
    //   name: this.translateService.instant('PLOT_ERROR.error_ia'),
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
    //   name: this.translateService.instant('PLOT_ERROR.error_ia_max'),
    //   type: "scatter"
    // }
  
    //   //console.log(iaMeanTrace)
    //   //SIRD TRACE
    //   // 
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
    //     data: [realTrace, iaLowerError, iaMeasurement, iaUpperError],
    //     layout: this.layout
    //   }

    //   // this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
    //   //   {this.chartUpdate(real,IA, label, reverseLabel, IA_MIN, IA_MAX); return;}
    //   // })

    //   this._changeDetectorRef.detectChanges();
    //   return;
    // }

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
      // let sirdTrace = {
      //   x: label.concat(reverseLabel),
      //   y: SIRD_MAX.concat(SIRD_MIN.reverse()),
      //   fill: "tozerox", 
      //   fillcolor: "rgba(0,222,222,0.2)", 
      //   line: {color: "transparent"}, 
      //   name: "SIRD Predict", 
      //   //showlegend: false, 
      //   type: "scatter"
      // }
      // let sirdMeanTrace = {
      //   x: label,
      //   y: SIRD, 
      //   line: {color: "rgb(0,222,222)"}, 
      //   mode: "lines", 
      //   name: "SIRD Predict", 
      //   type: "scatter"
      // }
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
        iaMeanTrace = {
          x: label,
          y: IA, 
          line: {color: "rgb(0,176,246)"}, 
          mode: "lines", 
          name: "IA", 
          type: "scatter"
        }
        realTrace = {
          x: label,
          y: real, 
          line: {color: "rgb(0,111,111)"}, 
          mode: "lines", 
          name: "Real", 
          type: "scatter"
        }
        this.updateChart(realTrace, iaMeanTrace, iaTrace)
        this._detectChanges();
      })

      // this.graph = {
      //   data: [realTrace, iaMeanTrace, iaTrace],
      //   layout: this.layout
      // }

      this.updateChart(realTrace, iaMeanTrace, iaTrace)
      this._detectChanges();
      // this._changeDetectorRef.detectChanges();

      // return;
    }

    updateChart(realTrace, iaMeanTrace, iaTrace){
      this.graph = {
        data: [realTrace, iaMeanTrace, iaTrace],
        layout: this.layout,
      }
      this._detectChanges();
    }
    private _detectChanges(): void {
      if (!this._changeDetectorRef['destroyed']) {
        this._changeDetectorRef.detectChanges();
      }
    }
}