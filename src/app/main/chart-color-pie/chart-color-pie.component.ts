import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Statistics } from '@classes/statistics';
import { ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, MultiDataSet } from 'ng2-charts';


export interface iChartColorPie {
	title: string;
	data: MultiDataSet;
}

@Component({
	selector: 'app-chart-color-pie',
	templateUrl: './chart-color-pie.component.html',
	styleUrls: ['./chart-color-pie.component.less']
})
export class ChartColorPieComponent implements OnInit {
	@Input() model: iChartColorPie;
	@ViewChild(BaseChartDirective, { static: true }) baseChart: BaseChartDirective;

	options: ChartOptions = {
		maintainAspectRatio: false,
		responsive: true,
		tooltips: {
			custom(tooltip: Chart.ChartTooltipModel) {
				if (!tooltip) { return; }
				tooltip.displayColors = false;
			},
			callbacks: {
				label(tooltipItem, data) {
					if (data.labels && data.datasets) {
						const seriesName = data.labels[tooltipItem.datasetIndex || 0] as string;
						const colorName = Statistics.COLORS[tooltipItem.index || 0][1];

						const dataSet = data.datasets[tooltipItem.datasetIndex || 0];

						if (dataSet.data) {
							const count = dataSet.data[tooltipItem.index || 0] as number;
							const occ = count === 1 ?
								(seriesName === 'Lands' ? 'Land' : 'Card') :
								(seriesName === 'Lands' ? 'Lands' : 'Cards');

							const total = (dataSet.data as number[]).reduce((a, b) => a + b, 0);
							const percent = total > 0 ? Math.round(count / total * 10000) / 100 : 0;

							return [seriesName, `${count} ${colorName} ${occ}`, percent + '%'];
						}
					}

					return 'NO LABEL';
				}
			}
		}
	};

	legend = false;
	type: ChartType = 'doughnut';

	labels = [
		'Lands',
		'Non-Lands',
	];

	colors = [
		{
			backgroundColor: [
				'#F6F2E4',
				'#B9E6FE',
				'#BAB1AB',
				'#F5B396',
				'#A6CEAA',
				'#CCCCCC'
			],
		},
		{
			backgroundColor: [
				'#F6F2E4',
				'#B9E6FE',
				'#BAB1AB',
				'#F5B396',
				'#A6CEAA',
				'#CCCCCC'
			],
		},
	];

	constructor() { }

	ngOnInit() {
	}
}
