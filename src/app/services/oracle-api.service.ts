import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MinOracleCard } from '@classes/min-oracle-card';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';


@Injectable({
	providedIn: 'root'
})
export class OracleApiService extends BaseApiService {
	constructor(
		private http: HttpClient,
	) {
		super();
	}

	// API: GET /OracleCards
	public getTransform(): Observable<MinOracleCard[]> {
		return this.http.get<MinOracleCard[]>(this.apiUrl + '/OracleCards/Transform');
	}

	// API: POST /OracleCards
	public postNames(names: string[]): Observable<MinOracleCard[]> {
		return this.http.post<MinOracleCard[]>(this.apiUrl + '/OracleCards', { cards: names }, this.httpOptions);
	}
}
