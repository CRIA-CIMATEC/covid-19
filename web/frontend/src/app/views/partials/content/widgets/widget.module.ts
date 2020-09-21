import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressSpinnerModule, MatSortModule, MatTableModule, MatNativeDateModule, MatTreeModule, MatAutocompleteModule, MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatStepperModule, MatDatepickerModule, MatDialogModule, MatDividerModule, MatExpansionModule, MatGridListModule, MatInputModule, MatListModule, MatMenuModule, MatProgressBarModule, MatRadioModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatBadgeModule, } from '@angular/material';
import { CoreModule } from '../../../../core/core.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// Datatable
import { DataTableComponent } from './general/data-table/data-table.component';
// General widgets
import { Widget1Component } from './widget1/widget1.component';
import { Widget4Component } from './widget4/widget4.component';
import { Widget5Component } from './widget5/widget5.component';
import { Widget12Component } from './widget12/widget12.component';
import { Widget14Component } from './widget14/widget14.component';
import { Widget26Component } from './widget26/widget26.component';
import { Timeline2Component } from './timeline2/timeline2.component';

//CUSTOM WIDGETS
import { LabelledDataComponent } from './labelled_data/labelled_data.component';
import { Widget27Component } from './widget27/widget27.component';
import { ConfirmedCasesComponent } from './confirmed_cases/confirmed_cases.component';
import { DeathsChartComponent } from './deaths_chart/deaths_chart.component';
import { WidgetDropFilesComponent } from './widget_dropfiles/widget_dropfiles.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone'
import { TranslateModule } from '@ngx-translate/core';
import { WidgetLoadResultsComponent } from './widget_loading_results/widget_loading_results.component';
import { WidgetImageWithNameComponent } from './imageWithName/imageWithName.component';
import { WidgetNgbdDatepickerRange } from './datepicker-range/datepicker-range.component';
import { Widget4TodoComponent } from './widget-todo/widget_todo.component'
import { NgApexchartsModule } from "ng-apexcharts";
import { ApexModeloComponent } from './apex_modelo/apex_modelo.component';
import { ApexConfirmedSparkComponent } from './apex_confirmed_spark/apex_confirmed_spark.component';
import { ApexConfirmedDiaryComponent } from './apex_confirmed_cases_diary/apex_confirmed_cases_diary.component';
import { ApexConfirmedTotalComponent } from './apex_confirmed_cases_total/apex_confirmed_cases_total.component';
import { ApexDiaryDeathsComponent } from './apex_diary_deaths/apex_diary_deaths.component';
import { ApexSocialMobilityComponent } from './apex_social_mobility/apex_social_mobility.component';
import { ApexTotalDeathsComponent } from './apex_total_deaths/apex_total_deaths.component';
import { ApexHeatmapComponent } from './apex_heatmap/apex_heatmap.component';
import { ApexTotalDeathsSparkComponent } from './apex_total_deaths_spark/apex_total_deaths_spark.component';
import { ApexScatterComponent } from './apex_scatter/apex_scatter.component';
import { ApexLetalitySparkComponent } from './apex_letality_spark/apex_letality_spark.component';
import { SimulationTopComponent } from './simulation_top/simulation_top.component';
import { CdkTableModule } from '@angular/cdk/table';
import { WidgetCsvUploadComponent } from './widget_csvupload/widget_csvupload.component';
import { ApexNFValueComponent } from './apex_NF_Value/apex_NF_Value.component';
import { ApexNFQuantityComponent } from './apex_NF_Quantity/apex_NF_Quantity.component';
import { ApexConfirmadosComponent } from './apex_confirmados/apex_confirmados.component';
import { FileUploadModule } from "angular-file-uploader";
import { from } from 'rxjs';
import { DropdownLocationComponent } from './dropdown_location/dropdown_location.component';

