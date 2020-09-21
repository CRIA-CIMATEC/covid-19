import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';
import { TranslationService } from '../../../../../core/_base/layout';
import { FileUploadService } from '../../../../../services/file-upload.service';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
	selector: 'kt-widget-dropfiles',
	templateUrl: './widget_dropfiles.component.html',
	styleUrls: ['./widget_dropfiles.component.scss']
})
export class WidgetDropFilesComponent implements OnInit {

	@Input() Title: string;
    @Input() Msg: string;
	@Input() Desc: string;
	@Input() InputType: string;
	@Input() Removable: boolean;
	@Output() hasResult = new EventEmitter<any>();
	@Output() clearOldList = new EventEmitter<void>();
	
	files = [];

	onSelect(event) {
		// console.log(event);
		for (let index = 0; index < event.addedFiles.length; index++)  
		{  
			this.files.push({data: event.addedFiles[index], inProgress: false, progress: 0});
		}  
	}

	onRemove(event) {
		// console.log(event);
		this.files.splice(this.files.indexOf(event), 1);
	}

	uploadFile(file) {  
		const formData = new FormData();
		formData.append(file.data.name, file.data);  
		file.inProgress = true;  
		this.fileUploadService.upload(formData, this.InputType)
			.pipe(  
				map(event => {  
					switch (event.type) {  
						case HttpEventType.UploadProgress:  
						file.progress = Math.round(event.loaded * 100 / event.total);
						//console.log(file.progress);  
						break;  
						case HttpEventType.Response:  
						return event;  
					}  
				}),  
				catchError((error: HttpErrorResponse) => {  
					file.inProgress = false;  
					return of(`${file.data.name} upload failed.`);  
				})
			).subscribe((event: any) => {  
				if (typeof (event) === 'object') {
					// console.log(event.body);
					this.hasResult.emit({image: file.data, diagnostic: event.body[file.data.name], valid: event.body[file.data.name][2]});
				}  
			});  
	}

	private uploadFiles() {  
		this.files.forEach(file => { this.uploadFile(file); });  
	}

	onClick(){
		this.clearOldList.emit();
		this.uploadFiles();
		this.files = [];
	}

	constructor(
		private translationService: TranslationService,
		private fileUploadService: FileUploadService
	) { 
		this.translationService.loadTranslations(enLang, ptLang);
	}

	ngOnInit() {
	}

}
