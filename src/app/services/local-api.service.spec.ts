import { TestBed } from '@angular/core/testing';

import { LocalApiService } from './local-api.service';

describe('LocalApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalApiService = TestBed.get(LocalApiService);
    expect(service).toBeTruthy();
  });
});