import { PlotlyModule } from 'angular-plotly.js';
import { PlotlyExampleComponent } from './plotly_modelo/plotly_modelo.component';
import { PlotlyValueInvoicesComponent } from './plotly_value_invoices/plotly_value_invoices.component';
import { PlotlyTotalDeathsComponent } from './plotly_total_deaths/plotly_total_deaths.component';
import { PlotlyTotalCasesComponent } from './plotly_total_cases/plotly_total_cases.component';
import { PlotlyDailyDeathsComponent } from './plotly_daily_deaths/plotly_daily_deaths.component';
import { PlotlyDailyCasesComponent } from './plotly_daily_cases/plotly_daily_cases.component';
import { PlotlyAmountInvoicesComponent } from './plotly_amount_invoices/plotly_amount_invoices.component';
import { TableSelectionComponent } from './table_with_selection/table_with_selection.component';
import { PlotlyMobilityComponent } from './plotly_mobility/plotly_mobility.component';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { PlotlyTotalCasesCenarioComponent } from './plotly_total_cases_cenario/plotly_total_cases_cenario.component';
import { PlotlyTotalCasesRecoveryComponent } from './plotly_total_cases_recovery/plotly_total_cases_recovery.component';
import { PlotlyTotalDeathsCenarioComponent } from './plotly_total_deaths_cenario/plotly_total_deaths_cenario.component';
import { MetigationRecoveryComponent } from './metigation_recovery/metigation_recovery.component';
import { PlotlyAmountRecoveryComponent } from './plotly_amount_recovery/plotly_amount_recovery.component';
import { PlotlyValueRecoveryComponent } from './plotly_value_recovery/plotly_value_recovery.component';
import { PlotlyInvoicesValueRecoveryComponent } from './plotly_invoices_value_recovery/plotly_invoices_value_recovery.component';
import { PlotlyAmountInvoicesRecoveryComponent } from './plotly_amount_invoices_recovery/plotly_amount_invoices_recovery.component';
import { PlotlyTotalDeathsRecoveryComponent } from './plotly_total_deaths_recovery/plotly_total_deaths_recovery.component';
import { DropdownLocationCenarioComponent } from './dropdown_location_cenario/dropdown_location_cenario.component';







