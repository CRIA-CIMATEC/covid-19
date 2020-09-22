import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MembrosService {

  base_url = 'https://covid19.fieb.org.br:9050/api/membros/';

  constructor(private httpClient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

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
  getAll(): Observable<any> {
    return this.httpClient.get<any>(this.base_url)
      .pipe(retry(2), catchError(this.handleError));
  } 

}
