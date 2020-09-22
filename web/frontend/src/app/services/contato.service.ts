import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContatoService {

  base_url = 'https://covid19.fieb.org.br:9050/api/contato';

  constructor(private httpClient: HttpClient) { }

  // Headers
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    observe: 'response' as 'body'
  }

  submit(data: any): Observable<any> {
    // console.log(JSON.stringify(data));
    return this.httpClient.post(this.base_url, JSON.stringify(data), this.httpOptions);
  }
}
