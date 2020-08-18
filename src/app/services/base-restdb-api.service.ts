import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ITotals {
  total: number;
  count: number;
  skip: number;
  max: number;
}

export interface IPageHint {
  max: number;
  skip: number;
  orderby: string;
}

@Injectable({
  providedIn: 'root',
})
export abstract class BaseRestdbApiService {
  protected apiUrl = environment.restdb.url;
  protected httpOptions = {
    headers: new HttpHeaders({
      'cache-control': 'no-cache',
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    @Inject(String) protected collection: string,
    protected http: HttpClient,
  ) {
    this.url = `${this.apiUrl}/${this.collection}`;
  }

  /** API url from environment + collection */
  protected url: string;

  protected handleError<T>(result?: T): any {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** GET optional id, optional params in param1=value1&param2=value2... format */
  protected _get(id?: string, params?: string): Observable<any> {
    let url = this.url;
    if (!!id) { url += '/' + id; }
    if (!!params) { url += `?` + params; }
    return this.http.get<any>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError<any>()),
      );
  }

  /** POST a new object */
  protected _post(model?: any, models?: any[]): Observable<any> {
    return this.http.post<any>(this.url, model ?? models, this.httpOptions)
      .pipe(
        catchError(this.handleError<any>()),
      );
  }

  /** PUT update of whole object */
  protected _put(id: string, model: any): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, model, this.httpOptions)
      .pipe(
        catchError(this.handleError<any>()),
      );
  }

  /** PATCH update of properties of object */
  protected _patch(id: string, model: any): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}`, model, this.httpOptions)
      .pipe(
        catchError(this.handleError<any>()),
      );
  }

  /** DELETE object */
  protected _delete(id?: string, idArray?: string[]): Observable<any> {
    if (!!id) {
      return this.http.delete<any>(`${this.url}/${id}`, this.httpOptions)
        .pipe(
          catchError(this.handleError<any>()),
        );
    } else {
      return this.http.request<any>('delete', this.url, {
        headers: new HttpHeaders({
          'cache-control': 'no-cache',
          'Content-Type': 'application/json',
        }),
        body: idArray,
      })
        .pipe(
          catchError(this.handleError<any>()),
        );
    }
  }
}
