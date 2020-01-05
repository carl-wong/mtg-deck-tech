export class ImageUris {
	normal: string;

	private art_crop: string;
	private border_crop: string;
	private large: string;
	private png: string;
	private small: string;
}

export class CardFace {
	image_uris: ImageUris;

	private object: string;
	private name: string;
	private mana_cost: string;
	private type_line: string;
	private oracle_text: string;
	private colors: string[];
	private flavor_text: string;
	private artist: string;
	private artist_id: string;
	private illustration_id: string;
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
	card_faces: CardFace[];
	cmc: number;
	color_identity: string[];
	colors: string[];
	image_uris: ImageUris;
	layout: string;
	name: string;
	oracle_id: string;
	oracle_text: string;
	type_line: string;

	private arena_id: number;
	private artist: string;
	private artist_ids: string[];
	private booster: boolean;
	private border_color: string;
	private card_back_id: string;
	private collector_number: string;
	private digital: boolean;
	private edhrec_rank: number;
	private flavor_text: string;
	private foil: boolean;
	private frame: string;
	private frame_effects: string[];
	private full_art: boolean;
	private games: string[];
	private highres_image: boolean;
	private id: string;
	private illustration_id: string;
	private lang: string;
	private legalities: Legalities;
	private mana_cost: string;
	private mtgo_id: number;
	private multiverse_ids: number[];
	private nonfoil: boolean;
	private object: string;
	private oversized: boolean;
	private power: string;
	private prints_search_uri: string;
	private promo: boolean;
	private rarity: string;
	private related_uris: RelatedUris;
	private released_at: string;
	private reprint: boolean;
	private reserved: boolean;
	private rulings_uri: string;
	private scryfall_set_uri: string;
	private scryfall_uri: string;
	private set: string;
	private set_name: string;
	private set_search_uri: string;
	private set_type: string;
	private set_uri: string;
	private story_spotlight: boolean;
	private tcgplayer_id: number;
	private textless: boolean;
	private toughness: string;
	private uri: string;
	private variation: boolean;
}
