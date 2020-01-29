import { TestBed } from '@angular/core/testing';

import { ProfileApiService } from './profile-api.service';

describe('ProfileApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfileApiService = TestBed.get(ProfileApiService);
    expect(service).toBeTruthy();
  });
});
