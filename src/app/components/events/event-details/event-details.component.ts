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
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { map } from 'rxjs';
import { EventsService } from '../../../shared/services/events/events.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SharedService } from '../../../shared/services/shared.service';
import { RouteService } from '../../../shared/services/route/route.service';
import { AppDrawerService } from '../../../shared/services/drawer/app-drawer.service';
import { BrowserService } from '../../../shared/services/browser/browser.service';
import { MatTooltip } from '@angular/material/tooltip';
import { Environment } from '../../../../environment';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { EventJoinStatusStore } from '../../../shared/services/events/event-join-status.store';
import { GalleryImage } from '../../../shared/components/gallery/gallery.component';
import { ChatComponent } from '../../chat/chat.component';
import { EventCommentsComponent } from '../../../shared/components/event-comments/event-comments.component';
import { InlineLoaderComponent } from '../../../shared/components/inline-loader/inline-loader.component';
import { EventDetailsSkeletonComponent } from '../../../shared/components/event-details-skeleton/event-details-skeleton.component';
import { isPartyPlayHangout } from './event-schedule.util';
import { ToastService } from '../../../shared/services/toast/toast.service';
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
import { EventPeopleDrawerComponent, JoinRequestView } from './components/event-people-drawer/event-people-drawer.component';
import { ActionModalComponent, ActionModalVariant } from '../../../shared/components/action-modal/action-modal.component';

export interface ActionModalState {
  isOpen: boolean;
  variant: ActionModalVariant;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  showCancelButton: boolean;
  showInput: boolean;
  inputPlaceholder: string;
  inputRequired: boolean;
  isLoading: boolean;
  action: 'delete' | 'cancel' | 'leave' | 'cancelRequest' | 'login' | null;
}

const defaultModalState: ActionModalState = {
  isOpen: false,
  variant: 'confirm',
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  showCancelButton: true,
  showInput: false,
  inputPlaceholder: '',
  inputRequired: false,
  isLoading: false,
  action: null,
};

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
    EventPeopleDrawerComponent,
    ChatComponent,
    EventCommentsComponent,
    ActionModalComponent,
    InlineLoaderComponent,
    EventDetailsSkeletonComponent,
    MatTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
})
export class EventDetailsComponent {
  @ViewChild(EventGallerySectionComponent) private gallerySection?: EventGallerySectionComponent;
  @ViewChild(EventHeroComponent) private heroComponent?: EventHeroComponent;

  readonly isHeroCtaVisible = signal<boolean>(true);

