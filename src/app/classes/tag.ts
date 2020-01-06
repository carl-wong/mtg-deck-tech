export class Tag {
	id: number;
	name: string;
	ProfileId: number;

	$CardTagLinksCount: number;// count(*) for CardTagLinks attached to this tag, computed by API

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
