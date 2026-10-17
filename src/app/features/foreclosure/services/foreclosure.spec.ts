import { TestBed } from '@angular/core/testing';

import { Foreclosure } from './foreclosure';

describe('Foreclosure', () => {
  let service: Foreclosure;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Foreclosure);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
