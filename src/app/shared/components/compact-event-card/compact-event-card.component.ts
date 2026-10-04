import { CurrencyPipe, SlicePipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouteService } from '../../services/route/route.service';
import { AuthService } from '../../services/auth/auth.service';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { TimePipe } from '../../pipes/time.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { isThisCalendarWeekend } from '../../utils/date-badge.util';

@Component({
  selector: 'vl-compact-event-card',
  standalone: true,
  imports: [DatePipe, TimePipe, ImageUrlPipe, CurrencyPipe, SlicePipe, DatePipe, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compact-event-card.component.html',
  styleUrl: './compact-event-card.component.scss'
})
export class CompactEventCardComponent {
  config = input<any>({});
  showWishlist = input<boolean>(true);
  cardClick = output<any>();
  wishlistChange = output<boolean>();

  private router = inject(RouteService);
  private authService = inject(AuthService);
  private readonly currentUser = toSignal(this.authService.userDetails$, {
    initialValue: this.authService.userDetails,
  });
  readonly isLoggedIn = computed(() => !!this.currentUser());

  onViewEventClick(): void {
    const eventData = this.config();
    this.cardClick.emit(eventData);
    const id = eventData?._id;
    if (id) {
      this.router.navigate('/events', id);
    }
  }

  get isWishlisted(): boolean {
    this.currentUser();
    if (!this.authService.isLoggedIn()) return false;
    return this.authService.isEventWishlisted(this.config()?._id);
  }

  onWishlistToggle(event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const eventId = this.config()?._id;
    if (!eventId) return;

    const wasWishlisted = this.isWishlisted;
    this.authService.setEventWishlistState(eventId, !wasWishlisted);

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
    const totalCurrentAttendees = (config.attendees?.length || 0) + 1;
    return Math.max(0, config.attendeeLimit - totalCurrentAttendees);
  }

  getEventBadge(): { text: string; icon: string } | null {
    const config = this.config();
    if (!config?.eventDate) return null;

    const eventDateTime = this.getEventDateTime();
    if (!eventDateTime) return null;

    if (this.isEventEnded) {
      return { text: 'Ended', icon: 'history' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const eventDate = new Date(config.eventDate);
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);

    if (eventDay.getTime() === today.getTime()) {
      return { text: 'Today', icon: 'today' };
    }

    if (eventDay.getTime() === tomorrow.getTime()) {
      return { text: 'Tomorrow', icon: 'event_upcoming' };
    }

    if (isThisCalendarWeekend(eventDay, today)) {
      return { text: 'This Weekend', icon: 'weekend' };
    }

    const dayOfWeek = eventDay.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const diffDays = Math.round((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays < 7) {
      return { text: `Coming ${dayNames[dayOfWeek]}`, icon: 'calendar_month' };
    }

    return null;
  }

  get isEventEnded(): boolean {
    const config = this.config();
    const endDate = config?.endDate;
    if (endDate) {
      if (config?.endTime) {
        const eventEndDateTime = this.getEventDateTime(config.endTime, endDate);
        return eventEndDateTime ? eventEndDateTime < new Date() : false;
      }
      const eventEndDate = new Date(endDate);
      if (Number.isNaN(eventEndDate.getTime())) return false;
      eventEndDate.setHours(23, 59, 59, 999);
      return eventEndDate < new Date();
    }

    const eventDateTime = this.getEventDateTime(this.config()?.endTime || this.config()?.eventTime);
    return eventDateTime ? eventDateTime < new Date() : false;
  }

  get location(): string {
    const address = this.config()?.address;
    return address?.area || address?.city || this.config()?.location || this.config()?.city || 'Location';
  }

  get hostName(): string {
    const createdBy = this.config()?.createdBy;
    return createdBy?.username || createdBy?.userName || createdBy?.name || createdBy?.fullName || 'Host';
  }

  get hostAvatar(): string {
    return (this.config()?.createdBy?.profileImage as string) || '';
  }

  get audiencePreferenceType(): 'women' | 'men' | 'open' {
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
        return 'Women Only';
      case 'men':
        return 'Men Only';
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

    return (hasEndDate && !config?.endTime) || categoryTitle.includes('escape') || categoryTitle.includes('travel') || categoryTitle.includes('trip');
  }

  get tripDateRangeLabel(): string {
    const config = this.config();
    const start = this.formatTripDate(config?.eventDate);
    const end = this.formatTripDate(config?.endDate);

    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    return 'Dates TBA';
  }

  get isMultiDay(): boolean {
    const { eventDate, endDate } = this.config() || {};
    return !!eventDate && !!endDate && new Date(eventDate).toDateString() !== new Date(endDate).toDateString();
  }

  get isFree(): boolean {
    const config = this.config();
    return config?.cost === 'Free' || !config?.price || config?.price === 0;
  }

  private getEventDateTime(timeValue?: string, dateValue?: string | Date): Date | null {
    const config = this.config();
    const resolvedDate = dateValue || config?.eventDate;
    if (!resolvedDate) return null;

    const eventDateTime = new Date(resolvedDate);
    if (timeValue) {
      try {
        const timeStr = timeValue.trim();
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
