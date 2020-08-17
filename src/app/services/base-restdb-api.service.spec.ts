import { TestBed } from '@angular/core/testing';

import { BaseRestdbApiService } from './base-restdb-api.service';

describe('BaseRestdbApiService', () => {
  let service: BaseRestdbApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseRestdbApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
