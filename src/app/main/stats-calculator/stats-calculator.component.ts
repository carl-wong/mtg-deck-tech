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

		//set form default value
		this.params.mode = Statistics.GROUP_MODES[0].toString();
		this._selectMode(this.params.mode);
		this._enforceLimits();
	}

	private _enforceLimits() {
		// hand size <= deck size
		this.params.sampleSize = Math.min(this.params.populationSize, this.params.sampleSize);

		// hits <= hand size
		this.params.sampleSuccesses = Math.min(this.limits.sampleSuccesses.max, this.params.sampleSize, this.params.sampleSuccesses);
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

	private _selectMode(mode: string) {
		switch (mode as GroupByMode) {
			case GroupByMode.Types:
				this.valueOptions = Statistics.MAIN_TYPES;
				break;

			case GroupByMode.Tags:
				this.valueOptions = Object.keys(this._tagsDict).sort((a, b) => {
					if (a < b) {
						return 1;
					} else if (b < a) {
						return -1;
					} else {
						return 0;
					}
				});
				break;

			case GroupByMode.CMC:
				this.valueOptions = Statistics.getCMCOptions();
				break;

			default:
				this.valueOptions = [];
				break;
		}

		this.params.value = this.valueOptions[0];
		this._selectValue(this.params.value);
	}

	onSelectMode($event) {
		this._selectMode($event.value);
		this._enforceLimits();
	}

	private _selectValue(value: string) {
		let dict = {};

		switch (this.params.mode as GroupByMode) {
			case GroupByMode.Types:
				dict = this._typesDict;
				break;

			case GroupByMode.Tags:
				dict = this._tagsDict;
				break;

			case GroupByMode.CMC:
				dict = this._cmcDict;
				break;

			default:
				break;
		}

		if (dict[this.params.value]) {
			this.limits.sampleSuccesses.max = Math.min(this.params.sampleSize, dict[this.params.value]);
		} else {
			//notify of invalid selection
		}
	}

	onSelectValue($event) {
		this._selectValue($event.value);
		this._enforceLimits();
	}

	onChangeSampleSize($event) {
		this._selectValue(this.params.value);
		this._enforceLimits();
	}
}