import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { EventsService } from '../../services/events/events.service';
import { SharedService } from '../../services/shared.service';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'vl-event-comments',
  imports: [CommonModule, ReactiveFormsModule, ImageUrlPipe],
  templateUrl: './event-comments.component.html',
  styleUrl: './event-comments.component.scss'
})
export class EventCommentsComponent implements OnChanges {
  @Input() eventId = '';
  @Input() eventAverageRating = 0;
  @Input() canLeaveReview = false;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly eventsService = inject(EventsService);
  private readonly sharedService = inject(SharedService);

  eventReviews: any[] = [];
  isSubmitting = false;
  reviewsLoaded = false;
  showAllReviews = false;
  editingReview: any = null;
  openReviewMenuId = '';
  deletingReviewId = '';
  hoverRating = 0;
  readonly stars = [1, 2, 3, 4, 5];

  reviewForm = this.fb.group({
    rating: [null, Validators.required],
    comment: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventId'] && this.eventId) {
      this.cancelReviewEdit();
      this.getEventReviews();
    }
  }

  get reviewList(): any[] {
    return Array.isArray(this.eventReviews) ? this.eventReviews : [];
  }

  get visibleReviews(): any[] {
    return this.showAllReviews ? this.reviewList : this.reviewList.slice(0, 3);
  }

  get reviewCount(): number {
    return this.reviewList.length;
  }

  get displayAverageRating(): number {
    const ratings = this.reviewList
      .map((review: any) => Number(review?.score))
      .filter((score: number) => Number.isFinite(score));

    if (!ratings.length) {
      const eventRating = Number(this.eventAverageRating);
      return Number.isFinite(eventRating) && eventRating > 0 ? eventRating : 0;
    }

    const total = ratings.reduce((sum: number, score: number) => sum + score, 0);
    return total / ratings.length;
  }

  get reviewCommentLength(): number {
    return String(this.reviewForm.get('comment')?.value || '').length;
  }

  get selectedRating(): number {
    return Number(this.reviewForm.get('rating')?.value || 0);
  }

  get shouldShowReviewToggle(): boolean {
    return this.reviewCount > 3;
  }

  get currentUserReview(): any {
    const userId = this.authService.userDetails?.id;
    if (!userId) return null;

    return this.reviewList.find((review: any) => this.getReviewUserId(review) === userId) || null;
  }

  get isEditingReview(): boolean {
    return Boolean(this.editingReview);
  }

  get reviewFormTitle(): string {
    return this.isEditingReview ? 'Edit Review' : 'Leave a Review';
  }

  get reviewSubmitLabel(): string {
    if (this.isSubmitting) return this.isEditingReview ? 'Updating...' : 'Posting...';
    return this.isEditingReview ? 'Update Review' : 'Post Review';
  }

  shouldShowReviewForm(): boolean {
    return this.canLeaveReview && this.reviewsLoaded && (!this.currentUserReview || this.isEditingReview);
  }

  toggleReviews(): void {
    this.showAllReviews = !this.showAllReviews;
  }

  getEventReviews(): void {
    if (!this.eventId) return;

    this.reviewsLoaded = false;
    this.eventsService.getEventReviews(this.eventId).subscribe({
      next: (reviews: any) => {
        this.eventReviews = Array.isArray(reviews?.data) ? reviews.data : [];
        this.reviewsLoaded = true;
      },
      error: (error: any) => {
        console.error('Error fetching reviews:', error);
        this.eventReviews = [];
        this.reviewsLoaded = true;
      }
    });
  }

  addReviewComment(): void {
    if (this.reviewForm.invalid || !this.eventId || !this.authService.userDetails?.id) return;

    this.isSubmitting = true;
    const review = {
      eventId: this.eventId,
      raterUserId: this.authService.userDetails.id,
      score: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment,
    };

    this.eventsService.addReview(review).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        this.resetReviewForm();
        this.editingReview = null;
        this.openReviewMenuId = '';
        this.eventReviews = [
          res.data,
          ...this.reviewList.filter((item: any) => this.getReviewUserId(item) !== this.authService.userDetails.id)
        ];
        this.getEventReviews();
      },
      error: (error: any) => {
        this.isSubmitting = false;
        console.error('Error adding review:', error);
      }
    });
  }

  editReview(review: any): void {
    if (!this.isOwnReview(review)) return;

    this.editingReview = review;
    this.openReviewMenuId = '';
    this.reviewForm.patchValue({
      rating: review?.score || null,
      comment: review?.comment || '',
    });
    this.reviewForm.markAsPristine();
    this.reviewForm.markAsUntouched();
    setTimeout(() => this.scrollTo('add-comment'), 80);
  }

  cancelReviewEdit(): void {
    this.editingReview = null;
    this.openReviewMenuId = '';
    this.resetReviewForm();
  }

  deleteReview(review: any): void {
    if (!this.isOwnReview(review) || !review?._id || this.deletingReviewId) return;

    this.deletingReviewId = review._id;
    this.openReviewMenuId = '';
    this.eventsService.deleteReview(review._id).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        if (this.editingReview?._id === review._id) {
          this.cancelReviewEdit();
        }
        this.eventReviews = this.reviewList.filter((item: any) => item?._id !== review._id);
        setTimeout(() => this.scrollTo('reviews-comments'), 80);
        this.getEventReviews();
      },
      error: (error: any) => {
        console.error('Error deleting review:', error);
      },
      complete: () => {
        this.deletingReviewId = '';
      }
    });
  }

  toggleReviewMenu(review: any): void {
    if (!this.isOwnReview(review)) return;

    const reviewId = review?._id || '';
    this.openReviewMenuId = this.openReviewMenuId === reviewId ? '' : reviewId;
  }

  isReviewMenuOpen(review: any): boolean {
    return Boolean(review?._id) && this.openReviewMenuId === review._id;
  }

  isOwnReview(review: any): boolean {
    const userId = this.authService.userDetails?.id;
    return Boolean(userId && this.getReviewUserId(review) === userId);
  }

  getReviewUserId(review: any): string {
    return review?.raterUserId?._id || review?.raterUserId || '';
  }

  getTimeAgo(date: string): string {
    return this.sharedService.calculateTimeAgo(date);
  }

  private resetReviewForm(): void {
    this.reviewForm.reset();
    this.reviewForm.markAsPristine();
    this.reviewForm.markAsUntouched();
  }

  private scrollTo(section: string): void {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
