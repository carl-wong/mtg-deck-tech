import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { CardReference } from '../classes/card-reference';
import { CardTagLink } from '../classes/card-tag-link';
import { MinOracleCard } from '../classes/min-oracle-card';
import { SleepHelper } from '../classes/sleep-helper';
import { Statistics } from '../classes/statistics';
import { Tag } from '../classes/tag';
import { DialogAddTagComponent } from '../dialog-add-tag/dialog-add-tag.component';
import { DialogCardDetailsComponent } from '../dialog-card-details/dialog-card-details.component';
import { LocalApiService } from '../services/local-api.service';
import { MessageLevel, MessagesService } from '../services/messages.service';
import { EventType, NotificationService } from '../services/notification.service';
import { OracleApiService } from '../services/oracle-api.service';
import { iChartCmc } from './chart-cmc/chart-cmc.component';
import { iChartColorPie } from './chart-color-pie/chart-color-pie.component';
import { iChartTags } from './chart-tags/chart-tags.component';


const MODE_TYPES = 'Types';
const MODE_TAGS = 'Tags';
const MODE_CMC = 'CMC';

const UNTAGGED_PLACEHOLDER = 'UNTAGGED';
const QUERY_BATCH_SIZE = 10;

const DECKBOX_TOKEN = 'deckbox.org/sets/';
const UNCORS_GET_PREFIX = 'https://crossorigin.me/';

