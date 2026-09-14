import { DatePipe, SlicePipe, CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouteService } from '../../services/route/route.service';
import { AuthService } from '../../services/auth/auth.service';
import { EventsService } from '../../services/events/events.service';
import { SharedService } from '../../services/shared.service';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { TimePipe } from '../../pipes/time.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'vl-event-card',
  imports: [DatePipe, SlicePipe, ImageUrlPipe, CurrencyPipe, NgClass, TimePipe, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss'
})
export class EventCardComponent {
  config = input<any>({});
  presentation = input<'default' | 'profile'>('default');
  profileStatus = input<'attended' | 'hosted'>('attended');
  showWishlist = input<boolean>(true);
  cardClick = output<any>();
  wishlistChange = output<boolean>();

  router = inject(RouteService)
  authService = inject(AuthService);
  eventsService = inject(EventsService);
  _shared = inject(SharedService);
  private readonly currentUser = toSignal(this.authService.userDetails$, {
    initialValue: this.authService.userDetails,
  });
  readonly isLoggedIn = computed(() => !!this.currentUser());

  onViewEventClick() {
    const eventData = this.config();
    this.cardClick.emit(eventData);
    this.router.navigate('/events', eventData?._id);
  }

  get isWishlisted(): boolean {
    this.currentUser();
    if (!this.authService.isLoggedIn()) return false;
    const eventId = this.config()?._id || this.config()?.id;
    return Boolean(eventId && this.authService.isEventWishlisted(eventId));
  }

  onWishlistToggle(event: Event) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const eventId = this.config()?._id || this.config()?.id;
    if (!eventId) return;

    const wasWishlisted = this.isWishlisted;
    this.authService.setEventWishlistState(eventId, !wasWishlisted);

    // Backend Request
    this.authService.toggleSavedEvent(eventId).subscribe({
      next: (res: any) => {
        if (Array.isArray(res?.data)) {
          this.authService.replaceWishlist(res.data);
        }
        this.wishlistChange.emit(this.authService.isEventWishlisted(eventId));
      },
      error: (err) => {
        this.authService.setEventWishlistState(eventId, wasWishlisted);
        console.error('Failed to toggle wishlist', err);
      }
    });
  }

  getRemainingSpots(): number {
    const config = this.config();
    if (!config || !config.attendeeLimit) return 0;
    const totalCurrentAttendees = (config.attendees?.length || 0) + 1; // +1 includes creator
    return Math.max(0, config.attendeeLimit - totalCurrentAttendees);
  }

  getInterestedCount(): number {
    // Basic logic: actual attendees + a small random factor for "interested" look
    const length = this.config().attendees?.length || 0;
    if (length === 0) return 0;
    return length + Math.floor(Math.random() * 5) + 2;
  }

  getEventBadge(): { text: string; icon: string } | null {
    const config = this.config();
    if (!config?.eventDate) return null;

    const eventDateTime = this.getEventDateTime();
    if (!eventDateTime) return null;

    const now = new Date();
    const eventDate = new Date(config.eventDate);

    if (this.isEventEnded) {
      return { text: 'Event Over', icon: 'event_busy' };
    }

    const diffMs = eventDateTime.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);

    // 1. Starts in X hrs (if within next 6 hours)
    if (diffHrs > 0 && diffHrs <= 6) {
      return { text: `⚡ Starts in ${Math.ceil(diffHrs)} hrs`, icon: 'bolt' };
    }

    // Setup for day checks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);

    // 2. Today
    if (eventDay.getTime() === today.getTime()) {
      const formattedTime = new TimePipe().transform(config.eventTime);
      return { text: `Today • ${formattedTime}`, icon: 'calendar_today' };
    }

    // 3. Tomorrow
    if (eventDay.getTime() === tomorrow.getTime()) {
      return { text: 'Tomorrow', icon: 'calendar_today' };
    }

    // 4. This Weekend (Sat/Sun and not today/tomorrow)
    const dayOfWeek = eventDay.getDay(); // 0 = Sun, 6 = Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { text: 'This Weekend', icon: 'weekend' };
    }

    // 5. Coming [Day] (for other days within the next 7 days)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const diffDays = Math.round((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays < 7) {
      return { text: `Coming ${dayNames[dayOfWeek]}`, icon: 'calendar_month' };
    }

    return null;
  }

  get isEventEnded(): boolean {
    const endDate = this.config()?.endDate;
    if (endDate) {
      const eventEndDate = new Date(endDate);
      if (Number.isNaN(eventEndDate.getTime())) return false;
      eventEndDate.setHours(23, 59, 59, 999);
      return eventEndDate < new Date();
    }

    const eventDateTime = this.getEventDateTime();
    return eventDateTime ? eventDateTime < new Date() : false;
  }

  get location(): string {
    const address = this.config()?.address;
    return address?.area || address?.pinCode || this.config()?.location || this.config()?.city || 'Location';
  }

  get hostName(): string {
    return this.config()?.createdBy?.username || this.config()?.createdBy?.userName || this.config()?.createdBy?.name || 'Host';
  }

  get attendees(): any[] {
    return this.config()?.attendees || this.config()?.participants || [];
  }

  get remainingAttendeeCount(): number {
    return Math.max((this.attendees?.length || 0) - 4, 0);
  }

  get profileStatusLabel(): string {
    return this.profileStatus() === 'hosted' ? 'Hosted' : 'Attended';
  }

  get categoryTitle(): string {
    const cat = this.config()?.category;
    if (typeof cat === 'object' && cat !== null) {
      return cat.title || cat.name || '';
    }
    if (typeof cat === 'string') {
      return cat;
    }
    return this.config()?.tags?.[0] || '';
  }

  get displayTags(): string[] {
    const expectations = this.config()?.expectations;
    if (Array.isArray(expectations) && expectations.length) return expectations;

    const tags = this.config()?.tags;
    return Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [];
  }

  get audiencePreferenceType(): 'open' | 'women' | 'men' {
    const preference = String(this.config()?.audiencePreference || '').toLowerCase();
    if (preference === 'women' || preference === 'men' || preference === 'open') return preference;

    const attendeeMix = Number(this.config()?.attendeeMix);
    if (Number.isFinite(attendeeMix)) {
      if (attendeeMix <= 20) return 'women';
      if (attendeeMix >= 80) return 'men';
    }

    return 'open';
  }

  get audiencePreferenceLabel(): string {
    switch (this.audiencePreferenceType) {
      case 'women':
        return 'Women';
      case 'men':
        return 'Men';
      default:
        return 'Mix';
    }
  }

  get shouldShowAudiencePreference(): boolean {
    return this.audiencePreferenceType === 'women' || this.audiencePreferenceType === 'men';
  }

  get audiencePreferenceIcon(): string {
    switch (this.audiencePreferenceType) {
      case 'women':
        return 'female';
      case 'men':
        return 'male';
      default:
        return 'groups';
    }
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  }

}
