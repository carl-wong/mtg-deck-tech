import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PostResult } from '@classes/api-result';
import { Profile } from '@classes/profile';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';


@Injectable({
	providedIn: 'root'
})
export class ProfileApiService extends BaseApiService {
	constructor(
		protected http: HttpClient,
	) {
		super();
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
}
