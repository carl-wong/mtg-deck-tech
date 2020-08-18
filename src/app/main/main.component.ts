import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { CardReference } from '@classes/card-reference';
import { CardTagLink } from '@classes/card-tag-link';
import { MinOracleCard } from '@classes/min-oracle-card';
import { SleepHelper } from '@classes/sleep-helper';
import { GroupByMode, MainCardTypes, Statistics } from '@classes/statistics';
import { Tag } from '@classes/tag';
import { environment } from '@env';
import {
  faChartBar, faComment, faList, faPlus,
  faSquareRootAlt, faSync, faTags, faTasks
} from '@fortawesome/free-solid-svg-icons';
import { CardTagLinkApiService } from '@services/card-tag-link-api.service';
import { OracleApiService } from '@services/oracle-api.service';
import { SingletonService } from '@services/singleton.service';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { first, take } from 'rxjs/operators';
import { DialogAddTagComponent } from '../dialog-add-tag/dialog-add-tag.component';
import { DialogCardDetailsComponent } from '../dialog-card-details/dialog-card-details.component';
import { iChartCmc } from './chart-cmc/chart-cmc.component';
import { iChartColorPie } from './chart-color-pie/chart-color-pie.component';
import { iChartTags } from './chart-tags/chart-tags.component';
import { StatsCalculatorComponent } from './stats-calculator/stats-calculator.component';

const UNTAGGED_PLACEHOLDER = 'UNTAGGED';
const QUERY_BATCH_SIZE = 10;
const QUERY_SLEEP_MS = 50;

const DECKBOX_TOKEN = 'deckbox.org/sets/';

enum FinishedStep {
  Cache = 'Cache',
  Oracle = 'Oracle Definitions',
  CardTagLinks = 'CardTagLinks',
  PostProcessing = 'Post Processing',
}

interface CardGrouping {
  key: string;
  cards: CardReference[];
  count: number;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
  constructor(
    private oracle: OracleApiService,
    private cardTagLinkService: CardTagLinkApiService,
    private dialog: MatDialog,
    private singleton: SingletonService,
  ) { }

  faChartBar = faChartBar;
  faComment = faComment;
  faList = faList;
  faPlus = faPlus;
  faSquareRootAlt = faSquareRootAlt;
  faSync = faSync;
  faTags = faTags;
  faTasks = faTasks;

  @ViewChild('statsCalculator') statsCalculator: StatsCalculatorComponent;

  groupByModes = Statistics.GROUP_MODES;
  @Input() groupByMode: string = this.groupByModes[0].toString();

  accordionStep = 'input';
  @Input() decklist = environment.defaultDecklist;

  deck: CardReference[] = [];

  totalCards = 0;
  uniqueCards = 0;

  private profileId: string;
  private tags: Tag[];
  private links: CardTagLink[] = [];
  private transformNameDict: { [name: string]: string } | undefined;

  chartsColumns = 2;

  cardsGrouped: CardGrouping[] = [];

  isChartTagsRadar = false;
  chartTagsRadar: iChartTags;

  isChartColorPie = false;
  chartColorPie: iChartColorPie;

  isChartCMCCurve = false;
  chartCMCCurve: iChartCmc;

  private _isEverythingReady(): boolean {
    return !!this.profileId && !!this.tags && !!this.transformNameDict;
  }

  ngOnInit() {
    // get dictionary of transform card names
    this.oracle.getTransform()
      .pipe(take(1))
      .subscribe((cards) => {
        if (!!cards) {
          this.transformNameDict = {};

          cards.filter(m => m.name && m.name.includes(' // ')).map(m => m.name.toLowerCase())
            .forEach(name => {
              const front = name.split(' // ')[0];
              if (!!this.transformNameDict) {
                this.transformNameDict[front] = name;
              }
            });
        }
      });

    // get and record profile._id for use in other REST calls
    this.singleton.profile$.pipe(first((m) => !!m))
      .subscribe((profile) => {
        this.profileId = profile?._id ?? '';
      });

    this.singleton.tags$.subscribe((tags) => {
        this.tags = tags;
      });
  }

