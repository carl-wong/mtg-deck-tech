export class MinOracleCard {
	cmc: number;
	color_identity: string;
	colors: string;
	image_uris: string;
	layout: string;
	name: string;
	oracle_id: string;
	oracle_text: string;
	type_line: string;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}