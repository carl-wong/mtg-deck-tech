import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResult, PostResult } from '@classes/api-result';
import { Tag } from '@classes/tag';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';


@Injectable({
	providedIn: 'root'
})
export class TagApiService extends BaseApiService {
	constructor(
		protected http: HttpClient,
	) {
		super();
	}

	public getTags(): Observable<Tag[]> {
		return this.http.get(this._api + '/Profiles/' + this.getSessionProfileId() + '/Tags')
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public createTag(model: Tag): Observable<PostResult> {
		model.ProfileId = parseInt(this.getSessionProfileId());
		return this.http.post<PostResult>(this._api + '/Tags', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<PostResult>('create Tag'))
			);
	}

	public updateTag(model: Tag): Observable<ApiResult> {
		return this.http.put<ApiResult>(this._api + '/Tags/' + model.id, model, this.httpOptions)
			.pipe(
				catchError(this.handleError<ApiResult>('update Tag'))
			);
	}

	public mergeTags(from: Tag, into: Tag): Observable<ApiResult> {
		return this.http.get<ApiResult>(this._api + '/Tags/Merge/' + from.id + '/' + into.id)
			.pipe(
				catchError(this.handleError<ApiResult>('merge Tag from ' + from.id + ' into ' + into.id))
			);
	}

	public deleteTag(id: number): Observable<ApiResult> {
		return this.http.delete<ApiResult>(this._api + '/Tags/' + id)
			.pipe(
				catchError(this.handleError<ApiResult>('delete Tag'))
			);
	}
}
