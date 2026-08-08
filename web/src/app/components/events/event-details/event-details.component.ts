import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { map } from 'rxjs';
import { EventsService } from '../../../shared/services/events/events.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SharedService } from '../../../shared/services/shared.service';
import { RouteService } from '../../../shared/services/route/route.service';
import { BrowserService } from '../../../shared/services/browser/browser.service';
import { Environment } from '../../../../environment';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { EventJoinStatusStore } from '../../../shared/services/events/event-join-status.store';
import { GalleryImage } from '../../../shared/components/gallery/gallery.component';
import { ChatComponent } from '../../chat/chat.component';
import { EventCommentsComponent } from '../../../shared/components/event-comments/event-comments.component';
import {
  AttendeeProfile,
  EventDetails,
  EventDrawerPerson,
  JoinRequestNotification,
  RequestActionState,
} from '../../../shared/interfaces/event.interface';
import { EventHeroComponent } from './components/event-hero/event-hero.component';
import { EventHostCardComponent } from './components/event-host-card/event-host-card.component';
import { EventFactsComponent } from './components/event-facts/event-facts.component';
import { EventMapPanelComponent } from './components/event-map-panel/event-map-panel.component';
import { EventChatCardComponent } from './components/event-chat-card/event-chat-card.component';
import { EventAboutComponent } from './components/event-about/event-about.component';
import { EventGallerySectionComponent } from './components/event-gallery-section/event-gallery-section.component';
import { EventRelatedComponent } from './components/event-related/event-related.component';
import { EventPeopleDrawerComponent, JoinRequestView } from './components/event-people-drawer/event-people-drawer.component';
import { EventProfileModalComponent } from './components/event-profile-modal/event-profile-modal.component';

