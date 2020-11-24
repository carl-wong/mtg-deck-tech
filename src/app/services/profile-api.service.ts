import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Profile } from '@classes/profile';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseRestdbApiService } from './base-restdb-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService extends BaseRestdbApiService {
  constructor(
    protected http: HttpClient,
  ) {
    super('profiles', http);
  }

  public getByAuth0(user_id: string): Observable<Profile> {
    const query = {
      user: {
        $elemMatch: {
          user_id,
        },
      },
    };

    return this._get(null, `q=${JSON.stringify(query)}`).pipe(map((result) => result ?.[0]));
  }
}
