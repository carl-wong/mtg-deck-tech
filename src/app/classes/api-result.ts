export class ApiResult {
	isSuccess: boolean;

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}

export class PostResult extends ApiResult {
	id: number;// insertId on POST requests

	constructor(values: Object = {}) {
		super(values);
		Object.assign(this, values);
	}
}