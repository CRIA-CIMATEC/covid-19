import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';

import { FileUploadModule } from "angular-file-uploader";

import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';
import { TranslationService } from '../../../../../core/_base/layout';
import { FileUploadService } from '../../../../../services/file-upload.service';
import { HttpErrorResponse, HttpEventType, HttpClient, HttpRequest } from '@angular/common/http';
import { catchError, map, tap, last } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { SimulationService } from '../../../../../services/simulation.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Papa } from 'ngx-papaparse';
import { SimulationTopComponent } from '../simulation_top/simulation_top.component';


export class FileUploadModel {
	data: File;
	state: string;
	inProgress: boolean;
	progress: number;
	canRetry: boolean;
	canCancel: boolean;
	sub?: Subscription;
}

@Component({
	selector: 'kt-widget-csvupload',
	templateUrl: './widget_csvupload.component.html',
	styleUrls: ['./widget_csvupload.component.scss']
})

export class WidgetCsvUploadComponent implements OnInit {

	ngOnInit(){
		this.afuConfig = {
			
			multiple: false,
			formatsAllowed: ".csv",
			uploadAPI: false,
			maxSize: "1",
		};
		// SimulationService.emitirList.subscribe(
		// 	x => { console.log(x); this.onFileChange(x);}
		//   )
	};
	fileControl_Cas = new FormControl();
	fileControl_Inv = new FormControl();
	fileControl_Mob = new FormControl();

	@Input() Title;
	@Input() Type: string;
	

	@ViewChild('labelImport', {static: true}) labelImport: ElementRef;


  
	formImport: FormGroup;
	fileToUpload: File = null;

	csvFiles = []; //INPUT
    csvUploads = []; //OUTPUT - UPLOAD
	csvConverted; // JSON CSV
	
	csvInvoices;
	csvMobility;
	csvCases;
  
	constructor(private papa: Papa, simulationService: SimulationService 
		) {
	  this.formImport = new FormGroup({
		importFile: new FormControl('', Validators.required)
	  });
	}

	
  
	onFileControl_Cas(){
		this.onFileChange(this.fileControl_Cas.value, 'Cases')
	}
	onFileControl_Inv(){
		this.onFileChange(this.fileControl_Inv.value, 'Invoices')
	}
	onFileControl_Mob(){
		this.onFileChange(this.fileControl_Mob.value, 'Mobility')
	}

