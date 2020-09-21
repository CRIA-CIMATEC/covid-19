import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { EventEmitter, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';


@Injectable({
  providedIn: 'root'
})
export class CenarioService {
  
  base_url = 'https://covid19.fieb.org.br:9050/api/optimization/'
  //base_url_restrictive = 'https://covid19.fieb.org.br:9050/api/dashboard/restrictive/?country=Brazil'

  static _showMessage: boolean;
  
  _emitedlow_deaths;
  _emitedhigh_economy;
  _emitedmoderate;
  _emitedInvoices;
  static _Country;
  static _State;

  _selectedCountry;
  _selectedState;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  static SchoolClosure: boolean;
  static WorkplaceClosure: boolean;
  static CancellationOfPublicEvents: boolean;
  static RestrictionsOnGatheringSize: boolean;
  static PublicTransportClosures: boolean;
  static StayAtHomeRequirements: boolean;
  static RestrictionsOnDomesticMovement: boolean;
  static RestrictionsOnInternationalTravel: boolean;
	static CountryResponse: any;
	
  
  // injetando o HttpClient
  constructor(private httpClient: HttpClient) { 
    // let headers = new Headers();
    // headers.append('Content-Type','application/json');
  }
  
  // Headers
  httpOptions = {
    headers: new HttpHeaders({  'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'})
  }

  // Manipulação de erros
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erro ocorreu no lado do client
      errorMessage = error.error.message;
    } else {
      // Erro ocorreu no lado do servidor
      errorMessage = `Código do erro: ${error.status}, ` + `mensagem: ${error.message}`;
    }
    // console.log(errorMessage);
    return throwError(errorMessage);
  };

  getLow_deaths(country:any,state:any) {
    CenarioService._Country = country;
    CenarioService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
  // console.log(`${this.base_url}low/deaths?country=${country}&state=${state}`);
    let getResponse = this.httpClient.get<any>(`${this.base_url}low/deaths?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          CenarioService.Responselow_deaths.emit(response)
        });
  }
  static Responselow_deaths = new EventEmitter<any>();

  getLow_cases(country:any,state:any) {
    CenarioService._Country = country;
    CenarioService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
  // console.log(`${this.base_url}low/cases?country=${country}&state=${state}`);
    let getResponse = this.httpClient.get<any>(`${this.base_url}low/cases?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          CenarioService.Responselow_cases.emit(response)
        });
  }
  static Responselow_cases = new EventEmitter<any>();

  getHigh_economy_quantity(country:any,state:any) {
    CenarioService._Country = country;
    CenarioService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
  // console.log(`${this.base_url}high_economy/quantity?country=${country}&state=${state}`);
    let getResponse = this.httpClient.get<any>(`${this.base_url}high_economy/quantity?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          CenarioService.ResponseHigh_economy_quantity.emit(response)
        });
  }
  static ResponseHigh_economy_quantity = new EventEmitter<any>();


  getHigh_economy_value(country:any,state:any) {
    CenarioService._Country = country;
    CenarioService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
  // console.log(CenarioService.ResponseHigh_economy_value.emit());
    let getResponse = this.httpClient.get<any>(`${this.base_url}high_economy/value?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          CenarioService.ResponseHigh_economy_value.emit(response)
        });
  }
  static ResponseHigh_economy_value = new EventEmitter<any>();


  getModerate(country:any,state:any) {
    CenarioService._Country = country;
    CenarioService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
  console.log(state);
  console.log(country);
    let getResponse = this.httpClient.get<any>(`${this.base_url}moderate?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          CenarioService.ResponseModerate.emit(response)
        });
  }
  static ResponseModerate = new EventEmitter<any>();


  // submitCase(data: any): Observable<any> {
  //   // console.log(JSON.stringify(data));
  //   var caraio = data; 

  //   // console.log(caraio)
  //   if(data['Country'] == undefined){
  //     //caraio['country'] = 'Brazil'
  //     data['Country'] = 'Brazil'
  //     // console.log(caraio['Country'])
  //   }
  //   if(data['State'] == undefined){
  //     data['State'] = 'null'
  //     //caraio['state'] = 'null'
  //     // console.log(caraio['State'])
  //   }

  //   //  console.log(JSON.stringify(data));
  //   this._emitedlow_deaths = this.httpClient.post<any>(this.base_url+'low_deaths/', this.httpOptions).subscribe(
  //     (response: HttpResponse<any>) => {
  //       this.addCases(response);
  //     });
  //   this._emitedhigh_economy = this.httpClient.post<any>(this.base_url+'high_economy/', this.httpOptions).subscribe(
  //     (response: HttpResponse<any>) => {
  //       this.addCases(response);
  //     });
  //   this._emitedmoderate = this.httpClient.post<any>(this.base_url+'moderate/', this.httpOptions).subscribe(
  //      (response: HttpResponse<any>) => {
  //       this.addCases(response);
  //     });          
  //     // console.log(this._emitedlow_deaths && this._emitedhigh_economy && this._emitedlow_deaths);
  //     return this._emitedlow_deaths && this._emitedhigh_economy && this._emitedlow_deaths;
  // }

  // static _emitedlow_deaths = new EventEmitter<any>();
  // static _emitedhigh_economy = new EventEmitter<any>();
  // static _emitedmoderate = new EventEmitter<any>();
  static emitirCases = new EventEmitter<any>();
  static emitirInvoices = new EventEmitter<any>();
  static emitirList = new EventEmitter<any>();
  static emitirCSV = [];

  static csvInvocesService = [];
  static csvCasesService = [];

  
  // addCases(cases){
  //   // CenarioService.emitirCases.emit(cases.body);
  //   CenarioService._emitedlow_deaths.emit(cases);
  //   CenarioService._emitedhigh_economy.emit(cases);
  //   CenarioService._emitedlow_deaths.emit(cases);
  //   // CenarioService.emitirCases.emit(cases);
  // }

  // addInvoices(invoices){
  //   //SimulationService.emitirInvoices.emit(invoices.body);
  //   SimulationService.emitirInvoices.emit(invoices);
  // }

  obtainJSON(dataAboutCSV){    
    CenarioService.emitirList.emit(dataAboutCSV)
  }

}
