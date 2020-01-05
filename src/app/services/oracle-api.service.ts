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
	private _api = environment.oracleApi;

	constructor(
		private http: HttpClient,
	) {
	}

	public getTransform(): Observable<MinOracleCard[]> {
		let params: HttpParams = new HttpParams()
			.set('layout', 'transform');

		return this.http.get(this._api + '/OracleCards', {
			params: params
		})
			.pipe(
				map(res => {
					res['payload'] = res;
					return res['payload'];
				})
			);
	}

	// API: GET /Oracles
	public getByNames(names: string[]): Observable<MinOracleCard[]> {
		let params: HttpParams = new HttpParams();

		names.forEach(card_name => {
			params = params.append('name', card_name);
		});

		return this.http.get(this._api + '/OracleCards', {
			params: params
		})
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
