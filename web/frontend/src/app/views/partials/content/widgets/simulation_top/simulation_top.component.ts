import { Component, ViewEncapsulation, ViewChild, Output, EventEmitter, Input, Type } from '@angular/core';
import { FormControl } from '@angular/forms';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Papa } from 'ngx-papaparse';
import { SimulationService } from '../../../../../services/simulation.service';
import {MatSelectModule} from '@angular/material/select';
import { HttpResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DashboardService } from '../../../../../services/dashboard.service';

export interface UserData {
  //'Parameters'?: any;
  Populacao: any;
  T_inf: any;
  Beta: any;
  N_inf: any;
  T_death: any;
  CFR: any;
  Country: any;
  State: any;
  dateSelected: any;
  Cases: any[];
  Invoices: any[];
  SchoolClosure: boolean;
  WorkplaceClosure: boolean;
  CancellationOfPublicEvents: boolean;
  RestrictionsOnGatheringSize: boolean;
  PublicTransportClosures: boolean;
  StayAtHomeRequirements: boolean;
  RestrictionsOnDomesticMovement: boolean;
  RestrictionsOnInternationalTravel: boolean;
}

// const initialSelection = [];
// const allowMultiSelect = true;
// this.selection = new SelectionModel<any>(allowMultiSelect, initialSelection);

  
@Component({
	selector: 'simulation_top',
	templateUrl: './simulation_top.component.html',
    styleUrls: ['simulation_top.component.scss'],
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
})

export class SimulationTopComponent  { 

  ShowMessage: boolean;

    autoTicks = false;
    disabled = false;
    invert = false;
    max = 100;
    min = 0;
    showTicks = false;
    step = 1;
    thumbLabel = false;
    Populacao:number = 0;
    Beta:number = 0 ;
    T_inf:number = 0;
    N_inf:number = 0;
    T_death:number = 0;
    CFR:number = 0;
    
    vertical = false;
    tickInterval = 1;

    displayedColumns = ['medida', 'action'];
    dataSource: MatTableDataSource<UserData>;
    users: UserData[] = [];

    csvFiles = []; //INPUT
    csvUploads = []; //OUTPUT - UPLOAD
    static csvConverted; // JSON CSV

    Country = 'Brazil';
    State = 'null';

    SchoolClosure: string;
    WorkplaceClosure: string;
    CancellationOfPublicEvents: string;
    RestrictionsOnGatheringSize: string;
    PublicTransportClosures: string;
    StayAtHomeRequirements: string;
    RestrictionsOnDomesticMovement: string;
    RestrictionsOnInternationalTravel: string;
    checked:string = "true";

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    //@ViewChild('SchoolClosure') SchoolClosure;
    

    selection = new SelectionModel<UserData>(true, []);

    constructor(private papa: Papa, private simulationService: SimulationService, dashboardService: DashboardService) {
      // Create 100 users
      // const users: UserData[] = [];
      //   for (let i = 1; i <= 100; i++) { users.push(this.createNewUser(i)); }
  
        //Assign the data to the data source for the table to render
        this.dataSource = new MatTableDataSource();
    }


    // toppings = new FormControl();
    // toppingList = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

    // isAllSelected() {
    //   const numSelected = this.selection.selected.length;
    //   const numRows = this.dataSource.data.length;
    //   return numSelected === numRows;
    // }

    // masterToggle() {
    //   this.isAllSelected() ?
    //   this.selection.clear() :
    //   this.dataSource.data.forEach(row => this.selection.select(row));
    // }
  
    getSliderTickInterval(): number | 'auto' {
      if (this.showTicks) {
        return this.autoTicks ? 'auto' : this.tickInterval;
      }
  
      return 0;
    }

    

    ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    // applyFilter(filterValue: string) {
    //   filterValue = filterValue.trim(); // Remove whitespace
    //   filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    //   this.dataSource.filter = filterValue;
    // }
    
    // createNewUser(Populacao, T_inf, Beta, N_inf, T_death, CFR, Country, State, dateSelected) {
    //   this.users.push(this.doUser(Populacao, T_inf, Beta, N_inf, T_death, CFR, Country, State, dateSelected))
    //   this.dataSource = new MatTableDataSource(this.users);
    // }

    doUser(Populacao, T_inf, Beta, N_inf, T_death, CFR, country, 
      _SchoolClosure, _WorkplaceClosure, _CancellationOfPublicEvents, _RestrictionsOnGatheringSize, _PublicTransportClosures,
      _StayAtHomeRequirements, _RestrictionsOnDomesticMovement, _RestrictionsOnInternationalTravel
      ,state?, dateSelected = Date.now(), Cases = [], Invoices = []): UserData{
        let _Cases;
        let _Invoices;
        //console.log(SimulationService.csvCasesService)
        if(SimulationService.csvCasesService.length == 0){
          _Cases = []
        }else {
          _Cases = JSON.parse(SimulationService.csvCasesService[0])
        }
        //console.log(SimulationService.csvInvocesService)
        if(SimulationService.csvInvocesService.length == 0){
          _Invoices = []
        }else{
          _Invoices = JSON.parse(SimulationService.csvInvocesService[0])
        }
      return {
        //'Parameters':[],
        Populacao: Populacao,
        T_inf: T_inf,
        Beta: Beta,
        N_inf: N_inf,
        T_death: T_death,
        CFR: CFR,
        Country: country,
        SchoolClosure: _SchoolClosure,
        WorkplaceClosure: _WorkplaceClosure,
        CancellationOfPublicEvents: _CancellationOfPublicEvents,
        RestrictionsOnGatheringSize: _RestrictionsOnGatheringSize,
        PublicTransportClosures: _PublicTransportClosures,
        StayAtHomeRequirements: _StayAtHomeRequirements,
        RestrictionsOnDomesticMovement: _RestrictionsOnDomesticMovement,
        RestrictionsOnInternationalTravel: _RestrictionsOnInternationalTravel,
        State: state,
        dateSelected: dateSelected,
        Cases: _Cases,
        Invoices: _Invoices
       };
    }
    
    
    convertCSVtoJSON(uploadCSVFile){
      return JSON.stringify(uploadCSVFile)
    }
    
