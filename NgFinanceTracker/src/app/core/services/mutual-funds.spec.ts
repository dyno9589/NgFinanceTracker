import { TestBed } from '@angular/core/testing';

import { MutualFunds } from './mutual-funds';

describe('MutualFunds', () => {
  let service: MutualFunds;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MutualFunds);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
