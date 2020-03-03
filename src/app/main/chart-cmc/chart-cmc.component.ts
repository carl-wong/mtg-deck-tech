import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Statistics } from '@classes/statistics';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';


export interface iChartCmc {
	title: string;
	data: ChartDataSets[];
	labels: Label[];
}

@Component({
	selector: 'app-chart-cmc',
	templateUrl: './chart-cmc.component.html',
	styleUrls: ['./chart-cmc.component.less']
})
export class ChartCmcComponent implements OnInit {
	@Input() model: iChartCmc;
	@ViewChild(BaseChartDirective, { static: true }) baseChart: BaseChartDirective;

	options: ChartOptions = {
		maintainAspectRatio: false,
		responsive: true,
		scales: {
			yAxes: [{
				ticks: {
					stepSize: 1,
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
					return ''; // no title
				},
				label(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData) {
					if (data.labels && data.datasets) {
						const cmc = data.labels[tooltipItem.index || 0];
						const dataSet = data.datasets[tooltipItem.datasetIndex || 0];

						if (dataSet.data) {
							const count = Number(dataSet.data[tooltipItem.index || 0]);
							const occ = count === 1 ? 'Card' : 'Cards';

							const total = (dataSet.data as number[]).reduce((a, b) => a + b, 0);
							const percent = total > 0 ? Math.round(count / total * 10000) / 100 : 0;

							return [`${tooltipItem.xLabel} CMC`, `${count} ${occ}`, percent + '%'];
						}
					}

					return 'NO LABEL';
				}
			}
		}
	};

	legend = false;
	type = 'bar';
	colors: Color[] = [{
		backgroundColor: Statistics.PALETTE_BLUE[5]
	}];

	constructor() { }

	ngOnInit() {
	}
}
