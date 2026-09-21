import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { EventCategoryPresentationService } from '../../services/events/event-category-presentation.service';

export interface PastEventCardConfig {
  title?: string;
  category?: { title?: string; name?: string } | string;
  attendeeImages?: string[];
  location?: string;
  city?: string;
  state?: string;
  image?: string;
  eventDate?: string | Date;
  hostName?: string;
  hostVerified?: boolean;
  attendedCount?: number;
  rating?: number;
  reviewCount?: number;
  photoCount?: number;
  statusLabel?: string;
  ctaLabel?: string;
}

@Component({
  selector: 'vl-past-event-card',
  standalone: true,
  imports: [ImageUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './past-event-card.component.html',
  styleUrl: './past-event-card.component.scss',
})
export class PastEventCardComponent {
  private categoryPresentation = inject(EventCategoryPresentationService);
  @Input() config: PastEventCardConfig = {};
  @Output() viewMemories = new EventEmitter<PastEventCardConfig>();

  get categoryLabel(): string {
    const category = this.config.category;
    const title = typeof category === 'string' ? category : category?.title || category?.name;
    if (!title || /^[a-f\d]{24}$/i.test(title)) return 'Vibe';
    return this.categoryPresentation.getDisplayTitle({ title });
  }

  get attendeeImages(): string[] {
    return (this.config.attendeeImages || []).filter(Boolean).slice(0, 3);
  }

  onImageError(event: Event, fallback: string): void {
    const image = event.target as HTMLImageElement;
    if (image.getAttribute('src') !== fallback) image.src = fallback;
  }

  get locationLabel(): string {
    const loc = this.config.location;
    if (typeof loc === 'string' && loc && !loc.includes('[object')) {
      return loc;
    }
    const address = (typeof loc === 'object' && loc !== null ? loc : null) || (this.config as any)?.address;
    if (address) {
      const area = address.area || address.city || address.name;
      const state = address.state || address.pinCode;
      const formatted = [area, state].filter(Boolean).join(', ');
      if (formatted) return formatted;
    }
    return [this.config.city, this.config.state].filter(Boolean).join(', ') || 'Location';
  }

  get shortDate(): string {
    if (!this.config.eventDate) return 'Date TBA';
    const date = new Date(this.config.eventDate);
    if (Number.isNaN(date.getTime())) return 'Date TBA';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  }

  get fullDate(): string {
    if (!this.config.eventDate) return 'Date TBA';
    const date = new Date(this.config.eventDate);
    if (Number.isNaN(date.getTime())) return 'Date TBA';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  get statusLabel(): string {
    return this.config.statusLabel || 'Completed';
  }

  get ctaLabel(): string {
    return this.config.ctaLabel || 'View Memories';
  }

  get hasReviews(): boolean {
    return Number(this.config.reviewCount || 0) > 0;
  }

  onViewMemories(): void {
    this.viewMemories.emit(this.config);
  }
}
