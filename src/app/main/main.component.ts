import { Component, Input, OnInit } from '@angular/core';
import { CardReference } from '../classes/card-reference';
import { CardTagLink } from '../classes/card-tag-link';
import { OracleCard } from '../classes/oracle-card';
import { SleepHelper } from '../classes/sleep-helper';
import { OracleApiService } from '../services/oracle-api.service';
import { LocalApiService } from '../services/local-api.service';
import { DialogAddTagComponent } from '../dialog-add-tag/dialog-add-tag.component';
import  {DialogCardDetailsComponent} from '../dialog-card-details/dialog-card-details.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';



@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
	@Input() decklist = "1 Akoum Refuge\n1 Battlefield Forge\n1 Bloodfell Caves\n1 Boros Guildgate\n1 Castle Locthwain\n1 Caves of Koilos\n1 Cinder Barrens\n1 Command Tower\n1 Evolving Wilds\n1 Exotic Orchard\n3 Mountain\n1 Myriad Landscape\n1 Naya Panorama\n1 Nomad Outpost\n1 Orzhov Guildgate\n5 Plains\n1 Rakdos Guildgate\n1 Rogue's Passage\n1 Scoured Barrens\n1 Slayers' Stronghold\n6 Swamp\n1 Temple of Silence\n1 Temple of the False God\n1 Temple of Triumph\n1 Terramorphic Expanse\n1 Adamaro, First to Desire\n1 Alesha, Who Smiles at Death\n1 Altar of Dementia\n1 Animate Dead\n1 Arcane Signet\n1 Assemble the Legion\n1 Blade of the Bloodchief\n1 Blood Artist\n1 Burglar Rat\n1 Buried Alive\n1 Burnished Hart\n1 Cartel Aristocrat\n1 Cauldron Familiar\n1 Cauldron of Souls\n1 Charming Prince\n1 Chromatic Lantern\n1 Commander's Sphere\n1 Cruel Celebrant\n1 Deafening Silence\n1 Despark\n1 Dictate of Erebos\n1 Dire Fleet Daredevil\n1 Dockside Extortionist\n1 Duplicant\n1 Embodiment of Agonies\n1 Faithless Looting\n1 Final Parting\n1 Ghostly Prison\n1 Gray Merchant of Asphodel\n1 Kaya's Ghostform\n1 Key to the City\n1 Kor Cartographer\n1 Leyline of Combustion\n1 Lightning Greaves\n1 Living Death\n1 Master of Cruelties\n1 Merchant of the Vale // Haggle\n1 Mortify\n1 Murderous Redcap\n1 Overeager Apprentice\n1 Perpetual Timepiece\n1 Phyrexian Unlife\n1 Profane Procession\n1 Ravenous Chupacabra\n1 Reforge the Soul\n1 Skeleton Key\n1 Smothering Tithe\n1 Solemn Simulacrum\n1 Solemnity\n1 Stitcher's Supplier\n1 Stormfist Crusader\n1 Supernatural Stamina\n1 Sword of Sinew and Steel\n1 Syr Konrad, the Grim\n1 Thrill of Possibility\n1 Tragic Arrogance\n1 Tuktuk the Explorer\n1 Vampire Hexmage\n1 Victimize\n1 Viscera Seer\n1 Wall of Omens\n1 Wear // Tear\n1 Whispersilk Cloak\n1 Zulaport Cutthroat";
	deck: CardReference[];

	isTransformCardsCacheReady = false;
	private _transformCardsCache: { [name: string]: string } = {};

	isCardsByTypeReady = false;
	cardsByType: [string, CardReference[], number][];
	cardsByOracleId: { [oracle_id: string]: CardReference } = {};

	constructor(
		private oracle: OracleApiService,
		private service: LocalApiService,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.oracle.getTransform().subscribe(cards => {
			if (cards) {
				cards.forEach(card => {
					const frontName = card.name.split(' // ')[0];
					this._transformCardsCache[frontName] = card.name;
				});
				this.isTransformCardsCacheReady = true;
			} else {
				alert('Could not load transform cards, is the oracle service running?');
			}
		});
	}

	processOracleCards(oCards: OracleCard[]) {
		oCards.forEach(oCard => {
			let dCard = this.deck.find(m => m.name === oCard.name);
			if (dCard) {
				dCard.OracleCard = oCard;
				this.cardsByOracleId[oCard.oracle_id] = dCard;
			}
		});

		const oracle_ids = oCards.map(a => a.oracle_id);
		this.service.getCardTagLinks(oracle_ids).subscribe(links => {
			links.forEach(link => {
				let dCard = this.cardsByOracleId[link.oracle_id];
				if (dCard) {
					dCard.CardTagLinks ? dCard.CardTagLinks.push(link) : dCard.CardTagLinks = [link];
				}
			});
		});
	}

	resetFlags() {
		this.isCardsByTypeReady = false;
	}

	submitDecklist() {
		if (this.isTransformCardsCacheReady) {
			this.resetFlags();

			this.deck = [];//reset contents

			const lines = this.decklist.split('\n').filter(l => l.length > 2);

			let queriesRemaining = Math.ceil(lines.length / 10);
			let lookupArray: string[] = [];
			lines.forEach(line => {
				const bySpace = line.split(' ');

				const count = parseInt(bySpace[0]);
				const name = line.substring(count.toString().length + 1);

				let card = new CardReference();
				card.count = count;
				card.name = this._transformCardsCache[name] ? this._transformCardsCache[name] : name;

				lookupArray.push(card.name);
				this.deck.push(card);

				if (lookupArray.length === 10) {
					this.oracle.getByNames(lookupArray).subscribe(cards => {
						this.processOracleCards(cards);
						queriesRemaining--;

						if (queriesRemaining <= 0) {
							this.getCardsByType();
						}
					});

					lookupArray = [];
					SleepHelper.sleep(100);
				}
			});

			if (lookupArray.length > 0) {
				this.oracle.getByNames(lookupArray).subscribe(cards => {
					this.processOracleCards(cards);
					queriesRemaining--;

					if (queriesRemaining <= 0) {
						this.getCardsByType();
					}
				});
			}
		} else {
			alert('Please wait for transform cards cache to load...');
		}
	}

	getCardsByType() {
		const MAIN_TYPES = [
			'Creature',
			'Instant',
			'Sorcery',
			'Enchantment',
			'Artifact',
			'Land',
		];

		this.cardsByType = [];

		this.deck.forEach(card => {
			if (!card.OracleCard) {
				console.log('Could not find ' + card.name);
			} else {
				MAIN_TYPES.forEach(mt => {
					if (card.OracleCard.type_line.indexOf(mt) != -1) {
						let type: [string, CardReference[], number] = this.cardsByType.find(m => m[0] === mt);

						if (!type) {
							type = [mt, [], 0];
							this.cardsByType.push(type);
						}

						type[1].push(card);
						type[2] += card.count;
					}
				});
			}
		});
		this.isCardsByTypeReady = true;
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
		dConfig.autoFocus = false;

		const dRef = this.dialog.open(DialogAddTagComponent, dConfig);
		dRef.afterClosed().subscribe(tagId => {
			if (tagId) {
				const newLink = new CardTagLink();
				newLink.oracle_id = card.OracleCard.oracle_id;
				newLink.TagId = tagId;

				this.service.createCardTagLink(newLink).subscribe(res => {
					if (res) {
						this.service.getTag(res.TagId).subscribe(tag => {
							if (tag) {
							res.Tag = tag;
							}
						});
						card.CardTagLinks ? card.CardTagLinks.push(res) : card.CardTagLinks = [res];
					}
				});
			}
		});
	}

	removeCardTagLink(link: CardTagLink) {
		this.service.deleteCardTagLink(link.id).subscribe(() => {
			let links = this.cardsByOracleId[link.oracle_id].CardTagLinks;
			links.splice(links.findIndex(m => m.TagId === link.TagId), 1);
		});
	}
}
