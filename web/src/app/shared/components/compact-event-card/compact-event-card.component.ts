import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouteService } from '../../services/route/route.service';
import { AuthService } from '../../services/auth/auth.service';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { TimePipe } from '../../pipes/time.pipe';

@Component({
  selector: 'vl-compact-event-card',
  standalone: true,
  imports: [ImageUrlPipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compact-event-card.component.html',
  styleUrl: './compact-event-card.component.scss'
})
export class CompactEventCardComponent {
  config = input<any>({});
  showWishlist = input<boolean>(true);
  cardClick = output<any>();

  private router = inject(RouteService);
  private authService = inject(AuthService);

  onViewEventClick(): void {
    const eventData = this.config();
    this.cardClick.emit(eventData);
    const id = eventData?._id;
    if (id) {
      this.router.navigate('/events', id);
    }
  }

  get isWishlisted(): boolean {
    if (!this.authService.isLoggedIn() || !this.authService.userDetails) return false;
    return this.authService.userDetails?.wishlist?.includes(this.config()?._id) || false;
  }

  onWishlistToggle(event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const eventId = this.config()?._id;
    if (!eventId) return;

    if (this.isWishlisted) {
      this.authService.userDetails.wishlist = this.authService.userDetails.wishlist.filter((id: string) => id !== eventId);
    } else {
      if (!this.authService.userDetails.wishlist) this.authService.userDetails.wishlist = [];
      this.authService.userDetails.wishlist.push(eventId);
    }

    this.authService.userDetails$.next(this.authService.userDetails);

    this.authService.toggleSavedEvent(eventId).subscribe({
      error: (err) => console.error('Failed to toggle wishlist', err)
    });
  }

  getRemainingSpots(): number {
    const config = this.config();
    if (!config || !config.attendeeLimit) return 0;
    const totalCurrentAttendees = (config.attendees?.length || 0) + 1;
    return Math.max(0, config.attendeeLimit - totalCurrentAttendees);
  }

  getEventBadge(): { text: string; icon: string } | null {
    const config = this.config();
    if (!config?.eventDate) return null;

    const eventDateTime = this.getEventDateTime();
    if (!eventDateTime) return null;

    const now = new Date();
    if (eventDateTime < now) {
      return { text: 'Ended', icon: 'event_busy' };
    }

    const diffMs = eventDateTime.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);

    if (diffHrs > 0 && diffHrs <= 6) {
      return { text: `${Math.ceil(diffHrs)}h left`, icon: 'bolt' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const eventDate = new Date(config.eventDate);
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);

    if (eventDay.getTime() === today.getTime()) {
      return { text: 'Today', icon: 'calendar_today' };
    }

    if (eventDay.getTime() === tomorrow.getTime()) {
      return { text: 'Tomorrow', icon: 'calendar_today' };
    }

    const dayOfWeek = eventDay.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { text: 'Weekend', icon: 'weekend' };
    }

    return null;
  }

  get isEventEnded(): boolean {
    const eventDateTime = this.getEventDateTime();
    return eventDateTime ? eventDateTime < new Date() : false;
  }

  get location(): string {
    const address = this.config()?.address;
    return address?.area || address?.city || this.config()?.location || this.config()?.city || 'Location';
  }

  get attendees(): any[] {
    return this.config()?.attendees || this.config()?.participants || [];
  }

  get categoryTitle(): string {
    return this.config()?.category?.title || this.config()?.category || '';
  }

  get isEscapeEvent(): boolean {
    const config = this.config();
    const category = config?.category;
    const hasEndDate = Boolean(config?.endDate);
    const categoryTitle = String(category?.title || category?.name || category || '').toLowerCase();

    return hasEndDate || categoryTitle.includes('escape') || categoryTitle.includes('travel') || categoryTitle.includes('trip');
  }

  get tripDateRangeLabel(): string {
    const config = this.config();
    const start = this.formatTripDate(config?.eventDate);
    const end = this.formatTripDate(config?.endDate);

    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    return 'Dates TBA';
  }

  get formattedDateTime(): string {
    if (this.isEscapeEvent) {
      return this.tripDateRangeLabel;
    }
    const config = this.config();
    if (!config?.eventDate) return '';

    const date = new Date(config.eventDate);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();

    if (config.eventTime) {
      const timeStr = new TimePipe().transform(config.eventTime);
      return `${month} ${day} • ${timeStr}`;
    }
    return `${month} ${day}`;
  }

  get isFree(): boolean {
    const config = this.config();
    return config?.cost === 'Free' || !config?.price || config?.price === 0;
  }

  private getEventDateTime(): Date | null {
    const config = this.config();
    if (!config?.eventDate) return null;

    const eventDateTime = new Date(config.eventDate);
    if (config.eventTime) {
      try {
        const timeStr = config.eventTime.trim();
        const [time, modifier] = timeStr.split(/\s+/);
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;

        eventDateTime.setHours(hours || 0, minutes || 0, 0, 0);
      } catch (e) {
        console.error('Error parsing event time', e);
      }
    }

    return eventDateTime;
  }

  private formatTripDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
}
