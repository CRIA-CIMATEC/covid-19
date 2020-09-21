// Angular
import { Component, ContentChild, Input, OnInit, TemplateRef, OnChanges, SimpleChanges } from '@angular/core';
// Lodash
import { shuffle } from 'lodash';
// Layout
import { LayoutConfigService } from '../../../../../core/_base/layout';
import {ViewEncapsulation, ViewChild, Output, EventEmitter} from '@angular/core';
import { FormControl } from '@angular/forms';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Papa } from 'ngx-papaparse';
import { SimulationService } from '../../../../../services/simulation.service';
import {MatSelectModule} from '@angular/material/select';
import { HttpResponse } from '@angular/common/http';
import { DashboardService } from '../../../../../services/dashboard.service';
import { CenarioService } from '../../../../../services/cenario.service';



export interface UserData {
    Country: any;
    State: any;
}

@Component({
	selector: 'dropdown_location_cenario',
	templateUrl: './dropdown_location_cenario.component.html',
    styleUrls: ['./dropdown_location_cenario.component.scss'],
    preserveWhitespaces: false,
})
export class DropdownLocationCenarioComponent implements OnInit {
    // Public properties
	@Input() country = 'Brazil';
    @Input() state = 'Acre';
    @Input() Type = '';
    // @Input() defaultValue = 'null';

     ShowMessage: boolean;

//   static emitinvoices: any;
  

     constructor(
        private dashboardService: DashboardService,
        private simulationService: SimulationService,
        private cenarioService: CenarioService
        )
     {
      
     }

     ngOnInit(): void {
        // this.dashboardService.getSummary(this.country,this.state);//getSummary
        // this.dashboardService.getConfirmadosTotal(this.country,this.state); //getConfirmadosTotal
        // this.dashboardService.getConfirmadosDaily(this.country,this.state);//getConfirmadosDaily
        // this.dashboardService.getMortesTotal(this.country,this.state); //getMortesTotal 
        // this.dashboardService.getMortesDaily(this.country,this.state);//getMortesDaily
        // this.dashboardService.getMobility(this.country,this.state); //getMobility
        // this.dashboardService.getInvoicesQuantity(this.country,this.state);//getInvoicesQuantity
        // this.dashboardService.getInvoicesValue(this.country,this.state);//getInvoicesValue
        this.cenarioService.getModerate(this.country,this.state);//getModerate 
        this.cenarioService.getLow_deaths(this.country,this.state);//getLow_deaths
        this.cenarioService.getLow_cases(this.country,this.state);//getLow_cases
        this.cenarioService.getHigh_economy_quantity(this.country,this.state);//getHigh_economy_quantity
        this.cenarioService.getHigh_economy_value(this.country,this.state);//getHigh_economy_value
        
        if(this.country == 'Brazil' && this.state == 'null'){
            this.ShowMessage = true;
            // DashboardService._showMessage = this.ShowMessage;
            CenarioService._showMessage = this.ShowMessage
        }else{
            this.ShowMessage = false;
            // DashboardService._showMessage = this.ShowMessage;
            CenarioService._showMessage = this.ShowMessage
        }
   }

   
      submit(type: any) {
        // if(type == 'dashboard'){
        //     // console.log( this.dashboardService.getMobility(this.country,this.state));
        //     this.dashboardService.getSummary(this.country,this.state);//getSummary
        //     this.dashboardService.getConfirmadosTotal(this.country,this.state); //getConfirmadosTotal
        //     this.dashboardService.getConfirmadosDaily(this.country,this.state);//getConfirmadosDaily
        //     this.dashboardService.getMortesTotal(this.country,this.state); //getMortesTotal 
        //     this.dashboardService.getMortesDaily(this.country,this.state);//getMortesDaily
        //     this.dashboardService.getMobility(this.country,this.state); //getMobility
        //     this.dashboardService.getInvoicesQuantity(this.country,this.state);//getInvoicesQuantity
        //     this.dashboardService.getInvoicesValue(this.country,this.state);//getInvoicesValue

        //     if(this.country == 'Brazil' && this.state == 'null'){
        //         this.ShowMessage = true;
        //         DashboardService._showMessage = this.ShowMessage
        //     }else{
        //         this.ShowMessage = false;
        //         DashboardService._showMessage = this.ShowMessage
        //     }

        // }else{
        //     this.simulationService._selectedState = this.state
        //     this.simulationService._selectedCountry = this.country
        //     // this.cenarioService._selectedState = this.state
        //     // this.cenarioService._selectedCountry = this.country
        // }
        if(type == 'cenario'){
            // console.log(this.cenarioService.getLow_deaths(this.country,this.state));
            this.cenarioService.getModerate(this.country,this.state);//getModerate
            this.cenarioService.getLow_deaths(this.country,this.state);//getLow_deaths
            this.cenarioService.getLow_cases(this.country,this.state);//getLow_cases
            this.cenarioService.getHigh_economy_quantity(this.country,this.state);//getHigh_economy_quantity
            this.cenarioService.getHigh_economy_value(this.country,this.state);//getHigh_economy_value
            

            if(this.country == 'Brazil' && this.state == 'null'){
                this.ShowMessage = true;
                CenarioService._showMessage = this.ShowMessage
            }else{
                this.ShowMessage = false;
                CenarioService._showMessage = this.ShowMessage
            }
        }
      }                  
      
}