enum FinishedStep {
	Transform,
	Oracle,
	Tags,
	CardTagLinks
}

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit, OnDestroy {
	accordionStep = 'input';
	_onFinishedStep = new EventEmitter();

	groupByModes = [
		MODE_TYPES,
		MODE_TAGS,
		MODE_CMC,
	];

	isTagsCacheReady = false;
	private _tagsCache: Tag[];

	isTransformCardsCacheReady = false;
	private _transformCardsCache: { [name: string]: string } = {};
	private _oracleCardsCache: { [oracle_id: string]: CardReference } = {};

	@Input() groupByMode: string = this.groupByModes[0];
	@Input() decklist = environment.defaultDecklist;
	private _cards: CardReference[] = [];

	totalCards = 0;
	uniqueCards = 0;
	missingCards = 0;

	cardsGrouped: [string, CardReference[], number][] = [];

	private _tagsUpdatedSub: Subscription;

	constructor(
		private http: HttpClient,
		private messages: MessagesService,
		private oracle: OracleApiService,
		private service: LocalApiService,
		private notify: NotificationService,
		private dialog: MatDialog,
	) { }

	ngOnDestroy() {
		this._tagsUpdatedSub.unsubscribe();
		this._onFinishedStep.unsubscribe();
	}

	ngOnInit() {
		this._subscribeToTagUpdateEvents();
		this._subscribeToFinishedStepEvents();
		this._getTransformCache();
		this._getTagsCache();
	}

	private _subscribeToFinishedStepEvents() {
		this._onFinishedStep.subscribe((step: FinishedStep) => {
			switch (step) {
				case FinishedStep.Tags:
					this.messages.add('Tags cache loaded...');
					this.isTagsCacheReady = true;
					break;

				case FinishedStep.Transform:
					this.messages.add('Transform cards cache loaded...');
					this.isTransformCardsCacheReady = true;
					break;

				case FinishedStep.Oracle:
					this.messages.add('Oracle cards loaded...');
					// mixin CardTagLinks
					this._mixinTagLinks();
					break;

				case FinishedStep.CardTagLinks:
					this.messages.add('CardTagLinks loaded...');
					// group cards based on selected mode value
					this._getStatistics();
					this._logMissingCards();
					this._performGroupByMode(this.groupByMode);
					break;

				default:
					break;
			}
		});
	}

	private _subscribeToTagUpdateEvents() {
		this._tagsUpdatedSub = this.notify.isTagsUpdated$.subscribe(event => {
			switch (event.type) {
				case EventType.Init:
					// do nothing
					break;

				case EventType.Update: {
					const tag = this._tagsCache.find(m => m.id == event.Tag.id);
					tag.name = event.Tag.name;

					this._cards.filter(m => m.CardTagLinks && m.CardTagLinks.length > 0)
						.forEach(card => {
							const link = card.CardTagLinks.find(m => m.TagId === tag.id);
							if (link) {
								link.TagName = event.Tag.name;
							}
						});
					break;
				}

				case EventType.Insert: {
					this._tagsCache.push(event.Tag);
					break;
				}

				case EventType.Delete: {
					const tagIndex = this._tagsCache.findIndex(m => m.id === event.Tag.id);
					if (tagIndex !== -1) {
						this._tagsCache.splice(tagIndex, 1);
					}
					break;
				}

				case EventType.Merge: {
					// remove the merged tag
					const tagIndex = this._tagsCache.findIndex(m => m.id == event.fromId);
					if (tagIndex !== -1) {
						this._tagsCache.splice(tagIndex, 1);
					}

					// update the TagId and TagName of all links referencing the merged from Tag
					this._cards.filter(m => m.CardTagLinks).forEach(card => {
						const link = card.CardTagLinks.find(m => m.TagId === event.fromId);
						if (link) {
							link.TagName = event.Tag.name;
							link.TagId = event.toId;
						}
					});
					break;
				}

				default:
					this.messages.add('Received unexpected EventType: ' + event.type);
					break;
			}
		});
	}

	private _logMissingCards() {
		const missing = this._cards.filter(m => !m.OracleCard);
		missing.forEach(card => {
			this.messages.add(`Could not find "${card.name}" in Oracle, please check spelling and/or capitalization.`, MessageLevel.Warn);
		});

		this.missingCards = missing.length;
	}

	private async _getDeckboxURL() {
		this.messages.add('<deckbox.org> integration is not supported at this time.', MessageLevel.Alert);

		if (false) {
			const regex = /[\d]+/gm;
			const setId = regex.exec(this.decklist);
			const deckboxExportURL = `https://deckbox.org/sets/${setId}/export`;

			this.messages.add(`Attempting to fetch <${deckboxExportURL}>`);
			const getResult = await fetch(deckboxExportURL, {
				method: 'GET',
				mode: 'no-cors',
				cache: 'no-cache',

			});

			await console.log(getResult);
		}
	}

	submitDecklist() {
		this._resetSession();

		if (this.decklist.indexOf(DECKBOX_TOKEN) !== -1) {
			// deckbox set URL
			this._getDeckboxURL();
		} else {
			// regular decklist importer
			let lookupArray: string[] = [];

			const lines = this.decklist.split('\n');
			const regex = /(?<_ls>[\s]+)?(?<count>[\d]+)?(?<_x>[xX]+[\s]+)?(?<_ms>[\s]+)?(?<name>.+)(?<_ts>[\s]+)?$/gm;

			while (lines.length > 0) {
				const line = lines.pop();

				regex.lastIndex = 0; // reset to look from start of each line
				const linesRx = regex.exec(line);

				if (linesRx) {
					const name = linesRx.groups.name ? linesRx.groups.name.trim().toLowerCase() : null;
					if (name) {
						const count = linesRx.groups.count ? parseInt(linesRx.groups.count) : 1;

						const card = new CardReference();
						card.count = count;
						card.name = this._transformCardsCache[name] ? this._transformCardsCache[name] : name;

						lookupArray.push(card.name);
						this._cards.push(card);

						if (lookupArray.length >= QUERY_BATCH_SIZE) {
							this.oracle.getByNames(lookupArray).subscribe(cards => {
								this._mixinOracleCards(cards);
							});

							lookupArray = [];
							SleepHelper.sleep(50);
						}
					}
				}
			}

			if (lookupArray.length > 0) {
				this.oracle.getByNames(lookupArray).subscribe(cards => {
					this._mixinOracleCards(cards);
					this._onFinishedStep.emit(FinishedStep.Oracle);
				});
			} else {
				this._onFinishedStep.emit(FinishedStep.Oracle);
			}
		}
	}

	private _getTransformCache() {
		this.oracle.getTransform().subscribe(cards => {
			if (cards) {
				cards.filter(m => m.name && m.name.includes(' // ')).map(m => m.name.toLowerCase())
					.forEach(name => {
						const front = name.split(' // ')[0];
						this._transformCardsCache[front] = name;
					});

				this._onFinishedStep.emit(FinishedStep.Transform);
			}
		});
	}

	private _getTagsCache() {
		this.service.getTags().subscribe(tags => {
			this._tagsCache = tags;
			this._onFinishedStep.emit(FinishedStep.Tags);

			if (this._cards.length > 0) {

			}
		});
	}

	private _mixinOracleCards(oCards: MinOracleCard[]) {
		// attach oracle results to each card reference
		oCards.forEach(oCard => {
			const lowerName = oCard.name.toLowerCase();
			const dCard = this._cards.find(m => m.name === lowerName);
			if (dCard) {
				dCard.name = oCard.name;
				dCard.OracleCard = oCard;
				this._oracleCardsCache[oCard.oracle_id] = dCard;
			}
		});
	}

	private _mixinTagLinks() {
		let lookupArray = [];
		const oracle_ids = this._cards.filter(m => m.OracleCard).map(a => a.OracleCard.oracle_id);

		while (oracle_ids.length > 0) {
			lookupArray.push(oracle_ids.pop());
			if (lookupArray.length >= QUERY_BATCH_SIZE) {
				this.service.getCardTagLinks(lookupArray).subscribe(links => {
					links.forEach(link => {
						const dCard = this._oracleCardsCache[link.oracle_id];
						if (dCard) {
							dCard.CardTagLinks ? dCard.CardTagLinks.push(link) : dCard.CardTagLinks = [link];
						}
					});
				});

				lookupArray = [];
				SleepHelper.sleep(50);
			}
		}

		if (lookupArray.length > 0) {
			this.service.getCardTagLinks(lookupArray).subscribe(links => {
				links.forEach(link => {
					const dCard = this._oracleCardsCache[link.oracle_id];
					if (dCard) {
						dCard.CardTagLinks ? dCard.CardTagLinks.push(link) : dCard.CardTagLinks = [link];
					}
				});
				this._onFinishedStep.emit(FinishedStep.CardTagLinks);
			});
		} else {
			this._onFinishedStep.emit(FinishedStep.CardTagLinks);
		}
	}

	private _getStatistics() {
		this._getCMCChart();
		this._getColorsPieChart();
		this._getTagsRadarChart();

		this.totalCards = this._cards.map(m => m.count).reduce((a, b) => a + b);
		this.uniqueCards = this._cards.length;
	}

	chartTagsRadar: iChartTags;
	private _getTagsRadarChart() {
		const stats: { sets: ChartDataSets[], labels: Label[] } = Statistics.getChartTagsRadar(this._cards);

		const chart: iChartTags = {
			title: 'Tags',
			data: stats.sets,
			labels: stats.labels
		};

		this.chartTagsRadar = chart;
	}

	chartColorPie: iChartColorPie;
	private _getColorsPieChart() {
		const chart: iChartColorPie = {
			title: 'Color Breakdown',
			data: Statistics.getChartColorPie(this._cards),
		};

		this.chartColorPie = chart;
	}

	chartCMCCurve: iChartCmc;
	private _getCMCChart() {
		const chart: iChartCmc = {
			title: 'CMC',
			data: [Statistics.getChartCMC(this._cards)],
			labels: [],
		};

		for (let cmc = 0; cmc < 8; cmc++) {
			if (cmc === 7) {
				chart.labels.push('7+');
			} else {
				chart.labels.push(cmc.toString());
			}
		}

		this.chartCMCCurve = chart;
	}

	private _resetSession() {
		this._cards = [];
		this.cardsGrouped = [];
	}

	private _groupByType() {
		const MAIN_TYPES = [
			'Creature',
			'Sorcery',
			'Instant',
			'Enchantment',
			'Artifact',
			'Planeswalker',
			'Land',
		];

		const result: [string, CardReference[], number][] = [];

		MAIN_TYPES.forEach(mainType => {
			result.push([mainType, [], 0]);
		});

		this._cards.forEach(card => {
			if (card.OracleCard) {
				for (let iType = 0; iType < MAIN_TYPES.length; iType++) {
					const mainType = MAIN_TYPES[iType];

					if (card.OracleCard.type_line.indexOf(mainType) !== -1) {
						const type: [string, CardReference[], number] = result.find(m => m[0] === mainType);

						type[1].push(card);
						type[2] += card.count;

						if (mainType === 'Creature') {
							// CHANGE: Shivon suggested not to list creatures under any other type to avoid confusion
							break;
						}
					}
				}
			}
		});

		result.map(a => this._sortGroupContents(a));

		this.cardsGrouped = result.filter(m => m[2] > 0);
		this.accordionStep = 'groups';
	}

	private _sortGroupContents(group: [string, CardReference[], number]) {
		group[1] = group[1].sort(this._sortCardsByName);
		group[1].forEach(card => {
			if (card.CardTagLinks) {
				card.CardTagLinks = card.CardTagLinks.sort(this._sortCardTagLinksByName);
			}
		});
	}

	private _groupByTag() {
		const untagged: [string, CardReference[], number] = [UNTAGGED_PLACEHOLDER, [], 0];
		let result: [string, CardReference[], number][] = [];

		this._cards.forEach(card => {
			if (card.CardTagLinks && card.CardTagLinks.length > 0) {
				card.CardTagLinks.forEach(link => {
					if (link && link.TagName) {
						let type: [string, CardReference[], number] = result.find(m => m[0] === link.TagName);

						if (!type) {
							type = [link.TagName, [], 0];
							result.push(type);
						}

						type[1].push(card);
						type[2] += card.count;
					}
				});
			} else {
				untagged[1].push(card);
				untagged[2] += card.count;

			}
		});

		result.map(a => this._sortGroupContents(a));
		result = result.sort(this._sortTupleByGroup);

		// ensure untagged cards show up at the bottom
		if (untagged[2] > 0) {
			untagged[1] = untagged[1].sort(this._sortCardsByName);
			result.push(untagged);
		}

		this.cardsGrouped = result;
		this.accordionStep = 'groups';
	}

	private _groupByCMC() {
		function cmcToString(cmc: number) {
			if (cmc > 6) {
				return '7+ CMC';
			} else {
				return `${cmc} CMC`;
			}
		}

		const result: [string, CardReference[], number][] = [];

		for (let i = 0; i < 8; i++) {
			result.push([cmcToString(i), [], 0]);
		}

		const landsGroup: [string, CardReference[], number] = ['Lands', [], 0];
		result.push(landsGroup);

		this._cards.forEach(card => {
			const oracle = card.OracleCard;
			if (oracle) {
				if (oracle.layout &&
					oracle.layout !== 'transform' &&
					oracle.type_line &&
					oracle.type_line.includes('Land')) {
					landsGroup[1].push(card);
					landsGroup[2] += card.count;
				} else {
					const cmcString = cmcToString(oracle.cmc);
					const group: [string, CardReference[], number] = result.find(m => m[0] === cmcString);
					group[1].push(card);
					group[2] += card.count;
				}
			} else {
				this.messages.add('Could not find Oracle entry for ' + card.name);
			}
		});

		result.map(a => this._sortGroupContents(a));

		this.cardsGrouped = result.filter(m => m[2] > 0);
		this.accordionStep = 'groups';
	}

	private _sortTupleByGroup(a, b): number {
		return (a[0] > b[0]) ? 1 : ((b[0] > a[0]) ? -1 : 0);
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
		switch (mode) {
			case MODE_TYPES:
				this._groupByType();
				break;

			case MODE_TAGS:
				this._groupByTag();
				break;

			case MODE_CMC:
				this._groupByCMC();
				break;

			default:
				break;
		}
	}

	selectedMode($event) {
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

		const dRef = this.dialog.open(DialogAddTagComponent, dConfig);
		dRef.afterClosed().subscribe((tag: Tag) => {
			if (tag) {
				if (card.CardTagLinks && card.CardTagLinks.findIndex(m => m.TagId === tag.id) !== -1) {
					// don't add the same tag twice
					this.messages.add(`"${card.name}" is already tagged with [${tag.name}].`, MessageLevel.Alert);
				} else {
					const newLink = new CardTagLink();
					newLink.oracle_id = card.OracleCard.oracle_id;
					newLink.TagName = tag.name;
					newLink.TagId = tag.id;

					this.service.createCardTagLink(newLink).subscribe(result => {
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
								this.messages.add(`Could not attach [${tag.name}] to "${card.name}."`, MessageLevel.Alert);
							}
						}
					});
				}
			}
		});
	}

	removeCardTagLink(link: CardTagLink) {
		this.service.deleteCardTagLink(link.id).subscribe(result => {
			if (result) {
				if (!result.isSuccess) {
					this.messages.add(`Could not remove link to [${link.TagName}].`, MessageLevel.Alert);
				} else {
					const card = this._cards.find(m => m.OracleCard && m.OracleCard.oracle_id === link.oracle_id);
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
		this.accordionStep = panel;
	}
}
