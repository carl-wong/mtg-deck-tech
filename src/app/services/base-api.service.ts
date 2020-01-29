import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable, of } from 'rxjs';


@Injectable({
	providedIn: 'root'
})
export abstract class BaseApiService {
	protected _api = environment.apiUrl;

	httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json',
		})
	};

	constructor() { }

	protected getSessionProfileId(): string {
		return sessionStorage.getItem('ProfileId');
	}

	/**
	   * Handle Http operation that failed.
	   * Let the app continue.
	   * @param operation - name of the operation that failed
	   * @param result - optional value to return as the observable result
	   */
	protected handleError<T>(operation = 'operation', result?: T) {
		return (error: any): Observable<T> => {

			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// Let the app keep running by returning an empty result.
			return of(result as T);
		};
	}
}
