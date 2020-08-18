import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tag } from '@classes/tag';
import { Observable } from 'rxjs';
import { BaseRestdbApiService } from './base-restdb-api.service';

@Injectable({
  providedIn: 'root',
})
export class TagApiService extends BaseRestdbApiService {
  constructor(
    protected http: HttpClient,
  ) {
    super('tags', http);
  }

  public getTags(profileId: string): Observable<Tag[]> {
    return this._get(undefined, `q={"profile":{"$elemMatch":{"_id":"${profileId}"}}}`);
  }

  public createTag(model: any): Observable<Tag> {
    return this._post(model);
  }

  public updateTag(model: any): Observable<Tag> {
    return this._put(model._id, model);
  }

  public deleteTag(id: string): Observable<any> {
    return this._delete(id);
  }
}
