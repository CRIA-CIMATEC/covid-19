import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  
  base_url = 'https://covid19.fieb.org.br:9050/api/newsletter'
  // base_url = 'http://179.182.29.112:9050/api/newsletter';

  // injetando o HttpClient
  constructor(private httpClient: HttpClient) { }

  // Headers
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    observe: 'response' as 'body'
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

  submit(data: any): Observable<any> {
    // console.log(JSON.stringify(data));
    return this.httpClient.post(this.base_url, JSON.stringify(data), this.httpOptions);
  }
}
