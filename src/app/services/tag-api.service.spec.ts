import { TestBed } from '@angular/core/testing';

import { TagApiService } from './tag-api.service';

describe('TagApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TagApiService = TestBed.get(TagApiService);
    expect(service).toBeTruthy();
  });
});
