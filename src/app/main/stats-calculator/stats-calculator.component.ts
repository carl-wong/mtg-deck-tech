import { Component, OnInit, Input } from '@angular/core';
import { CardReference } from '../../classes/card-reference';
import { Statistics, GroupByMode, MainCardTypes } from '../../classes/statistics';


interface iStatistics {
	mode: string;
	value: string;
	populationSize: number;
	populationSuccesses: number;
	sampleSize: number;
	sampleSuccesses: number;
}

@Component({
	selector: 'app-stats-calculator',
	templateUrl: './stats-calculator.component.html',
	styleUrls: ['./stats-calculator.component.less']
})
export class StatsCalculatorComponent implements OnInit {
	modeOptions = Statistics.GROUP_MODES;
	valueOptions: string[] = [];
	maxSampleSuccesses: number;

	limits = {
		sampleSize: {
			max: 0
		},
		sampleSuccesses: {
			max: 0
		}
	};

	private _tagsDict: { [tagName: string]: number } = {};
	private _typesDict: { [typeName: string]: number } = {};
	private _cmcDict: { [cmcString: string]: number } = {};

	@Input() model: CardReference[];

	@Input() params: iStatistics = {
		mode: null,
		value: null,
		populationSize: 0,
		populationSuccesses: 0,
		sampleSize: 7,
		sampleSuccesses: 0,
	};

	constructor() { }

	ngOnInit() {
		this.model.forEach(card => {
			this._countByTypes(card);
			this._countByTags(card);
			this._countByCMC(card);

			this.params.populationSize += card.count;
		});
	}

	private _countByTypes(card: CardReference) {
		if (card.OracleCard && card.OracleCard.type_line) {
			Statistics.MAIN_TYPES.forEach(type => {
				const typeString = type.toString();
				if (card.OracleCard.type_line.indexOf(typeString) !== -1) {
					if (!this._typesDict[typeString]) {
						this._typesDict[typeString] = card.count;
					} else {
						this._typesDict[typeString] += card.count;
					}
				}
			});
		}
	}

	private _countByTags(card: CardReference) {
		if (card.CardTagLinks) {
			card.CardTagLinks.forEach(link => {
				if (!this._tagsDict[link.TagName]) {
					this._tagsDict[link.TagName] = card.count;
				} else {
					this._tagsDict[link.TagName] += card.count;
				}
			});
		}
	}

	private _countByCMC(card: CardReference) {
		if (card.OracleCard) {
			let cmcString = null;

			if (card.OracleCard.cmc === 0 &&
				card.OracleCard.type_line &&
				card.OracleCard.type_line.includes('Land')) {
				cmcString = 'Land';
			} else {
				cmcString = typeof card.OracleCard.cmc === 'number' ?
					Statistics.cmcToString(card.OracleCard.cmc) :
					Statistics.cmcToString(0);
			}

			if (!this._cmcDict[cmcString]) {
				this._cmcDict[cmcString] = card.count;
			} else {
				this._cmcDict[cmcString] += card.count;
			}
		}
	}

	onSelectMode($event) {
		const mode = $event.value;

		switch (mode as GroupByMode) {
			case GroupByMode.Types:
				this.valueOptions = Statistics.MAIN_TYPES;
				break;

			case GroupByMode.Tags:
				this.valueOptions = Object.keys(this._tagsDict);
				break;

			case GroupByMode.CMC:
				this.valueOptions = Statistics.getCMCOptions();
				break;

			default:
				this.valueOptions = [];
				break;
		}
	}

	onSelectValue($event) {
		console.log(this.params);
		const value = $event.value;





	}
}