@Component({
  selector: 'vl-event-details',
  imports: [
    EventHeroComponent,
    EventHostCardComponent,
    EventFactsComponent,
    EventMapPanelComponent,
    EventChatCardComponent,
    EventAboutComponent,
    EventGallerySectionComponent,
    EventRelatedComponent,
    EventPeopleDrawerComponent,
    EventProfileModalComponent,
    ChatComponent,
    EventCommentsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
})
export class EventDetailsComponent {
  @ViewChild(EventGallerySectionComponent) private gallerySection?: EventGallerySectionComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly eventsService = inject(EventsService);
  private readonly authService = inject(AuthService);
  private readonly sharedService = inject(SharedService);
  private readonly routeService = inject(RouteService);
  private readonly platform = inject(BrowserService);
  private readonly socketService = inject(SocketService);
  private readonly eventJoinStatusStore = inject(EventJoinStatusStore);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);

  private readonly openCapacityLimit = 999999;
  private fetchedJoinStatusKey = '';

  // ── Route & core state ──
  eventId = toSignal(this.route.params.pipe(map((params) => params['eventId'] ?? '')), { initialValue: '' });
  eventDetails = signal<EventDetails | null>(null);
  attendeeProfiles = signal<AttendeeProfile[]>([]);
  eventGalleryImages = signal<GalleryImage[]>([]);
  relatedEvents = signal<any[]>([]);
  currentUser = toSignal(this.authService.userDetails$);
  notifications = toSignal(this.socketService.notifications$);

  // ── UI state ──
  isChatOpen = signal(false);
  isEventMenuOpen = signal(false);
  activeDrawer = signal<'requests' | 'attendees' | null>(null);
  profileModal = signal<{ open: boolean; userId: string }>({ open: false, userId: '' });
  requestActionStates = signal<Record<string, RequestActionState>>({});
  deletingGalleryImagePath = signal('');
  private readonly now = signal(Date.now());

  // ── Derived data ──
  attendees = computed(() => this.eventDetails()?.attendees ?? []);
  totalAttendeesCount = computed(() => this.attendees().length + 1); // +1 includes the creator
  attendeePreviewProfiles = computed(() => this.attendeeProfiles().slice(0, 5));

  canAccessPrivateEventData = computed(() => {
    const details = this.eventDetails();
    const userId = this.currentUser()?.id;
    const isLoggedIn = this.authService.isLoggedIn() && !!userId;
    const isMember = isLoggedIn && (this.attendees().includes(userId) || userId === details?.createdBy?._id);
    const joinStatus = this.eventJoinStatusStore.statusFor(this.eventId());

    return isMember || joinStatus === 'accepted';
  });
  isUserAttendee = computed(() => this.canAccessPrivateEventData());
  isEventCreator = computed(() =>
    this.authService.isLoggedIn() && this.currentUser()?.id === this.eventDetails()?.createdBy?._id);
  canLeaveReview = computed(() => this.isUserAttendee() && !this.isEventCreator());
  isMapVisible = computed(() => this.canAccessPrivateEventData() && hasEventCoordinates(this.eventDetails()));
  isChatVisible = computed(() => this.canAccessPrivateEventData());

  joinRequestStatus = computed(() => this.eventJoinStatusStore.labelFor(this.eventId()));
  canRequestJoin = computed(() => this.eventJoinStatusStore.canRequestJoin(this.eventId()));

  mapPosition = computed<google.maps.LatLngLiteral>(() => {
    const coordinates = getEventLocation(this.eventDetails())?.coordinates;
    return coordinates?.length === 2 ? { lat: coordinates[1], lng: coordinates[0] } : { lat: 0, lng: 0 };
  });
  mapOptions = computed<google.maps.MapOptions>(() => ({ center: this.mapPosition(), zoom: 16 }));

  isEventEnded = computed(() => {
    const eventDateTime = getEventDateTime(this.eventDetails());
    return eventDateTime ? eventDateTime < new Date() : false;
  });

  isEscapeEvent = computed(() => {
    const details = this.eventDetails();
    const category = details?.category;
    const hasEndDate = Boolean(details?.endDate);
    const categoryTitle = String((category as any)?.title || (category as any)?.name || category || '').toLowerCase();

    return hasEndDate || categoryTitle.includes('escape') || categoryTitle.includes('travel') || categoryTitle.includes('trip');
  });
  tripDateRangeLabel = computed(() => {
    const details = this.eventDetails();
    const start = formatTripDate(details?.eventDate);
    const end = formatTripDate(details?.endDate);

    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    return 'Dates TBA';
  });

  timeLeftLabel = computed(() => {
    if (this.isEscapeEvent()) return this.tripDateRangeLabel();
    const details = this.eventDetails();
    if (!details?.eventDate || !details?.eventTime) return 'Date TBA';

    const eventDateTime = getEventDateTime(details);
    if (!eventDateTime) return 'Date TBA';

    const diffMs = eventDateTime.getTime() - this.now();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return 'Event ended';
    if (diffMins < 60) return 'Starting soon';
    if (diffHrs < 24) return `Starts in ${diffHrs} hrs`;
    if (diffDays === 1) return 'Starts tomorrow';
    return `Starts in ${diffDays} days`;
  });

  remainingSpots = computed(() => {
    const details = this.eventDetails();
    if (!details?.attendeeLimit) return 0;
    if (isCapacityUnlimited(details.attendeeLimit, this.openCapacityLimit)) return 0;
    return Math.max(0, details.attendeeLimit - this.totalAttendeesCount());
  });
  remainingSpotsLabel = computed(() =>
    isCapacityUnlimited(this.eventDetails()?.attendeeLimit, this.openCapacityLimit) ? 'No limit' : `${this.remainingSpots()} left`);
  isUrgent = computed(() => this.remainingSpots() > 0 && this.remainingSpots() <= 5);

  attendanceSummaryLabel = computed(() => {
    const total = this.totalAttendeesCount();
    const status = this.isEventEnded() ? 'attended' : 'going';

    if (this.isUserAttendee()) {
      const others = Math.max(total - 1, 0);
      if (others === 0) return `You ${status}`;
      return `You and ${others} ${others === 1 ? 'other' : 'others'} ${status}`;
    }

    return `${total} ${total === 1 ? 'person' : 'people'} ${status}`;
  });

  eventPriceLabel = computed(() => {
    const details = this.eventDetails();
    if (details?.cost === 'Free') return 'Free';
    return details?.price ? '₹' + details.price : 'Free';
  });

  audiencePreferenceType = computed<'open' | 'women' | 'men'>(() => {
    const details = this.eventDetails();
    const preference = String(details?.audiencePreference || '').toLowerCase();
    if (preference === 'women' || preference === 'men' || preference === 'open') return preference;

    const attendeeMix = Number(details?.attendeeMix);
    if (Number.isFinite(attendeeMix)) {
      if (attendeeMix <= 20) return 'women';
      if (attendeeMix >= 80) return 'men';
    }

    return 'open';
  });
  audiencePreferenceLabel = computed(() => {
    switch (this.audiencePreferenceType()) {
      case 'women': return 'Women preferred';
      case 'men': return 'Men preferred';
      default: return 'Open to everyone';
    }
  });
  audiencePreferenceIcon = computed(() => {
    switch (this.audiencePreferenceType()) {
      case 'women': return 'fa-solid fa-venus';
      case 'men': return 'fa-solid fa-mars';
      default: return 'fa-solid fa-earth-asia';
    }
  });

  locationLabel = computed(() => {
    const address = this.eventDetails()?.address;
    const fullAddress = String(address?.fullAddress || '').trim();
    const partialAddress = String(address?.partialAddress || '').trim();

    if (fullAddress) return fullAddress;
    if (partialAddress) return partialAddress;

    const fallbackParts = [address?.area, address?.city, address?.state, address?.pinCode, address?.country].filter(Boolean);
    return fallbackParts.length ? fallbackParts.join(', ') : 'Location TBA';
  });
  showHostLocationVisibilityCopy = computed(() => this.isEventCreator());
  locationSubtitle = computed(() => {
    if (!this.showHostLocationVisibilityCopy()) return '';
    return this.eventDetails()?.address?.fullAddress
      ? 'Full address visible to you and attendees'
      : 'Exact address shared after joining';
  });

  hostEventCount = computed(() => {
    const count = Number(this.eventDetails()?.createdBy?.eventCount);
    return Number.isFinite(count) && count > 0 ? count : 1;
  });
  isNewHost = computed(() => this.hostEventCount() <= 1);
  hostRating = computed(() => {
    const rating = Number(this.eventDetails()?.createdBy?.averageRating);
    return Number.isFinite(rating) ? rating : 0;
  });
  shouldShowHostRating = computed(() => !this.isNewHost() && this.hostRating() > 3);

  canDownloadGalleryImage = computed(() => this.isUserAttendee());

  pendingJoinRequests = computed(() => {
    const notifications = this.notifications();
    const eventId = this.eventId();
    if (!Array.isArray(notifications) || !eventId) return [] as JoinRequestNotification[];

    return notifications.filter((notification: JoinRequestNotification) =>
      notification?.type === 'JOIN_REQUEST'
      && getNotificationEventId(notification) === eventId
      && notificationRequestState(notification, this.requestActionStates()) === 'pending');
  });
  pendingJoinRequestCount = computed(() => this.pendingJoinRequests().length);
  pendingJoinRequestsView = computed<JoinRequestView[]>(() =>
    this.pendingJoinRequests().map((notification) => ({
      id: getNotificationId(notification),
      senderId: getNotificationSenderId(notification),
      senderName: getNotificationSenderName(notification),
      senderImage: getNotificationSenderImage(notification),
      state: notificationRequestState(notification, this.requestActionStates()),
    })));

  eventDrawerTitle = computed(() => (this.activeDrawer() === 'requests' ? 'Pending Requests' : 'Attendees'));
  eventDrawerSubtitle = computed(() => {
    if (this.activeDrawer() === 'requests') {
      const count = this.pendingJoinRequestCount();
      return `${count} ${count === 1 ? 'request' : 'requests'} waiting for review`;
    }

    const total = this.eventDrawerAttendees().length;
    return `${total} ${total === 1 ? 'person' : 'people'} ${this.isEventEnded() ? 'attended' : 'going'}`;
  });
  eventDrawerAttendees = computed<EventDrawerPerson[]>(() => {
    const host = this.eventDetails()?.createdBy;
    const attendees = this.attendeeProfiles().map((attendee) => ({
      userId: attendee.userId,
      userName: attendee.userName,
      profileImage: attendee.profileImage,
      role: 'Attendee' as const,
    }));

    if (!host?._id) return attendees;

    return [
      { userId: host._id, userName: host.username || 'Host', profileImage: host.profileImage || '', role: 'Host' as const },
      ...attendees,
    ];
  });

  constructor() {
    effect(() => {
      const eventId = this.eventId();
      if (eventId) this.fetchEventDetails(eventId);
    });

    effect(() => {
      const userId = this.currentUser()?.id;
      if (userId) this.syncJoinStatusForCurrentUser();
      if (!this.canAccessPrivateEventData()) this.isChatOpen.set(false);
    });

    effect(() => {
      const details = this.eventDetails();
      if (!details) return;

      this.titleService.setTitle(`${details.title || 'Event'} | Viblooop`);
      this.meta.updateTag({ property: 'og:title', content: details.title || 'Event' });
      this.meta.updateTag({ property: 'og:description', content: (details.description ?? '').slice(0, 160) });
      this.meta.updateTag({ property: 'og:image', content: details.image ?? '' });
      this.meta.updateTag({ property: 'og:type', content: 'event' });
    });

    // Browser-only: a live setInterval registered during SSR would block Angular's
    // server-render stability detection (it never resolves), hanging the response.
    afterNextRender(() => {
      const clockId = setInterval(() => this.now.set(Date.now()), 60_000);
      this.destroyRef.onDestroy(() => clearInterval(clockId));
    });
  }

  private fetchEventDetails(eventId: string): void {
    this.eventsService.getEventDetails(eventId).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      const details: EventDetails = res.data ?? {};
      details.image = this.sharedService.getImageUrl(details.image);

      const galleryImages: GalleryImage[] = Array.isArray(details.gallery)
        ? details.gallery.map((image: string) => ({ path: image, url: this.sharedService.getImageUrl(image) }))
        : [];
      details.gallery = galleryImages.map((image) => image.url);

      this.eventDetails.set(details);
      this.eventGalleryImages.set(galleryImages);

      this.getAttendeesDetails();
      this.syncJoinStatusForCurrentUser();
      this.fetchRelatedNearbyEvents(eventId);
    });
  }

  private syncJoinStatusForCurrentUser(): void {
    const eventId = this.eventId();
    const userId = this.currentUser()?.id;
    if (!eventId || !userId) return;

    const fetchKey = `${eventId}:${userId}`;
    if (this.fetchedJoinStatusKey === fetchKey) return;

    this.fetchedJoinStatusKey = fetchKey;
    this.eventsService.getJoinStatus(eventId, userId).subscribe((res: any) => {
      if (res?.success) this.eventJoinStatusStore.setApiStatus(eventId, res.data?.status);
    });
  }

  private fetchRelatedNearbyEvents(eventId: string): void {
    this.eventsService.getRelatedNearbyEvents(eventId).subscribe((res: any) => {
      if (res?.success && res.data) this.relatedEvents.set(res.data);
    });
  }

  private getAttendeesDetails(): void {
    const attendees = this.attendees();
    if (!attendees.length) {
      this.attendeeProfiles.set([]);
      return;
    }

    this.eventsService.getAttendeeDetails(attendees).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }
      this.attendeeProfiles.set(res.data);
    });
  }

  requestJoinEvent(): void {
    const eventId = this.eventId();
    const userId = this.currentUser()?.id;
    if (!eventId || !userId) return;

    this.eventsService.requestJoinEvent(eventId, userId).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }
      this.eventJoinStatusStore.setStatus(eventId, 'pending');
    });
  }

  acceptJoinRequest(request: JoinRequestView): void {
    this.requestActionStates.update((states) => ({ ...states, [request.id]: 'processing' }));

    this.eventsService.acceptJoinRequest(this.eventId(), request.senderId).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          this.requestActionStates.update((states) => ({ ...states, [request.id]: 'pending' }));
          return;
        }

        this.requestActionStates.update((states) => ({ ...states, [request.id]: 'accepted' }));
        this.fetchEventDetails(this.eventId());
      },
      error: (err) => {
        this.requestActionStates.update((states) => ({ ...states, [request.id]: 'pending' }));
        console.error('Accept join request failed:', err);
      },
    });
  }

  rejectJoinRequest(request: JoinRequestView): void {
    this.requestActionStates.update((states) => ({ ...states, [request.id]: 'processing' }));

    this.eventsService.rejectJoinEventRequest(this.eventId(), request.senderId).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          this.requestActionStates.update((states) => ({ ...states, [request.id]: 'pending' }));
          return;
        }
        this.requestActionStates.update((states) => ({ ...states, [request.id]: 'rejected' }));
      },
      error: (err) => {
        this.requestActionStates.update((states) => ({ ...states, [request.id]: 'pending' }));
        console.error('Reject join request failed:', err);
      },
    });
  }

  openPersonProfile(userId: string): void {
    if (!userId) return;
    this.profileModal.set({ open: true, userId });
  }

  closeProfileModal(): void {
    this.profileModal.set({ open: false, userId: '' });
  }

  redirectToHostProfile(): void {
    const hostId = this.eventDetails()?.createdBy?._id;
    if (!hostId) return;
    this.routeService.navigateByUrl(`/profile?userId=${encodeURIComponent(hostId)}`);
  }

  toggleEventMenu(): void {
    if (!this.isEventCreator()) return;
    this.isEventMenuOpen.update((isOpen) => !isOpen);
  }

  closeEventMenu(): void {
    this.isEventMenuOpen.set(false);
  }

  openEditEvent(): void {
    if (!this.isEventCreator()) return;

    this.isEventMenuOpen.set(false);
    const eventId = this.eventId();
    const editQueryParams = { mode: 'edit', eventId };
    this.routeService.navigateToDrawer('create-event', `/create-event?mode=edit&eventId=${encodeURIComponent(eventId)}`, editQueryParams);
  }

  async onUploadPhotos(files: File[]): Promise<void> {
    if (!this.isEventCreator()) return;

    const eventId = this.eventId();
    const formData = new FormData();
    formData.append('eventId', eventId);
    for (const file of files) {
      const finalFile = await this.sharedService.convertHeicToJpg(file);
      formData.append('gallery', finalFile);
    }

    this.eventsService.updateEvent(formData).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        const gallery = Array.isArray(res.data?.event?.gallery) ? res.data.event.gallery : [];
        this.eventGalleryImages.set(gallery.map((image: string) => ({ path: image, url: this.sharedService.getImageUrl(image) })));
      },
      error: (err: any) => console.error('Error uploading gallery photos:', err),
    });
  }

  onDeleteGalleryImage(imagePath: string): void {
    const eventId = this.eventId();
    if (!this.isEventCreator() || !eventId || !imagePath || this.deletingGalleryImagePath()) return;

    this.deletingGalleryImagePath.set(imagePath);
    this.eventsService.removeEventGalleryImage(eventId, imagePath).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        this.eventGalleryImages.update((images) => images.filter((image) => image.path !== imagePath));
        this.gallerySection?.closeGalleryPreview();
      },
      error: (err: any) => console.error('Error removing gallery image:', err),
      complete: () => this.deletingGalleryImagePath.set(''),
    });
  }

  toggleChat(): void {
    if (!this.isChatVisible()) return;
    this.isChatOpen.update((isOpen) => !isOpen);
  }

  openInGoogleMaps(): void {
    const { lat, lng } = this.mapPosition();
    if (!lat || !lng || !this.platform.isBrowserPlatform()) return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `${Environment.googleMapsSearchUrl}?api=1&query=${lat},${lng}`;
    } else {
      window.open(`${Environment.googleMapsUrl}?q=${lat},${lng}`, '_blank');
    }
  }

  goBack(): void {
    if (this.platform.isBrowserPlatform()) window.history.back();
  }

  openAttendeesDrawer(): void {
    this.activeDrawer.set('attendees');
  }

  openRequestsDrawer(): void {
    if (!this.isEventCreator()) return;
    this.activeDrawer.set('requests');
  }

  closeEventDrawer(): void {
    this.activeDrawer.set(null);
  }
}

