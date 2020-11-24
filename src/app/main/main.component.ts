import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { AuthService } from '@auth0/auth0-angular';
import { CardReference } from '@classes/card-reference';
import { CardTagLink } from '@classes/card-tag-link';
import { MinOracleCard } from '@classes/min-oracle-card';
import { Profile } from '@classes/profile';
import { GroupByMode, MainCardTypes, Statistics } from '@classes/statistics';
import { Tag } from '@classes/tag';
import { environment } from '@env';
import { faChartBar, faComment, faList, faPlus, faSquareRootAlt, faSync, faTags, faTasks } from '@fortawesome/free-solid-svg-icons';
import { CardTagLinkApiService } from '@services/card-tag-link-api.service';
import { OracleApiService } from '@services/oracle-api.service';
import { SingletonService } from '@services/singleton.service';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { forkJoin } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { DialogAddTagComponent } from '../dialog-add-tag/dialog-add-tag.component';
import { DialogCardDetailsComponent } from '../dialog-card-details/dialog-card-details.component';
import { iChartCmc } from './chart-cmc/chart-cmc.component';
import { iChartColorPie } from './chart-color-pie/chart-color-pie.component';
import { iChartTags } from './chart-tags/chart-tags.component';
import { StatsCalculatorComponent } from './stats-calculator/stats-calculator.component';

const UNTAGGED_PLACEHOLDER = 'UNTAGGED';
const QUERY_BATCH_SIZE = 10;

/*
  original grouped regex:
  /(?<_ls>[\s]+)?(?<count>[\d]+)?(?<_x>[xX]+[\s]+)?(?<_ms>[\s]+)?(?<name>.+)(?<_ts>[\s]+)?$/gm;
  */
const REGEX = /([\s]+)?([\d]+)?([xX]+[\s]+)?([\s]+)?(.+)([\s]+)?$/gm;

const REGEX_GROUP = {
  count: 2,
  full: 0,
  ls: 1,
  ms: 4,
  name: 5,
  ts: 6,
  x: 3,
};

interface ICardGrouping {
  key: string;
  cards: CardReference[];
  count: number;
}

