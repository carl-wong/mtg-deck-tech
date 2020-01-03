import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CardTagLink } from '../classes/card-tag-link';
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

	public getTag(id: number): Observable<Tag> {
		return this.http.get<Tag>(this._api + '/Tags/' + id);
	}

	public getTags(): Observable<Tag[]> {
		return this.http.get(this._api + '/Tags')
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	public getCardTagLinks(oracle_ids: string[]): Observable<CardTagLink[]> {
		let params = new HttpParams().set('_expand', 'Tag');

		oracle_ids.forEach(id => {
			params = params.append('oracle_id', id);
		});

		return this.http.get(this._api + '/CardTagLinks', {
			params: params
		})
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}


	public createTag(model: Tag): Observable<Tag> {
		return this.http.post<Tag>(this._api + '/Tags', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<Tag>('create Tag'))
			);
	}

	public createCardTagLink(model: CardTagLink): Observable<CardTagLink> {
		return this.http.post<CardTagLink>(this._api + '/CardTagLinks', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<CardTagLink>('create CardTagLink'))
			);
	}

	public updateTag(model: Tag): Observable<Tag> {
		return this.http.put<Tag>(this._api + '/Tags/' + model.id, model, this.httpOptions)
			.pipe(
				catchError(this.handleError<Tag>('update Tag'))
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
