
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Cibilscore as CibilscoreService } from '../../services/cibilscore';
import { CibilReport } from '../../models/cibil-report';

@Component({
  selector: 'app-cibilscore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cibilscore.html',
  styleUrl: './cibilscore.scss'
})
export class Cibilscore {

  private cibilService = inject(CibilscoreService);

  customerId = 1;

  report: CibilReport | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

checkScore(): void {
  if (this.loading) return;


  this.loading = true;
  this.errorMessage = '';
  this.successMessage = '';
  this.report = null;
  this.cibilService.generateCibilScore(this.customerId).subscribe({
  next: (response) => {
    this.report = response?.data ?? null;
    this.loading = false;
  },
  error: (error) => {
    console.error('CIBIL API error:', error);
    this.errorMessage =
      error.error?.message ?? 'Unable to generate CIBIL score.';
    this.loading = false;
  }
});

  this.cibilService.generateCibilScore(this.customerId).subscribe({
    next: (response) => {
      console.log('CIBIL response:', response);

      if (response?.data) {
        this.report = response.data;
        this.successMessage =
          response.message ?? 'CIBIL report generated successfully.';
      } else {
        this.errorMessage =
          response?.message ?? 'CIBIL report data not found.';
      }

      this.loading = false;
    },
    error: (error) => {
      console.error('CIBIL API error:', error);

      this.errorMessage =
        error.error?.message ??
        `Unable to generate CIBIL score. HTTP status: ${error.status || 'unknown'}`;

      this.loading = false;
    }
  });
}


  // Mask PAN number
  get maskedPan(): string {
    const pan = this.report?.panNo;

    if (!pan) {
      return 'Not Available';
    }

    if (pan.length <= 4) {
      return 'XXXX';
    }

    return pan.substring(0, 2) + 'XXXXX' + pan.slice(-2);
  }

  // Display score category
  get scoreLabel(): string {
    const score = this.report?.cibilScore;

    if (score == null) {
      return 'Not Available';
    }

    if (score >= 750) {
      return 'Excellent';
    }

    if (score >= 700) {
      return 'Good';
    }

    if (score >= 650) {
      return 'Fair';
    }

    return 'Needs Improvement';
  }

  // Calculate gauge needle angle
  get scoreAngle(): number {
    const score = this.report?.cibilScore;

    if (score == null) {
      return -90;
    }

    const normalizedScore = Math.max(300, Math.min(900, score));

    return -90 + ((normalizedScore - 300) / 600) * 180;
  }
}