  /** updates total and unique tallies, groups cards by selected mode */
  private decklistPostProcessing() {
    this.performGroupByMode(this.groupByMode);

    this.totalCards = this.deck.map(m => m.count).reduce((a, b) => a + b, 0);
    this.uniqueCards = this.deck.length;
  }

  private submitDecklistHelper(lines: string[]) {
    if (lines.length === 0) {
      // done
    } else {
      if (!environment.production) { console.log(lines.length + ' lines left'); }
      /*
				original grouped regex:
				/(?<_ls>[\s]+)?(?<count>[\d]+)?(?<_x>[xX]+[\s]+)?(?<_ms>[\s]+)?(?<name>.+)(?<_ts>[\s]+)?$/gm;
				*/
      const regex = /([\s]+)?([\d]+)?([xX]+[\s]+)?([\s]+)?(.+)([\s]+)?$/gm;

      const REGEX_GROUP = {
        full: 0,
        ls: 1,
        count: 2,
        x: 3,
        ms: 4,
        name: 5,
        ts: 6,
      };

      const linesList = lines.slice(0, Math.min(QUERY_BATCH_SIZE, lines.length));
      lines.splice(0, linesList.length);

      const tempCardList: CardReference[] = [];

      linesList.forEach(line => {
        regex.lastIndex = 0; // reset to look from start of each line
        const lineRx = regex.exec(line);

        if (lineRx) {
          const cardName = (lineRx[REGEX_GROUP.name] || '').trim().toLowerCase();
          if (cardName) {
            const cardCount = parseInt(lineRx[REGEX_GROUP.count] || '1', 10);

            const card = new CardReference();
            card.count = cardCount;
            card.name = this.transformNameDict?.[cardName] || cardName;

            tempCardList.push(card);
          }
        }
      });

      this.oracle.getByNames(tempCardList.map(m => m.name)).pipe(take(1))
        .subscribe(cards => {
          this.mixinOracleCardResults(tempCardList, cards);
          SleepHelper.sleep(QUERY_SLEEP_MS);
          this.submitDecklistHelper(lines);
        });
    }
  }

  submitDecklist() {
    if (this._isEverythingReady()) {
      this.singleton.setIsLoading(true);
      this.singleton.notify('Processing decklist...');

      // reset output containers
      this.deck = [];
      this.cardsGrouped = [];

      this.submitDecklistHelper(this.decklist.split('\n'));
    } else {
      // load up the cache before (automatically) resubmitting
      this.singleton.notify('Please wait for things to warm up first...');
    }
  }

  // attach oracle details to each card
  private mixinOracleCardResults(dCards: CardReference[], oCards: MinOracleCard[]) {
    // attach oracle results to each card reference
    oCards.forEach(oCard => {
      const lowerName = oCard.name.toLowerCase();
      const dCard = dCards.find(m => m.name === lowerName);
      if (!!dCard) {
        dCard.name = oCard.name;
        dCard.OracleCard = oCard;
      }
    });

    // log each card that was not found
    dCards.filter(m => !m.OracleCard).forEach(card => {
      this.singleton.notify(`No oracle result for "${card.name}", removing from deck...`);
      SleepHelper.sleep(1000);
    });

    // add only the cards with oracle results to the deck
    dCards.filter(m => !!m.OracleCard).forEach(card => {
      this.deck.push(card);
    });
  }

  private mixinTagLinksHelper(oracleIds: string[]) {
    if (oracleIds.length === 0) {
      // done
    } else {
      const idList = oracleIds.slice(0, Math.min(QUERY_BATCH_SIZE, oracleIds.length));
      oracleIds.splice(0, idList.length);

      this.cardTagLinkService.getByProfileId(this.profileId ?? '', idList)
        .pipe(take(1))
        .subscribe(links => {
          links.forEach((link) => {
            const existing = this.links?.find(m => m._id === link._id);
            if (!existing) {
              this.links.push(link);
            }
          });

          SleepHelper.sleep(QUERY_SLEEP_MS);
          this.mixinTagLinksHelper(oracleIds);
      });
    }
  }