@Component({
  selector: 'app-main',
  styleUrls: ['./main.component.less'],
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private oracle: OracleApiService,
    private cardTagLinkService: CardTagLinkApiService,
    private dialog: MatDialog,
    private singleton: SingletonService,
  ) { }

  public faChartBar = faChartBar;
  public faComment = faComment;
  public faList = faList;
  public faPlus = faPlus;
  public faSquareRootAlt = faSquareRootAlt;
  public faSync = faSync;
  public faTags = faTags;
  public faTasks = faTasks;

  @ViewChild('statsCalculator') public statsCalculator: StatsCalculatorComponent;

  public groupByModes = Statistics.GROUP_MODES;
  @Input() public groupByMode: string = this.groupByModes[0].toString();

  public accordionStep = 'input';
  @Input() public decklist = environment.defaultDecklist;

  public deck: CardReference[] = [];

  public totalCards = 0;
  public uniqueCards = 0;

  private profileId: string;
  private transformNameDict: { [name: string]: string } | undefined;

  public chartsColumns = 2;

  public cardsGrouped: ICardGrouping[] = [];

  public isChartTagsRadar = false;
  public chartTagsRadar: iChartTags;

  public isChartColorPie = false;
  public chartColorPie: iChartColorPie;

  public isChartCMCCurve = false;
  public chartCMCCurve: iChartCmc;

  private isEverythingReady(): boolean {
    return !!this.profileId && !!this.transformNameDict;
  }

  public ngOnInit(): void {
    this.singleton.setIsLoading(true);
    this.auth.user$.pipe(first((m) => !!m)).subscribe(
      (user) => {
        if (!!user.sub) {
          this.singleton.setAuth0(user.sub);
          const tasks = [
            this.singleton.profile$.pipe(first((m) => !!m)),
            this.oracle.getTransform().pipe(take(1)),
          ];

          forkJoin(tasks).pipe(take(1)).subscribe(
            (results) => {
              const profile = results[0] as Profile;
              if (!!profile) {
                this.profileId = profile ?._id ?? '';
              } else {
                alert('Profile could not be loaded, please contact support');
              }

              const cards = results[1] as MinOracleCard[];
              if (!!cards) {
                this.transformNameDict = {};
                cards.filter((m) => m.name && m.name.includes(' // ')).map((m) => m.name.toLowerCase())
                  .forEach((name) => {
                    const front = name.split(' // ')[0];
                    if (!!this.transformNameDict) {
                      this.transformNameDict[front] = name;
                    }
                  });

              } else {
                alert('Transform cards could not be loaded, please contact support');
              }

              this.singleton.setIsLoading(false);
            });
        } else {
          alert('No auth0 sub value, please contact support');
          this.singleton.setIsLoading(false);
        }
      });

    this.singleton.requireReloadDeck$.subscribe((isReload) => {
      if (!!isReload && this.deck ?.length > 0) {
        this.submitDecklist();
      }
    });
  }

  public submitDecklist(): void {
    if (this.isEverythingReady()) {
      this.singleton.notify('Processing decklist...');
      this.singleton.setIsLoading(true);

      // reset output containers
      this.deck = [];
      this.cardsGrouped = [];

      const remainingLines: string[] = this.decklist.split('\n');
      if (!environment.production) { console.log(remainingLines.length + ' lines found'); }

      const oracleCalls = [];

      while (remainingLines.length > 0) {
        const linesList = remainingLines.slice(0, Math.min(QUERY_BATCH_SIZE, remainingLines.length));
        remainingLines.splice(0, linesList.length);

        if (!environment.production) { console.log(`remainingLines.length after splice: ${remainingLines.length}`); }

        // declare a temporary sublist of cards for fetching oracle data
        const tempCardList: CardReference[] = [];

        linesList.forEach((line) => {
          REGEX.lastIndex = 0; // reset to look from start of each line
          const lineRx = REGEX.exec(line);

          if (lineRx) {
            const cardName = (lineRx[REGEX_GROUP.name] || '').trim().toLowerCase();
            if (cardName) {
              const cardCount = parseInt(lineRx[REGEX_GROUP.count] || '1', 10);

              const card = new CardReference();
              card.count = cardCount;
              card.name = this.transformNameDict ?.[cardName] || cardName;

              tempCardList.push(card);
            }
          }
        });

        const cardNames = tempCardList.map((m) => m.name);
        if (cardNames.length > 0) {
          oracleCalls.push(this.oracle.getByNames(cardNames).pipe(take(1)));
          this.deck = this.deck.concat(tempCardList);
        }
      }

      // call all oracle queries together with forkJoin and loop through results
      forkJoin(oracleCalls).pipe(take(1)).subscribe((oracleResult) => {
        oracleResult.forEach((oCards) => {
          // attach oracle results to each card reference
          oCards.forEach((oCard) => {
            const lowerName = oCard.name.toLowerCase();
            const dCard = this.deck.find((m) => m.name === lowerName);
            if (!!dCard) {
              dCard.name = oCard.name;
              dCard.OracleCard = oCard;
            }
          });
        });

        // log each card that was not found
        this.deck.filter((m) => !m.OracleCard).forEach((card) => {
          this.singleton.notify(`No oracle result for "${card.name}", removing from deck...`);
        });

        // keep only cards with oracle definitions
        this.deck = this.deck.filter((m) => !!m.OracleCard);

        // fill in tag links
        const linkCalls = [];

        const stepSize = 20;
        for (let i = 0; i < this.deck.length; i += stepSize) {
          const subDeck = this.deck.slice(i, Math.min(i + stepSize, this.deck.length));
          const oracleIds = subDeck.map((m) => m.OracleCard.oracle_id);
          if (oracleIds.length > 0) {
            linkCalls.push(this.cardTagLinkService.getByProfileId(this.profileId ?? '', oracleIds).pipe(take(1)));
          }
        }

        forkJoin(linkCalls).pipe(take(1)).subscribe((linkResults) => {
          linkResults ?.forEach((links) => {
            links ?.forEach((link) => {
              const dCard = this.deck.find((m) => m.OracleCard ?.oracle_id === link.oracle_id);
              if (!!dCard) {
                if (!!dCard.links) {
                  dCard.links.push(link);
                } else {
                  dCard.links = [link];
                }
              }
            });
          });

          // sort each card's tag links list
          this.deck.filter((c) => !!c.links).forEach((card) => {
            card.links = card.links.sort(this.sortCardTagLinksByName);
          });

          if (!environment.production) {
            console.log('decklist:');
            console.log(this.deck);
          }

          this.performGroupByMode(this.groupByMode);
          if (!environment.production) {
            console.log('cardGroup:');
            console.log(this.cardsGrouped);
          }

          this.totalCards = this.deck.map((m) => m.count).reduce((a, b) => a + b, 0);
          this.uniqueCards = this.deck.length;

          // expand the next panel
          this.accordionStep = 'groups';

          this.singleton.setIsLoading(false);
        });
      });
    } else {
      // load up the cache before (automatically) resubmitting
      this.singleton.notify('Please wait for things to warm up first...');
    }
  }

  private getCharts(): void {
    this.getCMCChart();
    this.getColorsPieChart();
    this.getTagsRadarChart();
  }

  private getTagsRadarChart(): void {
    if (this.deck && this.deck.length > 0) {
      const stats: { sets: ChartDataSets[], labels: Label[] } = Statistics.getChartTagsRadar(this.deck);

      const chart: iChartTags = {
        data: stats.sets,
        labels: stats.labels,
        title: 'Tags',
      };

      let dataPoints = 0;
      chart.data.forEach((set) => {
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

  private getColorsPieChart(): void {
    if (this.deck && this.deck.length > 0) {
      const chart: iChartColorPie = {
        data: Statistics.getChartColorPie(this.deck),
        title: 'Color Breakdown',
      };

      this.chartColorPie = chart;
      this.isChartColorPie = true;
    } else {
      this.isChartColorPie = false;
    }
  }

  private getCMCChart(): void {
    if (this.deck && this.deck.length > 0) {
      const chart: iChartCmc = {
        data: Statistics.getChartCMC(this.deck),
        labels: [],
        title: 'CMC',
      };

      Statistics.getCMCOptions().forEach((cmc) => {
        chart.labels.push(cmc);
      });

      this.chartCMCCurve = chart;
      this.isChartCMCCurve = true;
    } else {
      this.isChartCMCCurve = false;
    }
  }

  private groupByTypes(): void {
    const result: ICardGrouping[] = [];

    Statistics.MAIN_TYPES.forEach((mainType) => {
      result.push({ key: mainType, cards: [], count: 0 });
    });

    this.deck.forEach((card) => {
      if (card.OracleCard) {
        // for (let iType = 0; iType < Statistics.MAIN_TYPES.length; iType++) {
        for (const mainType of Statistics.MAIN_TYPES) {
          if (card.OracleCard.type_line.indexOf(mainType.toString()) !== -1) {
            const grouping = result.find((m) => m.key === mainType);

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

    result.map((a) => this.sortGroupContents(a));
    this.cardsGrouped = result.filter((m) => m.count > 0);
  }

  private sortGroupContents(group: ICardGrouping): void {
    group.cards = group.cards.sort(this.sortCardsByName);
  }

  private groupByTags(): void {
    const untagged: ICardGrouping = { key: UNTAGGED_PLACEHOLDER, cards: [], count: 0 };
    let result: ICardGrouping[] = [];

    this.deck.forEach((card) => {

      // find all tags attached to this card
      const cardLinks = card ?.links ?.filter((l) => l.tag ?.length > 0);
      const cardTags: Tag[] = [];

      cardLinks.forEach((link) => link.tag.forEach((tag) => cardTags.push(tag)));

      if (cardTags.length > 0) {
        cardTags.forEach((tag) => {
          if (!!tag.name) {
            const grouping = result.find((m) => m.key === tag.name);
            if (!grouping) {
              result.push({ key: tag.name, cards: [card], count: card.count });
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

    result.map((a) => this.sortGroupContents(a));
    result = result.sort(this.sortCardGroupingsByKey);

    // ensure untagged cards show up at the bottom
    if (untagged.count > 0) {
      untagged.cards = untagged.cards.sort(this.sortCardsByName);
      result.push(untagged);
    }

    console.log('cardsGrouped pre filter');
    console.log(result);

    this.cardsGrouped = result.filter((m) => m.count > 0);

    console.log('cardsGrouped');
    console.log(this.cardsGrouped);
  }

  private groupByCMC(): void {
    const result: ICardGrouping[] = [];

    for (let i = 0; i < 8; i++) {
      result.push({ key: Statistics.cmcToString(i), cards: [], count: 0 });
    }

    const landsGroup: ICardGrouping = { key: 'Lands', cards: [], count: 0 };
    result.push(landsGroup);

    this.deck.forEach((card) => {
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
          const group = result.find((m) => m.key === cmcString);

          if (group) {
            group.cards.push(card);
            group.count += card.count;
          }
        }
      } else {
        this.singleton.notify('Could not find Oracle entry for ' + card.name);
      }
    });

    result.map((a) => this.sortGroupContents(a));

    this.cardsGrouped = result.filter((m) => m.count > 0);
  }

  private sortCardGroupingsByKey(a: ICardGrouping, b: ICardGrouping): number {
    return (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0);
  }

  private sortCardsByName(a: CardReference, b: CardReference): number {
    return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
  }

  private sortCardTagLinksByName(a: CardTagLink, b: CardTagLink): number {
    return (a ?.tag ?.[0] ?.name > b ?.tag ?.[0].name) ? 1 : ((b ?.tag ?.[0].name > a ?.tag ?.[0] ?.name) ? -1 : 0);
  }

  public refreshGroups(): void {
    this.performGroupByMode(this.groupByMode);
  }

  private performGroupByMode(mode: string): void {
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

  public selectedMode($event: MatSelectChange): void {
    this.performGroupByMode($event.value);
  }

  public openDialogCardDetails(card: CardReference): void {
    const dConfig = new MatDialogConfig();

    dConfig.disableClose = false;
    dConfig.autoFocus = false;

    dConfig.data = card;

    this.dialog.open(DialogCardDetailsComponent, dConfig);
  }

  public openDialogAddTag(card: CardReference): void {
    const dConfig = new MatDialogConfig();

    dConfig.disableClose = false;
    dConfig.autoFocus = true;

    const dRef = this.dialog.open(DialogAddTagComponent, dConfig);
    dRef.afterClosed().subscribe((tag: Tag) => {
      if (!!tag) {
        const existingCard = this.deck.find((m) => m.OracleCard.oracle_id === card.OracleCard.oracle_id);
        const existingLink = existingCard ?.links ?.find((m) => m.tag ?.[0]._id === tag._id);

        if (!!existingLink) {
          // don't add the same tag twice
          this.singleton.notify(`"${card.name}" is already tagged with [${tag.name}].`);
        } else {
          const newLink: { oracle_id: string, tag: string[], profile: string[] } = {
            oracle_id: card.OracleCard.oracle_id,
            profile: [this.profileId ?? ''],
            tag: [tag._id],
          };

          this.cardTagLinkService.createCardTagLink(newLink).pipe(take(1))
            .subscribe((result) => {
              if (!!result) {
                if (!!card.links) {
                  card.links.push(result);
                  card.links = card.links.sort(this.sortCardTagLinksByName);
                } else {
                  card.links = [result];
                }
              } else {
                this.singleton.notify(`Could not attach [${tag.name}] to "${card.name}."`);
              }
            });
        }
      }
    });
  }

  public removeCardTagLink(card: CardReference, linkId: string): void {
    const link = card ?.links ?.find((m) => m._id === linkId);
    if (!!link) {
      this.cardTagLinkService.deleteCardTagLink(link._id).pipe(take(1))
        .subscribe((result) => {
          if (!!result) {
            card.links = card.links.filter((m) => m._id !== linkId);
          } else {
            this.singleton.notify('Could not remove link.');
          }
        });
    }

  }

  public open(panel: string): void {
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
