
import {
  Component,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { finalize, timeout } from 'rxjs';

import { ScorecardService } from '../../services/scorecard';
import { ScorecardResponse } from '../../models/scorecard.model';

@Component({
  selector: 'app-scorecard-generation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './scorecard-generation.html',
  styleUrl: './scorecard-generation.scss'
})
export class ScorecardGeneration {

  private scorecardService = inject(ScorecardService);
  private cdr = inject(ChangeDetectorRef);

  customerId: number | null = null;

  scorecard: ScorecardResponse | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';

  generateScorecard(): void {
    this.callScorecardApi(true);
  }

  viewScorecard(): void {
    this.callScorecardApi(false);
  }

  private callScorecardApi(generate: boolean): void {

    if (this.loading) return;

    if (this.customerId == null || this.customerId <= 0) {
      this.errorMessage = 'Enter a valid Customer ID';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.scorecard = null;

    const request$ = generate
      ? this.scorecardService.generateScorecard(this.customerId)
      : this.scorecardService.getLatestScorecard(this.customerId);

    request$
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {

          if (response.success && response.data) {

            this.scorecard = response.data;

            this.successMessage =
              response.message || 'Scorecard loaded successfully';

          } else {

            this.errorMessage =
              response.message || 'Unable to load scorecard';
          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error('Scorecard error:', error);

          if (error.name === 'TimeoutError') {
            this.errorMessage = 'Request timed out';
          } else if (error.status === 0) {
            this.errorMessage = 'Backend connection failed or CORS blocked';
          } else {
            this.errorMessage =
              error.error?.message || 'Scorecard operation failed';
          }

          this.cdr.detectChanges();
        }
      });
  }
}
