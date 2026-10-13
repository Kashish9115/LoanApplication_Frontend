import { TestBed } from '@angular/core/testing';

import { Emi } from './emi';

describe('Emi', () => {
  let service: Emi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Emi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
