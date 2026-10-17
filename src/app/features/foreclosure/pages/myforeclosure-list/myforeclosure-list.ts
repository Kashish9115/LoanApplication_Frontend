
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForeclosureService } from '../../services/foreclosure';

@Component({
  selector: 'app-myforeclosure-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './myforeclosure-list.html',
  styleUrl: './myforeclosure-list.scss'
})
export class MyforeclosureList implements OnInit {

  private service = inject(ForeclosureService);

  customerId = 1;

  requests: any[] = [];

  loading = false;
  errorMessage = '';
  searchText = '';

  pageSize = 5;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadRequests();
  }

  // Load customer foreclosure requests
  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service
      .getCustomerRequests(
        this.customerId,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (response: any) => {
          const result = response?.data;

          // If backend returns a plain array
          if (Array.isArray(result)) {
            this.requests = result;
            this.totalElements = result.length;
            this.totalPages = Math.ceil(
              this.totalElements / this.pageSize
            );
          }
          // If backend returns a paginated object
          else {
            this.requests = result?.content ?? [];
            this.totalElements =
              result?.totalElements ?? this.requests.length;

            this.totalPages =
              result?.totalPages ??
              Math.ceil(this.totalElements / this.pageSize);
          }

          this.loading = false;
        },

        error: (error) => {
          console.error('Error loading requests:', error);

          this.errorMessage =
            error?.error?.message ??
            'Failed to load closure requests.';

          this.requests = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.loading = false;
        }
      });
  }

  // Search requests
  get filteredRequests(): any[] {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      return this.requests;
    }

    return this.requests.filter(request =>
      String(request.requestId ?? '')
        .toLowerCase().includes(search) ||

      String(request.loanAccountNo ?? '')
        .toLowerCase().includes(search) ||

      String(request.customerName ?? '')
        .toLowerCase().includes(search) ||

      String(request.status ?? '')
        .toLowerCase().includes(search)
    );
  }

  // Total pages for currently loaded records
  get totalPage(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredRequests.length / this.pageSize)
    );
  }

  // Records displayed on the current page
  get paginatedRequests(): any[] {
    const start = this.currentPage * this.pageSize;

    return this.filteredRequests.slice(
      start,
      start + this.pageSize
    );
  }

  get startRecord(): number {
    return this.filteredRequests.length === 0
      ? 0
      : this.currentPage * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      (this.currentPage + 1) * this.pageSize,
      this.filteredRequests.length
    );
  }

  // Previous page
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadRequests();
    }
  }

  // Next page
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadRequests();
    }
  }

  // Search changed
  onSearchChange(): void {
    this.currentPage = 0;
  }

  // Page size changed
  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadRequests();
  }

  // Navigate to a zero-based page
  goToPage(page: number): void {
    if (
      page >= 0 &&
      page < this.totalPages &&
      page !== this.currentPage
    ) {
      this.currentPage = page;
      this.loadRequests();
    }
  }

  // Status CSS class
  statusClass(status: string | null | undefined): string {
    return (status ?? 'unknown')
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  // View request in console
  viewRequest(request: any): void {
    console.log('Selected foreclosure request:', request);
  }
}
