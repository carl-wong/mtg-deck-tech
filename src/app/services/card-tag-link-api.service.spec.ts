import { TestBed } from '@angular/core/testing';

import { CardTagLinkApiService } from './card-tag-link-api.service';

describe('CardTagLinkApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CardTagLinkApiService = TestBed.get(CardTagLinkApiService);
    expect(service).toBeTruthy();
  });
});
