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
  memoryImage?: string;
  memoryType?: 'polaroid' | 'stamp';
  accentDoodle?: 'heart' | 'botanical' | 'burst';
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

  readonly defaultCover = 'assets/images/default-cover.jpg';

  get categoryLabel(): string {
    const category = this.config.category;
    const title = typeof category === 'string' ? category : category?.title || category?.name;
    if (!title || /^[a-f\d]{24}$/i.test(title)) return 'VIBE';
    return (this.categoryPresentation.getDisplayTitle({ title }) || title).toUpperCase();
  }

  get categoryIcon(): string {
    const category = this.config.category;
    const title = (typeof category === 'string' ? category : category?.title || category?.name || '').toLowerCase();
    if (title.includes('food') || title.includes('dine') || title.includes('walk') || title.includes('cafe')) return 'restaurant';
    if (title.includes('travel') || title.includes('escape') || title.includes('trip') || title.includes('trek')) return 'landscape';
    if (title.includes('play') || title.includes('sport') || title.includes('football') || title.includes('game')) return 'sports_soccer';
    if (title.includes('social') || title.includes('party') || title.includes('meetup') || title.includes('hangout')) return 'group';
    return this.categoryPresentation.getDisplayIcon(category) || 'celebration';
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

  get formattedDate(): string {
    if (!this.config.eventDate) return 'Sep 23, 2026';
    const date = new Date(this.config.eventDate);
    if (Number.isNaN(date.getTime())) return 'Sep 23, 2026';
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  get compactDate(): string {
    if (!this.config.eventDate) return 'Sep 23';
    const date = new Date(this.config.eventDate);
    if (Number.isNaN(date.getTime())) return 'Sep 23';
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    const day = String(date.getDate()).padStart(2, '0');
    return `${month} ${day}`;
  }

  get shortDate(): string {
    return this.formattedDate;
  }

  get fullDate(): string {
    return this.formattedDate;
  }

  get memoryType(): 'stamp' | 'polaroid' {
    if (this.config.memoryType) return this.config.memoryType;
    const cat = (typeof this.config.category === 'string' 
      ? this.config.category 
      : this.config.category?.title || this.config.category?.name || '').toLowerCase();
    const title = (this.config.title || '').toLowerCase();
    if (cat.includes('play') || cat.includes('sport') || title.includes('football') || title.includes('game')) {
      return 'stamp';
    }
    return 'polaroid';
  }

  get memoryPhoto(): string {
    if (this.config.memoryImage) return this.config.memoryImage;
    const cat = (typeof this.config.category === 'string' 
      ? this.config.category 
      : this.config.category?.title || this.config.category?.name || '').toLowerCase();
    const title = (this.config.title || '').toLowerCase();

    if (cat.includes('food') || title.includes('food') || title.includes('dine') || title.includes('walk')) {
      return 'assets/images/travel-hero/travel-cafe.jpg';
    }
    if (cat.includes('travel') || cat.includes('escape') || title.includes('trip') || title.includes('munnar')) {
      return 'assets/images/travel-hero/travel-hike.jpg';
    }
    if (cat.includes('social') || title.includes('adventure') || title.includes('pondicherry') || title.includes('party')) {
      return 'assets/images/explore-hero/image-3.webp';
    }
    if (cat.includes('play') || cat.includes('sport') || title.includes('football')) {
      return 'assets/images/play-hero/play-badminton.webp';
    }
    return this.config.image || 'assets/images/explore-hero/image-3.webp';
  }

  get doodleType(): 'heart' | 'botanical' | 'none' {
    if (this.config.accentDoodle) {
      if (this.config.accentDoodle === 'heart') return 'heart';
      if (this.config.accentDoodle === 'botanical') return 'botanical';
    }
    const cat = (typeof this.config.category === 'string' 
      ? this.config.category 
      : this.config.category?.title || this.config.category?.name || '').toLowerCase();
    const title = (this.config.title || '').toLowerCase();
    if (cat.includes('travel') || title.includes('munnar') || title.includes('trip') ||
        cat.includes('play') || cat.includes('sport') || title.includes('football')) {
      return 'botanical';
    }
    return 'heart';
  }

  get hasDateBurst(): boolean {
    const title = (this.config.title || '').toLowerCase();
    return !title.includes('pondicherry');
  }

  get hasTape(): boolean {
    const cat = (typeof this.config.category === 'string' 
      ? this.config.category 
      : this.config.category?.title || this.config.category?.name || '').toLowerCase();
    const title = (this.config.title || '').toLowerCase();
    return cat.includes('food') || title.includes('food') || title.includes('walk') || cat.includes('travel') || title.includes('munnar');
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
