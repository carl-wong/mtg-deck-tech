import { ChartDataSets } from 'chart.js';
import { MultiDataSet } from 'ng2-charts';
import { CardReference } from './card-reference';


export abstract class Statistics {
	static COLORS = [
		['W', 'White'],
		['U', 'Blue'],
		['B', 'Black'],
		['R', 'Red'],
		['G', 'Green'],
		['C', 'Colorless']
	];

	static getChartCMC(deck: CardReference[]): ChartDataSets {
		function sum(total, num) {
			return total + num;
		}

		let result: ChartDataSets = {
			data: [],
			label: 'CMC Curve',
			backgroundColor: PALETTE_BLUE[5]
		};

		for (let i = 0; i < 8; i++) {
			let filtered: CardReference[];

			if (i === 0) {
				filtered = deck.filter(m => m.OracleCard && m.OracleCard.cmc === i)
					.filter(m => !m.OracleCard.type_line.includes('Land'));
			} else if (i === 7) {
				filtered = deck.filter(m => m.OracleCard && m.OracleCard.cmc > 6);
			} else {
				filtered = deck.filter(m => m.OracleCard && m.OracleCard.cmc === i);
			}

			if (filtered && filtered.length > 0) {
				result.data.push(filtered.map(m => m.count).reduce(sum));
			} else {
				result.data.push(0);
			}
		}

		return result;
	}

	static getChartColorPie(deck: CardReference[]): ChartDataSets[] {

		let cardCounts: { [color: string]: number } = {};
		let landCounts: { [color: string]: number } = {};

		this.COLORS.forEach(c => {
			cardCounts[c[0]] = 0;
			landCounts[c[0]] = 0;
		});

		deck.filter(m => m.OracleCard).forEach(card => {
			if (card.OracleCard.layout !== 'transform' &&
				card.OracleCard.type_line.includes('Land')) {
				if (card.OracleCard.color_identity) {
					card.OracleCard.color_identity.forEach(c => {
						landCounts[c] += 1;
					});
				}

				if (card.OracleCard.oracle_text.includes('Add {C}')) {
					landCounts['C'] += 1;
				}
			} else {
				if (card.OracleCard.colors) {
					card.OracleCard.colors.forEach(c => {
						cardCounts[c] += 1;
					});
				} else {
					cardCounts['C'] += 1;
				}
			}
		});

		let result: MultiDataSet = [[], []];

		for (let i = 0; i < this.COLORS.length; i++) {
			result[0][i] = landCounts[this.COLORS[i][0]];
			result[1][i] = cardCounts[this.COLORS[i][0]];
		}

		return result;
	}
}


const PALETTE_BLUE = [
	'#a2c0c7',
	'#7da7b0',
	'#61949f',
	'#45818e',
	'#3e7986',
	'#366e7b',
	'#2e6471',
	'#1f515f',
	'#9fe9ff',
	'#6cddff',
	'#39d2ff',
	'#1fccff',
];

const PALETTE_GREEN = [
	'#b5d4a7',
	'#97c284',
	'#80b569',
	'#6aa84f',
	'#62a048',
	'#57973f',
	'#4d8d36',
	'#3c7d26',
	'#cdffbe',
	'#a6ff8b',
	'#7fff58',
	'#6cff3f',
];

const PALETTE_ORANGE = [
	'#f3c89c',
	'#eeb274',
	'#eaa256',
	'#e69138',
	'#e38932',
	'#df7e2b',
	'#db7424',
	'#d56217',
	'#ffffff',
	'#ffe3d4',
	'#ffc3a1',
	'#ffb287',
];