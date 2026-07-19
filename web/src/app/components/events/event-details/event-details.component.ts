import { Component, DestroyRef, ElementRef, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../../../shared/services/events/events.service';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SharedService } from '../../../shared/services/shared.service';
import { ProfileComponent } from '../../user/profile/profile.component';
import { MatTooltip } from '@angular/material/tooltip';
import { RouteService } from '../../../shared/services/route/route.service';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps';
import { BrowserService } from '../../../shared/services/browser/browser.service';
import { Environment } from '../../../../environment';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { HttpService } from '../../../shared/services/http/http.service';
import { ChatComponent } from '../../chat/chat.component';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { GalleryComponent, GalleryImage } from '../../../shared/components/gallery/gallery.component';
import { EventCommentsComponent } from '../../../shared/components/event-comments/event-comments.component';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { EventJoinStatusStore } from '../../../shared/services/events/event-join-status.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface AttendeesProfile {
  profileImage: string;
  userId: string;
  userName: string;
}

@Component({
  selector: 'vl-event-details',
  imports: [DatePipe, ProfileComponent, MatTooltip, CommonModule, GoogleMapsModule, GoogleMap, MapMarker, ChatComponent, ImageUrlPipe, GalleryComponent, EventCommentsComponent, EventCardComponent],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss'
})
export class EventDetailsComponent implements OnInit {
  @ViewChild('photoUploadInput') photoUpload!: ElementRef<HTMLInputElement>;
  @ViewChild('eventGalleryPreview') eventGalleryPreview?: GalleryComponent;
  @ViewChild(GoogleMap) map!: GoogleMap;

  eventDetails: any = [];
  relatedEvents: any[] = [];
  isChatOpen = signal(false);
  activeEventDrawer: 'requests' | 'attendees' | null = null;

  route: ActivatedRoute = inject(ActivatedRoute)
  eventsService = inject(EventsService)
  authService = inject(AuthService);
  _shared = inject(SharedService);
  routeService = inject(RouteService);
  platform = inject(BrowserService)
  socketService = inject(SocketService)
  httpService = inject(HttpService)
  eventJoinStatusStore = inject(EventJoinStatusStore)
  private readonly destroyRef = inject(DestroyRef);

  currentEventId = signal('');
  eventAccessVersion = signal(0);
  joinRequestStatus = computed(() => this.eventJoinStatusStore.labelFor(this.currentEventId()));
  canRequestJoin = computed(() => this.eventJoinStatusStore.canRequestJoin(this.currentEventId()));
  canAccessPrivateEventData = computed(() => {
    this.eventAccessVersion();

    const eventId = this.currentEventId();
    const joinStatus = this.eventJoinStatusStore.statusFor(eventId);

    return this.isCurrentUserEventMember() || joinStatus === 'accepted';
  });
  isMapVisible = computed(() => this.canAccessPrivateEventData() && this.hasEventCoordinates());
  isChatVisible = computed(() => this.canAccessPrivateEventData());

  attendees: string[] = []
  attendessProfiles: AttendeesProfile[] = []
  eventId = ''
  userProfile: any = []
  profileData: any = {}

  isOpen = false;
  isFullAddressVisible: boolean = false;
  eventGalleryImages: GalleryImage[] = [];
  deletingGalleryImagePath = '';
  uploadedPhotos: File[] = [];
  previewPhotos: string[] = [];
  averageRating: number = 0;
  isEventMenuOpen = false;
  requestActionStates: Record<string, 'pending' | 'processing' | 'accepted' | 'rejected'> = {};
  private readonly openCapacityLimit = 999999;
  private fetchedJoinStatusKey = '';

  position: google.maps.LatLngLiteral = {
    lat: 0,
    lng: 0
  };

  options: google.maps.MapOptions = {
    center: this.position,
    zoom: 16
  };

