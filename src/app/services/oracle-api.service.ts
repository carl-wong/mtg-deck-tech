import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MinOracleCard } from '../classes/min-oracle-card';


@Injectable({
	providedIn: 'root'
})
export class OracleApiService {
	private _api = environment.apiUrl;

	constructor(
		private http: HttpClient,
	) {
	}

	// API: GET /OracleCards
	public getTransform(): Observable<MinOracleCard[]> {
		return this.http.get(this._api + '/OracleCards?layout=transform')
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	// API: GET /OracleCards
	public getByNames(names: string[]): Observable<MinOracleCard[]> {
		const queries: string[] = [];

		names.forEach(name => {
			queries.push('name=' + encodeURIComponent(name));
		});

		const suffix = queries.length > 0 ? '?' + queries.join('&') : '';
		return this.http.get(this._api + '/OracleCards' + suffix)
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
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
