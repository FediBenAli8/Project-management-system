import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project';

type ReviewAction = 'approve' | 'reject';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews implements OnInit {
  reviews: any[] = [];
  isLoading = true;
  isSubmitting = false;
  error = '';
  selectedReview: any = null;
  modalAction: ReviewAction = 'approve';
  modalComment = '';

  constructor(
    public auth: AuthService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.error = '';

    this.projectService.getLeaderReviews().subscribe({
      next: (reviews: any) => {
        this.reviews = reviews || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load reviews', err);
        this.error = err.error?.detail || 'Could not load reviews.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAction(review: any, action: ReviewAction): void {
    this.selectedReview = review;
    this.modalAction = action;
    this.modalComment = '';
  }

  closeModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.selectedReview = null;
    this.modalComment = '';
  }

  submitAction(): void {
    if (!this.selectedReview) {
      return;
    }

    const comment = this.modalComment.trim();

    if (this.modalAction === 'reject' && !comment) {
      this.error = 'A rejection comment is required.';
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const request = this.modalAction === 'approve'
      ? this.projectService.approveSubmission(this.selectedReview.submission_id, comment || undefined)
      : this.projectService.rejectSubmission(this.selectedReview.submission_id, comment);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadReviews();
      },
      error: (err: any) => {
        console.error('Failed to update submission review', err);
        this.error = err.error?.detail || 'Could not update this review.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  download(review: any): void {
    this.projectService.downloadSubmission(review.submission_id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = review.filename || 'submission';
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download submission', err);
        this.error = 'Could not download the submitted file.';
        this.cdr.detectChanges();
      }
    });
  }

  badgeClass(status: string): string {
    const normalized = String(status || '').toUpperCase();

    if (normalized === 'APPROVED') {
      return 'approved';
    }

    if (normalized === 'REJECTED') {
      return 'rejected';
    }

    return 'pending';
  }
}
