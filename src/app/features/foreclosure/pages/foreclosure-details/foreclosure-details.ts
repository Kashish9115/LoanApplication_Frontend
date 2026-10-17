
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface ForeclosureRequest {
  requestId: number;
  loanAccountId: number;
  loanAccountNo?: string;
  foreClosureType: string;
  foreClosureAmount: number;
  reason?: string;
  status: string;
  requestedDate?: string;
  expectedClosureDate?: string;
  customerName?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-foreclosure-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './foreclosure-details.html',
  styleUrl: './foreclosure-details.scss'
})
export class ForeclosureDetails implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  private readonly baseUrl = 'http://localhost:8080/api';

  request: ForeclosureRequest | null = null;
  loading = false;
  actionLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = Number(params.get('requestId'));

      if (id > 0) {
        this.loadRequest(id);
      } else {
        this.errorMessage = 'Request ID URL mein nahi mila.';
      }
    });
  }

  loadRequest(requestId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<ApiResponse<ForeclosureRequest[]>>(
      `${this.baseUrl}/officer/foreclosure/requests/pending`
    ).subscribe({
      next: response => {
        const requests = response.data ?? [];

        this.request =
          requests.find(r => r.requestId === requestId) ?? null;

        if (!this.request) {
          this.errorMessage =
            'Pending request nahi mili. Ho sakta hai request pehle hi process ho chuki ho.';
        }

        this.loading = false;
      },
      error: error => {
        console.error('Request fetch error:', error);
        this.errorMessage = 'Request details fetch nahi ho payi.';
        this.loading = false;
      }
    });
  }

  approveRequest(): void {
    this.updateStatus('approve');
  }

  rejectRequest(): void {
    this.updateStatus('reject');
  }

  private updateStatus(action: 'approve' | 'reject'): void {
    if (!this.request || this.request.status !== 'PENDING') {
      return;
    }

    const message = action === 'approve'
      ? 'Kya aap is request ko approve karna chahte hain?'
      : 'Kya aap is request ko reject karna chahte hain?';

    if (!confirm(message)) {
      return;
    }

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const requestId = this.request.requestId;

    this.http.patch<ApiResponse<ForeclosureRequest>>(
      `${this.baseUrl}/officer/foreclosure/requests/${requestId}/${action}`,
      {}
    ).subscribe({
      next: response => {
        if (response.data) {
          this.request = { ...this.request!, ...response.data };
        }

        // Backend response mein status na ho toh expected status set karo.
        // Successful API response ke baad hi local status update hota hai.
        if (this.request) {
          this.request.status =
            action === 'approve' ? 'APPROVED' : 'REJECTED';
        }

        this.successMessage = response.message ||
          `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`;

        this.actionLoading = false;
      },
      error: error => {
        console.error('Status update error:', error);
        this.errorMessage =
          error.error?.message || 'Status update nahi ho paya.';
        this.actionLoading = false;
      }
    });
  }
}
