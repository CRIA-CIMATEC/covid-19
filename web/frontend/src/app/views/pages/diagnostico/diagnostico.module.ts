// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import {NgbModule, NgbProgressbarModule} from '@ng-bootstrap/ng-bootstrap';

import { MatProgressSpinnerModule, MatChipsModule, MatSelectModule } from '@angular/material';

import { NgxDropzoneModule } from 'ngx-dropzone'

// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { TranslateModule } from '@ngx-translate/core';
import { RaioxComponent } from './raiox/raiox.component';
import { LaminaComponent } from './lamina/lamina.component';
import { DicomComponent } from './dicom/dicom.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NiiComponent } from './nii/nii.component';

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		MatProgressSpinnerModule,
		MatChipsModule,
		NgbModule,
		NgbProgressbarModule,
		NgxDropzoneModule,
		FormsModule,
		ReactiveFormsModule,

		TranslateModule.forChild(),
		
		RouterModule.forChild([
			{
				path: '',
				children: [
					{
						path: 'raiox',
						component: RaioxComponent
					},
					// {
					// 	path: 'lamina',
					// 	component: LaminaComponent
					// },
					// {
					// 	path: 'dicom',
					// 	component: DicomComponent
					// },
					{
						path: 'nii',
						component: NiiComponent
					}
				]
			},
		]),
	],
	providers: [],
	declarations: [
		RaioxComponent,
		LaminaComponent,
		DicomComponent,
		NiiComponent,
	]
})
export class DiagnosticoModule {
}





		
