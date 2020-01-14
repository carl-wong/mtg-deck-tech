import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CardTagLink } from '../classes/card-tag-link';
import { Profile } from '../classes/profile';
import { Tag } from '../classes/tag';
import { ApiResult, PostResult } from '../classes/api-result';

@Injectable({
	providedIn: 'root'
})
export class LocalApiService {
	private _api = environment.apiUrl;

	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json',
		})
	};

	constructor(
		private http: HttpClient,
	) {
	}

	private _getProfileId(): string {
		return sessionStorage.getItem('ProfileId');

	}

	public getProfilesByAuth0(id: string): Observable<Profile[]> {
		return this.http.get<Profile[]>(this._api + '/Profiles?auth0Id=' + id)
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				}),
				catchError(this.handleError('get auth0Id=' + id))
			);
	}

	public createProfile(model: Profile): Observable<PostResult> {
		return this.http.post<PostResult>(this._api + '/Profiles', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<PostResult>('create Profile'))
			);
	}

	public getTags(): Observable<Tag[]> {
		return this.http.get(this._api + '/Profiles/' + this._getProfileId() + '/Tags')
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public createTag(model: Tag): Observable<PostResult> {
		model.ProfileId = parseInt(this._getProfileId());
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

	public getCardTagLink(oracle_id: string, tagId: number): Observable<CardTagLink[]> {
		const queries: string[] = [];

		queries.push('oracle_id=' + oracle_id);
		queries.push('TagId=' + tagId.toString());

		const suffix = queries.length > 0 ? '?' + queries.join('&') : '';
		return this.http.get(this._api + '/Profiles/' + this._getProfileId() + '/CardTagLinks' + suffix)
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public getCardTagLinksByTagId(tagId: number): Observable<CardTagLink[]> {
		const suffix = '?TagId=' + tagId;
		return this.http.get(this._api + '/Profiles/' + this._getProfileId() + '/CardTagLinks' + suffix)
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public getCardTagLinks(oracle_ids: string[]): Observable<CardTagLink[]> {
		const queries: string[] = [];

		oracle_ids.forEach(id => {
			queries.push('oracle_id=' + id);
		});

		const suffix = queries.length > 0 ? '?' + queries.join('&') : '';
		return this.http.get(this._api + '/Profiles/' + this._getProfileId() + '/CardTagLinks' + suffix)
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public createCardTagLink(model: CardTagLink): Observable<PostResult> {
		model.ProfileId = parseInt(this._getProfileId());
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

	/**
	   * Handle Http operation that failed.
	   * Let the app continue.
	   * @param operation - name of the operation that failed
	   * @param result - optional value to return as the observable result
	   */
	private handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {

			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// Let the app keep running by returning an empty result.
			return of(result as T);
		};
	}
}