  private getCharts() {
    this.getCMCChart();
    this.getColorsPieChart();
    this.getTagsRadarChart();
  }

  private getTagsRadarChart() {
    if (this.deck && this.deck.length > 0) {
      const stats: { sets: ChartDataSets[], labels: Label[] } = Statistics.getChartTagsRadar(this.deck, this.tags, this.links);

      const chart: iChartTags = {
        title: 'Tags',
        data: stats.sets,
        labels: stats.labels
      };

      let dataPoints = 0;
      chart.data.forEach(set => {
        if (set.data) {
          dataPoints += set.data.length;
        }
      });

      this.chartTagsRadar = chart;
      this.isChartTagsRadar = dataPoints > 0;
    } else {
      this.isChartTagsRadar = false;
    }
  }

  private getColorsPieChart() {
    if (this.deck && this.deck.length > 0) {
      const chart: iChartColorPie = {
        title: 'Color Breakdown',
        data: Statistics.getChartColorPie(this.deck),
      };

      this.chartColorPie = chart;
      this.isChartColorPie = true;
    } else {
      this.isChartColorPie = false;
    }
  }

  private getCMCChart() {
    if (this.deck && this.deck.length > 0) {
      const chart: iChartCmc = {
        title: 'CMC',
        data: Statistics.getChartCMC(this.deck),
        labels: [],
      };

      Statistics.getCMCOptions().forEach(cmc => {
        chart.labels.push(cmc);
      });

      this.chartCMCCurve = chart;
      this.isChartCMCCurve = true;
    } else {
      this.isChartCMCCurve = false;
    }
  }

  private groupByTypes() {
    const result: CardGrouping[] = [];

    Statistics.MAIN_TYPES.forEach(mainType => {
      result.push({ key: mainType, cards: [], count: 0 });
    });

    this.deck.forEach(card => {
      if (card.OracleCard) {
        // for (let iType = 0; iType < Statistics.MAIN_TYPES.length; iType++) {
        for (const mainType of Statistics.MAIN_TYPES) {
          if (card.OracleCard.type_line.indexOf(mainType.toString()) !== -1) {
            const grouping = result.find(m => m.key === mainType);

            if (grouping) {
              grouping.cards.push(card);
              grouping.count += card.count;
            }

            if (mainType === MainCardTypes.Creature) {
              break;
            }
          }
        }
      }
    });

    result.map(a => this.sortGroupContents(a));

    this.cardsGrouped = result.filter(m => m.count > 0);
    this.accordionStep = 'groups';
  }

  private sortGroupContents(group: CardGrouping) {
    group.cards = group.cards.sort(this.sortCardsByName);
  }

  private groupByTags() {
    const untagged: CardGrouping = { key: UNTAGGED_PLACEHOLDER, cards: [], count: 0 };
    let result: CardGrouping[] = [];

    this.deck.forEach(card => {
      // find all tags attached to this card
      const cardTags = this.links.filter((link) => link.oracle_id === card.OracleCard?.oracle_id && link.tag?.length > 0)
        .map(link => this.tags?.find(tag => tag._id === link.tag[0]._id));
      if (cardTags.length > 0) {
        cardTags.forEach((tag) => {
          if (!!(tag?.name)) {
            const grouping = result.find(m => m.key === tag.name);
            if (!grouping) {
              result.push({ key: tag.name, cards: [card], count: 0 });
            } else {
              grouping.cards.push(card);
              grouping.count += card.count;
            }
          }
        });
      } else {
        untagged.cards.push(card);
        untagged.count += card.count;
      }
    });

    result.map(a => this.sortGroupContents(a));
    result = result.sort(this.sortCardGroupingsByKey);

    // ensure untagged cards show up at the bottom
    if (untagged.count > 0) {
      untagged.cards = untagged.cards.sort(this.sortCardsByName);
      result.push(untagged);
    }

    this.cardsGrouped = result.filter(m => m.count > 0);
    this.accordionStep = 'groups';
  }

