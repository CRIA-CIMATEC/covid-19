import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // base_url = 'http://179.182.16.172:9050/api/dashboard/';
  base_url = 'https://covid19.fieb.org.br:9050/api/dashboard/';

  _invoicesvalue;
  static _showMessage: boolean;
  
  // injetando o HttpClient
  constructor(private httpClient: HttpClient) { }

  // Headers
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
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
    //console.log(errorMessage);
    return throwError(errorMessage);
  };

  

  // getAll(): Observable<any> {
  //   return this.httpClient.get<any>(this.base_url + 'all')
  //     .pipe(retry(2), catchError(this.handleError))
  // }
 
   getSummary(country:any,state:any) {
    DashboardService._Country = country;
    DashboardService._State = state;  
    if(country == null || country == undefined || country == "" ||    country.length == 0){
      country = "null";
  }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
    state = "null";
} 
// console.log(this.httpClient.get<any>(`${this.base_url}summary/?country=${country}&state=${state}`)
// .pipe(retry(2), catchError(this.handleError)).subscribe(
//   (response: HttpResponse<any>) => {
//     DashboardService.CountryResponse8.emit(response)
//   }))
    let getResponse = this.httpClient.get<any>(`${this.base_url}summary/?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          DashboardService.CountryResponse8.emit(response)
        });
  }
  static CountryResponse8 = new EventEmitter<any>();
  // getSummary
  // (): Observable<any> {
  //   //console.log(`${this.base_url}summary/?country=Brazil&state=Bahia`)
  //   return this.httpClient.get<any>(`${this.base_url}summary/?country=Brazil&state=Bahia`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }


  getRestritivo(country:any,state:any) {
    DashboardService._Country = country;
    DashboardService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
    let getResponse = this.httpClient.get<any>(`${this.base_url}restrictive/?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          DashboardService.CountryResponse7.emit(response)
        });
  }
  static CountryResponse7 = new EventEmitter<any>();
  // getRestritivo
  // (): Observable<any> {
  //   //console.log(`${this.base_url}restrictive/?country=Brazil`)
  //   return this.httpClient.get<any>(`${this.base_url}restrictive/?country=Brazil`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }


   getConfirmadosTotal(country:any,state:any) {
    DashboardService._Country = country;
    DashboardService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
    let getResponse = this.httpClient.get<any>(`${this.base_url}confirmed/total_cases/?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          DashboardService.CountryResponse6.emit(response)
        });
  }
  static CountryResponse6 = new EventEmitter<any>();
  // getConfirmadosTotal
  // (): Observable<any> {
  //   //console.log(`${this.base_url}confirmed/total_cases/?country=Brazil&state=Bahia`)
  //   return this.httpClient.get<any>(`${this.base_url}confirmed/total_cases/?country=Brazil&state=Bahia`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }
  

  getConfirmadosDaily(country:any,state:any) {
    DashboardService._Country = country;
    DashboardService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
    let getResponse = this.httpClient.get<any>(`${this.base_url}confirmed/daily/?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          DashboardService.CountryResponse5.emit(response)
        });
  }
  static CountryResponse5 = new EventEmitter<any>();
  // getConfirmadosDaily
  // (): Observable<any> {
  //   //console.log(`${this.base_url}confirmed/daily/?country=Brazil&state=Bahia`)
  //   return this.httpClient.get<any>(`${this.base_url}confirmed/daily/?country=Brazil&state=Bahia`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }


  getMortesTotal(country:any,state:any) {
    DashboardService._Country = country;
    DashboardService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
    let getResponse = this.httpClient.get<any>(`${this.base_url}deaths/total_cases/?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          DashboardService.CountryResponse4.emit(response)
        });
  }
  static CountryResponse4 = new EventEmitter<any>();
  // getMortesTotal
  // (): Observable<any> {
  //   //console.log(`${this.base_url}deaths/total_cases/?country=Brazil&state=Bahia`)
  //   return this.httpClient.get<any>(`${this.base_url}deaths/total_cases/?country=Brazil&state=Bahia`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }


  getMortesDaily(country:any,state:any) {
    DashboardService._Country = country;
    DashboardService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
    let getResponse = this.httpClient.get<any>(`${this.base_url}deaths/daily/?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          DashboardService.CountryResponse3.emit(response)
        });
  }
  static CountryResponse3 = new EventEmitter<any>();
  // getMortesDaily
  // (): Observable<any> {
  //   //console.log(`${this.base_url}deaths/daily/?country=Brazil&state=Bahia`)
  //   return this.httpClient.get<any>(`${this.base_url}deaths/daily/?country=Brazil&state=Bahia`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }
  
  getMobility(country:any,state:any) {
    DashboardService._Country = country;
    DashboardService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
    let getResponse = this.httpClient.get<any>(`${this.base_url}mobility/?country=${country}&state=${state}&category=6`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          DashboardService.CountryResponse2.emit(response)
        });
  }
  static CountryResponse2 = new EventEmitter<any>();
  // (SEM DROPDOWN-getMobility)
  // (): Observable<any> {
  //   //console.log(`${this.base_url}mobility/?country=Brazil&state=Bahia&category=6`)
  //   return this.httpClient.get<any>(`${this.base_url}mobility/?country=Brazil&state=Bahia&category=6`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }
  
  getInvoicesQuantity(country:any,state:any) {
    DashboardService._Country = country;
    DashboardService._State = state;
    if(country == null || country == undefined || country == "" ||    country.length == 0){
        country = "null";
    }
    if(state == null || state == undefined || state == "" ||    state.length == 0){
      state = "null";
  }
    let getResponse = this.httpClient.get<any>(`${this.base_url}invoices/quantity/?country=${country}&state=${state}`)
      .pipe(retry(2), catchError(this.handleError)).subscribe(
        (response: HttpResponse<any>) => {
          DashboardService.CountryResponse1.emit(response)
        });
  }
  static CountryResponse1 = new EventEmitter<any>();
  // (SEM DROPDOWN-getInvoicesQuantity)
  // (): Observable<any> {
  //   //console.log(`${this.base_url}invoices/quantity/?state=Bahia`)
  //   return this.httpClient.get<any>(`${this.base_url}invoices/quantity/?state=Bahia`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }

  
  getInvoicesValue(country:any,state:any) {
        DashboardService._Country = country;
        DashboardService._State = state;
        if(country == null || country == undefined || country == "" ||    country.length == 0){
            country = "null";
        }
        if(state == null || state == undefined || state == "" ||    state.length == 0){
          state = "null";
      }
        let getResponse = this.httpClient.get<any>(`${this.base_url}invoices/value/?country=${country}&state=${state}`)
          .pipe(retry(2), catchError(this.handleError)).subscribe(
            (response: HttpResponse<any>) => {
              DashboardService.CountryResponse.emit(response)
            });
      }

  //(SEM DROPDOWN-getInvoicesValue) 
  // getInvoicesValue(): Observable<any> {
  //   //console.log(`${this.base_url}invoices/value/?state=Bahia`)
  //   return this.httpClient.get<any>(`${this.base_url}invoices/value/?state=Bahia`)
  //     .pipe(retry(2), catchError(this.handleError))
  // }

  static _Country;
  static _State;
  static CountryResponse = new EventEmitter<any>();

  // getResumo(): Observable<any> {
  //   return this.httpClient.get<any>(this.base_url + 'summary')
  //     .pipe(retry(2), catchError(this.handleError))
  // }
}
