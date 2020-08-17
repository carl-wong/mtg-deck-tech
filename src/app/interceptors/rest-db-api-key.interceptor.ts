import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';

@Injectable()
export class RestDbApiKeyInterceptor implements HttpInterceptor {

  constructor() { }

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.startsWith(environment.restdb.url) ||
      request.url.startsWith(environment.restdb.mediaUrl)) {
      // only intercept requests to restdb endpoints
      return next.handle(request.clone({
        setHeaders: { 'x-apikey': environment.restdb.cors_key },
      }));
    } else {
      // leave original request untouched
      return next.handle(request);
    }
  }
}