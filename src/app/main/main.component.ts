import { Component, Input, OnInit } from '@angular/core';
import { CardReference } from '../classes/card-reference';
import { OracleCard } from '../classes/oracle-card';
import { SleepHelper } from '../classes/sleep-helper';
import { OracleApiService } from '../services/oracle-api.service';

const TRANSFORM_CARDS = {
	'Aberrant Researcher': 'Aberrant Researcher // Perfected Form',
	'Perfected Form': 'Aberrant Researcher // Perfected Form',
	'Accursed Witch': 'Accursed Witch // Infectious Curse',
	'Infectious Curse': 'Accursed Witch // Infectious Curse',
	'Afflicted Deserter': 'Afflicted Deserter // Werewolf Ransacker',
	'Werewolf Ransacker': 'Afflicted Deserter // Werewolf Ransacker',
	'Archangel Avacyn': 'Archangel Avacyn // Avacyn, the Purifier',
	'Avacyn, the Purifier': 'Archangel Avacyn // Avacyn, the Purifier',
	'Arguel\'s Blood Fast': 'Arguel\'s Blood Fast // Temple of Aclazotz',
	'Temple of Aclazotz': 'Arguel\'s Blood Fast // Temple of Aclazotz',
	'Arlinn Kord': 'Arlinn Kord // Arlinn, Embraced by the Moon',
	'Arlinn, Embraced by the Moon': 'Arlinn Kord // Arlinn, Embraced by the Moon',
	'Autumnal Gloom': 'Autumnal Gloom // Ancient of the Equinox',
	'Ancient of the Equinox': 'Autumnal Gloom // Ancient of the Equinox',
	'Avacynian Missionaries': 'Avacynian Missionaries // Lunarch Inquisitors',
	'Lunarch Inquisitors': 'Avacynian Missionaries // Lunarch Inquisitors',
	'Azor\'s Gateway': 'Azor\'s Gateway // Sanctum of the Sun',
	'Sanctum of the Sun': 'Azor\'s Gateway // Sanctum of the Sun',
	'Bloodline Keeper': 'Bloodline Keeper // Lord of Lineage',
	'Lord of Lineage': 'Bloodline Keeper // Lord of Lineage',
	'Breakneck Rider': 'Breakneck Rider // Neck Breaker',
	'Neck Breaker': 'Breakneck Rider // Neck Breaker',
	'Chalice of Life': 'Chalice of Life // Chalice of Death',
	'Chalice of Death': 'Chalice of Life // Chalice of Death',
	'Chandra, Fire of Kaladesh': 'Chandra, Fire of Kaladesh // Chandra, Roaring Flame',
	'Chandra, Roaring Flame': 'Chandra, Fire of Kaladesh // Chandra, Roaring Flame',
	'Chosen of Markov': 'Chosen of Markov // Markov\'s Servant',
	'Markov\'s Servant': 'Chosen of Markov // Markov\'s Servant',
	'Civilized Scholar': 'Civilized Scholar // Homicidal Brute',
	'Homicidal Brute': 'Civilized Scholar // Homicidal Brute',
	'Cloistered Youth': 'Cloistered Youth // Unholy Fiend',
	'Unholy Fiend': 'Cloistered Youth // Unholy Fiend',
	'Conduit of Storms': 'Conduit of Storms // Conduit of Emrakul',
	'Conduit of Emrakul': 'Conduit of Storms // Conduit of Emrakul',
	'Conqueror\'s Galleon': 'Conqueror\'s Galleon // Conqueror\'s Foothold',
	'Conqueror\'s Foothold': 'Conqueror\'s Galleon // Conqueror\'s Foothold',
	'Convicted Killer': 'Convicted Killer // Branded Howler',
	'Branded Howler': 'Convicted Killer // Branded Howler',
	'Cryptolith Fragment': 'Cryptolith Fragment // Aurora of Emrakul',
	'Aurora of Emrakul': 'Cryptolith Fragment // Aurora of Emrakul',
	'Curious Homunculus': 'Curious Homunculus // Voracious Reader',
	'Voracious Reader': 'Curious Homunculus // Voracious Reader',
	'Daring Sleuth': 'Daring Sleuth // Bearer of Overwhelming Truths',
	'Bearer of Overwhelming Truths': 'Daring Sleuth // Bearer of Overwhelming Truths',
	'Daybreak Ranger': 'Daybreak Ranger // Nightfall Predator',
	'Nightfall Predator': 'Daybreak Ranger // Nightfall Predator',
	'Delver of Secrets': 'Delver of Secrets // Insectile Aberration',
	'Insectile Aberration': 'Delver of Secrets // Insectile Aberration',
	'Docent of Perfection': 'Docent of Perfection // Final Iteration',
	'Final Iteration': 'Docent of Perfection // Final Iteration',
	'Dowsing Dagger': 'Dowsing Dagger // Lost Vale',
	'Lost Vale': 'Dowsing Dagger // Lost Vale',
	'Duskwatch Recruiter': 'Duskwatch Recruiter // Krallenhorde Howler',
	'Krallenhorde Howler': 'Duskwatch Recruiter // Krallenhorde Howler',
	'Elbrus, the Binding Blade': 'Elbrus, the Binding Blade // Withengar Unbound',
	'Withengar Unbound': 'Elbrus, the Binding Blade // Withengar Unbound',
	'Elusive Tormentor': 'Elusive Tormentor // Insidious Mist',
	'Insidious Mist': 'Elusive Tormentor // Insidious Mist',
	'Extricator of Sin': 'Extricator of Sin // Extricator of Flesh',
	'Extricator of Flesh': 'Extricator of Sin // Extricator of Flesh',
	'Garruk Relentless': 'Garruk Relentless // Garruk, the Veil-Cursed',
	'Garruk, the Veil-Cursed': 'Garruk Relentless // Garruk, the Veil-Cursed',
	'Gatstaf Arsonists': 'Gatstaf Arsonists // Gatstaf Ravagers',
	'Gatstaf Ravagers': 'Gatstaf Arsonists // Gatstaf Ravagers',
	'Gatstaf Shepherd': 'Gatstaf Shepherd // Gatstaf Howler',
	'Gatstaf Howler': 'Gatstaf Shepherd // Gatstaf Howler',
	'Geier Reach Bandit': 'Geier Reach Bandit // Vildin-Pack Alpha',
	'Vildin-Pack Alpha': 'Geier Reach Bandit // Vildin-Pack Alpha',
	'Golden Guardian': 'Golden Guardian // Gold-Forge Garrison',
	'Gold-Forge Garrison': 'Golden Guardian // Gold-Forge Garrison',
	'Grimlock, Dinobot Leader': 'Grimlock, Dinobot Leader // Grimlock, Ferocious King',
	'Grimlock, Ferocious King': 'Grimlock, Dinobot Leader // Grimlock, Ferocious King',
	'Grizzled Angler': 'Grizzled Angler // Grisly Anglerfish',
	'Grisly Anglerfish': 'Grizzled Angler // Grisly Anglerfish',
	'Grizzled Outcasts': 'Grizzled Outcasts // Krallenhorde Wantons',
	'Krallenhorde Wantons': 'Grizzled Outcasts // Krallenhorde Wantons',
	'Growing Rites of Itlimoc': 'Growing Rites of Itlimoc // Itlimoc, Cradle of the Sun',
	'Itlimoc, Cradle of the Sun': 'Growing Rites of Itlimoc // Itlimoc, Cradle of the Sun',
	'Hadana\'s Climb': 'Hadana\'s Climb // Winged Temple of Orazca',
	'Winged Temple of Orazca': 'Hadana\'s Climb // Winged Temple of Orazca',
	'Hanweir Militia Captain': 'Hanweir Militia Captain // Westvale Cult Leader',
	'Westvale Cult Leader': 'Hanweir Militia Captain // Westvale Cult Leader',
	'Hanweir Watchkeep': 'Hanweir Watchkeep // Bane of Hanweir',
	'Bane of Hanweir': 'Hanweir Watchkeep // Bane of Hanweir',
	'Harvest Hand': 'Harvest Hand // Scrounged Scythe',
	'Scrounged Scythe': 'Harvest Hand // Scrounged Scythe',
	'Heir of Falkenrath': 'Heir of Falkenrath // Heir to the Night',
	'Heir to the Night': 'Heir of Falkenrath // Heir to the Night',
	'Hermit of the Natterknolls':
		'Hermit of the Natterknolls // Lone Wolf of the Natterknolls',
	'Lone Wolf of the Natterknolls':
		'Hermit of the Natterknolls // Lone Wolf of the Natterknolls',
	'Hinterland Hermit': 'Hinterland Hermit // Hinterland Scourge',
	'Hinterland Scourge': 'Hinterland Hermit // Hinterland Scourge',
	'Hinterland Logger': 'Hinterland Logger // Timber Shredder',
	'Timber Shredder': 'Hinterland Logger // Timber Shredder',
	'Huntmaster of the Fells': 'Huntmaster of the Fells // Ravager of the Fells',
	'Ravager of the Fells': 'Huntmaster of the Fells // Ravager of the Fells',
	'Instigator Gang': 'Instigator Gang // Wildblood Pack',
	'Wildblood Pack': 'Instigator Gang // Wildblood Pack',
	'Jace, Vryn\'s Prodigy': 'Jace, Vryn\'s Prodigy // Jace, Telepath Unbound',
	'Jace, Telepath Unbound': 'Jace, Vryn\'s Prodigy // Jace, Telepath Unbound',
	'Journey to Eternity': 'Journey to Eternity // Atzal, Cave of Eternity',
	'Atzal, Cave of Eternity': 'Journey to Eternity // Atzal, Cave of Eternity',
	'Kessig Forgemaster': 'Kessig Forgemaster // Flameheart Werewolf',
	'Flameheart Werewolf': 'Kessig Forgemaster // Flameheart Werewolf',
	'Kessig Prowler': 'Kessig Prowler // Sinuous Predator',
	'Sinuous Predator': 'Kessig Prowler // Sinuous Predator',
	'Kindly Stranger': 'Kindly Stranger // Demon-Possessed Witch',
	'Demon-Possessed Witch': 'Kindly Stranger // Demon-Possessed Witch',
	'Kruin Outlaw': 'Kruin Outlaw // Terror of Kruin Pass',
	'Terror of Kruin Pass': 'Kruin Outlaw // Terror of Kruin Pass',
	'Kytheon, Hero of Akros': 'Kytheon, Hero of Akros // Gideon, Battle-Forged',
	'Gideon, Battle-Forged': 'Kytheon, Hero of Akros // Gideon, Battle-Forged',
	'Lambholt Elder': 'Lambholt Elder // Silverpelt Werewolf',
	'Silverpelt Werewolf': 'Lambholt Elder // Silverpelt Werewolf',
	'Lambholt Pacifist': 'Lambholt Pacifist // Lambholt Butcher',
	'Lambholt Butcher': 'Lambholt Pacifist // Lambholt Butcher',
	'Legion\'s Landing': 'Legion\'s Landing // Adanto, the First Fort',
	'Adanto, the First Fort': 'Legion\'s Landing // Adanto, the First Fort',
	'Liliana, Heretical Healer': 'Liliana, Heretical Healer // Liliana, Defiant Necromancer',
	'Liliana, Defiant Necromancer': 'Liliana, Heretical Healer // Liliana, Defiant Necromancer',
	'Lone Rider': 'Lone Rider // It That Rides as One',
	'It That Rides as One': 'Lone Rider // It That Rides as One',
	'Loyal Cathar': 'Loyal Cathar // Unhallowed Cathar',
	'Unhallowed Cathar': 'Loyal Cathar // Unhallowed Cathar',
	'Ludevic\'s Test Subject': 'Ludevic\'s Test Subject // Ludevic\'s Abomination',
	'Ludevic\'s Abomination': 'Ludevic\'s Test Subject // Ludevic\'s Abomination',
	'Mayor of Avabruck': 'Mayor of Avabruck // Howlpack Alpha',
	'Howlpack Alpha': 'Mayor of Avabruck // Howlpack Alpha',
	'Mondronen Shaman': 'Mondronen Shaman // Tovolar\'s Magehunter',
	'Tovolar\'s Magehunter': 'Mondronen Shaman // Tovolar\'s Magehunter',
	'Neglected Heirloom': 'Neglected Heirloom // Ashmouth Blade',
	'Ashmouth Blade': 'Neglected Heirloom // Ashmouth Blade',
	'Nicol Bolas, the Ravager': 'Nicol Bolas, the Ravager // Nicol Bolas, the Arisen',
	'Nicol Bolas, the Arisen': 'Nicol Bolas, the Ravager // Nicol Bolas, the Arisen',
	'Nightmare Moon': 'Nightmare Moon // Princess Luna',
	'Princess Luna': 'Nightmare Moon // Princess Luna',
	'Nissa, Vastwood Seer': 'Nissa, Vastwood Seer // Nissa, Sage Animist',
	'Nissa, Sage Animist': 'Nissa, Vastwood Seer // Nissa, Sage Animist',
	'Path of Mettle': 'Path of Mettle // Metzali, Tower of Triumph',
	'Metzali, Tower of Triumph': 'Path of Mettle // Metzali, Tower of Triumph',
	'Pious Evangel': 'Pious Evangel // Wayward Disciple',
	'Wayward Disciple': 'Pious Evangel // Wayward Disciple',
	'Primal Amulet': 'Primal Amulet // Primal Wellspring',
	'Primal Wellspring': 'Primal Amulet // Primal Wellspring',
	'Profane Procession': 'Profane Procession // Tomb of the Dusk Rose',
	'Tomb of the Dusk Rose': 'Profane Procession // Tomb of the Dusk Rose',
	'Ravenous Demon': 'Ravenous Demon // Archdemon of Greed',
	'Archdemon of Greed': 'Ravenous Demon // Archdemon of Greed',
	'Reckless Waif': 'Reckless Waif // Merciless Predator',
	'Merciless Predator': 'Reckless Waif // Merciless Predator',
	'Sage of Ancient Lore': 'Sage of Ancient Lore // Werewolf of Ancient Hunger',
	'Werewolf of Ancient Hunger': 'Sage of Ancient Lore // Werewolf of Ancient Hunger',
	'Scorned Villager': 'Scorned Villager // Moonscarred Werewolf',
	'Moonscarred Werewolf': 'Scorned Villager // Moonscarred Werewolf',
	'Screeching Bat': 'Screeching Bat // Stalking Vampire',
	'Stalking Vampire': 'Screeching Bat // Stalking Vampire',
	'Search for Azcanta': 'Search for Azcanta // Azcanta, the Sunken Ruin',
	'Azcanta, the Sunken Ruin': 'Search for Azcanta // Azcanta, the Sunken Ruin',
	'Shrill Howler': 'Shrill Howler // Howling Chorus',
	'Howling Chorus': 'Shrill Howler // Howling Chorus',
	'Skin Invasion': 'Skin Invasion // Skin Shedder',
	'Skin Shedder': 'Skin Invasion // Skin Shedder',
	'Smoldering Werewolf': 'Smoldering Werewolf // Erupting Dreadwolf',
	'Erupting Dreadwolf': 'Smoldering Werewolf // Erupting Dreadwolf',
	'Solitary Hunter': 'Solitary Hunter // One of the Pack',
	'One of the Pack': 'Solitary Hunter // One of the Pack',
	'Soul Seizer': 'Soul Seizer // Ghastly Haunting',
	'Ghastly Haunting': 'Soul Seizer // Ghastly Haunting',
	'Startled Awake': 'Startled Awake // Persistent Nightmare',
	'Persistent Nightmare': 'Startled Awake // Persistent Nightmare',
	'Storm the Vault': 'Storm the Vault // Vault of Catlacan',
	'Vault of Catlacan': 'Storm the Vault // Vault of Catlacan',
	'Tangleclaw Werewolf': 'Tangleclaw Werewolf // Fibrous Entangler',
	'Fibrous Entangler': 'Tangleclaw Werewolf // Fibrous Entangler',
	'Thaumatic Compass': 'Thaumatic Compass // Spires of Orazca',
	'Spires of Orazca': 'Thaumatic Compass // Spires of Orazca',
	'Thing in the Ice': 'Thing in the Ice // Awoken Horror',
	'Awoken Horror': 'Thing in the Ice // Awoken Horror',
	'Thraben Gargoyle': 'Thraben Gargoyle // Stonewing Antagonizer',
	'Stonewing Antagonizer': 'Thraben Gargoyle // Stonewing Antagonizer',
	'Thraben Sentry': 'Thraben Sentry // Thraben Militia',
	'Thraben Militia': 'Thraben Sentry // Thraben Militia',
	'Tormented Pariah': 'Tormented Pariah // Rampaging Werewolf',
	'Rampaging Werewolf': 'Tormented Pariah // Rampaging Werewolf',
	'Town Gossipmonger': 'Town Gossipmonger // Incited Rabble',
	'Incited Rabble': 'Town Gossipmonger // Incited Rabble',
	'Treasure Map': 'Treasure Map // Treasure Cove',
	'Treasure Cove': 'Treasure Map // Treasure Cove',
	'Ulrich of the Krallenhorde': 'Ulrich of the Krallenhorde // Ulrich, Uncontested Alpha',
	'Ulrich, Uncontested Alpha': 'Ulrich of the Krallenhorde // Ulrich, Uncontested Alpha',
	'Ulvenwald Captive': 'Ulvenwald Captive // Ulvenwald Abomination',
	'Ulvenwald Abomination': 'Ulvenwald Captive // Ulvenwald Abomination',
	'Ulvenwald Mystics': 'Ulvenwald Mystics // Ulvenwald Primordials',
	'Ulvenwald Primordials': 'Ulvenwald Mystics // Ulvenwald Primordials',
	'Uninvited Geist': 'Uninvited Geist // Unimpeded Trespasser',
	'Unimpeded Trespasser': 'Uninvited Geist // Unimpeded Trespasser',
	'Vance\'s Blasting Cannons': 'Vance\'s Blasting Cannons // Spitfire Bastion',
	'Spitfire Bastion': 'Vance\'s Blasting Cannons // Spitfire Bastion',
	'Vildin-Pack Outcast': 'Vildin-Pack Outcast // Dronepack Kindred',
	'Dronepack Kindred': 'Vildin-Pack Outcast // Dronepack Kindred',
	'Village Ironsmith': 'Village Ironsmith // Ironfang',
	Ironfang: 'Village Ironsmith // Ironfang',
	'Village Messenger': 'Village Messenger // Moonrise Intruder',
	'Moonrise Intruder': 'Village Messenger // Moonrise Intruder',
	'Villagers of Estwald': 'Villagers of Estwald // Howlpack of Estwald',
	'Howlpack of Estwald': 'Villagers of Estwald // Howlpack of Estwald',
	'Voldaren Pariah': 'Voldaren Pariah // Abolisher of Bloodlines',
	'Abolisher of Bloodlines': 'Voldaren Pariah // Abolisher of Bloodlines',
	'Westvale Abbey': 'Westvale Abbey // Ormendahl, Profane Prince',
	'Ormendahl, Profane Prince': 'Westvale Abbey // Ormendahl, Profane Prince',
	'Wolfbitten Captive': 'Wolfbitten Captive // Krallenhorde Killer',
	'Krallenhorde Killer': 'Wolfbitten Captive // Krallenhorde Killer'
};


