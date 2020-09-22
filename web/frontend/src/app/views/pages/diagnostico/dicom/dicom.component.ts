import { Component, Injector } from '@angular/core';
import { DiagnosticoComponent } from '../diagnostico.component';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { FileUploadService } from '../../../../services/file-upload.service';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'kt-dicom',
  templateUrl: './dicom.component.html',
  styleUrls: ['./dicom.component.scss']
})
export class DicomComponent extends DiagnosticoComponent {
  title = 'MENU.DIAGNOSTICO_DICOM';
  descricao = 'DASHBOARD.DIAGNOSTICOS_DESC_DICOM';
  inputType = 'DICOM';
  
  files = [];
  images = [];
  result = null;
  hideElement = true;
  maxSpacing: number;
  
  // DICOM = true

  form: FormGroup;

  constructor(
    injector: Injector, 
    private formBuilder: FormBuilder,
    private fileUploadService: FileUploadService
  ) {
    super(injector);
    
    this.form = this.formBuilder.group(
      {
        amountOfSpacing: new FormControl(1),
        selectedImages: new FormArray([])
      }
    );
  }

  cleanSelection() {
    (this.form.controls.selectedImages as FormArray).controls.forEach(c => c.setValue(false));
  }

  sendDicomImages() {
    this.hideElement = false;
    const selectedImgFiles = this.form.value.selectedImages
      .map((v, i) => (v ? this.files[i] : null))
      .filter(v => v !== null);
    console.log(selectedImgFiles);

    const formData = new FormData();
    for(let i =0; i < selectedImgFiles.length; i++){
        formData.append("files", selectedImgFiles[i].data, selectedImgFiles[i].data.name);
    }

    //console.log(formData.getAll("imgs[]"))

    let inProgress = true;
    let progress = 0;  
		this.fileUploadService.upload(formData, 'DICOM')
			.pipe(  
				map(event => {  
					switch (event.type) {  
						case HttpEventType.UploadProgress:  
						progress = Math.round(event.loaded * 100 / event.total);
						// console.log(progress);  
						break;  
						case HttpEventType.Response:  
						return event;  
					}  
				}),  
				catchError((error: HttpErrorResponse) => {  
					inProgress = false;  
					return of(`upload failed. ${error.message}`);  
				})
			).subscribe((event: any) => {  
				if (typeof (event) === 'object') {
          let myObj = JSON.parse(event.body)
          console.log(myObj)
          this.result = {
            normal: 100 - myObj['laminas'][0],
            covid: myObj['laminas'][1]
          }
          this.hideElement = true;
          this._cdr.detectChanges();
				}  
			});

		this.files = [];
  }

  onSelect(event) {
    // console.log(event);
    let amountOfFiles = event.addedFiles.length;
    this.maxSpacing = ~~(amountOfFiles / 16);
		for (let index = 0; index < amountOfFiles; index++)  
		{ 
      var file = event.addedFiles[index];

      this.files.push({data: file, inProgress: false, progress: 0});

      var reader = new FileReader();

      // Isso aqui é bruxaria alto nível, só altere se for bruxão mesmo!
      reader.onloadend = (function(theFile, images, cdr, form){
        var fileName = theFile.name;
        return function(e){
          images.push(
            {
              pic: e.target.result,
              imageName: fileName,
              imageUrl: e.target.result
            }
          );
          const control = new FormControl(images.length === 0);
          (form.controls.selectedImages as FormArray).push(control);
          cdr.detectChanges();
        };
      })(file, this.images, this._cdr, this.form); //Passando array de imagens, cdr e form como referência.

      reader.readAsDataURL(file);
		}  
  }
  
  onCheckImgChange(idx){
    let selectedImgs = (this.form.controls.selectedImages as FormArray).controls;
    let spacing = this.form.controls.amountOfSpacing.value;

    this.cleanSelection();
    for(let i = idx, counter = 16; i < selectedImgs.length && counter > 0; i += spacing, counter--) {
      (this.form.controls.selectedImages as FormArray).controls[i].setValue(true);
    }
  }

  clearOldList(){
		this.hideElement = false;
		this.files = [];
	}
}