function hasEventCoordinates(details: EventDetails | null): boolean {
  const coordinates = getEventLocation(details)?.coordinates;
  return Array.isArray(coordinates) && coordinates.length === 2
    && Number.isFinite(Number(coordinates[0])) && Number.isFinite(Number(coordinates[1]));
}

function getEventLocation(details: EventDetails | null) {
  return details?.address?.location || details?.location;
}

function isCapacityUnlimited(limit: unknown, openCapacityLimit: number): boolean {
  return Number(limit) >= openCapacityLimit;
}

function formatTripDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

function getEventDateTime(details: EventDetails | null): Date | null {
  if (!details?.eventDate) return null;

  const eventDateTime = new Date(details.eventDate);
  if (Number.isNaN(eventDateTime.getTime())) return null;

  const eventTime = String(details?.eventTime || '').trim();
  if (!eventTime) return eventDateTime;

  const match = eventTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return eventDateTime;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const modifier = match[3]?.toUpperCase();

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  eventDateTime.setHours(hours || 0, minutes || 0, 0, 0);
  return eventDateTime;
}

function getNotificationId(notification: JoinRequestNotification): string {
  return notification?._id || notification?.id || '';
}

function getNotificationEventId(notification: JoinRequestNotification): string {
  const eventId = notification?.eventId;
  return (typeof eventId === 'object' ? eventId?._id : eventId) || '';
}

function getNotificationSenderId(notification: JoinRequestNotification): string {
  const senderId = notification?.senderId;
  return (typeof senderId === 'object' ? senderId?._id : senderId) || notification?.sender?._id || '';
}

function getNotificationSenderName(notification: JoinRequestNotification): string {
  const senderId = notification?.senderId;
  return notification?.senderName
    || notification?.sender?.username
    || (typeof senderId === 'object' ? senderId?.username : undefined)
    || 'Guest';
}

function getNotificationSenderImage(notification: JoinRequestNotification): string {
  const senderId = notification?.senderId;
  return notification?.senderImage
    || notification?.sender?.profileImage
    || (typeof senderId === 'object' ? senderId?.profileImage : undefined)
    || '';
}

function notificationRequestState(
  notification: JoinRequestNotification,
  requestActionStates: Record<string, RequestActionState>,
): RequestActionState {
  const localState = requestActionStates[getNotificationId(notification)];
  if (localState) return localState;

  const status = String(notification?.status || 'pending').toLowerCase();
  if (status === 'processing' || status === 'accepted' || status === 'rejected' || status === 'pending') {
    return status as RequestActionState;
  }

  return 'pending';
}
