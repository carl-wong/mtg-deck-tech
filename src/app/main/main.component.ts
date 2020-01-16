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
import { GroupByMode, MainCardTypes, Statistics } from '../classes/statistics';
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


const TOTAL_PROGRESS_STEPS = 5.0;

const UNTAGGED_PLACEHOLDER = 'UNTAGGED';
const QUERY_BATCH_SIZE = 10;
const QUERY_SLEEP_MS = 100;

const DECKBOX_TOKEN = 'deckbox.org/sets/';

enum FinishedStep {
	Transform = 'Transform Name Dictionary',
	Oracle = 'Oracle Definitions',
	CardTagLinks = 'CardTagLinks',
	PostProcessing = 'Post Processing',
}

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit, OnDestroy {
	chartsColumns = 2;

	accordionStep = 'input';
	private _emitFinishedStep = new EventEmitter();

	groupByModes = Statistics.GROUP_MODES;

	isTransformNameDictReady = false;
	private _transformNameDict: { [name: string]: string } = {};

	@Input() groupByMode: string = this.groupByModes[0].toString();
	@Input() decklist = environment.defaultDecklist;

	isDecklistReady: boolean = false;
	deck: CardReference[] = [];

	cardCounts = {
		total: 0,
		unique: 0,
		missing: 0,
	}

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
		this._emitFinishedStep.unsubscribe();
	}

	ngOnInit() {
		this._subscribeToTagUpdateEvents();
		this._subscribeToFinishedStepEvents();
	}

	private _subscribeToFinishedStepEvents() {
		this._emitFinishedStep.subscribe((step: FinishedStep) => {
			this.messages.send(`${step.toString()} loaded...`);

			switch (step) {
				case FinishedStep.Oracle:
					this._countCards();
					this._updateProgress();
					this._mixinTagLinks();
					break;

				case FinishedStep.CardTagLinks:
					this._updateProgress();
					this._decklistPostProcessing();
					break;

				case FinishedStep.PostProcessing:
					this._updateProgress();
					this.isProgressSpinnerActive = false;
					this.isDecklistReady = true;
					this.messages.send('Decklist processed!');
					break;

				default:
					break;
			}
		});
	}

	private _countCards() {
		this.cardCounts.total = this.deck.map(m => m.count).reduce((a, b) => a + b);
		this.cardCounts.unique = this.deck.length;
	}

	private _decklistPostProcessing() {
		this._logMissingCards();
		this._performGroupByMode(this.groupByMode);

		this._emitFinishedStep.emit(FinishedStep.PostProcessing);
	}

	private _subscribeToTagUpdateEvents() {
		this._tagsUpdatedSub = this.notify.isTagsUpdated$.subscribe(event => {
			switch (event.type) {
				case EventType.Update: {
					this.deck.filter(m => m.CardTagLinks && m.CardTagLinks.length > 0)
						.forEach(card => {
							const link = card.CardTagLinks.find(m => m.TagId === event.Tag.id);
							if (link) {
								link.TagName = event.Tag.name;
							}
						});
					break;
				}

				case EventType.Delete: {
					this.deck.filter(m => m.CardTagLinks && m.CardTagLinks.length > 0)
						.forEach(card => {
							const linkIndex = card.CardTagLinks.findIndex(m => m.TagId === event.Tag.id);
							if (linkIndex !== -1) {
								card.CardTagLinks.splice(linkIndex, 1);
							}
						});
					break;
				}

				case EventType.Merge: {
					// update the TagId and TagName of all links referencing the merged from Tag
					this.deck.filter(m => m.CardTagLinks)
						.forEach(card => {
							const link = card.CardTagLinks.find(m => m.TagId === event.fromId);
							if (link) {
								link.TagName = event.Tag.name;
								link.TagId = event.toId;
							}
						});
					break;
				}

				default:
					// no action required
					break;
			}
		});
	}

	private _logMissingCards() {
		const missing = this.deck.filter(m => !m.OracleCard);
		missing.forEach(card => {
			this.messages.send(`Could not find "${card.name}" in Oracle, please check spelling and/or capitalization.`, MessageLevel.Warn);
		});

		this.cardCounts.missing = missing.length;
	}

	private async _getDeckboxURL() {
		this.messages.send('<deckbox.org> integration is not supported at this time.', MessageLevel.Alert);

		if (false) {
			const regex = /[\d]+/gm;
			const setId = regex.exec(this.decklist);
			const deckboxExportURL = `https://deckbox.org/sets/${setId}/export`;

			this.messages.send(`Attempting to fetch <${deckboxExportURL}>`);
			const getResult = await fetch(deckboxExportURL, {
				method: 'GET',
				mode: 'no-cors',
				cache: 'no-cache',

			});

			await console.log(getResult);
		}
	}

	isProgressSpinnerActive: boolean = false;
	progressSpinnerValue: number = 0;
	private _stepNumber: number = 0;
	private _updateProgress() {
		if (this._stepNumber < TOTAL_PROGRESS_STEPS) {
			this._stepNumber++;
		}

		this.progressSpinnerValue = Math.min(100, (this._stepNumber / TOTAL_PROGRESS_STEPS) * 100);
	}

	submitDecklist(isFromClick: boolean = false) {
		if (isFromClick) {
			this.isDecklistReady = false;
			this._stepNumber = this.isTransformNameDictReady ? 1 : 0;
			this.isProgressSpinnerActive = true;
		}

		if (this.isTransformNameDictReady) {
			this._updateProgress();

			this.messages.send('Processing decklist, please wait...', MessageLevel.Notify);

			// reset output containers
			this.deck = [];
			this.cardsGrouped = [];

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
							card.name = this._transformNameDict[name] ? this._transformNameDict[name] : name;

							lookupArray.push(card.name);
							this.deck.push(card);

							if (lookupArray.length >= QUERY_BATCH_SIZE) {
								this.oracle.getByNames(lookupArray).subscribe(cards => {
									this._mixinOracleCards(cards);
								});

								lookupArray = [];
								SleepHelper.sleep(QUERY_SLEEP_MS);
							}
						}
					}
				}

				if (lookupArray.length > 0) {
					this.oracle.getByNames(lookupArray).subscribe(cards => {
						this._mixinOracleCards(cards);
						this._emitFinishedStep.emit(FinishedStep.Oracle);
					});
				} else {
					this._emitFinishedStep.emit(FinishedStep.Oracle);
				}
			}
		} else {
			this._updateProgress();

			this.oracle.getTransform()
				.subscribe(cards => {
					if (cards) {
						cards.filter(m => m.name && m.name.includes(' // ')).map(m => m.name.toLowerCase())
							.forEach(name => {
								const front = name.split(' // ')[0];
								this._transformNameDict[front] = name;
							});

						this.isTransformNameDictReady = true;
						this._emitFinishedStep.emit(FinishedStep.Transform);

						this.submitDecklist();
					}
				});
		}
	}

	private _mixinOracleCards(oCards: MinOracleCard[]) {
		// attach oracle results to each card reference
		oCards.forEach(oCard => {
			const lowerName = oCard.name.toLowerCase();
			const dCard = this.deck.find(m => m.name === lowerName);
			if (dCard) {
				dCard.name = oCard.name;
				dCard.OracleCard = oCard;
			}
		});
	}

	private _mixinTagLinks() {
		let lookupArray = [];
		const oracle_ids = this.deck.filter(m => m.OracleCard).map(a => a.OracleCard.oracle_id);

		while (oracle_ids.length > 0) {
			lookupArray.push(oracle_ids.pop());
			if (lookupArray.length >= QUERY_BATCH_SIZE) {
				this.service.getCardTagLinks(lookupArray).subscribe(links => {
					links.forEach(link => {
						const dCard = this.deck.find(m => m.OracleCard && m.OracleCard.oracle_id === link.oracle_id);
						if (dCard) {
							dCard.CardTagLinks ? dCard.CardTagLinks.push(link) : dCard.CardTagLinks = [link];
						}
					});
				});

				lookupArray = [];
				SleepHelper.sleep(QUERY_SLEEP_MS);
			}
		}

		if (lookupArray.length > 0) {
			this.service.getCardTagLinks(lookupArray).subscribe(links => {
				links.forEach(link => {
					const dCard = this.deck.find(m => m.OracleCard && m.OracleCard.oracle_id === link.oracle_id);
					if (dCard) {
						dCard.CardTagLinks ? dCard.CardTagLinks.push(link) : dCard.CardTagLinks = [link];
					}
				});
				this._emitFinishedStep.emit(FinishedStep.CardTagLinks);
			});
		} else {
			this._emitFinishedStep.emit(FinishedStep.CardTagLinks);
		}
	}

	private _getCharts() {
		this._getCMCChart();
		this._getColorsPieChart();
		this._getTagsRadarChart();
	}

	isChartTagsRadar: boolean = false;
	chartTagsRadar: iChartTags;
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

	isChartColorPie: boolean = false;
	chartColorPie: iChartColorPie;
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

	isChartCMCCurve: boolean = false;
	chartCMCCurve: iChartCmc;
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
		const result: [string, CardReference[], number][] = [];

		Statistics.MAIN_TYPES.forEach(mainType => {
			result.push([mainType, [], 0]);
		});

		this.deck.forEach(card => {
			if (card.OracleCard) {
				for (let iType = 0; iType < Statistics.MAIN_TYPES.length; iType++) {
					const mainType = Statistics.MAIN_TYPES[iType];

					if (card.OracleCard.type_line.indexOf(mainType.toString()) !== -1) {
						const type: [string, CardReference[], number] = result.find(m => m[0] === mainType);

						type[1].push(card);
						type[2] += card.count;

						if (mainType === MainCardTypes.Creature) {
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

	private _groupByTags() {
		const untagged: [string, CardReference[], number] = [UNTAGGED_PLACEHOLDER, [], 0];
		let result: [string, CardReference[], number][] = [];

		this.deck.forEach(card => {
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
		const result: [string, CardReference[], number][] = [];

		for (let i = 0; i < 8; i++) {
			result.push([Statistics.cmcToString(i), [], 0]);
		}

		const landsGroup: [string, CardReference[], number] = ['Lands', [], 0];
		result.push(landsGroup);

		this.deck.forEach(card => {
			const oracle = card.OracleCard;
			if (oracle) {
				if (oracle.layout &&
					oracle.layout !== 'transform' &&
					oracle.type_line &&
					oracle.type_line.includes('Land')) {
					landsGroup[1].push(card);
					landsGroup[2] += card.count;
				} else {
					const cmcString = Statistics.cmcToString(oracle.cmc);
					const group: [string, CardReference[], number] = result.find(m => m[0] === cmcString);
					group[1].push(card);
					group[2] += card.count;
				}
			} else {
				this.messages.send('Could not find Oracle entry for ' + card.name);
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
					this.messages.send(`"${card.name}" is already tagged with [${tag.name}].`, MessageLevel.Alert);
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
								this.messages.send(`Could not attach [${tag.name}] to "${card.name}."`, MessageLevel.Alert);
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
		if (panel === 'charts') {
			this._getCharts();
			this.accordionStep = panel;
		} else {
			this.accordionStep = panel;
		}
	}
}
