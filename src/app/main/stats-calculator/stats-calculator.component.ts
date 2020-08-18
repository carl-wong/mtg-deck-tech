import { Component, Input, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { CardReference } from '@classes/card-reference';
import { CardTagLink } from '@classes/card-tag-link';
import { GroupByMode, Statistics } from '@classes/statistics';
import { Tag } from '@classes/tag';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { all, create } from 'mathjs';

interface IHypergeometricParams {
  mode: string;
  modeValue: string;
  populationSize: number;			// N
  populationSuccesses: number;	// k
  sampleSize: number;				// n
  sampleSuccesses: number;		// x
}

interface IHypergeometricOutputs {
  [key: string]: any;

  X_eq_x: number;
  X_lt_x: number;
  X_lte_x: number;
  X_gt_x: number;
  X_gte_x: number;
}

@Component({
  selector: 'app-stats-calculator',
  templateUrl: './stats-calculator.component.html',
  styleUrls: ['./stats-calculator.component.less'],
})
export class StatsCalculatorComponent implements OnInit {
  public faCalculator = faCalculator;

  public modeOptions = Statistics.GROUP_MODES;
  public modeValueOptions: string[] = [];
  public maxSampleSuccesses: number;

  public limits = {
    sampleSuccesses: {
      max: 0,
    },
  };

  private tagsDict: { [tagName: string]: number } = {};
  private typesDict: { [typeName: string]: number } = {};
  private cmcDict: { [cmcString: string]: number } = {};

  private math: Partial<math.MathJsStatic> = create(all, {});

  @Input() public model: CardReference[];

  @Input() public params: IHypergeometricParams = {
    mode: '',
    modeValue: '',
    populationSize: 0,
    populationSuccesses: 0,
    sampleSize: 7,
    sampleSuccesses: 0,
  };

  public outputs: IHypergeometricOutputs = {
    X_eq_x: 0,
    X_gt_x: 0,
    X_gte_x: 0,
    X_lt_x: 0,
    X_lte_x: 0,
  };

  constructor() { }

  public ngOnInit(): void {
    // set form default value
    this.params.mode = Statistics.GROUP_MODES[0].toString();
  }

  public updateOptions(): void {
    this.params.populationSize = 0;

    this.model.forEach((card) => {
      this.countByTypes(card);
      this.countByTags(card);
      this.countByCMC(card);

      this.params.populationSize += card.count;
    });

    this.selectMode(this.params.mode);
    this._enforceLimits();
  }

  private _enforceLimits(): void {
    // hand size <= deck size
    this.params.sampleSize = Math.min(this.params.populationSize, this.params.sampleSize);

    // hits <= hand size
    this.params.sampleSuccesses = Math.min(this.limits.sampleSuccesses.max, this.params.sampleSize, this.params.sampleSuccesses);
  }

  private countByTypes(card: CardReference): void {
    if (card.OracleCard && card.OracleCard.type_line) {
      Statistics.MAIN_TYPES.forEach((type) => {
        const typeString = type.toString();
        if (card.OracleCard.type_line.indexOf(typeString) !== -1) {
          if (!this.typesDict[typeString]) {
            this.typesDict[typeString] = card.count;
          } else {
            this.typesDict[typeString] += card.count;
          }
        }
      });
    }
  }

  private countByTags(card: CardReference): void {
    if (card?.links?.length > 0) {
      card.links.forEach((link) => {
        const tag = link.tag?.[0];
        if (!!tag) {
          if (!this.tagsDict[tag.name]) {
            this.tagsDict[tag.name] = card.count;
          } else {
            this.tagsDict[tag.name] += card.count;
          }
        }
      });
    }
  }

  private countByCMC(card: CardReference): void {
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

      if (!this.cmcDict[cmcString]) {
        this.cmcDict[cmcString] = card.count;
      } else {
        this.cmcDict[cmcString] += card.count;
      }
    }
  }

  private getDictByMode(mode: GroupByMode): any {
    switch (mode as GroupByMode) {
      case GroupByMode.Types:
        return this.typesDict;

      case GroupByMode.Tags:
        return this.tagsDict;

      case GroupByMode.CMC:
        return this.cmcDict;

      default:
        return {};
    }
  }

  private selectMode(mode: string): void {
    function sort(a: string, b: string): number {
      if (a > b) {
        return 1;
      } else if (b > a) {
        return -1;
      } else {
        return 0;
      }
    }

    this.modeValueOptions = Object.keys(this.getDictByMode(mode as GroupByMode)).sort(sort);
    this.params.modeValue = this.modeValueOptions[0];
    this.selectModeValue(this.modeValueOptions[0]);
  }

  public onSelectMode($event: MatSelectChange): void {
    this.selectMode($event.value);
    this._enforceLimits();
  }

  private selectModeValue(value: string): void {
    const dict = this.getDictByMode(this.params.mode as GroupByMode);

    // update params
    if (dict[this.params.modeValue]) {
      this.params.populationSuccesses = dict[this.params.modeValue];
    } else {
      this.params.populationSuccesses = 0;
    }

    this.limits.sampleSuccesses.max = Math.min(this.params.sampleSize, this.params.populationSuccesses);
  }

  public onSelectModeValue($event: MatSelectChange): void {
    this.selectModeValue($event.value);
    this._enforceLimits();
  }

  public onChangeSampleSize($event: MatSelectChange): void {
    this.selectModeValue(this.params.modeValue);
    this._enforceLimits();
  }

  public calculate(): void {
    const N = this.params.populationSize;
    const k = this.params.populationSuccesses;
    const n = this.params.sampleSize;
    const x = this.params.sampleSuccesses;

    const results: IHypergeometricOutputs = {
      X_eq_x: 0,
      X_gt_x: 0,
      X_gte_x: 0,
      X_lt_x: 0,
      X_lte_x: 0,
    };

    for (let iX = 0; iX <= n && iX <= k; iX++) {
      if (this.math.combinations) {
        const prob = (this.math.combinations(k, iX) as number) *
          (this.math.combinations(N - k, n - iX) as number) /
          (this.math.combinations(N, n) as number);

        if (iX < x) {
          results.X_lt_x += prob;
          results.X_lte_x += prob;
        } else if (iX === x) {
          results.X_lte_x += prob;
          results.X_eq_x = prob;
          results.X_gte_x += prob;
        } else if (iX > x) {
          results.X_gte_x += prob;
          results.X_gt_x += prob;
        }
      }
    }

    Object.keys(results).forEach((key) => {
      results[key] = Math.round(results[key] * 10000) / 100;
    });

    this.outputs = results;
  }
}
