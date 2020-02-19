import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResult, PostResult } from '@classes/api-result';
import { CardTagLink } from '@classes/card-tag-link';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';


@Injectable({
	providedIn: 'root'
})
export class CardTagLinkApiService extends BaseApiService {
	constructor(
		protected http: HttpClient,
	) {
		super();
	}

	public getCardTagLink(oracle_id: string, tagId: number): Observable<CardTagLink[]> {
		const queries: string[] = [];

		queries.push('oracle_id=' + oracle_id);
		queries.push('TagId=' + tagId.toString());

		const suffix = queries.length > 0 ? '?' + queries.join('&') : '';
		return this.http.get(this._api + '/Profiles/' + this.getSessionProfileId() + '/CardTagLinks' + suffix)
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public getCardTagLinksByTagId(tagId: number): Observable<CardTagLink[]> {
		const suffix = '?TagId=' + tagId;
		return this.http.get(this._api + '/Profiles/' + this.getSessionProfileId() + '/CardTagLinks' + suffix)
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public postCardTagLinks(oracle_ids: string[]): Observable<CardTagLink[]> {
		return this.http.post<CardTagLink[]>(this._api + '/Profiles/' + this.getSessionProfileId() + '/CardTagLinks', { oracle_ids: oracle_ids }, this.httpOptions)
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public createCardTagLink(model: CardTagLink): Observable<PostResult> {
		model.ProfileId = parseInt(this.getSessionProfileId());
		return this.http.post<PostResult>(this._api + '/CardTagLinks', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<PostResult>('create CardTagLink'))
			);
	}

	public deleteCardTagLink(id: number): Observable<ApiResult> {
		return this.http.delete<ApiResult>(this._api + '/CardTagLinks/' + id)
			.pipe(
				catchError(this.handleError<ApiResult>('delete CardTagLink'))
			);
	}
}
