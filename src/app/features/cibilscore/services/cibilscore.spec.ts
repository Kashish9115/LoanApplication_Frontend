import { TestBed } from '@angular/core/testing';
import { Cibilscore } from './cibilscore';

describe('Cibilscore', () => {
  let service: Cibilscore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cibilscore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
