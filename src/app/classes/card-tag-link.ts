import { Tag } from './tag';

export class CardTagLink {
	id: number;
	oracle_id: string;
	tagId: number;

	Tag: Tag;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
