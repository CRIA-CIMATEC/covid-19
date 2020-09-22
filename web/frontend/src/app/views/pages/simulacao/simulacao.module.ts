// Angular
import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// Core Module
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { SimulacaoComponent } from '../simulacao/simulacao.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';


@NgModule({
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		PartialsModule,
				CoreModule,
		NgApexchartsModule,
		RouterModule.forChild([
			{
				path: '',
				component: SimulacaoComponent
			},
		]),
	],
	providers: [],
	declarations: [
		SimulacaoComponent,
	]
})
export class SimulacaoModule {
}
  