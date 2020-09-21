import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SparklineChartOptions, LayoutConfigService, TranslationService } from '../../../../../core/_base/layout';

import { DashboardService } from '../../../../../services/dashboard.service';


import { locale as enLang } from '../../../../../core/_config/i18n/en';
import { locale as chLang } from '../../../../../core/_config/i18n/ch';
import { locale as esLang } from '../../../../../core/_config/i18n/es';
import { locale as jpLang } from '../../../../../core/_config/i18n/jp';
import { locale as deLang } from '../../../../../core/_config/i18n/de';
import { locale as frLang } from '../../../../../core/_config/i18n/fr';
import { locale as ptLang } from '../../../../../core/_config/i18n/pt';

import 'hammerjs';
import 'chartjs-plugin-zoom';
import { Router } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { set } from 'object-path';

@Component({
	selector: 'kt-deaths_chart',
	templateUrl: './deaths_chart.component.html',
	styleUrls: ['./deaths_chart.component.scss']
})
export class DeathsChartComponent implements OnInit {

	// Public properties
	@Input() data: { labels: string[], datasets: any[] };
	@Input() type = 'line';
	@Input() value: string;
	@Input() desc: string;
	@ViewChild('chart', {static: true}) chart;


	chartjs: any;
	
	/**
	 * Component constructor
	 * @param layoutConfigService
	 */
	constructor(
		private layoutConfigService: LayoutConfigService,
		private dashboardService: DashboardService,
		private translationService: TranslationService,
		private translateService: TranslateService
	) { 
		this.translationService.loadTranslations(enLang, chLang, esLang, jpLang, deLang, frLang, ptLang);
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */

	ngOnInit(): void {
		DashboardService.CountryResponse.subscribe(
			y => this.getdashboard(y)
		  )
		// this.getDashboard();

		const color = Chart.helpers.color;
		if (!this.data) {
			this.data = {
				labels: ['1 Jan', '2 Jan', '3 Jan', '4 Jan', '5 Jan', '6 Jan', '7 Jan'],
				datasets: [
					{
						label: "predição",
						fill: false,
						borderWidth: 3,
						//backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.2).rgbString(),
						borderColor: color(this.layoutConfigService.getConfig('colors.state.danger')).alpha(1).rgbString(),

						pointHoverRadius: 4,
						pointHoverBorderWidth: 12,
						pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
						pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

						data: [25, 45, 55, 30, 40, 65, 35],
						lineTension: 0.0
					}
				]
			};
		}
		this.initChart();
	}
	
	clickFunction() {
		this.chartjs.resetZoom();
	}

	private initChart() {
		// For more information about the chartjs, visit this link
		// https://www.chartjs.org/docs/latest/getting-started/usage.html

		this.chartjs = new Chart(this.chart.nativeElement, {
			type: this.type,
			data: this.data,
			options: {

				responsive: true,
				maintainAspectRatio: false,
				legend: {
					
					display: true,
					position: 'bottom',
					align: 'auto',
					Labels: {
						usePointStyle: true,
						fontSize: 14,
					generateLabels: function (chart) { 
						const items = [];
						chart.data.datasets.forEach ((dataset,i) => {
							items.push({
								text: dataset.label,
								datasetIndex: i,
								fillStyle: dataset.borderColor,
								lineWidth: 0,
								pointStyle: 'rectRot',
							});
						}); 
						return items;
					},
				 },
				},
				scales: {
					xAxes: [{
						categoryPercentage: 0.35,
						barPercentage: 0.70,
						display: true,
						scaleLabel: {
							display: false,
							labelString: 'Month'
						},
						gridLines: false,
						ticks: {
							maxTicksLimit: 10,
							display: true,
							beginAtZero: true,
							fontColor: this.layoutConfigService.getConfig('colors.base.shape.3'),
							fontSize: 13,
							padding: 10
						}
					}],
					yAxes: [{
						categoryPercentage: 0.35,
						barPercentage: 0.70,
						display: true,
						scaleLabel: {
							display: false,
							labelString: 'Value'
						},
						gridLines: {
							color: this.layoutConfigService.getConfig('colors.base.shape.2'),
							drawBorder: false,
							offsetGridLines: false,
							drawTicks: false,
							borderDash: [3, 4],
							zeroLineWidth: 1,
							zeroLineColor: this.layoutConfigService.getConfig('colors.base.shape.2'),
							zeroLineBorderDash: [3, 4]
						},
						ticks: {
							maxTicksLimit: 10,
							display: true,
							beginAtZero: true,
							fontColor: this.layoutConfigService.getConfig('colors.base.shape.3'),
							fontSize: 13,
							padding: 10
						}
					}]
				},
				title: {
					display: false
				},
				hover: {
					mode: 'index'
				},
				tooltips: {
					enabled: true,
					intersect: false,
					mode: 'nearest',
					bodySpacing: 5,
					yPadding: 10,
					xPadding: 10,
					caretPadding: 0,
					displayColors: false,
					backgroundColor: this.layoutConfigService.getConfig('colors.state.danger'),
					titleFontColor: '#ffffff',
					cornerRadius: 4,
					footerSpacing: 0,
					titleSpacing: 0
				},
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 5,
						bottom: 5
					}
				},
				plugins: {
					zoom: {
						// Container for pan options
						pan: {
							// Boolean to enable panning
							enabled: true,

				
							// Panning directions. Remove the appropriate direction to disable
							// Eg. 'y' would only allow panning in the y direction
							// A function that is called as the user is panning and returns the
							// available directions can also be used:
							//   mode: function({ chart }) {
							//     return 'xy';
							//   },
							mode: 'xy',
				
							rangeMin: {
								// Format of min pan range depends on scale type
								x: 0,
								y: 0
							},
							rangeMax: {
								// Format of max pan range depends on scale type
								x: null,
								y: null
							},
				
							// On category scale, factor of pan velocity
							speed: 5,
				
							// Minimal pan distance required before actually applying pan
							threshold: 10,
				
							// Function called while the user is panning
							onPan: function({chart}) { console.log(`I'm panning!!!`); },
							// Function called once panning is completed
							onPanComplete: function({chart}) { console.log(`I was panned!!!`); }
						},
				
						// Container for zoom options
						zoom: {
							// Boolean to enable zooming
							enabled: true,
				
							// Enable drag-to-zoom behavior
							drag: false,
				
							// Drag-to-zoom effect can be customized
							// drag: {
							// 	 borderColor: 'rgba(225,225,225,0.3)'
							// 	 borderWidth: 5,
							// 	 backgroundColor: 'rgb(225,225,225)',
							// 	 animationDuration: 0
							// },
				
							// Zooming directions. Remove the appropriate direction to disable
							// Eg. 'y' would only allow zooming in the y direction
							// A function that is called as the user is zooming and returns the
							// available directions can also be used:
							//   mode: function({ chart }) {
							//     return 'xy';
							//   },
							mode: 'xy',
				
							rangeMin: {
								// Format of min zoom range depends on scale type
								x: 0,
								y: 0
							},
							rangeMax: {
								// Format of max zoom range depends on scale type
								x: null,
								y: null
							},
				
							// Speed of zoom via mouse wheel
							// (percentage of zoom on a wheel event)
							speed: 0.1,
				
							// Minimal zoom distance required before actually applying zoom
							threshold: 2,
				
							// On category scale, minimal zoom level before actually applying zoom
							sensitivity: 3,
							
							// Function called while the user is zooming
							onZoom: function({chart}) { console.log(`I'm zooming!!!`); },
							// Function called once zooming is completed
							onZoomComplete: function({chart}) { console.log(`I was zoomed!!!`); }
						}
					}
				},
				
			}
		});
	}

	getdashboard(obj?) {
        console.log(obj);
		// this.dashboardService.getMortesTotal().subscribe(obj => {
			
			var realLength = obj.real.data.length;
			var _labels = obj.real.data.concat(obj.previsto.data);
			const color = Chart.helpers.color;

			this.data = {
				labels: _labels.slice(1),
				datasets: [
					{   label:  this.translateService.instant('DASHBOARD.REAL_CHART'),
						fill: false,
						borderWidth: 3,
						//backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.2).rgbString(),
						borderColor: color(this.layoutConfigService.getConfig('colors.state.danger')).alpha(1).rgbString(),

						pointHoverRadius: 4,
						pointHoverBorderWidth: 12,
						pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
						pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

						data: obj.real.quantidade,
						lineTension: 0
					},
					{   
						label: this.translateService.instant('DASHBOARD.PREDICT_CHART'),
						fill: false,
						borderWidth: 3,
						//backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.2).rgbString(),
						borderColor: color(this.layoutConfigService.getConfig('colors.state.danger')).alpha(1).rgbString(),
						borderDash: [5, 5],

						pointHoverRadius: 4,
						pointHoverBorderWidth: 12,
						pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
						pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

						data: Array(realLength-1).fill(null).concat(obj.previsto.quantidade),
						lineTension: 0
					}
				]
			};
			this.chartjs.data = this.data
			// this.chartjs.data.datasets[0].label = "SuaString";
			this.chartjs.update();

			this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
				this.chartjs.data.datasets[0].label = this.translateService.instant('DASHBOARD.REAL_CHART');
				this.chartjs.data.datasets[1].label = this.translateService.instant('DASHBOARD.PREDICT_CHART');

				var dp  = new DatePipe(this.translateService.currentLang);
				

				for(var x=0; x < _labels.length; x++){
					
					
					var date1 = _labels[x].split("/");
					var d = new Date(parseInt(date1[2]), parseInt(date1[1])-1, parseInt(date1[0])+1).toISOString();
					
					if(this.translateService.currentLang == 'en'){
					
						this.chartjs.data.labels[x] = dp.transform(d,'MM/dd/yyyy');
						
					}else if (this.translateService.currentLang == 'pt'){
					
						this.chartjs.data.labels[x] = dp.transform(d,'dd/MM/yyyy');
						
					}
					
				}

				

				this.chartjs.update();
			});
		// });	
	}
}
