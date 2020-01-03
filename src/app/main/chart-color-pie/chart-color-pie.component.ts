import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Color, Label, MultiDataSet } from 'ng2-charts';

export interface ChartColorPie {
	title: string;
	data: MultiDataSet;
	labels: Label[];
	colors: Color[];
}


@Component({
	selector: 'app-chart-color-pie',
	templateUrl: './chart-color-pie.component.html',
	styleUrls: ['./chart-color-pie.component.less']
})
export class ChartColorPieComponent implements OnInit {
	@Input() model: ChartColorPie
	@ViewChild(BaseChartDirective, { static: true }) baseChart: BaseChartDirective;

	options: ChartOptions = {
		responsive: true,
		legend: {
			position: 'right',
		},
		tooltips: {
			callbacks: {
				label(tooltipItem, data) {
					const risk = data.labels[tooltipItem.index];
					const percentage = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + '%';
					return risk + ': ' + percentage;
				}
			}
		}
	};

	legend = true;
	type: ChartType = 'doughnut';

	constructor() { }

	ngOnInit() {
	}
}
