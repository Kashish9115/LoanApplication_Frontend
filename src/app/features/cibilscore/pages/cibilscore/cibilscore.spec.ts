import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cibilscore } from './cibilscore';

describe('Cibilscore', () => {
  let component: Cibilscore;
  let fixture: ComponentFixture<Cibilscore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cibilscore]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Cibilscore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
