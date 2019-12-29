import { TestBed } from '@angular/core/testing';

import { OracleApiService } from './oracle-api.service';

describe('OracleApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OracleApiService = TestBed.get(OracleApiService);
    expect(service).toBeTruthy();
  });
});
