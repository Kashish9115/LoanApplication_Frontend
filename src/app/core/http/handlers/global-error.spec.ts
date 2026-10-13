import { TestBed } from '@angular/core/testing';

import { GlobalError } from './global-error';

describe('GlobalError', () => {
  let service: GlobalError;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalError);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
