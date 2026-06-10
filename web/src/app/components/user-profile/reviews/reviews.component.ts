import { Component, Input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'vl-reviews',
  imports: [DatePipe, DecimalPipe, ImageUrlPipe],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent {
  @Input() reviews: any[] = [];

  stars = [1, 2, 3, 4, 5];

  getReviewerName(review: any): string {
    return review?.raterUserId?.username || review?.reviewer || 'Guest';
  }

  getReviewerImage(review: any): string {
    return review?.raterUserId?.profileImage || review?.avatar || '';
  }

  getReviewDate(review: any): string {
    return review?.updatedAt || review?.createdAt || review?.date || '';
  }

  getReviewComment(review: any): string {
    return review?.comment || 'No comment added.';
  }
}
