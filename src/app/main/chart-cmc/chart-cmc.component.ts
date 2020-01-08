import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';

export interface ChartCmc {
	title: string;
	data: ChartDataSets[];
	labels: Label[];
	colors: Color[];
}


@Component({
	selector: 'app-chart-cmc',
	templateUrl: './chart-cmc.component.html',
	styleUrls: ['./chart-cmc.component.less']
})
export class ChartCmcComponent implements OnInit {
	@Input() model: ChartCmc;
	@ViewChild(BaseChartDirective, { static: true }) baseChart: BaseChartDirective;

	options: ChartOptions = {
		responsive: true,
		scales: {
			yAxes: [{
				ticks: {
					beginAtZero: true,
				}
			}]
		},
		tooltips: {
			custom(tooltip: Chart.ChartTooltipModel) {
				if (!tooltip) { return; }
				tooltip.displayColors = false;
			},
			callbacks: {
				title(item: Chart.ChartTooltipItem[], data: Chart.ChartData) {
					const label = data.datasets[0].label.trim();
					return label;
				},
				label(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData) {
					const cmc = data.labels[tooltipItem.index];
					const count = Number(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
					return cmc + ' CMC: ' + count + (count === 1 ? ' card' : ' cards');
				}
			}
		}
	};

	legend = false;
	type = 'bar';

	constructor() { }

	ngOnInit() {
	}
}