@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
	@Input() decklist = "1 Akoum Refuge\n1 Battlefield Forge\n1 Bloodfell Caves\n1 Boros Guildgate\n1 Castle Locthwain\n1 Caves of Koilos\n1 Cinder Barrens\n1 Command Tower\n1 Evolving Wilds\n1 Exotic Orchard\n3 Mountain\n1 Myriad Landscape\n1 Naya Panorama\n1 Nomad Outpost\n1 Orzhov Guildgate\n5 Plains\n1 Rakdos Guildgate\n1 Rogue's Passage\n1 Scoured Barrens\n1 Slayers' Stronghold";
	deck: CardReference[];

	isCardsByTypeReady = false;

	cardsByType: [string, CardReference[], number][];

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
				console.log(card);
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

	oracleCache: { [oracle_id: string]: OracleCard };

	constructor(
		private oracle: OracleApiService,
	) { }

	ngOnInit() {
	}

	processOracleCards(cards: OracleCard[]) {
		cards.forEach(card => {
			let entry = this.deck.find(m => m.name === card.name);
			if (entry) {
				entry.OracleCard = card;
			}
		});
	}

	resetFlags() {
		this.isCardsByTypeReady = false;
	}

	submitDecklist() {
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
			card.name = TRANSFORM_CARDS[name] ? TRANSFORM_CARDS[name] : name;

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
	}
}
