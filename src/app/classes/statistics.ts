import { CardReference } from './card-reference';
import { ChartDataSets, ChartOptions } from 'chart.js';


export abstract class Statistics {
	static getChartCMCCurve(deck: CardReference[]): ChartDataSets {
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