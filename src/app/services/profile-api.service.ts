import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Profile } from '@classes/profile';
import { Observable } from 'rxjs';
import { BaseRestdbApiService } from './base-restdb-api.service';

@Injectable({
    providedIn: 'root'
})
export class ProfileApiService extends BaseRestdbApiService {
    constructor(
        protected http: HttpClient,
    ) {
        super('profiles', http);
    }

    public getByAuth0(user_id: string): Observable<Profile[]> {
        return this._get(undefined, `q={"user":{"$elemMatch":{"user_id":"${user_id}"}}}`);
    }
}
