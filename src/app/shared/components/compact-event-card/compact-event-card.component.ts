import { CurrencyPipe, SlicePipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouteService } from '../../services/route/route.service';
import { AuthService } from '../../services/auth/auth.service';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { TimePipe } from '../../pipes/time.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { isThisCalendarWeekend } from '../../utils/date-badge.util';
import { eventDateRangeDurationLabel } from '../../utils/event-date-range.util';
import { OPEN_EVENT_CAPACITY_LIMIT } from '../../utils/event-capacity.util';

@Component({
  selector: 'vl-compact-event-card',
  standalone: true,
  imports: [DatePipe, TimePipe, ImageUrlPipe, CurrencyPipe, DatePipe, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compact-event-card.component.html',
  styleUrl: './compact-event-card.component.scss'
})
export class CompactEventCardComponent {
  config = input<any>({});
  showWishlist = input<boolean>(true);
  showAttendeeCount = input<boolean>(true);
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
    const attendeeLimit = Number(config?.attendeeLimit);
    if (!Number.isFinite(attendeeLimit) || attendeeLimit <= 0 || attendeeLimit >= OPEN_EVENT_CAPACITY_LIMIT) return 0;
    const totalCurrentAttendees = (config.attendees?.length || 0) + 1;
    return Math.max(0, attendeeLimit - totalCurrentAttendees);
  }

  get shouldShowRemainingSpots(): boolean {
    const remainingSpots = this.getRemainingSpots();
    return remainingSpots > 0 && remainingSpots < 20;
  }

  getEventBadge(): { text: string; icon: string } | null {
    const config = this.config();
    if (this.isEventCancelled) return { text: 'Cancelled', icon: '' };
    if (!config?.eventDate) return null;

    const eventDateTime = this.getEventDateTime();
    if (!eventDateTime) return null;

    if (this.isEventEnded) {
      return {
        text: 'Completed',
        icon: 'check_circle'
      };
    }

    if (this.isEventOngoing) {
      return { text: 'Ongoing', icon: 'schedule' };
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

  get isEventCancelled(): boolean {
    const status = String(this.config()?.status || '').toLowerCase();
    return status === 'cancelled' || status === 'canceled';
  }

  get isExplicitlyCompleted(): boolean {
    const status = String(this.config()?.status || this.config()?.eventStatus || '').toLowerCase();
    return status === 'completed';
  }

  get isEventEnded(): boolean {
    const config = this.config();
    if (!config) return false;

    const status = String(config.status || config.eventStatus || '').toLowerCase();
    if (status === 'completed' || status === 'ended' || status === 'closed' || status === 'past') {
      return true;
    }

    if (config?.endTime) {
      const end = this.getEventDateTime(config.endTime, config.endDate || config.eventDate);
      const start = config.eventTime ? this.getEventDateTime(config.eventTime, config.eventDate) : null;
      if (!end) return false;
      if (start && end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
      return end < new Date();
    }
    if (config?.endDate) {
      const eventEndDate = new Date(config.endDate);
      if (Number.isNaN(eventEndDate.getTime())) return false;
      eventEndDate.setHours(23, 59, 59, 999);
      return eventEndDate < new Date();
    }

    const eventDateTime = config?.eventTime ? this.getEventDateTime(config.eventTime, config.eventDate) : null;
    return eventDateTime ? eventDateTime < new Date() : false;
  }

  private get isEventOngoing(): boolean {
    const config = this.config();
    if (!config?.eventDate || !config?.eventTime || !config?.endTime) return false;

    const start = this.getEventDateTime(config.eventTime, config.eventDate);
    const end = this.getEventDateTime(config.endTime, config.endDate || config.eventDate);
    if (!start || !end) return false;

    if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
    const now = new Date();
    return start.getTime() <= now.getTime() && now.getTime() < end.getTime();
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

  get isDurationStyleEvent(): boolean {
    const category = this.config()?.category;
    const categoryTitle = String(category?.title || category?.name || category || '').toLowerCase();
    return ['party', 'social', 'meetup', 'play', 'sports', 'gaming', 'fitness', 'hangout', 'events', 'local']
      .some((name) => categoryTitle.includes(name));
  }

  get tripDurationLabel(): string {
    const config = this.config();
    return eventDateRangeDurationLabel(config?.eventDate, config?.endDate) || 'Duration TBA';
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

}
