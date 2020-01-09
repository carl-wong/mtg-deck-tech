import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Color, Label, MultiDataSet } from 'ng2-charts';
import { Statistics } from '../../classes/statistics';


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
		responsive: true,
		tooltips: {
			custom(tooltip: Chart.ChartTooltipModel) {
				if (!tooltip) { return; }
				tooltip.displayColors = false;
			},
			callbacks: {
				label(tooltipItem, data) {
					const seriesName = data.labels[tooltipItem.datasetIndex] as string;
					const colorName = Statistics.COLORS[tooltipItem.index][1];

					const count = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] as number;
					const occ = count === 1 ?
						(seriesName === 'Lands' ? 'Land' : 'Card') :
						(seriesName === 'Lands' ? 'Lands' : 'Cards');

					const total = (data.datasets[tooltipItem.datasetIndex].data as number[]).reduce((a, b) => a + b);
					const percent = total > 0 ? Math.round(count / total * 10000) / 100 : 0;

					return [seriesName, `${count} ${colorName} ${occ}`, percent + '%'];
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
