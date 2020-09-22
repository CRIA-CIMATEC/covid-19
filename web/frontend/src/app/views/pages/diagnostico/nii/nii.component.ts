import { Injector, Component } from '@angular/core';
import { DiagnosticoComponent } from '../diagnostico.component';
import { FormArray, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { FileUploadService } from '../../../../services/file-upload.service';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
	selector: 'kt-diagnostico',
	templateUrl: './nii.component.html',
	styleUrls: ['../diagnostico.component.scss'],
})
export class NiiComponent extends DiagnosticoComponent {
  title = 'MENU.DIAGNOSTICO_NII';
  descricao = 'DASHBOARD.DIAGNOSTICOS_DESC_NII';
  inputType = 'Nii';

  constructor(injector: Injector) {
    super(injector);
  }

}
