import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartOptions, ChartType, RadialChartOptions, ChartDataSets } from 'chart.js';
import { BaseChartDirective, Color, Label, MultiDataSet } from 'ng2-charts';
import { Statistics } from '../../classes/statistics';


export interface iChartTags {
	title: string;
	data: ChartDataSets[];
	labels: Label[];
}

@Component({
	selector: 'app-chart-tags',
	templateUrl: './chart-tags.component.html',
	styleUrls: ['./chart-tags.component.less']
})
export class ChartTagsComponent implements OnInit {
	@Input() model: iChartTags;
	@ViewChild(BaseChartDirective, { static: true }) baseChart: BaseChartDirective;

	options: RadialChartOptions = {
		responsive: true,
		scale: {
			ticks: {
				stepSize: 2,
				precision: 0,
				suggestedMin: 0,
			}
		},
		tooltips: {
			custom(tooltip: Chart.ChartTooltipModel) {
				if (!tooltip) { return; }
				tooltip.displayColors = false;
			},
			callbacks: {
				title(item: Chart.ChartTooltipItem[], data: Chart.ChartData) {
					return '';
				},
				label(tooltipItem, data) {
					const tag = data.labels[tooltipItem.index] as string;
					const count = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] as number;
					const occ = count === 1 ? 'Card Tagged' : 'Cards Tagged';

					return [tag, `${count} ${occ}`];
				}
			}
		}
	};

	legend = false;
	type: ChartType = 'radar';
	colors: Color[] = [{
		backgroundColor: Statistics.hexToRgbA(Statistics.PALETTE_GREEN[5], 0.4),
		borderColor: Statistics.hexToRgbA(Statistics.PALETTE_GREEN[4], 0.8),
	}];

	constructor() { }

	ngOnInit() {
	}

}
