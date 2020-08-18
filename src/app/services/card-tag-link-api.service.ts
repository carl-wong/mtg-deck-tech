import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CardTagLink } from '@classes/card-tag-link';
import { Observable } from 'rxjs';
import { BaseRestdbApiService } from './base-restdb-api.service';

@Injectable({
  providedIn: 'root',
})
export class CardTagLinkApiService extends BaseRestdbApiService {
  constructor(
    protected http: HttpClient,
  ) {
    super('links', http);
  }

  public getCardTagLink(oracleId: string, tagId: string): Observable<CardTagLink[]> {
    return this._get(undefined, `q={"$and":[{"oracle_id":"${oracleId}"},{"tag":{"$elemMatch":{"_id":"${tagId}"}}}]}`);
  }

  public getByTagId(tagId: string): Observable<CardTagLink[]> {
      return this._get(undefined, `q={"tag":{"$elemMatch":{"_id":"${tagId}"}}}`);
  }

  public getByProfileId(profileId: string, oracleId: string[]): Observable<CardTagLink[]> {
    const clauses: string[] = [];

    oracleId.forEach((id) => {
      clauses.push(`{"oracle_id":"${id}"}`);
    });

    return this._get(undefined, `q={"$or":[${clauses.join(',')}]}&filter={"profile":{"$elemMatch":{"_id":"${profileId}"}}}`);
  }

  public createCardTagLink(model: any): Observable<CardTagLink> {
    return this._post(model);
  }

  public createCardTagLinks(model: any[]): Observable<CardTagLink[]> {
    return this._post(undefined, model);
  }

  public deleteCardTagLink(id: string): Observable<any> {
    return this._delete(id);
  }

  public deleteCardTagLinks(idArray: string[]): Observable<any> {
    return this._delete(undefined, idArray);
  }
}
