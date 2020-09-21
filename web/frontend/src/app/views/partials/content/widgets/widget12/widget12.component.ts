// Angular
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
// Layout config
import { LayoutConfigService } from '../../../../../core/_base/layout';

/**
 * Sample components with sample data
 */
@Component({
	selector: 'kt-widget12',
	templateUrl: './widget12.component.html',
	styleUrls: ['./widget12.component.scss']
})
export class Widget12Component implements OnInit {

	// Public properties
	@Input() data: { labels: string[], datasets: any[] };
	@Input() type = 'line';
	@ViewChild('chart', {static: true}) chart;

	/**
	 * Component constructor
	 * @param layoutConfigService
	 */
	constructor(private layoutConfigService: LayoutConfigService) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		const color = Chart.helpers.color;
		if (!this.data) {
			this.data = {
				labels: ['1 Jan', '2 Jan', '3 Jan', '4 Jan', '5 Jan', '6 Jan', '7 Jan'],
				datasets: [
					{
						fill: true,
						// borderWidth: 0,
						backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.6).rgbString(),
						borderColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0).rgbString(),

						pointHoverRadius: 4,
						pointHoverBorderWidth: 12,
						pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
						pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

						data: [20, 40, 50, 25, 35, 60, 30]
					},
					{
						fill: true,
						// borderWidth: 0,
						backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.2).rgbString(),
						borderColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0).rgbString(),

						pointHoverRadius: 4,
						pointHoverBorderWidth: 12,
						pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
						pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
						pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

						data: [25, 45, 55, 30, 40, 65, 35]
					}
				]
			};
		}
		this.initChart();
	}

	private initChart() {
		// For more information about the chartjs, visit this link
		// https://www.chartjs.org/docs/latest/getting-started/usage.html

		var chart = new Chart(this.chart.nativeElement, {
			type: this.type,
			data: this.data,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				legend: false,
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
							max: 70,
							stepSize: 10,
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
					backgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
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
				}
			}
		});
		this.updateChart(chart)
	}
	updateChart(chart) {
		const color = Chart.helpers.color;
		this.data = {
			labels: ['1 Jan', '2 Jan', '3 Jan', '4 Jan', '5 Jan', '6 Jan', '7 Jan'],
			datasets: [
				{
					fill: true,
					// borderWidth: 0,
					backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.6).rgbString(),
					borderColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0).rgbString(),

					pointHoverRadius: 4,
					pointHoverBorderWidth: 12,
					pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
					pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
					pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
					pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

					data: [200, 400, 500, 205, 305, 600, 300]
				},
				{
					fill: true,
					// borderWidth: 0,
					backgroundColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0.2).rgbString(),
					borderColor: color(this.layoutConfigService.getConfig('colors.state.brand')).alpha(0).rgbString(),

					pointHoverRadius: 4,
					pointHoverBorderWidth: 12,
					pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
					pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
					pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.brand'),
					pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

					data: [25, 45, 55, 30, 40, 65, 35]
				}
			]
		};
		chart.data = this.data
		
		chart.update();
	}
}