  private groupByCMC() {
    const result: CardGrouping[] = [];

    for (let i = 0; i < 8; i++) {
      result.push({ key: Statistics.cmcToString(i), cards: [], count: 0 });
    }

    const landsGroup: CardGrouping = { key: 'Lands', cards: [], count: 0 };
    result.push(landsGroup);

    this.deck.forEach(card => {
      const oracle = card.OracleCard;
      if (oracle) {
        if (oracle.layout &&
          oracle.layout !== 'transform' &&
          oracle.type_line &&
          oracle.type_line.includes('Land')) {
          landsGroup.cards.push(card);
          landsGroup.count += card.count;
        } else {
          const cmcString = Statistics.cmcToString(oracle.cmc);
          const group = result.find(m => m.key === cmcString);

          if (group) {
            group.cards.push(card);
            group.count += card.count;
          }
        }
      } else {
        this.singleton.notify('Could not find Oracle entry for ' + card.name);
      }
    });

    result.map(a => this.sortGroupContents(a));

    this.cardsGrouped = result.filter(m => m.count > 0);
    this.accordionStep = 'groups';
  }

  private sortCardGroupingsByKey(a: CardGrouping, b: CardGrouping): number {
    return (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0);
  }

  private sortCardsByName(a: CardReference, b: CardReference): number {
    return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
  }

  private sortCardTagLinksByName(a: CardTagLink, b: CardTagLink): number {
    return (a?.tag?.[0]?.name > b?.tag?.[0].name) ? 1 : ((b?.tag?.[0].name > a?.tag?.[0]?.name) ? -1 : 0);
  }

  refreshGroups() {
    this.performGroupByMode(this.groupByMode);
  }

  private performGroupByMode(mode: string) {
    switch (mode as GroupByMode) {
      case GroupByMode.Types:
        this.groupByTypes();
        break;

      case GroupByMode.Tags:
        this.groupByTags();
        break;

      case GroupByMode.CMC:
        this.groupByCMC();
        break;

      default:
        break;
    }
  }

  selectedMode($event: MatSelectChange) {
    this.performGroupByMode($event.value);
  }

  openDialogCardDetails(card: CardReference) {
    const dConfig = new MatDialogConfig();

    dConfig.disableClose = false;
    dConfig.autoFocus = false;

    dConfig.data = card;

    this.dialog.open(DialogCardDetailsComponent, dConfig);
  }

  openDialogAddTag(card: CardReference) {
    const dConfig = new MatDialogConfig();

    dConfig.disableClose = false;
    dConfig.autoFocus = true;

    const dRef = this.dialog.open(DialogAddTagComponent, dConfig);
    dRef.afterClosed().subscribe((tag: Tag) => {
      if (!!tag) {
        const existingLink = this.links.find(m => m.oracle_id === card.OracleCard.oracle_id && m.tag?.[0]._id === tag._id);

        if (!!existingLink) {
          // don't add the same tag twice
          this.singleton.notify(`"${card.name}" is already tagged with [${tag.name}].`);
        } else {
          const newLink: { oracle_id: string, tag: string[], profile: string[] } = {
            oracle_id: card.OracleCard.oracle_id,
            tag: [tag._id],
            profile: [this.profileId ?? '']
          };

          this.cardTagLinkService.createCardTagLink(newLink).pipe(take(1))
          .subscribe(result => {
            if (!!result) {
                this.links.push(result);
              } else {
                this.singleton.notify(`Could not attach [${tag.name}] to "${card.name}."`);
              }
          });
        }
      }
    });
  }

  removeCardTagLink(linkId: string) {
    const link = this.links?.find(m => m._id === linkId);
    if (!!link) {
      this.cardTagLinkService.deleteCardTagLink(link._id).pipe(take(1))
      .subscribe((result) => {
        if (!!result) {
          this.links = this.links.filter(m => m._id !== linkId);
        } else {
          this.singleton.notify('Could not remove link.');
        }
      });
    }

  }

  open(panel: string) {
    switch (panel) {
      case 'charts':
        this.getCharts();
        break;

      case 'stats':
        this.statsCalculator.updateOptions();
        break;

      default:
        break;
    }

    this.accordionStep = panel;
  }
}
