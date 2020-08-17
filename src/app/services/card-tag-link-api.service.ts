import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResult, PostResult } from '@classes/api-result';
import { CardTagLink } from '@classes/card-tag-link';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
		return this.http.get<CardTagLink[]>(this.apiUrl + '/Profiles/' + this.getSessionProfileId() + '/CardTagLinks' + suffix);
	}

	public getCardTagLinksByTagId(tagId: number): Observable<CardTagLink[]> {
		const suffix = '?TagId=' + tagId;
		return this.http.get<CardTagLink[]>(this.apiUrl + '/Profiles/' + this.getSessionProfileId() + '/CardTagLinks' + suffix);
	}

	public postCardTagLinks(oracle_ids: string[]): Observable<CardTagLink[]> {
		return this.http.post<CardTagLink[]>(this.apiUrl + '/Profiles/' + this.getSessionProfileId() + '/CardTagLinks', { oracle_ids: oracle_ids }, this.httpOptions);
	}

	public createCardTagLink(model: CardTagLink): Observable<PostResult> {
		model.ProfileId = parseInt(this.getSessionProfileId());
		return this.http.post<PostResult>(this.apiUrl + '/CardTagLinks', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<PostResult>('create CardTagLink'))
			);
	}

	public deleteCardTagLink(id: number): Observable<ApiResult> {
		return this.http.delete<ApiResult>(this.apiUrl + '/CardTagLinks/' + id)
			.pipe(
				catchError(this.handleError<ApiResult>('delete CardTagLink'))
			);
	}
}
