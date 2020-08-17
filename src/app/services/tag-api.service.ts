import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResult, PostResult } from '@classes/api-result';
import { Tag } from '@classes/tag';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';


@Injectable({
	providedIn: 'root'
})
export class TagApiService extends BaseApiService {
	constructor(
		protected http: HttpClient,
	) {
		super();
	}

	public getTags(): Observable<Tag[]> {
		return this.http.get<Tag[]>(this.apiUrl + '/Profiles/' + this.getSessionProfileId() + '/Tags');
	}

	public createTag(model: Tag): Observable<PostResult> {
		model.ProfileId = parseInt(this.getSessionProfileId());
		return this.http.post<PostResult>(this.apiUrl + '/Tags', model, this.httpOptions)
			.pipe(
				catchError(this.handleError<PostResult>('create Tag'))
			);
	}

	public updateTag(model: Tag): Observable<ApiResult> {
		return this.http.put<ApiResult>(this.apiUrl + '/Tags/' + model.id, model, this.httpOptions)
			.pipe(
				catchError(this.handleError<ApiResult>('update Tag'))
			);
	}

	public mergeTags(from: Tag, into: Tag): Observable<ApiResult> {
		return this.http.get<ApiResult>(this.apiUrl + '/Tags/Merge/' + from.id + '/' + into.id)
			.pipe(
				catchError(this.handleError<ApiResult>('merge Tag from ' + from.id + ' into ' + into.id))
			);
	}

	public deleteTag(id: number): Observable<ApiResult> {
		return this.http.delete<ApiResult>(this.apiUrl + '/Tags/' + id)
			.pipe(
				catchError(this.handleError<ApiResult>('delete Tag'))
			);
	}
}
