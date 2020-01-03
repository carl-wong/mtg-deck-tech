export class Profile {
	id: number;
	auth0Id: string;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
