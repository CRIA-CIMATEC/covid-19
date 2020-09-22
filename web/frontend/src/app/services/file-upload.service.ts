import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { forEach } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  // base_url = 'http://localhost:5000/api/predict';
  // base_url = 'http://179.181.9.192:9050/api/diagnostico';
  // base_url = 'https://covid19.fieb.org.br:9050/api/diagnostico';
  base_url = 'https://covid19.fieb.org.br:9050/api/diagnosis';
  

  constructor(private httpClient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({  'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'})
  }
  
  upload(formData: FormData, diagnosisType: String) {
    //console.log('Uploading!');
    let aaa = formData.getAll("files")
    console.log(aaa);

    let url = this.base_url;
    if (diagnosisType == 'RaioX') { url += '/xray'; }
    if (diagnosisType == 'Lamina') { url += '/tc'; }
    if (diagnosisType == 'DICOM') { url += '/dicom'; }
    if (diagnosisType == 'Nii') { url += '/nii'; }

    let _emitXray = this.httpClient.post<any>(url, formData, {  
      reportProgress: true,  
      observe: 'events'  
    })
    
    return _emitXray;
   
    
  }

 
  

  static emitResponse = new EventEmitter<any>();

  addResponse(response: HttpResponse<any>) {
    FileUploadService.emitResponse.emit(response.body);
  }
}
