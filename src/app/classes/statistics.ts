import { ChartDataSets } from 'chart.js';
import { Label, MultiDataSet } from 'ng2-charts';
import { CardReference } from './card-reference';

export enum GroupByMode {
  Types = 'Types',
  Tags = 'Tags',
  CMC = 'CMC',
}

export enum MainCardTypes {
  Creature = 'Creature',
  Sorcery = 'Sorcery',
  Instant = 'Instant',
  Enchantment = 'Enchantment',
  Artifact = 'Artifact',
  Planeswalker = 'Planeswalker',
  Land = 'Land',
}

export abstract class Statistics {
  public static GROUP_MODES = [
    GroupByMode.Types,
    GroupByMode.Tags,
    GroupByMode.CMC,
  ];

  public static MAIN_TYPES = [
    MainCardTypes.Creature,
    MainCardTypes.Sorcery,
    MainCardTypes.Instant,
    MainCardTypes.Enchantment,
    MainCardTypes.Artifact,
    MainCardTypes.Planeswalker,
    MainCardTypes.Land,
  ];

  public static COLORS = [
    ['W', 'White'],
    ['U', 'Blue'],
    ['B', 'Black'],
    ['R', 'Red'],
    ['G', 'Green'],
    ['C', 'Colorless'],
  ];

  public static MAX_CMC_BUCKET = 7; // CMCs will range from [0..6, 7+]

  public static PALETTE_BLUE = [
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

  public static PALETTE_GREEN = [
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

  public static PALETTE_ORANGE = [
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

  public static hexToRgbA(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } else {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
  }

  public static getChartTagsRadar(deck: CardReference[]): { sets: ChartDataSets[], labels: Label[] } {
    const dict: { [tag: string]: number } = {};
    deck.filter((c) => c.count > 0)
      .forEach((card) => {
          card.links?.forEach((link) => {
            const tag = link.tag?.[0];
            if (!!tag) {
              if (!dict[tag.name]) {
                dict[tag.name] = card.count;
              } else {
                dict[tag.name] += card.count;
              }
            }
          });
      });

    // sort the tags by descending count
    const sortedTags = Object.entries(dict).sort(([tag1, count1], [tag2, count2]) => {
      if (count1 < count2) {
        return 1;
      } else if (count2 < count1) {
        return -1;
      } else {
        return 0;
      }
    });

    // take at most the first 10 tags and sort them by tag name this time
    const topTags = sortedTags.slice(0, Math.min(10, sortedTags.length)).sort(([tag1, count1], [tag2, count2]) => {
      if (tag1 > tag2) {
        return 1;
      } else if (tag2 > tag1) {
        return -1;
      } else {
        return 0;
      }
    });

    const result: { sets: ChartDataSets[], labels: Label[] } = { sets: [{ data: [], label: 'Tags' }], labels: [] };
    topTags.forEach((item: [string, number]) => {
      result.labels.push(item[0]);

      if (result.sets[0].data) {
        result.sets[0].data.push(item[1]);
      }
    });

    if (topTags.length === 0) {
      result.labels.push('No Tags');

      if (result.sets[0].data) {
        result.sets[0].data.push(deck.map((m) => m.count).reduce((a, b) => a + b, 0));
      }
    }

    return result;
  }

  public static cmcToString(cmc: number): string {
    if (typeof cmc === 'number') {
      if (cmc >= this.MAX_CMC_BUCKET) {
        return `${this.MAX_CMC_BUCKET}+ CMC`;
      } else {
        return `${cmc} CMC`;
      }
    } else {
      // catch null or undefined cases
      return '0 CMC';
    }
  }

  public static getCMCOptions(): string[] {
    const output = [];

    for (let cmc = 0; cmc <= this.MAX_CMC_BUCKET; cmc++) {
      if (cmc === this.MAX_CMC_BUCKET) {
        output.push(`${cmc}+`);
      } else {
        output.push(cmc.toString());
      }
    }

    return output;
  }

  public static getChartCMC(deck: CardReference[]): ChartDataSets[] {
    const result: ChartDataSets = {
      backgroundColor: this.PALETTE_BLUE[5],
      data: [],
      label: 'Curve',
    };

    if (result.data) {
      for (let i = 0; i <= this.MAX_CMC_BUCKET; i++) {
        let filtered: CardReference[];

        if (i === 0) {
          filtered = deck.filter((m) => m.OracleCard && m.OracleCard.cmc === i)
            .filter((m) => !m.OracleCard.type_line.includes('Land'));
        } else if (i === this.MAX_CMC_BUCKET) {
          filtered = deck.filter((m) => m.OracleCard && m.OracleCard.cmc >= this.MAX_CMC_BUCKET);
        } else {
          filtered = deck.filter((m) => m.OracleCard && m.OracleCard.cmc === i);
        }

        if (filtered.length > 0) {
          result.data.push(filtered.map((m) => m.count).reduce((a, b) => a + b, 0));
        } else {
          result.data.push(0);
        }
      }
    }

    return [result];
  }

  public static getChartColorPie(deck: CardReference[]): MultiDataSet {
    const cardCounts: { [color: string]: number } = {};
    const landCounts: { [color: string]: number } = {};

    this.COLORS.forEach((c) => {
      cardCounts[c[0]] = 0;
      landCounts[c[0]] = 0;
    });

    deck.filter((m) => m.OracleCard).forEach((card) => {
      if (card.OracleCard.layout !== 'transform' &&
        card.OracleCard.type_line.includes('Land')) {
        if (card.OracleCard.color_identity) {
          card.OracleCard.color_identity.split(',')
            .forEach((c) => {
              landCounts[c] += card.count;
            });
        }

        if (card.OracleCard.oracle_text.includes('Add {C}')) {
          landCounts.C += card.count;
        }
      } else {
        if (card.OracleCard.colors) {
          card.OracleCard.colors.split(',')
            .forEach((c) => {
              cardCounts[c] += card.count;
            });
        } else {
          cardCounts.C += card.count;
        }
      }
    });

    const result: MultiDataSet = [[], []];

    for (let i = 0; i < this.COLORS.length; i++) {
      result[0][i] = landCounts[this.COLORS[i][0]];
      result[1][i] = cardCounts[this.COLORS[i][0]];
    }

    return result;
  }
}
