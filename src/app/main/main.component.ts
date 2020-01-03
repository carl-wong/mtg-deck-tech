import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CardReference } from '../classes/card-reference';
import { CardTagLink } from '../classes/card-tag-link';
import { OracleCard } from '../classes/oracle-card';
import { SleepHelper } from '../classes/sleep-helper';
import { Statistics } from '../classes/statistics';
import { Tag } from '../classes/tag';
import { DialogAddTagComponent } from '../dialog-add-tag/dialog-add-tag.component';
import { DialogCardDetailsComponent } from '../dialog-card-details/dialog-card-details.component';
import { LocalApiService } from '../services/local-api.service';
import { OracleApiService } from '../services/oracle-api.service';
import { ChartCmc } from './chart-cmc/chart-cmc.component';
import { ChartColorPie } from './chart-color-pie/chart-color-pie.component';


const MODE_TYPES = 'Types';
const MODE_TAGS = 'Tags';
const MODE_CMC = 'CMC';

const UNTAGGED_PLACEHOLDER = 'UNTAGGED';
const QUERY_BATCH_SIZE = 10;

enum FinishedStep {
	Transform,
	Oracle,
	Tags
}

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
	accordionStep = 'input';
	onCardsLoaded = new EventEmitter();

	groupByModes = [
		MODE_TYPES,
		MODE_TAGS,
		MODE_CMC,
	];

	private _isTransformCardsCacheReady = false;
	private _transformCardsCache: { [name: string]: string } = {};
	private _oracleCardsCache: { [oracle_id: string]: CardReference } = {};

	@Input() groupByMode: string = this.groupByModes[0];
	@Input() decklist = "1 Akoum Refuge\n1 Battlefield Forge\n1 Bloodfell Caves\n1 Boros Guildgate\n1 Castle Locthwain\n1 Caves of Koilos\n1 Cinder Barrens\n1 Command Tower\n1 Evolving Wilds\n1 Exotic Orchard\n3 Mountain\n1 Myriad Landscape\n1 Naya Panorama\n1 Nomad Outpost\n1 Orzhov Guildgate\n5 Plains\n1 Rakdos Guildgate\n1 Rogue's Passage\n1 Scoured Barrens\n1 Slayers' Stronghold\n6 Swamp\n1 Temple of Silence\n1 Temple of the False God\n1 Temple of Triumph\n1 Terramorphic Expanse\n1 Adamaro, First to Desire\n1 Alesha, Who Smiles at Death\n1 Altar of Dementia\n1 Animate Dead\n1 Arcane Signet\n1 Assemble the Legion\n1 Blade of the Bloodchief\n1 Blood Artist\n1 Burglar Rat\n1 Buried Alive\n1 Burnished Hart\n1 Cartel Aristocrat\n1 Cauldron Familiar\n1 Cauldron of Souls\n1 Charming Prince\n1 Chromatic Lantern\n1 Commander's Sphere\n1 Cruel Celebrant\n1 Deafening Silence\n1 Despark\n1 Dictate of Erebos\n1 Dire Fleet Daredevil\n1 Dockside Extortionist\n1 Duplicant\n1 Embodiment of Agonies\n1 Faithless Looting\n1 Final Parting\n1 Ghostly Prison\n1 Gray Merchant of Asphodel\n1 Kaya's Ghostform\n1 Key to the City\n1 Kor Cartographer\n1 Leyline of Combustion\n1 Lightning Greaves\n1 Living Death\n1 Master of Cruelties\n1 Merchant of the Vale // Haggle\n1 Mortify\n1 Murderous Redcap\n1 Overeager Apprentice\n1 Perpetual Timepiece\n1 Phyrexian Unlife\n1 Profane Procession\n1 Ravenous Chupacabra\n1 Reforge the Soul\n1 Skeleton Key\n1 Smothering Tithe\n1 Solemn Simulacrum\n1 Solemnity\n1 Stitcher's Supplier\n1 Stormfist Crusader\n1 Supernatural Stamina\n1 Sword of Sinew and Steel\n1 Syr Konrad, the Grim\n1 Thrill of Possibility\n1 Tragic Arrogance\n1 Tuktuk the Explorer\n1 Vampire Hexmage\n1 Victimize\n1 Viscera Seer\n1 Wall of Omens\n1 Wear // Tear\n1 Whispersilk Cloak\n1 Zulaport Cutthroat";
	private _cards: CardReference[] = [];

	cardsGrouped: [string, CardReference[], number][] = [];
	chartCMCCurve: ChartCmc;
	chartColorPie: ChartColorPie;

	constructor(
		private oracle: OracleApiService,
		private service: LocalApiService,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.onCardsLoaded.subscribe((step: FinishedStep) => {
			console.log('Received onCardsLoaded: ' + step.toString());

			switch (step) {
				case FinishedStep.Transform:
					this._isTransformCardsCacheReady = true;
					break;

				case FinishedStep.Oracle:
					// mixin CardTagLinks
					this._mixinTagLinks();
					this._getStatistics();
					break;

				case FinishedStep.Tags:
					// group cards based on selected mode value
					this._performGroupByMode(this.groupByMode);
					break;

				default:
					break;
			}
		});

		this._getTransformCache();
	}

	submitDecklist() {
		if (this._isTransformCardsCacheReady) {
			console.log('Submission received');

			this._resetSession();

			let lookupArray: string[] = [];
			let lines = this.decklist.split('\n').filter(l => l.length > 2);
			console.log('Found ' + lines.length + ' lines');

			while (lines.length > 0) {
				let line = lines.pop();
				const bySpace = line.split(' ');

				const count = parseInt(bySpace[0]);
				const name = line.substring(count.toString().length + 1);

				let card = new CardReference();
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

			if (lookupArray.length > 0) {
				this.oracle.getByNames(lookupArray).subscribe(cards => {
					this._mixinOracleCards(cards);
					this.onCardsLoaded.emit(FinishedStep.Oracle);
				});
			} else {
				this.onCardsLoaded.emit(FinishedStep.Oracle);
			}
		} else {
			alert('Please wait for transform cards cache to load...');
		}
	}

	private _getTransformCache() {
		this.oracle.getTransform().subscribe(cards => {
			if (cards) {
				cards.forEach(card => {
					const frontName = card.name.split(' // ')[0];
					this._transformCardsCache[frontName] = card.name;
				});

				this.onCardsLoaded.emit(FinishedStep.Transform);
			} else {
				alert('Could not load transform cards, is the oracle service running?');
			}
		});
	}

	private _mixinOracleCards(oCards: OracleCard[]) {
		// attach oracle results to each card reference
		oCards.forEach(oCard => {
			let dCard = this._cards.find(m => m.name === oCard.name);
			if (dCard) {
				dCard.OracleCard = oCard;
				this._oracleCardsCache[oCard.oracle_id] = dCard;
			}
		});
	}

	private _mixinTagLinks() {
		let lookupArray = [];
		let oracle_ids = this._cards.filter(m => m.OracleCard).map(a => a.OracleCard.oracle_id);
		console.log('Found ' + oracle_ids.length + ' oracle_ids');

		while (oracle_ids.length > 0) {
			lookupArray.push(oracle_ids.pop());
			if (lookupArray.length >= QUERY_BATCH_SIZE) {
				this.service.getCardTagLinks(lookupArray).subscribe(links => {
					links.forEach(link => {
						if (link) {
							let dCard = this._oracleCardsCache[link.oracle_id];
							if (dCard) {
								dCard.CardTagLinks ? dCard.CardTagLinks.push(link) : dCard.CardTagLinks = [link];
							}
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
					if (link) {
						let dCard = this._oracleCardsCache[link.oracle_id];
						if (dCard) {
							dCard.CardTagLinks ? dCard.CardTagLinks.push(link) : dCard.CardTagLinks = [link];
						}
					}
				});
				this.onCardsLoaded.emit(FinishedStep.Tags);
			});
		} else {
			this.onCardsLoaded.emit(FinishedStep.Tags);
		}
	}

	private _getStatistics() {
		this._getCMCChart();
		this._getColorsPieChart();
	}

	private _getColorsPieChart() {
		let chart: ChartColorPie = {
			title: 'Color Breakdown',
			data: Statistics.getChartColorPie(this._cards),
		};

		this.chartColorPie = chart;
	}

	private _getCMCChart() {
		let chart: ChartCmc = {
			title: 'CMC',
			data: [Statistics.getChartCMC(this._cards)],
			labels: [],
			colors: [],
		};

		for (let cmc = 0; cmc < 8; cmc++) {
			if (cmc === 7) {
				chart.labels.push('7+');
			} else {
				chart.labels.push(cmc.toString());
			}
		}

		chart.colors.push({
			backgroundColor: chart.data[0].backgroundColor.toString()
		});

		this.chartCMCCurve = chart;
	}

	private _resetSession() {
		this._cards = [];
		this.cardsGrouped = [];
	}

	private _groupCardsByType() {
		const MAIN_TYPES = [
			'Creature',
			'Sorcery',
			'Instant',
			'Enchantment',
			'Artifact',
			'Land',
		];

		let result: [string, CardReference[], number][] = [];

		this._cards.forEach(card => {
			if (!card.OracleCard) {
				console.log('Could not find ' + card.name);
			} else {
				MAIN_TYPES.forEach(mt => {
					if (card.OracleCard.type_line.indexOf(mt) != -1) {
						let type: [string, CardReference[], number] = result.find(m => m[0] === mt);

						if (!type) {
							type = [mt, [], 0];
							result.push(type);
						}

						type[1].push(card);
						type[2] += card.count;
					}
				});
			}
		});

		result.map(a => this._sortGroupContents(a));

		this.cardsGrouped = result;
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

	private _groupCardsByTag() {
		let untagged: [string, CardReference[], number] = [UNTAGGED_PLACEHOLDER, [], 0];
		let result: [string, CardReference[], number][] = [];

		this._cards.forEach(card => {
			if (card.CardTagLinks && card.CardTagLinks.length > 0) {
				card.CardTagLinks.forEach(link => {
					if (link && link.Tag) {
						let type: [string, CardReference[], number] = result.find(m => m[0] === link.Tag.name);

						if (!type) {
							type = [link.Tag.name, [], 0];
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

	private _groupCardsByCMC() {
		function cmcToString(cmc: number) {
			if (cmc > 6) {
				return '7+ CMC';
			} else {
				return `${cmc} CMC`;
			}
		}

		let result: [string, CardReference[], number][] = [];

		for (let i = 0; i < 8; i++) {
			result.push([cmcToString(i), [], 0]);
		}
		
		let landsGroup: [string, CardReference[], number] = ['Lands', [], 0];
		result.push(landsGroup);

		this._cards.forEach(card => {
			if (card.OracleCard.layout &&
				card.OracleCard.layout !== 'transform' &&
				card.OracleCard.type_line &&
				card.OracleCard.type_line.includes('Land')) {
				landsGroup[1].push(card);
				landsGroup[2] += card.count;
			} else {
				const cmcString = cmcToString(card.OracleCard.cmc);
				let group: [string, CardReference[], number] = result.find(m => m[0] === cmcString);
				group[1].push(card);
				group[2] += card.count;
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
		if (a.Tag && b.Tag) {
			return (a.Tag.name > b.Tag.name) ? 1 : ((b.Tag.name > a.Tag.name) ? -1 : 0);
		} else {
			return 1;
		}
	}

	refreshGroups() {
		this._performGroupByMode(this.groupByMode);
	}

	_performGroupByMode(mode: string) {
		switch (mode) {
			case MODE_TYPES:
				this._groupCardsByType();
				break;

			case MODE_TAGS:
				this._groupCardsByTag();
				break;

			case MODE_CMC:
				this._groupCardsByCMC();
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
		dRef.afterClosed().subscribe(tagId => {
			if (tagId) {
				const newLink = new CardTagLink();
				newLink.oracle_id = card.OracleCard.oracle_id;
				newLink.TagId = tagId;

				this.service.createCardTagLink(newLink).subscribe((link: CardTagLink) => {
					if (link) {
						// new links don't return with Tag loaded
						this.service.getTag(link.TagId).subscribe((tag: Tag) => {
							if (tag) {
								link.Tag = tag;

								if (card.CardTagLinks) {
									const newTag = link.Tag.name;
									let index = 0;
									while (index < card.CardTagLinks.length) {
										if (newTag > card.CardTagLinks[index].Tag.name) {
											index++;
										} else {
											break;
										}
									}

									card.CardTagLinks.splice(index, 0, link);
								} else {
									card.CardTagLinks = [link];
								}
							}
						});
					}
				});
			}
		});
	}

	removeCardTagLink(link: CardTagLink) {
		this.service.deleteCardTagLink(link.id).subscribe(() => {
			let links = this._oracleCardsCache[link.oracle_id].CardTagLinks;
			links.splice(links.findIndex(m => m.TagId === link.TagId), 1);
		});
	}

	open(panel: string) {
		this.accordionStep = panel;
	}
}
