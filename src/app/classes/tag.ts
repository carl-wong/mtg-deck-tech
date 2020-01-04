export class Tag {
	id: number;
	name: string;
	ProfileId: number;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
