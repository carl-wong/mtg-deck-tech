import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { CardReference } from '@classes/card-reference';
import { CardTagLink } from '@classes/card-tag-link';
import { MinOracleCard } from '@classes/min-oracle-card';
import { SleepHelper } from '@classes/sleep-helper';
import { GroupByMode, MainCardTypes, Statistics } from '@classes/statistics';
import { Tag } from '@classes/tag';
import { environment } from '@env';
import { faChartBar, faComment, faList, faPlus, faSpinner, faSquareRootAlt, faSync, faTags, faTasks } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@services/auth.service';
import { CardTagLinkApiService } from '@services/card-tag-link-api.service';
import { MessageLevel, MessagesService } from '@services/messages.service';
import { EventType, iTagsUpdated, NotificationService } from '@services/notification.service';
import { OracleApiService } from '@services/oracle-api.service';
import { TagApiService } from '@services/tag-api.service';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
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
	key: string,
	cards: CardReference[],
	count: number
}

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit, OnDestroy {
	faChartBar = faChartBar;
	faComment = faComment;
	faList = faList;
	faPlus = faPlus;
	faSpinner = faSpinner;
	faSquareRootAlt = faSquareRootAlt;
	faSync = faSync;
	faTags = faTags;
	faTasks = faTasks;

	@ViewChild('statsCalculator') statsCalculator: StatsCalculatorComponent;

	groupByModes = Statistics.GROUP_MODES;
	@Input() groupByMode: string = this.groupByModes[0].toString();

	accordionStep = 'input';
	@Input() decklist = environment.defaultDecklist;

	isDecklistReady = false;
	deck: CardReference[] = [];

	totalCards = 0;
	uniqueCards = 0;

	private _emitFinishedStep = new EventEmitter();

	private _isCacheReady(): boolean {
		return !!this._tags && !!this._transformNameDict;
	};

	private _tags: Tag[];
	private _transformNameDict: { [name: string]: string } = {};

	chartsColumns = 2;

	cardsGrouped: CardGrouping[] = [];

	private _subscriptions: Subscription[] = [];

	isProgressSpinnerActive = true;

	isChartTagsRadar = false;
	chartTagsRadar: iChartTags;

	isChartColorPie = false;
	chartColorPie: iChartColorPie;

	isChartCMCCurve = false;
	chartCMCCurve: iChartCmc;

	constructor(
		private http: HttpClient,
		private auth: AuthService,
		private messages: MessagesService,
		private oracle: OracleApiService,
		private tagService: TagApiService,
		private cardTagLinkService: CardTagLinkApiService,
		private notify: NotificationService,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this._subscribeToUserLoadedEvent();
		this._subscribeToTagUpdateEvents();
		this._subscribeToFinishedStepEvents();
	}

	ngOnDestroy() {
		this._subscriptions.forEach(sub => sub.unsubscribe());
		this._emitFinishedStep.unsubscribe();
	}

	private _subscribeToUserLoadedEvent() {
		// when user object is loaded, allow interaction
		const sub = this.auth.isUserLoaded$.subscribe(isLoaded => {
			if (isLoaded) {
				this.isProgressSpinnerActive = false;
			}
		});
		this._subscriptions.push(sub);
	}

	private _subscribeToFinishedStepEvents() {
		this._emitFinishedStep.subscribe((step: FinishedStep) => {
			this.messages.send(`${step.toString()} loaded...`);

			switch (step) {
				case FinishedStep.Cache:
					this.submitDecklist();
					break;

				case FinishedStep.Oracle:
					this._mixinTagLinks();
					break;

				case FinishedStep.CardTagLinks:
					this._decklistPostProcessing();
					break;

				case FinishedStep.PostProcessing:
					this.isProgressSpinnerActive = false;
					this.isDecklistReady = true;
					this.messages.send('Decklist processed!');
					break;

				default:
					break;
			}
		});
	}

	private _decklistPostProcessing() {
		this._performGroupByMode(this.groupByMode);

		this.totalCards = this.deck.map(m => m.count).reduce((a, b) => a + b, 0);
		this.uniqueCards = this.deck.length;

		this._emitFinishedStep.emit(FinishedStep.PostProcessing);
	}

	private _subscribeToTagUpdateEvents() {
		const sub = this.notify.isTagsUpdated$.subscribe((event: iTagsUpdated) => {
			switch (event.type) {
				case EventType.Insert: {
					// update list of tags
					if (event.Tag) {
						let tagIndex = 0;
						while (tagIndex < this._tags.length) {
							if (event.Tag.name > this._tags[tagIndex].name) {
								tagIndex++;
							} else {
								break;
							}
						}

						this._tags.splice(tagIndex, 0, event.Tag);
					}
					break;
				}

				case EventType.Update: {
					// update list of tags
					if (event.Tag) {
						const tagId = event.Tag.id;
						const tag = this._tags.find(m => m.id === tagId);
						if (tag) {
							tag.name = event.Tag.name;
						}

						// update tags attached to cards in deck
						const tagName = event.Tag.name;
						this.deck.filter(m => m.CardTagLinks && m.CardTagLinks.length > 0)
							.forEach(card => {
								const link = card.CardTagLinks.find(m => m.TagId === tagId);
								if (link) {
									link.TagName = tagName;
								}
							});
					}
					break;
				}

				case EventType.Delete: {
					// update list of tags
					if (event.Tag) {
						const tagId = event.Tag.id;
						const tagIndex = this._tags.findIndex(m => m.id === tagId);
						if (tagIndex !== -1) {
							this._tags.splice(tagIndex, 1);
						}

						// update tags attached to cards in deck
						this.deck.filter(m => m.CardTagLinks && m.CardTagLinks.length > 0)
							.forEach(card => {
								const linkIndex = card.CardTagLinks.findIndex(m => m.TagId === tagId);
								if (linkIndex !== -1) {
									card.CardTagLinks.splice(linkIndex, 1);
								}
							});
					}
					break;
				}

				case EventType.Merge: {
					// update list of tags
					if (event.Tag) {
						const fromIndex = this._tags.findIndex(m => m.id === event.fromId);
						if (fromIndex !== -1) {
							this._tags.splice(fromIndex, 1);
						}

						// update tags attached to cards in deck
						const tagName = event.Tag.name;
						this.deck.filter(m => m.CardTagLinks)
							.forEach(card => {
								const link = card.CardTagLinks.find(m => m.TagId === event.fromId);
								if (link) {
									link.TagName = tagName;
									link.TagId = event.toId;
								}
							});
					}
					break;
				}

				default:
					// no action required
					break;
			}
		});

		this._subscriptions.push(sub);
	}

	private _submitDecklistHelper(lines: string[]) {
		console.log(lines.length + ' lines left');

		if (lines.length === 0) {
			this._emitFinishedStep.emit(FinishedStep.Oracle);
		} else {
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
						const cardCount = parseInt(lineRx[REGEX_GROUP.count] || '1');

						const card = new CardReference();
						card.count = cardCount;
						card.name = this._transformNameDict[cardName] || cardName;

						tempCardList.push(card);
					}
				}
			});

			this.oracle.postNames(tempCardList.map(m => m.name)).subscribe(cards => {
				this._mixinOracleCardResults(tempCardList, cards);

				SleepHelper.sleep(QUERY_SLEEP_MS);
				this._submitDecklistHelper(lines);
			});
		}
	}

	submitDecklist() {
		this.isDecklistReady = false;
		this.isProgressSpinnerActive = true;

		if (this._isCacheReady()) {
			this.messages.send('Processing decklist...', MessageLevel.Notify);

			// reset output containers
			this.deck = [];
			this.cardsGrouped = [];

			this._submitDecklistHelper(this.decklist.split('\n'));
		} else {
			// load up the cache before (automatically) resubmitting
			this.tagService.getTags()
				.subscribe(tags => {
					this._tags = tags;

					this.oracle.getTransform()
						.subscribe(cards => {
							if (cards) {
								cards.filter(m => m.name && m.name.includes(' // ')).map(m => m.name.toLowerCase())
									.forEach(name => {
										const front = name.split(' // ')[0];
										this._transformNameDict[front] = name;
									});

								this._emitFinishedStep.emit(FinishedStep.Cache);
							}
						});
				});
		}
	}

	private _mixinOracleCardResults(dCards: CardReference[], oCards: MinOracleCard[]) {
		// attach oracle results to each card reference
		oCards.forEach(oCard => {
			const lowerName = oCard.name.toLowerCase();
			const dCard = dCards.find(m => m.name === lowerName);
			if (dCard) {
				dCard.name = oCard.name;
				dCard.OracleCard = oCard;
			}
		});

		// log each card that was not found
		dCards.filter(m => !m.OracleCard).forEach(card => {
			this.messages.send(
				`No oracle result for "${card.name}", removing from deck...`,
				MessageLevel.Info);
		});

		// add only the cards with oracle results to the deck
		dCards.filter(m => !!m.OracleCard).forEach(card => {
			this.deck.push(card);
		});
	}

	private _mixinTagLinksHelper(oracle_ids: string[]) {
		if (oracle_ids.length === 0) {
			this._emitFinishedStep.emit(FinishedStep.CardTagLinks);
		} else {
			const idList = oracle_ids.slice(0, Math.min(QUERY_BATCH_SIZE, oracle_ids.length));
			oracle_ids.splice(0, idList.length);

			this.cardTagLinkService.postCardTagLinks(idList).subscribe(links => {
				links.forEach(link => {
					const dCard = this.deck.filter(m => !!m.OracleCard)
						.find(m => m.OracleCard.oracle_id === link.oracle_id);

					if (dCard) {
						dCard.CardTagLinks ? dCard.CardTagLinks.push(link) : dCard.CardTagLinks = [link];
					}
				});

				SleepHelper.sleep(QUERY_SLEEP_MS);
				this._mixinTagLinksHelper(oracle_ids);
			});
		}
	}

	private _mixinTagLinks() {
		const oracle_ids = this.deck.filter(m => !!m.OracleCard).map(a => a.OracleCard.oracle_id);
		this._mixinTagLinksHelper(oracle_ids);
	}

	private _getCharts() {
		this._getCMCChart();
		this._getColorsPieChart();
		this._getTagsRadarChart();
	}

	private _getTagsRadarChart() {
		if (this.deck && this.deck.length > 0) {
			const stats: { sets: ChartDataSets[], labels: Label[] } = Statistics.getChartTagsRadar(this.deck);

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

	private _getColorsPieChart() {
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

	private _getCMCChart() {
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

	private _groupByTypes() {
		const result: CardGrouping[] = [];

		Statistics.MAIN_TYPES.forEach(mainType => {
			result.push({ key: mainType, cards: [], count: 0 });
		});

		this.deck.forEach(card => {
			if (card.OracleCard) {
				for (let iType = 0; iType < Statistics.MAIN_TYPES.length; iType++) {
					const mainType = Statistics.MAIN_TYPES[iType];

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

		result.map(a => this._sortGroupContents(a));

		this.cardsGrouped = result.filter(m => m.count > 0);
		this.accordionStep = 'groups';
	}

	private _sortGroupContents(group: CardGrouping) {
		group.cards = group.cards.sort(this._sortCardsByName);
		group.cards.forEach(card => {
			if (card.CardTagLinks) {
				card.CardTagLinks = card.CardTagLinks.sort(this._sortCardTagLinksByName);
			}
		});
	}

	private _groupByTags() {
		const untagged: CardGrouping = { key: UNTAGGED_PLACEHOLDER, cards: [], count: 0 };
		let result: CardGrouping[] = [];

		this.deck.forEach(card => {
			if (card.CardTagLinks && card.CardTagLinks.length > 0) {
				card.CardTagLinks.forEach(link => {
					if (link && link.TagName) {
						let grouping = result.find(m => m.key === link.TagName);

						if (!grouping) {
							grouping = { key: link.TagName, cards: [], count: 0 };
							result.push(grouping);
						}

						grouping.cards.push(card);
						grouping.count += card.count;
					}
				});
			} else {
				untagged.cards.push(card);
				untagged.count += card.count;
			}
		});

		result.map(a => this._sortGroupContents(a));
		result = result.sort(this._sortCardGroupingsByKey);

		// ensure untagged cards show up at the bottom
		if (untagged.count > 0) {
			untagged.cards = untagged.cards.sort(this._sortCardsByName);
			result.push(untagged);
		}

		this.cardsGrouped = result.filter(m => m.count > 0);
		this.accordionStep = 'groups';
	}

	private _groupByCMC() {
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
				this.messages.send('Could not find Oracle entry for ' + card.name);
			}
		});

		result.map(a => this._sortGroupContents(a));

		this.cardsGrouped = result.filter(m => m.count > 0);
		this.accordionStep = 'groups';
	}

	private _sortCardGroupingsByKey(a: CardGrouping, b: CardGrouping): number {
		return (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0);
	}

	private _sortCardsByName(a: CardReference, b: CardReference): number {
		return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
	}

	private _sortCardTagLinksByName(a: CardTagLink, b: CardTagLink): number {
		if (a.TagName && b.TagName) {
			return (a.TagName > b.TagName) ? 1 : ((b.TagName > a.TagName) ? -1 : 0);
		} else {
			return 1;
		}
	}

	refreshGroups() {
		this._performGroupByMode(this.groupByMode);
	}

	private _performGroupByMode(mode: string) {
		switch (mode as GroupByMode) {
			case GroupByMode.Types:
				this._groupByTypes();
				break;

			case GroupByMode.Tags:
				this._groupByTags();
				break;

			case GroupByMode.CMC:
				this._groupByCMC();
				break;

			default:
				break;
		}
	}

	selectedMode($event: MatSelectChange) {
		this._performGroupByMode($event.value);
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

		dConfig.data = { tags: this._tags };

		const dRef = this.dialog.open(DialogAddTagComponent, dConfig);
		dRef.afterClosed().subscribe((tag: Tag) => {
			if (tag) {
				if (card.CardTagLinks && card.CardTagLinks.findIndex(m => m.TagId === tag.id) !== -1) {
					// don't add the same tag twice
					this.messages.send(`"${card.name}" is already tagged with [${tag.name}].`, MessageLevel.Alert);
				} else {
					const newLink = new CardTagLink();
					newLink.oracle_id = card.OracleCard.oracle_id;
					newLink.TagName = tag.name;
					newLink.TagId = tag.id;

					this.cardTagLinkService.createCardTagLink(newLink).subscribe(result => {
						if (result) {
							if (result.id) {
								newLink.id = result.id;

								if (card.CardTagLinks) {
									let index = 0;
									while (index < card.CardTagLinks.length) {
										if (newLink.TagName > card.CardTagLinks[index].TagName) {
											index++;
										} else {
											break;
										}
									}

									card.CardTagLinks.splice(index, 0, newLink);
								} else {
									card.CardTagLinks = [newLink];
								}
							} else {
								this.messages.send(`Could not attach [${tag.name}] to "${card.name}."`, MessageLevel.Alert);
							}
						}
					});
				}
			}
		});
	}

	removeCardTagLink(link: CardTagLink) {
		this.cardTagLinkService.deleteCardTagLink(link.id).subscribe(result => {
			if (result) {
				if (!result.isSuccess) {
					this.messages.send(`Could not remove link to [${link.TagName}].`, MessageLevel.Alert);
				} else {
					const card = this.deck.find(m => m.OracleCard && m.OracleCard.oracle_id === link.oracle_id);
					if (card) {
						const linkIndex = card.CardTagLinks.findIndex(m => m.TagId === link.TagId);
						if (linkIndex !== -1) {
							card.CardTagLinks.splice(linkIndex, 1);
						}
					}
				}
			}
		});
	}

	open(panel: string) {
		switch (panel) {
			case 'charts':
				this._getCharts();
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