  private readonly route = inject(ActivatedRoute);
  private readonly eventsService = inject(EventsService);
  private readonly authService = inject(AuthService);
  private readonly sharedService = inject(SharedService);
  private readonly routeService = inject(RouteService);
  private readonly appDrawerService = inject(AppDrawerService);
  private readonly platform = inject(BrowserService);
  private readonly socketService = inject(SocketService);
  private readonly eventJoinStatusStore = inject(EventJoinStatusStore);
  private readonly toastService = inject(ToastService);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);

  private readonly openCapacityLimit = 999999;
  private fetchedJoinStatusKey = '';
  private refreshedAcceptedMembershipKey = '';

  // ── Unified loading & core state ──
  readonly isLoadingEvent = signal<boolean>(true);
  readonly hasLoadingError = signal<boolean>(false);
  readonly loadingErrorMessage = signal<string>('');

  eventId = toSignal(this.route.params.pipe(map((params) => params['eventId'] ?? '')), { initialValue: '' });
  eventDetails = signal<EventDetails | null>(null);
  attendeeProfiles = signal<AttendeeProfile[]>([]);
  eventGalleryImages = signal<GalleryImage[]>([]);
  relatedEvents = signal<any[]>([]);
  currentUser = toSignal(this.authService.userDetails$);
  notifications = toSignal(this.socketService.notifications$);

  // ── UI state ──
  isAuthInitialized = toSignal(this.authService.isAuthInitialized$, { initialValue: false });
  isJoinRequestPending = signal(false);
  isUploadingGallery = signal(false);
  isChatOpen = signal(false);
  isEventMenuOpen = signal(false);
  activeDrawer = signal<'requests' | 'attendees' | null>(null);
  requestActionStates = signal<Record<string, RequestActionState>>({});
  deletingGalleryImagePath = signal('');
  actionModal = signal<ActionModalState>({ ...defaultModalState });
  private readonly now = signal(Date.now());

  // ── Derived data ──
  attendees = computed(() => this.eventDetails()?.attendees ?? []);
  totalAttendeesCount = computed(() => this.attendees().length + 1); // +1 includes the creator
  nonHostAttendeeProfiles = computed(() => {
    const creator = this.eventDetails()?.createdBy as any;
    const creatorId = creator?._id || creator?.id || (typeof creator === 'string' ? creator : '');
    return this.attendeeProfiles().filter((attendee) => attendee.userId !== creatorId);
  });
  attendeePreviewProfiles = computed(() => this.nonHostAttendeeProfiles().slice(0, 5));

  currentUserId = computed(() => this.currentUser()?.id || this.currentUser()?._id || '');

  isLoggedIn = computed(() => {
    const user = this.currentUser();
    return !!(user?.id || user?._id || user?.username || user?.email);
  });

  canAccessPrivateEventData = computed(() => {
    const details = this.eventDetails();
    const userId = this.currentUser()?.id || this.currentUser()?._id;
    const creator = details?.createdBy as any;
    const creatorId = creator?._id || creator?.id || (typeof creator === 'string' ? creator : '');
    const isAttendee = this.attendees().some((attendee: any) =>
      (typeof attendee === 'string' ? attendee : attendee?._id || attendee?.id) === userId);
    const isMember = this.isLoggedIn() && !!userId && (isAttendee || userId === creatorId);

    return isMember;
  });
  isUserAttendee = computed(() => this.canAccessPrivateEventData());
  isEventCreator = computed(() => {
    const user = this.currentUser();
    const userId = user?.id || user?._id;
    const details = this.eventDetails();
    const creator = details?.createdBy as any;
    const creatorId = creator?._id || creator?.id || (typeof creator === 'string' ? creator : '');
    return this.isLoggedIn() && !!userId && userId === creatorId;
  });
  isCancelled = computed(() => {
    const status = String(this.eventDetails()?.['status'] || '').toLowerCase();
    return status === 'cancelled' || status === 'canceled';
  });
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
    const details = this.eventDetails();
    if (details?.endDate && !details.endTime) {
      const end = new Date(details.endDate);
      end.setHours(23, 59, 59, 999);
      return end.getTime() <= this.now();
    }
    const eventDateTime = getEventDateTime(
      details,
      details?.endTime || details?.eventTime,
      details?.endDate || details?.eventDate,
    );
    return eventDateTime ? eventDateTime.getTime() <= this.now() : false;
  });

  isEscapeEvent = computed(() => {
    const details = this.eventDetails();
    const category = details?.category;
    const hasEndDate = Boolean(details?.endDate);
    const categoryTitle = String((category as any)?.title || (category as any)?.name || category || '').toLowerCase();

    return (hasEndDate && !details?.endTime) || categoryTitle.includes('escape') || categoryTitle.includes('travel') || categoryTitle.includes('trip');
  });
  isSocialEvent = computed(() => isPartyPlayHangout(this.eventDetails()?.category));
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

    if (diffMs < 0) return this.isEventEnded() ? 'Event ended' : 'Happening now';
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
    const attendees = this.nonHostAttendeeProfiles();
    const total = attendees.length;
    const userId = this.currentUserId();
    const isListedAttendee = !!userId && attendees.some((attendee) => attendee.userId === userId);
    const status = this.isEventEnded() ? 'Attended' : 'Going';

    if (total === 0) return '';
    if (total === 1) return status;

    if (isListedAttendee) {
      const others = total - 1;
      return `You + ${others} ${others === 1 ? 'other' : 'others'}`;
    }

    return `${total} ${total === 1 ? 'person' : 'people'} ${this.isEventEnded() ? 'attended' : 'going'}`;
  });

  eventPriceLabel = computed(() => {
    if (this.isEventEnded()) return '';

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
      case 'women': return 'female';
      case 'men': return 'male';
      default: return 'public';
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
    return this.nonHostAttendeeProfiles().map((attendee) => ({
      userId: attendee.userId,
      userName: attendee.userName,
      profileImage: attendee.profileImage,
      role: 'Attendee' as const,
    }));
  });

  constructor() {

    this.eventsService.eventUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedEventId) => {
        if (updatedEventId === this.eventId()) {
          this.fetchEventDetails(updatedEventId, false);
        }
      });

    effect(() => {
      const eventId = this.eventId();
      if (eventId) this.fetchEventDetails(eventId, true);
    });

    effect(() => {
      const userId = this.currentUser()?.id || this.currentUser()?._id;
      if (userId && !this.isLoadingEvent()) this.syncJoinStatusForCurrentUser();
      if (!this.canAccessPrivateEventData()) this.isChatOpen.set(false);
    });

    effect(() => {
      const eventId = this.eventId();
      const userId = this.currentUser()?.id || this.currentUser()?._id;
      const joinStatus = this.eventJoinStatusStore.statusFor(eventId);

      if (joinStatus !== 'accepted') {
        this.refreshedAcceptedMembershipKey = '';
        return;
      }

      if (!eventId || !userId || !this.eventDetails() || this.canAccessPrivateEventData()) return;

      const refreshKey = `${eventId}:${userId}`;
      if (this.refreshedAcceptedMembershipKey === refreshKey) return;

      this.refreshedAcceptedMembershipKey = refreshKey;
      this.fetchEventDetails(eventId, false);
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

      if (this.platform.isBrowserPlatform()) {
        const checkVisibility = () => {
          const target = this.heroComponent?.heroActionContainer?.nativeElement
            || this.heroComponent?.heroCtaBtn?.nativeElement
            || document.querySelector('.hero-actions-container')
            || document.querySelector('.hero-action-row');

          if (target) {
            const rect = target.getBoundingClientRect();
            // When hero CTA is above 75px from top (scrolled out of view), show bottom sticky bar
            const isVisible = rect.bottom > 75 && rect.top < (window.innerHeight || 800);
            this.isHeroCtaVisible.set(isVisible);
          } else {
            this.isHeroCtaVisible.set(window.scrollY < 240);
          }
        };

        window.addEventListener('scroll', checkVisibility, { passive: true });
        window.addEventListener('resize', checkVisibility, { passive: true });
        checkVisibility();

        const t1 = setTimeout(checkVisibility, 250);
        const t2 = setTimeout(checkVisibility, 750);
        const t3 = setTimeout(checkVisibility, 1500);

        this.destroyRef.onDestroy(() => {
          window.removeEventListener('scroll', checkVisibility);
          window.removeEventListener('resize', checkVisibility);
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        });
      }
    });
  }

  retryLoadEvent(): void {
    const id = this.eventId();
    if (id) {
      this.fetchEventDetails(id, true);
    }
  }

  private fetchEventDetails(eventId: string, showLoader: boolean = true): void {
    if (!eventId) return;

    if (showLoader) {
      this.isLoadingEvent.set(true);
      this.hasLoadingError.set(false);
      this.loadingErrorMessage.set('');
    }


    this.eventsService.getEventDetails(eventId).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200 || !res.data) {
          console.warn('Unexpected response format or status code:', res);
          if (showLoader) {
            this.hasLoadingError.set(true);
            this.loadingErrorMessage.set('The requested event could not be found or has been removed.');
            this.isLoadingEvent.set(false);
          }
          return;
        }

        const details: EventDetails = res.data ?? {};
        details.image = this.sharedService.getImageUrl(details.image);

        const galleryImages: GalleryImage[] = Array.isArray(details.gallery)
          ? details.gallery.map((image: any) => {
            if (typeof image === 'object' && image !== null) {
              return {
                path: image.path || image.url,
                url: this.sharedService.getImageUrl(image.path || image.url),
                uploaderId: image.uploaderId || image.uploadedBy || image.userId || image.createdBy,
              };
            }
            return { path: image, url: this.sharedService.getImageUrl(image) };
          })
          : [];
        details.gallery = galleryImages.map((image) => image.url);

        this.eventDetails.set(details);
        this.eventGalleryImages.set(galleryImages);

        const attendees = Array.isArray(details.attendees) ? details.attendees : [];
        this.attendeeProfiles.set(attendees.map((attendee: any) => ({
          userId: attendee?._id || attendee?.id || attendee,
          userName: attendee?.username || '',
          profileImage: attendee?.profileImage || '',
        })));
        if (showLoader) this.isLoadingEvent.set(false);
      },
      error: (err) => {
        console.error('Error fetching event details:', err);
        if (showLoader) {
          this.hasLoadingError.set(true);
          this.loadingErrorMessage.set('Unable to load event details. Please check your internet connection and try again.');
          this.isLoadingEvent.set(false);
        }
      }
    });
  }

  private syncJoinStatusForCurrentUser(): void {
    const eventId = this.eventId();
    const userId = this.currentUser()?.id || this.currentUser()?._id;
    if (!eventId || !userId || this.isEventCreator() || !this.authService.isLoggedIn()) return;

    const fetchKey = `${eventId}:${userId}`;
    if (this.fetchedJoinStatusKey === fetchKey) return;

    this.fetchedJoinStatusKey = fetchKey;
    this.eventsService.getJoinStatus(eventId, userId).subscribe((res: any) => {
      if (res?.success) this.eventJoinStatusStore.setApiStatus(eventId, res.data?.status);
    });
  }

  requestJoinEvent(): void {
    const eventId = this.eventId();
    const user = this.currentUser();

    // Guest user handling: prompt to login
    if (!user || !user.id) {
      const returnUrl = `/events/${eventId}`;
      this.toastService.info('Please sign in to join this event.', 'Sign In Required', {
        action: {
          label: 'Sign In',
          onClick: () => {
            this.routeService.navigateByUrl(`/login?redirect=${encodeURIComponent(returnUrl)}`);
          }
        }
      });

      this.actionModal.set({
        ...defaultModalState,
        isOpen: true,
        variant: 'info',
        title: 'Sign In to Join Event',
        message: 'You need an account to request to join this vibe, connect with attendees, and stay updated.',
        confirmLabel: 'Sign In / Register',
        cancelLabel: 'Not Now',
        showCancelButton: true,
        showInput: false,
        action: 'login',
      });
      return;
    }

    if (!eventId || this.isJoinRequestPending()) return;

    this.isJoinRequestPending.set(true);
    this.eventsService.requestJoinEvent(eventId, user.id).subscribe({
      next: (res: any) => {
        this.isJoinRequestPending.set(false);
        if (!res?.success || res.statusCode !== 200) {
          const message = res?.message || 'Could not send join request. Please try again.';
          this.toastService.error(message, 'Request Failed');
          return;
        }
        this.eventJoinStatusStore.setStatus(eventId, 'pending');
        this.toastService.success('Your join request was sent to the host!', 'Request Sent');
      },
      error: (err: any) => {
        this.isJoinRequestPending.set(false);
        const message = err?.error?.message || err?.message || 'Failed to send request. Please check connection.';
        this.toastService.error(message, 'Request Error');
      }
    });
  }

  acceptJoinRequest(request: JoinRequestView): void {
    this.requestActionStates.update((states) => ({ ...states, [request.id]: 'processing' }));

    this.eventsService.acceptJoinRequest(this.eventId(), request.senderId).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          this.requestActionStates.update((states) => ({ ...states, [request.id]: 'pending' }));
          this.toastService.error(res?.message || 'Could not accept request.', 'Error');
          return;
        }

        this.requestActionStates.update((states) => ({ ...states, [request.id]: 'accepted' }));
        this.toastService.success(`${request.senderName || 'Member'} has been added to attendees!`, 'Request Accepted');
        this.fetchEventDetails(this.eventId(), false);
      },
      error: (err) => {
        this.requestActionStates.update((states) => ({ ...states, [request.id]: 'pending' }));
        this.toastService.error('Failed to accept join request.', 'Error');
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
          this.toastService.error(res?.message || 'Could not decline request.', 'Error');
          return;
        }
        this.requestActionStates.update((states) => ({ ...states, [request.id]: 'rejected' }));
        this.toastService.info('Join request declined.', 'Request Declined');
      },
      error: (err) => {
        this.requestActionStates.update((states) => ({ ...states, [request.id]: 'pending' }));
        this.toastService.error('Failed to decline request.', 'Error');
        console.error('Reject join request failed:', err);
      },
    });
  }

  openPersonProfile(userId: string): void {
    if (!userId) return;
    this.routeService.navigateByUrl(`/profile?userId=${encodeURIComponent(userId)}`);
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
    this.appDrawerService.openEditEvent(this.eventId());
  }

  async onUploadPhotos(files: File[]): Promise<void> {
    if (!this.isUserAttendee() || this.isUploadingGallery()) return;

    this.isUploadingGallery.set(true);
    const eventId = this.eventId();
    const userId = this.currentUserId();

    const formData = new FormData();
    formData.append('eventId', eventId);
    if (userId) {
      formData.append('uploaderId', userId);
    }
    for (const file of files) {
      const finalFile = await this.sharedService.convertHeicToJpg(file);
      formData.append('gallery', finalFile);
    }

    this.eventsService.updateEvent(formData).subscribe({
      next: (res: any) => {
        this.isUploadingGallery.set(false);
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          this.toastService.error(res?.message || 'Failed to upload photos.', 'Upload Error');
          return;
        }

        const gallery = Array.isArray(res.data?.event?.gallery) ? res.data.event.gallery : [];
        this.eventGalleryImages.set(gallery.map((image: any) => {
          if (typeof image === 'object' && image !== null) {
            return {
              path: image.path || image.url,
              url: this.sharedService.getImageUrl(image.path || image.url),
              uploaderId: image.uploaderId || image.uploadedBy || image.userId || image.createdBy || userId,
            };
          }
          return {
            path: image,
            url: this.sharedService.getImageUrl(image),
            uploaderId: userId,
          };
        }));
        this.toastService.success('Photos added to event gallery!', 'Photos Uploaded');
      },
      error: (err: any) => {
        this.isUploadingGallery.set(false);
        console.error('Error uploading gallery photos:', err);
        this.toastService.error('Failed to upload photos. Please try again.', 'Upload Error');
      },
    });
  }

  onDeleteGalleryImage(imagePath: string): void {
    const eventId = this.eventId();
    if (!this.isUserAttendee() || !eventId || !imagePath || this.deletingGalleryImagePath()) return;

    const targetImage = this.eventGalleryImages().find((img) => img.path === imagePath || img.url === imagePath);
    const userId = this.currentUserId();
    const canDeleteThis = this.isEventCreator() || (targetImage?.uploaderId && String(targetImage.uploaderId) === String(userId));

    if (!canDeleteThis) {
      this.toastService.error('You can only delete photos that you uploaded.', 'Permission Denied');
      return;
    }

    this.deletingGalleryImagePath.set(imagePath);
    this.eventsService.removeEventGalleryImage(eventId, imagePath).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          this.toastService.error(res?.message || 'Failed to delete photo.', 'Error');
          return;
        }

        this.eventGalleryImages.update((images) => images.filter((image) => image.path !== imagePath && image.url !== imagePath));
        this.gallerySection?.closeGalleryPreview();
        this.toastService.info('Photo removed from gallery.', 'Photo Removed');
      },
      error: (err: any) => {
        console.error('Error removing gallery image:', err);
        this.toastService.error('Could not remove photo.', 'Error');
      },
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

  async shareCurrentEvent(): Promise<void> {
    const event = this.eventDetails();
    const eventTitle = event?.title || 'Check out this event on Viblooop';
    const eventDesc = event?.description ? event.description.substring(0, 120) + '...' : 'Discover and join events on Viblooop!';
    const url = this.platform.isBrowserPlatform() ? window.location.href : '';

    if (this.platform.isBrowserPlatform() && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: eventTitle,
          text: `${eventTitle} — ${eventDesc}`,
          url: url,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
      }
    }

    if (this.platform.isBrowserPlatform() && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        this.toastService.success('Event link copied to clipboard!', 'Link Copied');
      } catch {
        this.toastService.info(url, 'Event Link');
      }
    }
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

  // ── Modal flows for event actions ──

  openDeleteConfirmation(): void {
    this.isEventMenuOpen.set(false);
    this.actionModal.set({
      ...defaultModalState,
      isOpen: true,
      variant: 'error',
      title: 'Delete Event?',
      message: 'This will permanently delete the event and its pending join requests. This action cannot be undone. Events with attendees must be cancelled instead.',
      confirmLabel: 'Yes, Delete Event',
      showInput: false,
      action: 'delete',
    });
  }

  openCancelConfirmation(): void {
    this.isEventMenuOpen.set(false);
    this.actionModal.set({
      ...defaultModalState,
      isOpen: true,
      variant: 'warning',
      title: 'Cancel Event?',
      message: 'This will cancel the event. Please provide a reason to share with attendees.',
      confirmLabel: 'Yes, Cancel Event',
      cancelLabel: 'Keep Event',
      showInput: true,
      inputPlaceholder: 'Why are you cancelling this event?',
      inputRequired: true,
      action: 'cancel',
    });
  }

  openLeaveConfirmation(): void {
    this.actionModal.set({
      ...defaultModalState,
      isOpen: true,
      variant: 'confirm',
      title: 'Leave Event',
      message: 'You will be removed from the attendee list. The host will be notified.',
      confirmLabel: 'Leave Event',
      showInput: true,
      inputPlaceholder: 'Why are you leaving? (optional for the host)',
      inputRequired: true,
      action: 'leave',
    });
  }

  openCancelRequestConfirmation(): void {
    this.actionModal.set({
      ...defaultModalState,
      isOpen: true,
      variant: 'confirm',
      title: 'Cancel Join Request?',
      message: 'Are you sure you want to withdraw your request to join this event?',
      confirmLabel: 'Withdraw Request',
      action: 'cancelRequest',
    });
  }

  onModalConfirmed(inputValue: string): void {
    const action = this.actionModal().action;
    switch (action) {
      case 'delete':
        this.performDeleteEvent();
        break;
      case 'cancel':
        this.performCancelEvent(inputValue);
        break;
      case 'leave':
        this.performLeaveEvent(inputValue);
        break;
      case 'cancelRequest':
        this.performCancelRequest();
        break;
      case 'login':
        this.onModalCancelled();
        this.routeService.navigateByUrl(`/login?redirect=${encodeURIComponent(`/events/${this.eventId()}`)}`);
        break;
      default:
        this.onModalCancelled();
        break;
    }
  }

  onModalCancelled(): void {
    this.actionModal.set({ ...defaultModalState });
  }

  private performDeleteEvent(): void {
    this.actionModal.update((state) => ({ ...state, isLoading: true }));
    const eventId = this.eventId();

    this.eventsService.deleteEvent(eventId).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.showErrorModal(res?.message || 'Failed to delete event');
          return;
        }
        this.toastService.info('Event permanently deleted.', 'Event Deleted');
        this.actionModal.set({
          ...defaultModalState,
          isOpen: true,
          variant: 'success',
          title: 'Event Deleted',
          message: 'The event has been permanently deleted.',
          confirmLabel: 'Done',
          showCancelButton: false,
          action: null,
        });
      },
      error: (err: any) => {
        const message = err?.error?.message || err?.message || 'Failed to delete event';
        this.showErrorModal(message);
      },
    });
  }

  private performCancelEvent(reason: string): void {
    this.actionModal.update((state) => ({ ...state, isLoading: true }));
    const eventId = this.eventId();

    this.eventsService.cancelEvent(eventId, reason).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.showErrorModal(res?.message || 'Failed to cancel event');
          return;
        }
        this.toastService.warning('Event has been cancelled. Attendees notified.', 'Event Cancelled');
        this.actionModal.set({
          ...defaultModalState,
          isOpen: true,
          variant: 'success',
          title: 'Event Cancelled',
          message: 'All attendees have been notified about the cancellation.',
          confirmLabel: 'Done',
          showCancelButton: false,
          action: null,
        });
        this.fetchEventDetails(eventId, false);
      },
      error: (err: any) => {
        const message = err?.error?.message || err?.message || 'Failed to cancel event';
        this.showErrorModal(message);
      },
    });
  }

  private performLeaveEvent(reason: string): void {
    this.actionModal.update((state) => ({ ...state, isLoading: true }));
    const eventId = this.eventId();

    this.eventsService.leaveEvent(eventId, reason).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.showErrorModal(res?.message || 'Failed to leave event');
          return;
        }
        this.toastService.success('You have left the event.', 'Event Left');
        this.eventJoinStatusStore.setStatus(eventId, 'none');
        this.actionModal.set({
          ...defaultModalState,
          isOpen: true,
          variant: 'success',
          title: 'You Left the Event',
          message: 'You have been removed from the attendee list. The host has been notified.',
          confirmLabel: 'Done',
          showCancelButton: false,
          action: null,
        });
        this.fetchEventDetails(eventId, false);
      },
      error: (err: any) => {
        const message = err?.error?.message || err?.message || 'Failed to leave event';
        this.showErrorModal(message);
      },
    });
  }

  private performCancelRequest(): void {
    this.actionModal.update((state) => ({ ...state, isLoading: true }));
    const eventId = this.eventId();

    this.eventsService.cancelJoinRequest(eventId).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.showErrorModal(res?.message || 'Failed to cancel join request');
          return;
        }
        this.toastService.info('Your join request has been cancelled.', 'Request Cancelled');
        this.eventJoinStatusStore.setStatus(eventId, 'none');
        this.actionModal.set({ ...defaultModalState });
        this.fetchEventDetails(eventId, false);
      },
      error: (err: any) => {
        const message = err?.error?.message || err?.message || 'Failed to cancel join request';
        this.showErrorModal(message);
      },
    });
  }

  private showErrorModal(message: string): void {
    this.actionModal.set({
      ...defaultModalState,
      isOpen: true,
      variant: 'error',
      title: 'Something Went Wrong',
      message,
      confirmLabel: 'Close',
      showCancelButton: false,
      action: null,
    });
  }

  /** Called when a non-action success/error modal's confirm button is clicked (just close). */
  onResultModalDismissed(): void {
    const modal = this.actionModal();
    // If this was a successful delete, navigate away
    if (modal.variant === 'success' && modal.title === 'Event Deleted') {
      this.actionModal.set({ ...defaultModalState });
      this.routeService.navigateByUrl('/');
      return;
    }
    this.actionModal.set({ ...defaultModalState });
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

function getEventDateTime(details: EventDetails | null, timeValue?: string, dateValue?: string | Date): Date | null {
  const resolvedDate = dateValue || details?.eventDate;
  if (!resolvedDate) return null;

  const eventDateTime = new Date(resolvedDate);
  if (Number.isNaN(eventDateTime.getTime())) return null;

  const eventTime = String(timeValue ?? details?.eventTime ?? '').trim();
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