  ngOnInit() {
    this.route.params.subscribe(params => {
      const eventId = params['eventId'];
      this.getEventDetails(eventId);
    })

    this.authService.userDetails$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshEventAccessState();
        this.syncJoinStatusForCurrentUser();
      });
  }


  getCommentStatus() {
    return this.isUserAttendee() ? 'Be the first to comment' : 'Please join the event to comment'
  }

  showFullAddress() {
    this.isFullAddressVisible = !this.isFullAddressVisible;
  }

  getEventDetails(eventId: string) {
    this.eventsService.getEventDetails(eventId).subscribe(
      (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }
        this.eventDetails = res.data ?? {};
        if (this.eventDetails) {
          this.attendees = Array.isArray(this.eventDetails.attendees) ? this.eventDetails.attendees : [];
          this.eventId = this.eventDetails._id;
          this.currentEventId.set(this.eventId);
          this.eventDetails.image = this._shared.getImageUrl(this.eventDetails.image);
          this.eventGalleryImages = Array.isArray(this.eventDetails.gallery)
            ? this.eventDetails.gallery.map((image: string) => ({
              path: image,
              url: this._shared.getImageUrl(image),
            }))
            : [];
          this.eventDetails.gallery = this.eventGalleryImages.map((image) => image.url);
          
          // Safely set average rating
          const rawRating = this.eventDetails?.createdBy?.averageRating;
          this.averageRating = rawRating ? parseFloat(rawRating) : 0;

          const eventLocation = this.getEventLocation();
          if (eventLocation?.coordinates?.length === 2) {
            this.position = { 
              lat: eventLocation.coordinates[1], 
              lng: eventLocation.coordinates[0] 
            };
            this.options = { ...this.options, center: this.position, zoom: 16 };
          }
          this.refreshEventAccessState();

          this.getUserProfile();
          this.getAttendeesDetails();
          this.syncJoinStatusForCurrentUser();
          this.fetchRelatedNearbyEvents();
        }
      })
  }

  syncJoinStatusForCurrentUser() {
    const userId = this.authService.userDetails?.id;
    if (!this.eventId || !userId) return;

    const fetchKey = `${this.eventId}:${userId}`;
    if (this.fetchedJoinStatusKey === fetchKey) return;

    this.fetchedJoinStatusKey = fetchKey;
    this.eventsService.getJoinStatus(this.eventId, userId).subscribe((res: any) => {
      if (res?.success) {
        this.eventJoinStatusStore.setApiStatus(this.eventId, res.data?.status);
      }
    });
  }

  fetchRelatedNearbyEvents() {
    this.eventsService.getRelatedNearbyEvents(this.eventId).subscribe((res: any) => {
      if (res?.success && res.data) {
        this.relatedEvents = res.data;
      }
    });
  }

  // Location coords now read directly from event.location.coordinates

  openInGoogleMaps() {
    if (!this.position?.lat || !this.position?.lng) {
      console.warn('Coordinates not available.');
      return;
    }

    const lat = this.position.lat;
    const lng = this.position.lng;

    if (!this.platform.isBrowserPlatform()) {
      console.warn('Platform not supported.');
      return;
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `${Environment.googleMapsSearchUrl}?api=1&query=${lat},${lng}`;
    } else {
      window.open(`${Environment.googleMapsUrl}?q=${lat},${lng}`, '_blank');
    }
  }


  requestJoinEvent() {
    this.httpService.post(Environment.apiBaseUrl + '/requestJoinEvent', {
      eventId: this.eventDetails._id,
      userId: this.authService.userDetails.id
    }).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }
      this.eventJoinStatusStore.setStatus(this.eventId, 'pending');
    })
  }

  isUserAttendee() {
    return this.canAccessPrivateEventData();
  }

  private isCurrentUserEventMember(): boolean {
    const userId = this.authService.userDetails?.id;
    if (!this.authService.isLoggedIn() || !userId) return false;

    return this.attendees.includes(userId) || userId === this.eventDetails?.createdBy?._id;
  }

  private hasEventCoordinates(): boolean {
    const coordinates = this.getEventLocation()?.coordinates;
    return Array.isArray(coordinates)
      && coordinates.length === 2
      && Number.isFinite(Number(coordinates[0]))
      && Number.isFinite(Number(coordinates[1]));
  }

  private getEventLocation(): any {
    return this.eventDetails?.address?.location || this.eventDetails?.location;
  }

  private refreshEventAccessState(): void {
    this.eventAccessVersion.update((version) => version + 1);

    if (!this.canAccessPrivateEventData()) {
      this.isChatOpen.set(false);
    }
  }

  isEventCreator() {
    return this.authService.isLoggedIn() && this.authService.userDetails.id === (this.eventDetails?.createdBy?._id);
  }

  canLeaveReview() {
    return this.isUserAttendee() && !this.isEventCreator();
  }

  getRemainingSpots(): number {
    if (!this.eventDetails || !this.eventDetails.attendeeLimit) return 0;
    if (this.isCapacityUnlimited(this.eventDetails.attendeeLimit)) return 0;
    const remaining = this.eventDetails.attendeeLimit - (this.attendees.length + 1); // +1 includes the creator
    return Math.max(0, remaining);
  }

  get remainingSpotsLabel(): string {
    return this.isCapacityUnlimited(this.eventDetails?.attendeeLimit) ? 'No limit' : `${this.getRemainingSpots()} left`;
  }

  getTotalAttendeesCount(): number {
    return this.attendees.length + 1; // +1 includes the creator
  }

  getArrayForNumber(number: number) {
    return Array.from({ length: number }, (_, index) => index + 1);
  }

  getUserProfile() {
    if (!this.authService.userDetails || !this.authService.userDetails.id) return
    this.authService.getMyProfile().subscribe((res: any) => {
      console.log(res)

      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.userProfile = res.data
    })
  }

  getAttendeesDetails() {
    if (!this.attendees.length) {
      this.attendessProfiles = [];
      return;
    }

    this.eventsService.getAttendeeDetails(this.attendees).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }
      this.attendessProfiles = res.data;
    })
  }

  openRequestsDrawer() {
    if (!this.isEventCreator()) return;
    this.activeEventDrawer = 'requests';
  }

  openAttendeesDrawer() {
    this.activeEventDrawer = 'attendees';
  }

  closeEventDrawer() {
    this.activeEventDrawer = null;
  }

  acceptJoinRequest(notification: any) {
    const notificationId = this.getNotificationId(notification);
    if (!notificationId) return;

    this.requestActionStates[notificationId] = 'processing';
    this.httpService.post(Environment.apiBaseUrl + '/acceptJoinRequest', {
      eventId: this.getNotificationEventId(notification),
      userId: this.getNotificationSenderId(notification),
    }).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          this.requestActionStates[notificationId] = 'pending';
          return;
        }

        this.requestActionStates[notificationId] = 'accepted';
        if (this.eventId) {
          this.getEventDetails(this.eventId);
        }
      },
      error: (err) => {
        this.requestActionStates[notificationId] = 'pending';
        console.error('Accept join request failed:', err);
      }
    });
  }

  rejectJoinRequest(notification: any) {
    const notificationId = this.getNotificationId(notification);
    if (!notificationId) return;

    this.requestActionStates[notificationId] = 'processing';
    this.httpService.post(Environment.apiBaseUrl + '/rejectJoinEventRequest', {
      eventId: this.getNotificationEventId(notification),
      userId: this.getNotificationSenderId(notification),
    }).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          this.requestActionStates[notificationId] = 'pending';
          return;
        }

        this.requestActionStates[notificationId] = 'rejected';
      },
      error: (err) => {
        this.requestActionStates[notificationId] = 'pending';
        console.error('Reject join request failed:', err);
      }
    });
  }

  viewProfile(userId: string) {
    this._shared.viewProfile(userId).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.profileData.profile = res.profile;
      this.profileData.attendedEvents = res.attendedEvents;
      this.isOpen = true;
    })
  }

  openModal() {
    this.viewProfile(this.eventDetails.createdBy._id);
  }

  redirectToHostProfile() {
    const hostId = this.eventDetails?.createdBy?._id;
    if (!hostId) return;

    this.routeService.navigateByUrl(`/profile?userId=${encodeURIComponent(hostId)}`);
  }

  closeModal() {
    this.isOpen = false;
  }

  toggleEventMenu() {
    if (!this.isEventCreator()) return;
    this.isEventMenuOpen = !this.isEventMenuOpen;
  }

  closeEventMenu() {
    this.isEventMenuOpen = false;
  }

  openEditEvent() {
    if (!this.isEventCreator()) return;

    this.isEventMenuOpen = false;
    const editQueryParams = { mode: 'edit', eventId: this.eventId };
    this.routeService.navigateToDrawer(
      'create-event',
      `/create-event?mode=edit&eventId=${encodeURIComponent(this.eventId)}`,
      editQueryParams
    );
  }

  async onPhotoUpload(event: any): Promise<void> {
    if (!this.isEventCreator()) return;

    const files: File[] = Array.from(event.target.files);
    this.uploadedPhotos = [];
    this.previewPhotos = [];
    for (const file of files) {
      const finalFile = await this._shared.convertHeicToJpg(file);
      this.uploadedPhotos.push(finalFile);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.previewPhotos.push(reader.result.toString());
        }
      };
      reader.readAsDataURL(finalFile);
    }
    const formData = new FormData();
    formData.append('eventId', this.eventId);
    this.uploadedPhotos.forEach(file => {
      formData.append('gallery', file);
    });

    this.eventsService.updateEvent(formData).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        const gallery = Array.isArray(res.data?.event?.gallery) ? res.data.event.gallery : [];
        this.eventGalleryImages = gallery.map((image: string) => ({
          path: image,
          url: this._shared.getImageUrl(image),
        }));
        this.eventDetails.gallery = this.eventGalleryImages.map((image) => image.url);
        this.uploadedPhotos = [];
        this.previewPhotos = [];
        if (event.target) event.target.value = '';
      },
      error: (err: any) => {
        console.error('Error uploading gallery photos:', err);
      }
    });


  }

  triggerPhotoUpload() {
    if (!this.isEventCreator()) return;

    this.photoUpload.nativeElement.click();
  }

  openGalleryPreview(index: number) {
    this.eventGalleryPreview?.openAtIndex(index);
  }

  canDownloadGalleryImage() {
    return this.isUserAttendee();
  }

  removeGalleryImage(imagePath: string) {
    if (!this.isEventCreator() || !this.eventId || !imagePath || this.deletingGalleryImagePath) return;

    this.deletingGalleryImagePath = imagePath;
    this.eventsService.removeEventGalleryImage(this.eventId, imagePath).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        this.eventGalleryImages = this.eventGalleryImages.filter((image) => image.path !== imagePath);
        this.eventDetails.gallery = this.eventGalleryImages.map((image) => image.url);
        this.eventGalleryPreview?.closePreview();
      },
      error: (err: any) => {
        console.error('Error removing gallery image:', err);
        this.deletingGalleryImagePath = '';
      },
      complete: () => {
        this.deletingGalleryImagePath = '';
      }
    });
  }

  toggleChat() {
    if (!this.isChatVisible()) return;

    this.isChatOpen.update((isOpen) => !isOpen);
  }

  goBack() {
    if (this.platform.isBrowserPlatform()) {
      window.history.back();
    }
  }

  getTimeLeftString(): string {
    if (this.isEscapeEvent) return this.tripDateRangeLabel;
    if (!this.eventDetails?.eventDate || !this.eventDetails?.eventTime) return 'Date TBA';
    try {
      const eventDateTime = this.getEventDateTime();
      if (!eventDateTime) return 'Date TBA';
      const now = new Date();
      const diffMs = eventDateTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffMs < 0) return 'Event ended';
      if (diffMins < 60) return 'Starting soon';
      if (diffHrs < 24) return `Starts in ${diffHrs} hrs`;
      if (diffDays === 1) return 'Starts tomorrow';
      return `Starts in ${diffDays} days`;
    } catch { return 'Date TBA'; }
  }

  get isEventEnded(): boolean {
    const eventDateTime = this.getEventDateTime();
    return eventDateTime ? eventDateTime < new Date() : false;
  }

  get attendanceSummaryLabel(): string {
    const total = this.getTotalAttendeesCount();
    const status = this.isEventEnded ? 'attended' : 'going';
    const isCurrentUserIncluded = this.isUserAttendee();

    if (isCurrentUserIncluded) {
      const others = Math.max(total - 1, 0);
      if (others === 0) return `You ${status}`;
      return `You and ${others} ${others === 1 ? 'other' : 'others'} ${status}`;
    }

    return `${total} ${total === 1 ? 'person' : 'people'} ${status}`;
  }

  get pendingJoinRequestCount(): number {
    return this.pendingJoinRequests.length;
  }

  get pendingJoinRequests(): any[] {
    const notifications = this.socketService.notifications$.value;
    if (!Array.isArray(notifications) || !this.eventId) return [];

    return notifications.filter((notification: any) => {
      const notificationEventId = this.getNotificationEventId(notification);
      return notification?.type === 'JOIN_REQUEST'
        && notificationEventId === this.eventId
        && this.notificationRequestState(notification) === 'pending';
    });
  }

  get eventDrawerTitle(): string {
    return this.activeEventDrawer === 'requests' ? 'Pending Requests' : 'Attendees';
  }

  get eventDrawerSubtitle(): string {
    if (this.activeEventDrawer === 'requests') {
      return `${this.pendingJoinRequestCount} ${this.pendingJoinRequestCount === 1 ? 'request' : 'requests'} waiting for review`;
    }

    const total = this.eventDrawerAttendees.length;
    return `${total} ${total === 1 ? 'person' : 'people'} ${this.isEventEnded ? 'attended' : 'going'}`;
  }

  get eventDrawerAttendees(): Array<{ userId: string; userName: string; profileImage: string; role: 'Host' | 'Attendee' }> {
    const host = this.eventDetails?.createdBy;
    const attendees = this.attendessProfiles.map((attendee) => ({
      userId: attendee.userId,
      userName: attendee.userName,
      profileImage: attendee.profileImage,
      role: 'Attendee' as const,
    }));

    if (!host?._id) return attendees;

    return [
      {
        userId: host._id,
        userName: host.username || 'Host',
        profileImage: host.profileImage,
        role: 'Host' as const,
      },
      ...attendees,
    ];
  }

  getNotificationId(notification: any): string {
    return notification?._id || notification?.id || '';
  }

  getNotificationEventId(notification: any): string {
    return notification?.eventId?._id || notification?.eventId || '';
  }

  getNotificationSenderId(notification: any): string {
    return notification?.senderId?._id || notification?.sender?._id || notification?.senderId || '';
  }

  getNotificationSenderName(notification: any): string {
    return notification?.senderName || notification?.sender?.username || notification?.senderId?.username || 'Guest';
  }

  getNotificationSenderImage(notification: any): string {
    return notification?.senderImage || notification?.sender?.profileImage || notification?.senderId?.profileImage || '';
  }

  notificationRequestState(notification: any): 'pending' | 'processing' | 'accepted' | 'rejected' {
    const localState = this.requestActionStates[this.getNotificationId(notification)];
    if (localState) return localState;

    const status = String(notification?.status || 'pending').toLowerCase();
    if (status === 'processing' || status === 'accepted' || status === 'rejected' || status === 'pending') {
      return status;
    }

    return 'pending';
  }

  get isEscapeEvent(): boolean {
    const category = this.eventDetails?.category;
    const hasEndDate = Boolean(this.eventDetails?.endDate);
    const categoryTitle = String(category?.title || category?.name || category || '').toLowerCase();

    return hasEndDate || categoryTitle.includes('escape') || categoryTitle.includes('travel') || categoryTitle.includes('trip');
  }

  get tripDateRangeLabel(): string {
    const start = this.formatTripDate(this.eventDetails?.eventDate);
    const end = this.formatTripDate(this.eventDetails?.endDate);

    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    return 'Dates TBA';
  }

  get isUrgent(): boolean {
    const spots = this.getRemainingSpots();
    return spots > 0 && spots <= 5;
  }

  get eventPriceLabel(): string {
    if (this.eventDetails?.cost === 'Free') return 'Free';
    return this.eventDetails?.price ? '₹' + this.eventDetails.price : 'Free';
  }

  get audiencePreferenceType(): 'open' | 'women' | 'men' {
    const preference = String(this.eventDetails?.audiencePreference || '').toLowerCase();
    if (preference === 'women' || preference === 'men' || preference === 'open') return preference;

    const attendeeMix = Number(this.eventDetails?.attendeeMix);
    if (Number.isFinite(attendeeMix)) {
      if (attendeeMix <= 20) return 'women';
      if (attendeeMix >= 80) return 'men';
    }

    return 'open';
  }

  get audiencePreferenceLabel(): string {
    switch (this.audiencePreferenceType) {
      case 'women':
        return 'Women preferred';
      case 'men':
        return 'Men preferred';
      default:
        return 'Open to everyone';
    }
  }

  get audiencePreferenceIcon(): string {
    switch (this.audiencePreferenceType) {
      case 'women':
        return 'fa-solid fa-venus';
      case 'men':
        return 'fa-solid fa-mars';
      default:
        return 'fa-solid fa-earth-asia';
    }
  }

  get locationLabel(): string {
    const address = this.eventDetails?.address;
    const fullAddress = String(address?.fullAddress || '').trim();
    const partialAddress = String(address?.partialAddress || '').trim();

    if (fullAddress) return fullAddress;
    if (partialAddress) return partialAddress;

    const fallbackParts = [
      address?.area,
      address?.city,
      address?.state,
      address?.pinCode,
      address?.country
    ].filter(Boolean);

    return fallbackParts.length ? fallbackParts.join(', ') : 'Location TBA';
  }

  get locationSubtitle(): string {
    if (!this.showHostLocationVisibilityCopy) return '';

    return this.eventDetails?.address?.fullAddress
      ? 'Full address visible to you and attendees'
      : 'Exact address shared after joining';
  }

  get showHostLocationVisibilityCopy(): boolean {
    return this.isEventCreator();
  }

  get hostEventCount(): number {
    const count = Number(this.eventDetails?.createdBy?.eventCount);
    return Number.isFinite(count) && count > 0 ? count : 1;
  }

  get isNewHost(): boolean {
    return this.hostEventCount <= 1;
  }

  get hostRating(): number {
    const rating = Number(this.eventDetails?.createdBy?.averageRating);
    return Number.isFinite(rating) ? rating : 0;
  }

  get shouldShowHostRating(): boolean {
    return !this.isNewHost && this.hostRating > 3;
  }

  private isCapacityUnlimited(limit: unknown): boolean {
    return Number(limit) >= this.openCapacityLimit;
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

  private getEventDateTime(): Date | null {
    if (!this.eventDetails?.eventDate) return null;

    const eventDateTime = new Date(this.eventDetails.eventDate);
    if (Number.isNaN(eventDateTime.getTime())) return null;

    const eventTime = String(this.eventDetails?.eventTime || '').trim();
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
}
