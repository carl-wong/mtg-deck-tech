import { Tag } from './tag';

export class CardTagLink {
	id: number;
	oracle_id: string;
	ProfileId: number;
	TagId: number;

	TagName: string; // Tag.name from Tag attached to this link

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
