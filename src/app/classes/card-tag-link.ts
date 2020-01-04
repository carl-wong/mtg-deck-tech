import { Tag } from './tag';

export class CardTagLink {
	id: number;
	oracle_id: string;
	ProfileId: number;
	TagId: number;

	Tag: Tag;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
