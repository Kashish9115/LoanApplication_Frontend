import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PenaltyService } from '../../services/penalty.service';
import { PenaltyManagement } from './penalty-management';

describe('PenaltyManagement', () => {
  let component: PenaltyManagement;
  let fixture: ComponentFixture<PenaltyManagement>;
  let penaltyService: {
    getByLoanAccount: ReturnType<typeof vi.fn>;
    requestWaiver: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    penaltyService = {
      getByLoanAccount: vi.fn().mockReturnValue(of({
        content: [],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
      })),
      requestWaiver: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PenaltyManagement],
      providers: [{ provide: PenaltyService, useValue: penaltyService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PenaltyManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads penalties for the entered loan account ID from the first page', () => {
    component.loanAccountId = 27;
    component.currentPage = 3;

    component.loadAccount();

    expect(penaltyService.getByLoanAccount).toHaveBeenLastCalledWith(27, 0, 10);
  });

  it('does not request penalties for an invalid loan account ID', () => {
    component.loanAccountId = 0;
    penaltyService.getByLoanAccount.mockClear();

    component.loadAccount();

    expect(penaltyService.getByLoanAccount).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('valid loan account ID');
  });
});
