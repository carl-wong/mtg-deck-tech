import { TestBed } from '@angular/core/testing';

import { RestDbApiKeyInterceptor } from './rest-db-api-key.interceptor';

describe('RestDbApiKeyInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      RestDbApiKeyInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: RestDbApiKeyInterceptor = TestBed.inject(RestDbApiKeyInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