@NgModule({
	declarations: [
		DataTableComponent,
		// Widgets
		Widget1Component,
		Widget4Component,
		Widget5Component,
		Widget12Component,
		Widget14Component,
		Widget26Component,
		Timeline2Component,

		//CUSTOM WIDGETS
		LabelledDataComponent,
		Widget27Component,
		ConfirmedCasesComponent,
		DeathsChartComponent,
		WidgetDropFilesComponent,
		WidgetLoadResultsComponent,
		WidgetImageWithNameComponent,
		ApexModeloComponent,
		ApexConfirmedSparkComponent,
		ApexConfirmedDiaryComponent,
		ApexConfirmedTotalComponent,
		ApexDiaryDeathsComponent,
		ApexNFQuantityComponent,
		ApexNFValueComponent,
		ApexSocialMobilityComponent,
		ApexTotalDeathsComponent,
		ApexHeatmapComponent,
		ApexTotalDeathsSparkComponent,
		ApexScatterComponent,
		ApexLetalitySparkComponent,
		WidgetNgbdDatepickerRange,
		SimulationTopComponent,
		WidgetCsvUploadComponent,
		ApexConfirmadosComponent,
		TableSelectionComponent,
		PlotlyExampleComponent,
		DropdownLocationComponent,
		DropdownLocationCenarioComponent,
		
		PlotlyValueInvoicesComponent,
		PlotlyValueRecoveryComponent,
		PlotlyTotalDeathsComponent,
		PlotlyTotalDeathsCenarioComponent,
		PlotlyTotalCasesComponent,
		PlotlyTotalCasesCenarioComponent,
		PlotlyTotalCasesRecoveryComponent,
		PlotlyDailyDeathsComponent,
		PlotlyDailyCasesComponent,
		PlotlyAmountInvoicesComponent,
		PlotlyAmountRecoveryComponent,
		PlotlyMobilityComponent,
		MetigationRecoveryComponent,
		PlotlyInvoicesValueRecoveryComponent,
		PlotlyAmountInvoicesRecoveryComponent,
		PlotlyTotalDeathsRecoveryComponent,

		Widget4TodoComponent

		
	],
	exports: [
		DataTableComponent,
		// Widgets
		Widget1Component,
		Widget4Component,
		Widget5Component,
		Widget12Component,
		Widget14Component,
		Widget26Component,
		Timeline2Component,

		//CUSTOM WIDGETS
		LabelledDataComponent,
		Widget27Component,
		ConfirmedCasesComponent,
		DeathsChartComponent,
		WidgetDropFilesComponent,
		WidgetLoadResultsComponent,
		WidgetImageWithNameComponent,
		WidgetNgbdDatepickerRange,
		Widget4TodoComponent,
		ApexModeloComponent,
		ApexConfirmedSparkComponent,
		ApexConfirmedDiaryComponent,
		ApexConfirmedTotalComponent,
		ApexDiaryDeathsComponent,
		ApexNFQuantityComponent,
		ApexNFValueComponent,
		ApexSocialMobilityComponent,
		ApexTotalDeathsComponent,
		ApexTotalDeathsSparkComponent,
		ApexScatterComponent,
		ApexHeatmapComponent,
		ApexLetalitySparkComponent,
		SimulationTopComponent,
		ApexConfirmadosComponent,
		WidgetCsvUploadComponent,
		DropdownLocationComponent,
		DropdownLocationCenarioComponent,
		TableSelectionComponent,
		PlotlyExampleComponent,
		PlotlyValueInvoicesComponent,
		PlotlyValueRecoveryComponent,
		PlotlyTotalDeathsComponent,
		PlotlyTotalDeathsCenarioComponent,
		PlotlyTotalCasesComponent,
		PlotlyTotalCasesCenarioComponent,
		PlotlyTotalCasesRecoveryComponent,
		PlotlyDailyDeathsComponent,
		PlotlyDailyCasesComponent,
		PlotlyAmountInvoicesComponent,
		PlotlyAmountRecoveryComponent,
		PlotlyMobilityComponent,
		MetigationRecoveryComponent,
		PlotlyInvoicesValueRecoveryComponent,
		PlotlyAmountInvoicesRecoveryComponent,
		PlotlyTotalDeathsRecoveryComponent,


		
		        //MATERIAL
				CdkTableModule,
				MatTreeModule,
				MatAutocompleteModule,
				MatButtonModule,
				MatButtonToggleModule,
				MatCardModule,
				MatCheckboxModule,
				MatChipsModule,
				MatStepperModule,
				MatDatepickerModule,
				MatDialogModule,
				MatDividerModule,
				MatExpansionModule,
				MatGridListModule,
				MatIconModule,
				MatInputModule,
				MatListModule,
				MatMenuModule,
				MatNativeDateModule,
				MatPaginatorModule,
				MatProgressBarModule,
				MatProgressSpinnerModule,
				MatRadioModule,
				MatRippleModule,
				MatSelectModule,
				MatSidenavModule,
				MatSliderModule,
				MatSlideToggleModule,
				MatSnackBarModule,
				MatSortModule,
				MatTableModule,
				MatTabsModule,
				MatToolbarModule,
				MatTooltipModule,
				MatBadgeModule,
		
		
		
		

		NgxDropzoneModule,
		NgxMatFileInputModule
	],
	imports: [
		CommonModule,
		PerfectScrollbarModule,
		MatTableModule,
		CoreModule,
		MatIconModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatPaginatorModule,
		MatSortModule,
		FormsModule,
		NgbModule,
		NgApexchartsModule,
		ReactiveFormsModule,
		FileUploadModule,
		  //MATERIAL
		  CdkTableModule,
		  MatTreeModule,
		  MatAutocompleteModule,
		  MatButtonModule,
		  MatButtonToggleModule,
		  MatCardModule,
		  MatCheckboxModule,
		  MatChipsModule,
		  MatStepperModule,
		  MatDatepickerModule,
		  MatDialogModule,
		  MatDividerModule,
		  MatExpansionModule,
		  MatGridListModule,
		  MatIconModule,
		  MatInputModule,
		  MatListModule,
		  MatMenuModule,
		  MatNativeDateModule,
		  MatPaginatorModule,
		  MatProgressBarModule,
		  MatProgressSpinnerModule,
		  MatRadioModule,
		  MatRippleModule,
		  MatSelectModule,
		  MatSidenavModule,
		  MatSliderModule,
		  MatSlideToggleModule,
		  MatSnackBarModule,
		  MatSortModule,
		  MatTableModule,
		  MatTabsModule,
		  MatToolbarModule,
		  MatTooltipModule,
		  MatBadgeModule,
		
		  PlotlyModule,
		  NgxMatFileInputModule,
		NgxDropzoneModule,
		TranslateModule.forChild(),
	]
})
export class WidgetModule {
}