	//TIPO: CASOS
	onFileChange(data, Type) {
	//   this.labelImport.nativeElement.innerText = Array.from(files)
	// 	.map(f => f.name)
	// 	.join(', ');
	//   this.fileToUpload = files.item(0);
	//   this.csvFiles.push(this.fileToUpload)

		// var files2 = this.csvFiles; // FileList object
		// var file = files2[0];
		var reader = new FileReader();
		reader.readAsText(data);
		if(Type == 'Cases' || Type == 'Casos'){
			console.log("Cases");
		reader.onload = (event: any) => {
		
				
				var csv = event.target.result; // Content of CSV file
				this.papa.parse(csv, {
				skipEmptyLines: true,
				header: true,
				complete: (results) => {
					for (let i = 0; i < results.data.length; i++) {
					let csvInputs = {
						Data: results.data[i].Data,
						Casos_confirmados_Diarios: results.data[i].Casos_confirmados_Diarios,
						Obitos_Diarios: results.data[i].Obitos_Diarios
					};
					this.csvUploads.push(csvInputs);
					}
					// console.log(this.test);
					//console.log('Parsed: k', results.data);
					this.csvConverted = this.convertCSVtoJSON(results.data);
					//console.log(this.csvConverted);
					//SimulationService.emitirCSV.push(this.csvCases);
					SimulationService.csvCasesService.push(this.csvConverted);
				}
				});
			}
		}
		else if (Type == 'Invoices' || Type == 'Notas Fiscais'){
			console.log("Invoices");
			reader.onload = (event: any) => {
				var csv = event.target.result; // Content of CSV file
				this.papa.parse(csv, {
				skipEmptyLines: true,
				header: true,
				complete: (results) => {
					for (let i = 0; i < results.data.length; i++) {
					let csvInputs = {
						// Data: results.data[i].Data,
						// BPe_Quantidade_Diaria: results.data[i].BPe_Quantidade_Diaria,
						// BPe_Valor_Diario: results.data[i].BPe_Valor_Diario,
						// CTe_Quantidade_Diaria:results.data[i].CTe_Quantidade_Diaria,
						// CTe_Valor_Diario:results.data[i].CTe_Valor_Diario,
						// CTe_OS_Quantidade_Diaria: results.data[i].CTe_OS_Quantidade_Diaria,
						// CTe_OS_Valor_Diario: results.data[i].CTe_OS_Valor_Diario,
						// MDFe_Quantidade_Diaria: results.data[i].MDFe_Quantidade_Diaria,
						// MDFe_Valor_Diario: results.data[i].MDFe_Valor_Diario,
						// NFe_Quantidade_Diaria: results.data[i].NFe_Quantidade_Diaria,
						// NFe_Valor_Diario: results.data[i].NFe_Valor_Diario,
						// NFCe_Quantidade_Diaria: results.data[i].NFCe_Quantidade_Diaria,
						// NFCe_Valor_Diario: results.data[i].NFCe_Valor_Diario
						Data: results.data[i].Data,
						Casos_confirmados_Diarios: results.data[i].Casos_confirmados_Diarios,
						Obitos_Diarios: results.data[i].Obitos_Diarios
					};
					this.csvUploads.push(csvInputs);
					}
					// console.log(this.test);
					//console.log('Parsed: k', results.data);
					this.csvConverted = this.convertCSVtoJSON(results.data);
					//SimulationService.emitirCSV.push(this.csvInvoices);
					SimulationService.csvInvocesService.push(this.csvConverted);
					//console.log(SimulationTopComponent.csvConverted)
					
					
				}
				});
			}
			}
		else if(Type == 'Mobility' || Type == 'Mobilidade'){
			reader.onload = (event: any) => {
				var csv = event.target.result; // Content of CSV file
				this.papa.parse(csv, {
				skipEmptyLines: true,
				header: true,
				complete: (results) => {
					for (let i = 0; i < results.data.length; i++) {
					let csvInputs = {
						Data: results.data[i].Data,
						grocery_and_pharmacy: results.data[i].grocery_and_pharmacy,
						parks: results.data[i].parks,
						residential: results.data[i].residential,
						retail_and_recreation: results.data[i].retail_and_recreation,
						transit_stations: results.data[i].transit_stations,
						workplaces: results.data[i].workplaces,
					};
					this.csvUploads.push(csvInputs);
					}
					// console.log(this.test);
					//console.log('Parsed: k', results.data);
					this.csvConverted = this.convertCSVtoJSON(results.data);
					//SimulationService.emitirCSV.push(this.csvMobility);
					//console.log(SimulationTopComponent.csvConverted)
					SimulationService.csvMobilityService.push(this.csvConverted);
					
				}
				});
			}
		
		}
	}
		


	
	convertCSVtoJSON(uploadCSVFile){
		return JSON.stringify(uploadCSVFile)
	}


	afuConfig = {
		multiple: false,
		formatsAllowed: ".csv",
		uploadAPI: false,
		maxSize: "1",
		// theme: "attachPin",
		// hideProgressBar: true,
		// hideResetBtn: true,
		// hideSelectBtn: true,
		// fileNameIndex: true,
		// replaceTexts: {
		//   selectFileBtn: 'Select Files',
		//   resetBtn: 'Reset',
		//   uploadBtn: 'Upload',
		//   dragNDropBox: 'Drag N Drop',
		//   attachPinBtn: 'Attach Files...',
		//   afterUploadMsg_success: 'Successfully Uploaded !',
		//   afterUploadMsg_error: 'Upload Failed !',
		//   sizeLimit: 'Size Limit'
		// }
	};
}