    // handleFileInput(data) {
      
    //   console.log(data);
    //   var files = this.csvFiles; // FileList object
    //   var file = files[0];
    //   console.log(file);
    //   var reader = new FileReader();
    //   reader.readAsText(file);
    //   reader.onload = (event: any) => {
    //     var csv = event.target.result; // Content of CSV file
    //     this.papa.parse(csv, {
    //       skipEmptyLines: true,
    //       header: true,
    //       complete: (results) => {
    //         for (let i = 0; i < results.data.length; i++) {
    //           let csvInputs = {
    //             Category: results.data[i].Category,
    //             Real: results.data[i].Real,
    //             Predito: results.data[i].Predict
    //           };
    //          this.csvUploads.push(csvInputs);
    //         }
    //         // console.log(this.test);
    //         //console.log('Parsed: k', results.data);
    //         SimulationTopComponent.csvConverted = this.convertCSVtoJSON(results.data);
    //       }
    //     });
    //   }
    // }
      
    submit() {
      // console.log('submitting...');

      if(this.simulationService._selectedCountry == 'Brazil' && this.simulationService._selectedState == 'null'){
        this.ShowMessage = true;
        SimulationService._showMessage = this.ShowMessage
    }else{
        this.ShowMessage = false;
        SimulationService._showMessage = this.ShowMessage
    }
      // console.log(document.getElementById('SchoolClosure').attributes);
      // console.log(document.getElementById('SchoolClosure').getAttributeNode('class').value)
      //this.handleFileSelect();
      //console.log(SimulationService.emitirCSV);


      let userInput = this.doUser(
                      document.getElementById('Populacao')['value'], 
                      document.getElementById('T_inf')['value'], 
                      document.getElementById('Beta')['value'],                  
                      document.getElementById('N_inf')['value'],
                      document.getElementById('T_death')['value'], 
                      document.getElementById('CFR')['value'], 
                      // this.country,
                      this.simulationService._selectedCountry, 
                      //SimulationService.emitirCSV,
                      //document.getElementById('SchoolClosure')['class'], 
                      document.getElementById('SchoolClosure').getAttributeNode('class').value == "mat-checkbox mat-accent mat-checkbox-checked" ?"true" : "false",
                      document.getElementById('WorkplaceClosure').getAttributeNode('class').value == "mat-checkbox mat-accent mat-checkbox-checked" ?"true" : "false", 
                      document.getElementById('CancellationOfPublicEvents').getAttributeNode('class').value == "mat-checkbox mat-accent mat-checkbox-checked" ?"true" : "false",                  
                      document.getElementById('RestrictionsOnGatheringSize').getAttributeNode('class').value == "mat-checkbox mat-accent mat-checkbox-checked" ?"true" : "false",
                      document.getElementById('PublicTransportClosures').getAttributeNode('class').value == "mat-checkbox mat-accent mat-checkbox-checked" ?"true" : "false", 
                      document.getElementById('StayAtHomeRequirements').getAttributeNode('class').value == "mat-checkbox mat-accent mat-checkbox-checked" ?"true" : "false",
                      document.getElementById('RestrictionsOnDomesticMovement').getAttributeNode('class').value == "mat-checkbox mat-accent mat-checkbox-checked" ?"true" : "false", 
                      document.getElementById('RestrictionsOnInternationalTravel').getAttributeNode('class').value == "mat-checkbox mat-accent mat-checkbox-checked" ?"true" : "false",
                      // SimulationService.SchoolClosure,
                      // SimulationService.WorkplaceClosure,
                      // SimulationService.CancellationOfPublicEvents,
                      // SimulationService.RestrictionsOnGatheringSize,
                      // SimulationService.PublicTransportClosures,
                      // SimulationService.StayAtHomeRequirements,
                      // SimulationService.RestrictionsOnDomesticMovement,
                      // SimulationService.RestrictionsOnInternationalTravel,
                      
                      // this.state
                      this.simulationService._selectedState)
                      
              //this.simulationService.getConfirmadosDaily();// A SER REMOVIDO
              
              
      console.log(userInput);
      this.simulationService.submitCases(userInput);//submitCases
      //this.simulationService.submitInvoices(userInput); //submitInvoices

      
    }

    simulationSubmit(){
      this.simulationService._selectedCountry;
      this.simulationService._selectedState;
      if(this.simulationService._selectedCountry == 'Brazil' && this.simulationService._selectedState == 'null'){
        this.ShowMessage = true;
        SimulationService._showMessage = this.ShowMessage
    }else{
        this.ShowMessage = false;
        SimulationService._showMessage = this.ShowMessage
    }
    }
}

// const USERDATA: UserData[] = [{
//   Populacao: 150000000,
//   T_inf: 100,
//   Beta: 100,
//   N_inf: 100,
//   T_death: 100,
//   CFR: 100,
//   dateSelected: Date.now()
// }, {
//   Populacao: 10000000,
//   T_inf: 10,
//   Beta: 10,
//   N_inf: 10,
//   T_death: 100,
//   CFR: 10,
//   dateSelected: Date.now()
// }]

