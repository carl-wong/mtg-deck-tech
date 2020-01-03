export class ImageUris {
	private small: string;
	normal: string;
	private large: string;
	private png: string;
	private art_crop: string;
	private border_crop: string;
}

export class Legalities {
	private standard: string;
	private future: string;
	private historic: string;
	private pioneer: string;
	private modern: string;
	private legacy: string;
	private pauper: string;
	private vintage: string;
	private penny: string;
	private commander: string;
	private brawl: string;
	private duel: string;
	private oldschool: string;
}

export class RelatedUris {
	private gatherer: string;
	private tcgplayer_decks: string;
	private edhrec: string;
	private mtgtop8: string;
}

export class OracleCard {
	private object: string;
	private id: string;
	oracle_id: string;
	private multiverse_ids: number[];
	private mtgo_id: number;
	private tcgplayer_id: number;
	name: string;
	private lang: string;
	private released_at: string;
	private uri: string;
	private scryfall_uri: string;
	layout: string;
	private highres_image: boolean;
	private image_uris: ImageUris;
	private mana_cost: string;
	cmc: number;
	type_line: string;
	oracle_text: string;
	private power: string;
	private toughness: string;
	colors: string[];
	color_identity: string[];
	private legalities: Legalities;
	private games: string[];
	private reserved: boolean;
	private foil: boolean;
	private nonfoil: boolean;
	private oversized: boolean;
	private promo: boolean;
	private reprint: boolean;
	private variation: boolean;
	private set: string;
	private set_name: string;
	private set_type: string;
	private set_uri: string;
	private set_search_uri: string;
	private scryfall_set_uri: string;
	private rulings_uri: string;
	private prints_search_uri: string;
	private collector_number: string;
	private digital: boolean;
	private rarity: string;
	private flavor_text: string;
	private card_back_id: string;
	private artist: string;
	private artist_ids: string[];
	private illustration_id: string;
	private border_color: string;
	private frame: string;
	private full_art: boolean;
	private textless: boolean;
	private booster: boolean;
	private story_spotlight: boolean;
	private edhrec_rank: number;
	private related_uris: RelatedUris;
}
