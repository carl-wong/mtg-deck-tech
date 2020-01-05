import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CardTagLink } from '../classes/card-tag-link';
import { Profile } from '../classes/profile';
import { Tag } from '../classes/tag';


@Injectable({
	providedIn: 'root'
})
export class LocalApiService {
	private _api = environment.localApi;

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
				catchError(this.handleError('get id=' + id))
			);
	}

	public createProfile(model: Profile) {
		return this.http.post<Profile>(this._api + '/Profiles', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<Profile>('create'))
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

	public createTag(model: Tag) {
		model.ProfileId = parseInt(this._getProfileId());
		return this.http.post<Tag>(this._api + '/Tags', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<Tag>('create Tag'))
			);
	}

	public getCardTagLink(oracle_id: string, tagId: number): Observable<CardTagLink[]> {
		let queries: string[] = [];

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

	public getCardTagLinks(oracle_ids: string[]): Observable<CardTagLink[]> {
		let queries: string[] = [];

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

	public createCardTagLink(model: CardTagLink): Observable<CardTagLink> {
		model.ProfileId = parseInt(this._getProfileId());
		return this.http.post<CardTagLink>(this._api + '/CardTagLinks', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<CardTagLink>('create CardTagLink'))
			);
	}

	public deleteCardTagLink(id: number) {
		return this.http.delete(this._api + '/CardTagLinks/' + id)
			.pipe(
				map(res => null),
				catchError(this.handleError<CardTagLink>('delete CardTagLink'))
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
