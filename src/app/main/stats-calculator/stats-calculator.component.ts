import { Component, OnInit, Input } from '@angular/core';
import { CardReference } from '../../classes/card-reference';
import { Statistics, GroupByMode, MainCardTypes } from '../../classes/statistics';
import { create, all } from 'mathjs';

interface iHypergeometricParams {
	mode: string;
	modeValue: string;
	populationSize: number;			// N
	populationSuccesses: number;	// k
	sampleSize: number;				// n
	sampleSuccesses: number;		// x
}

interface iHypergeometricOutputs {
	X_eq_x: number;
	X_lt_x: number;
	X_lte_x: number;
	X_gt_x: number;
	X_gte_x: number;
}

@Component({
	selector: 'app-stats-calculator',
	templateUrl: './stats-calculator.component.html',
	styleUrls: ['./stats-calculator.component.less']
})
export class StatsCalculatorComponent implements OnInit {
	modeOptions = Statistics.GROUP_MODES;
	modeValueOptions: string[] = [];
	maxSampleSuccesses: number;

	limits = {
		sampleSuccesses: {
			max: 0
		}
	};

	private _tagsDict: { [tagName: string]: number } = {};
	private _typesDict: { [typeName: string]: number } = {};
	private _cmcDict: { [cmcString: string]: number } = {};

	private _math: Partial<math.MathJsStatic> = create(all, {});

	@Input() model: CardReference[];

	@Input() params: iHypergeometricParams = {
		mode: null,
		modeValue: null,
		populationSize: 0,
		populationSuccesses: 0,
		sampleSize: 7,
		sampleSuccesses: 0,
	};

	outputs: iHypergeometricOutputs = {
		X_eq_x: 0,
		X_lt_x: 0,
		X_lte_x: 0,
		X_gt_x: 0,
		X_gte_x: 0,
	};

	constructor() { }

	ngOnInit() {
		// set form default value
		this.params.mode = Statistics.GROUP_MODES[0].toString();
	}

	updateOptions() {
		this.params.populationSize = 0;

		this.model.forEach(card => {
			this._countByTypes(card);
			this._countByTags(card);
			this._countByCMC(card);

			this.params.populationSize += card.count;
		});

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

			if (typeof card.OracleCard.cmc === 'number') {
				cmcString = Statistics.cmcToString(card.OracleCard.cmc);
			} else if (card.OracleCard.type_line &&
				card.OracleCard.type_line.includes('Land')) {
				cmcString = 'Land';
			} else {
				cmcString = Statistics.cmcToString(0);
			}

			if (!this._cmcDict[cmcString]) {
				this._cmcDict[cmcString] = card.count;
			} else {
				this._cmcDict[cmcString] += card.count;
			}
		}
	}

	private _getDictByMode(mode: GroupByMode) {
		switch (mode as GroupByMode) {
			case GroupByMode.Types:
				return this._typesDict;

			case GroupByMode.Tags:
				return this._tagsDict;

			case GroupByMode.CMC:
				return this._cmcDict;

			default:
				return {};
		}
	}

	private _selectMode(mode: string) {
		function sort(a, b) {
			if (a > b) {
				return 1;
			} else if (b > a) {
				return -1;
			} else {
				return 0;
			}
		}

		this.modeValueOptions = Object.keys(this._getDictByMode(mode as GroupByMode)).sort(sort);
		this.params.modeValue = this.modeValueOptions[0];
		this._selectModeValue(this.modeValueOptions[0]);
	}

	onSelectMode($event) {
		this._selectMode($event.value);
		this._enforceLimits();
	}

	private _selectModeValue(value: string) {
		const dict = this._getDictByMode(this.params.mode as GroupByMode);

		// update params
		if (dict[this.params.modeValue]) {
			this.params.populationSuccesses = dict[this.params.modeValue];
		} else {
			this.params.populationSuccesses = 0;
		}

		this.limits.sampleSuccesses.max = Math.min(this.params.sampleSize, this.params.populationSuccesses);
	}

	onSelectModeValue($event) {
		this._selectModeValue($event.value);
		this._enforceLimits();
	}

	onChangeSampleSize($event) {
		this._selectModeValue(this.params.modeValue);
		this._enforceLimits();
	}

	calculate() {
		const _N = this.params.populationSize;
		const _k = this.params.populationSuccesses;
		const _n = this.params.sampleSize;
		const _x = this.params.sampleSuccesses;

		const results: iHypergeometricOutputs = {
			X_eq_x: 0,
			X_lt_x: 0,
			X_lte_x: 0,
			X_gt_x: 0,
			X_gte_x: 0,
		};

		for (let iX = 0; iX <= _n && iX <= _k; iX++) {
			const prob = (this._math.combinations(_k, iX) as number) *
				(this._math.combinations(_N - _k, _n - iX) as number) /
				(this._math.combinations(_N, _n) as number);

			if (iX < _x) {
				results.X_lt_x += prob;
				results.X_lte_x += prob;
			} else if (iX === _x) {
				results.X_lte_x += prob;
				results.X_eq_x = prob;
				results.X_gte_x += prob;
			} else if (iX > _x) {
				results.X_gte_x += prob;
				results.X_gt_x += prob;
			}
		}

		Object.keys(results).forEach(key => {
			results[key] = Math.round(results[key] * 10000) / 100;
		});

		this.outputs = results;
	}
}
