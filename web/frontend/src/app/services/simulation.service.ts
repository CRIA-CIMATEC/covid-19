import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { EventEmitter } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  
  base_url = 'https://covid19.fieb.org.br:9050/api/simulation/scenario'
  //base_url_restrictive = 'https://covid19.fieb.org.br:9050/api/dashboard/restrictive/?country=Brazil'

  static _showMessage: boolean;
  
  _emitedCases;
  _emitedInvoices;

  _selectedCountry;
  _selectedState;

  static SchoolClosure: boolean;
  static WorkplaceClosure: boolean;
  static CancellationOfPublicEvents: boolean;
  static RestrictionsOnGatheringSize: boolean;
  static PublicTransportClosures: boolean;
  static StayAtHomeRequirements: boolean;
  static RestrictionsOnDomesticMovement: boolean;
  static RestrictionsOnInternationalTravel: boolean;
	
  
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

  submitCases(data: any): Observable<any> {
    // console.log(JSON.stringify(data));
    var caraio = data; 

    // console.log(caraio)
    if(data['Country'] == undefined){
      //caraio['country'] = 'Brazil'
      data['Country'] = 'Brazil'
      // console.log(caraio['Country'])
    }
    if(data['State'] == undefined){
      data['State'] = 'null'
      //caraio['state'] = 'null'
      // console.log(caraio['State'])
    }

    console.log(JSON.stringify(data));
    this._emitedCases = this.httpClient.post<any>(this.base_url+'s/', JSON.stringify(data), this.httpOptions).subscribe(
      (response: HttpResponse<any>) => {
        this.addCases(response);
      });
      
    /* {
        "População":"15130000",
        "T_inf":"70",
        "Beta":"2",
        "N_inf":"60",
        "T_death":"8",
        "CFR":"0.3",
        "Country":"Brazil",
        "State":"Bahia",
        "dateSelected":1594070890620,
        "Cases":[],
        "Invoices":[],
        "SchoolClosure":true,
        "WorkplaceClosure":false,
        "CancellationOfPublicEvents":false,
        "RestrictionsOnGatheringSize":false,
        "PublicTransportClosures":false,
        "StayAtHomeRequirements":false,
        "RestrictionsOnDomesticMovement":false,
        "RestrictionsOnInternationalTravel":false
  }*/
      
    // this._emitedCases = this.httpClient.get<any>(this.base_url+`?Populacao=`+caraio['População']
    // +`&T_inf=`+caraio['T_inf']
    // +`&Beta=`+caraio['Beta']
    // +`&N_inf=`+caraio['N_inf']
    // +`&T_death=`+caraio['T_death']
    // +`&CFR=`+caraio['CFR']
    // +`&Country=`+caraio['country']
    // +`&State=`+caraio['state']
    // +`&dateSelected=`+caraio['dateSelected']
    // +`&Cases=`+caraio['Cases']
    // +`&Invoices=`+caraio['Invoices']
    // +`&SchoolClosure=`+caraio['SchoolClosure']
    // +`&WorkplaceClosure=`+caraio['WorkplaceClosure']
    // +`&CancellationOfPublicEvents=`+caraio['CancellationOfPublicEvents']
    // +`&RestrictionsOnGatheringSize=`+caraio['RestrictionsOnGatheringSize']
    // +`&PublicTransportClosures=`+caraio['PublicTransportClosures']
    // +`&StayAtHomeRequirements=`+caraio['StayAtHomeRequirements']
    // +`&RestrictionsOnDomesticMovement=`+caraio['RestrictionsOnDomesticMovement']
    // +`&RestrictionsOnInternationalTravel=`+caraio['RestrictionsOnInternationalTravel'])
    //   .subscribe(
    //     (response: HttpResponse<any>) => {
    //       {console.log(this.base_url+`?Populacao=`+caraio['População']
    //       +`&T_inf=`+caraio['T_inf']
    //       +`&Beta=`+caraio['Beta']
    //       +`&N_inf=`+caraio['N_inf']
    //       +`&T_death=`+caraio['T_death']
    //       +`&CFR=`+caraio['CFR']
    //       +`&Country=`+caraio['country']
    //       +`&State=`+caraio['state']
    //       +`&dateSelected=`+caraio['dateSelected']
    //       +`&Cases=`+caraio['Cases']
    //       +`&Invoices=`+caraio['Invoices']
    //       +`&SchoolClosure=`+caraio['SchoolClosure']
    //       +`&WorkplaceClosure=`+caraio['WorkplaceClosure']
    //       +`&CancellationOfPublicEvents=`+caraio['CancellationOfPublicEvents']
    //       +`&RestrictionsOnGatheringSize=`+caraio['RestrictionsOnGatheringSize']
    //       +`&PublicTransportClosures=`+caraio['PublicTransportClosures']
    //       +`&StayAtHomeRequirements=`+caraio['StayAtHomeRequirements']
    //       +`&RestrictionsOnDomesticMovement=`+caraio['RestrictionsOnDomesticMovement']
    //       +`&RestrictionsOnInternationalTravel=`+caraio['RestrictionsOnInternationalTravel']);
    //       // console.log(response);
    //        this.addCases(response);}
    //     });
      return this._emitedCases;
  }

  static emitirCases = new EventEmitter<any>();
  static emitirInvoices = new EventEmitter<any>();
  static emitirList = new EventEmitter<any>();
  static emitirCSV = [];

  static csvInvocesService = [];
  static csvCasesService = [];
  static csvMobilityService = [];
  
  addCases(cases){
    //SimulationService.emitirCases.emit(cases.body);
    SimulationService.emitirCases.emit(cases);
  }

  // addInvoices(invoices){
  //   //SimulationService.emitirInvoices.emit(invoices.body);
  //   SimulationService.emitirInvoices.emit(invoices);
  // }

  obtainJSON(dataAboutCSV){    
    SimulationService.emitirList.emit(dataAboutCSV)
  }

}
