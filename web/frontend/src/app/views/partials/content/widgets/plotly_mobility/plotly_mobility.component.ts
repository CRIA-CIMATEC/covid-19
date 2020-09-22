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
    selector: 'plotly-mobility',
    templateUrl: './plotly_mobility.component.html'
})

export class PlotlyMobilityComponent {
    
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
        zeroline: false,
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
      DashboardService.CountryResponse2.subscribe(
        y => this.getDashboard(y)
      )
    }

    getDashboard(obj?) {
        //   console.log(obj)

          var _labels = obj['Varejo e Recreação']['date']
          .concat(obj['Mercearia e Farmácia']['date']);
          
          var groceryandpharmacyLength = obj['Mercearia e Farmácia'].date.length;
          var percent_retailandrecreation = obj['Varejo e Recreação'].percent;
          var percent_groceryandpharmacy = obj['Mercearia e Farmácia'].percent;
          var percent_parks = obj['Parques'].percent;
          var percent_transitstations = obj['Estações de Transporte'].percent;
          var percent_workplaces = obj['Locais de Trabalho'].percent;
          var percent_residential = obj['Residencial'].percent;
          
          
          
        //   this.apexChart = this.chart;
          this.chartUpdate(percent_retailandrecreation,percent_groceryandpharmacy,percent_parks,percent_transitstations,percent_workplaces,percent_residential, _labels);
          this._detectChanges();
          //   this.apexChart.hideSeries('Mercearia e Farmácia');
        //   this.apexChart.hideSeries('Varejo e Recreação');
        //   this.apexChart.hideSeries('Parques');
        //   this.apexChart.hideSeries('Estações de Transporte');
        //   this.apexChart.hideSeries('Locais de Trabalho')
    };


    chartUpdate(percent_retailandrecreation,percent_groceryandpharmacy,percent_parks,percent_transitstations,percent_workplaces,percent_residential, label){ 
      // console.log("Chart Update")
      
      //retailandrecreation Trace
      let retailandrecreation = {
        x: label,
        y: percent_retailandrecreation,
        line: {color: "rgb(0, 143, 251)"}, 
        mode: "lines",
        name: this.translateService.instant('DASHBOARD.retailandrecreation_CHART'), 
        type: "scatter"
      }
      
      //groceryandpharmacy Trace
      let groceryandpharmacy = {
        x: label,
        y: percent_groceryandpharmacy, 
        line: {color: "rgb(139, 117, 215)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.groceryandpharmacy_CHART'), 
        type: "scatter"
      }
      
      //parks TRACE
      let parks = {
        x: label,
        y: percent_parks, 
        line: {color: "rgb(255, 69, 96)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.parks_CHART'),
        type: "scatter"
      }

      //transitstations TRACE
      let transitstations = {
        x: label,
        y: percent_transitstations, 
        line: {color: "rgb(254, 176, 25)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.transitstations_CHART'), 
        type: "scatter"
      }

      //workplaces TRACE
      let workplaces = {
        x: label,
        y: percent_workplaces, 
        line: {color: "rgb(38, 231, 166)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.workplaces_CHART'),
        type: "scatter"
      }

      //residential TRACE
      let residential = {
        x: label,
        y: percent_residential, 
        line: {color: "rgb(0, 0, 0)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.residential_CHART'), 
        type: "scatter"
      }
    
      this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
  
      //retailandrecreation Trace
      let retailandrecreation = {
        x: label,
        y: percent_retailandrecreation,
        line: {color: "rgb(0, 143, 251)"}, 
        mode: "lines",
        name: this.translateService.instant('DASHBOARD.retailandrecreation_CHART'), 
        type: "scatter"
      }
      
      //groceryandpharmacy Trace
      let groceryandpharmacy = {
        x: label,
        y: percent_groceryandpharmacy, 
        line: {color: "rgb(139, 117, 215)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.groceryandpharmacy_CHART'), 
        type: "scatter"
      }
      
      //parks TRACE
      let parks = {
        x: label,
        y: percent_parks, 
        line: {color: "rgb(255, 69, 96)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.parks_CHART'),
        type: "scatter"
      }

      //transitstations TRACE
      let transitstations = {
        x: label,
        y: percent_transitstations, 
        line: {color: "rgb(254, 176, 25)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.transitstations_CHART'), 
        type: "scatter"
      }

      //workplaces TRACE
      let workplaces = {
        x: label,
        y: percent_workplaces, 
        line: {color: "rgb(38, 231, 166)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.workplaces_CHART'),
        type: "scatter"
      }

      //residential TRACE
      let residential = {
        x: label,
        y: percent_residential, 
        line: {color: "rgb(0, 0, 0)"}, 
        mode: "lines", 
        name: this.translateService.instant('DASHBOARD.residential_CHART'), 
        type: "scatter"
      }
      this.updateChart(workplaces, groceryandpharmacy, retailandrecreation, transitstations, parks, residential)
      this._detectChanges();
    })

    this.updateChart(workplaces, groceryandpharmacy, retailandrecreation, transitstations, parks, residential)
    this._detectChanges();
    // this._changeDetectorRef.detectChanges();
    //   return;
    }

    updateChart(workplaces, groceryandpharmacy, retailandrecreation, transitstations, parks, residential){
      this.graph = {
        data: [workplaces, groceryandpharmacy, retailandrecreation, transitstations, parks, residential],
        layout: this.layout, 
      }
      this._detectChanges();
      // this._changeDetectorRef.detectChanges();
      // return;
    }

    private _detectChanges(): void {
      if (!this._changeDetectorRef['destroyed']) {
        this._changeDetectorRef.detectChanges();
      }
    }

}