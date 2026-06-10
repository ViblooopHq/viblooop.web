import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../../../shared/services/events/events.service';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SharedService } from '../../../shared/services/shared.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

export interface AttendeesProfile {
  profileImage: string;
  userId: string;
  userName: string;
}
@Component({
  selector: 'vl-event-details',
  imports: [DatePipe, ReactiveFormsModule, ProfileComponent, MatTooltip, CommonModule, GoogleMapsModule, GoogleMap, MapMarker, RouterLink, ChatComponent, ImageUrlPipe],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss'
})
export class EventDetailsComponent implements OnInit {
  @ViewChild('photoUploadInput') photoUpload!: ElementRef<HTMLInputElement>;
  @ViewChild(GoogleMap) map!: GoogleMap;

  eventDetails: any = [];
  isMapVisible = false;
  isChatVisible = false;

  route: ActivatedRoute = inject(ActivatedRoute)
  eventsService = inject(EventsService)
  authService = inject(AuthService);
  _shared = inject(SharedService);
  routeService = inject(RouteService);
  platform = inject(BrowserService)
  socketService = inject(SocketService)
  httpService = inject(HttpService)

  joinRequestStatus = signal('Request Join')

  ratingStar = 1
  hoverRating = 0;
  attendees: string[] = []
  attendessProfiles: AttendeesProfile[] = []
  eventId = ''
  eventReviews: any = []
  isSubmitting = false;
  stars = [1, 2, 3, 4, 5];
  userProfile: any = []
  reviewForm: FormGroup;
  profileData: any = {}

  isOpen = false;
  isFullAddressVisible: boolean = false;
  uploadedPhotos: File[] = [];
  previewPhotos: string[] = [];
  averageRating: number = 0;
  showAllReviews = false;

  position: google.maps.LatLngLiteral = {
    lat: 0,
    lng: 0
  };

  options: google.maps.MapOptions = {
    center: this.position,
    zoom: 16
  };

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      rating: [null, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const eventId = params['eventId'];
      this.getEventDetails(eventId);
    })
  }


  getCommentStatus() {
    return this.isUserAttendee() ? 'Be the first to comment' : 'Please join the event to comment'
  }

  get reviewList(): any[] {
    return Array.isArray(this.eventReviews) ? this.eventReviews : [];
  }

  get visibleReviews(): any[] {
    return this.showAllReviews ? this.reviewList : this.reviewList.slice(0, 3);
  }

  get reviewCount(): number {
    return this.reviewList.length;
  }

  get eventAverageRating(): number {
    const eventRating = Number(this.eventDetails?.averageRating);
    if (Number.isFinite(eventRating) && eventRating > 0) return eventRating;

    const ratings = this.reviewList
      .map((review: any) => Number(review?.score))
      .filter((score: number) => Number.isFinite(score));

    if (!ratings.length) return 0;

    const total = ratings.reduce((sum: number, score: number) => sum + score, 0);
    return total / ratings.length;
  }

  get reviewCommentLength(): number {
    return String(this.reviewForm.get('comment')?.value || '').length;
  }

  get shouldShowReviewToggle(): boolean {
    return this.reviewCount > 3;
  }

  toggleReviews() {
    this.showAllReviews = !this.showAllReviews;
  }

  setRatingCount(rating: number) {
    this.ratingStar = rating
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
          this.eventDetails.image = this._shared.getImageUrl(this.eventDetails.image);
          this.eventDetails.gallery = Array.isArray(this.eventDetails.gallery)
            ? this.eventDetails.gallery.map((image: string) => this._shared.getImageUrl(image))
            : [];
          
          // Safely set average rating
          const rawRating = this.eventDetails?.createdBy?.averageRating;
          this.averageRating = rawRating ? parseFloat(rawRating) : 0;

          const address = this.eventDetails.address;
          if (address) {
            setTimeout(() => {
              this.getLocationCoord([address.street, address.area, address.city].filter(Boolean).join(' '));
            }, 0)
          }

          this.getUserProfile();
          this.getEventRewiews();
          this.getAttendeesDetails();
          this.fetchJoinStatus();
        }
      })
  }

  fetchJoinStatus() {
    if (!this.authService.isLoggedIn()) return;
    const userId = this.authService.userDetails.id;
    this.eventsService.getJoinStatus(this.eventId, userId).subscribe((res: any) => {
      if (res?.success && res.data.status) {
        if (res.data.status === 'pending') {
          this.joinRequestStatus.set('Requested');
        } else if (res.data.status === 'accepted') {
          this.joinRequestStatus.set('Joined');
        } else if (res.data.status === 'rejected') {
          this.joinRequestStatus.set('Request Join');
        }
      }
    });
  }

  getLocationCoord(address: string) {
    this.eventsService.getLocationCoord(address).subscribe((res: any) => {
      if (!res?.success) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.position = { lat: res.data.latitude, lng: res.data.longitude };

      // this.map.panTo(this.position);

      this.options = {
        ...this.options,
        center: this.position,
        zoom: 16
      };

      if (this.position.lat !== 0 && this.position.lng !== 0) {
        this.isMapVisible = true;
      }
    })
  }

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
      this.joinRequestStatus.set('Requested');
    })
  }

  getTimeAgo(date: string) {
    return this._shared.calculateTimeAgo(date)
  }

  isUserAttendee() {
    let isAllowed = this.authService.isLoggedIn() && (this.attendees.includes(this.authService.userDetails.id) || this.authService.userDetails.id === (this.eventDetails.createdBy && this.eventDetails.createdBy._id))
    return isAllowed;
  }

  isEventCreator() {
    return this.authService.isLoggedIn() && this.authService.userDetails.id === (this.eventDetails?.createdBy?._id);
  }

  canLeaveReview() {
    return this.isUserAttendee() && !this.isEventCreator();
  }

  getRemainingSpots(): number {
    if (!this.eventDetails || !this.eventDetails.attendeeLimit) return 0;
    const remaining = this.eventDetails.attendeeLimit - (this.attendees.length + 1); // +1 includes the creator
    return Math.max(0, remaining);
  }

  getTotalAttendeesCount(): number {
    return this.attendees.length + 1; // +1 includes the creator
  }

  getArrayForNumber(number: number) {
    return Array.from({ length: number }, (_, index) => index + 1);
  }

  getUserProfile() {
    if (!this.authService.userDetails || !this.authService.userDetails.id) return
    this.authService.getUserProfile(this.authService.userDetails.id).subscribe((res: any) => {
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

  getEventRewiews() {
    this.eventsService.getEventReviews(this.eventId).subscribe((reviews: any) => {
      this.eventReviews = reviews.data
    })
  }

  addReviewComment() {
    if (this.reviewForm.invalid) return;

    this.isSubmitting = true;
    let review: any = {}
    review.eventId = this.eventId
    review.raterUserId = this.authService.userDetails.id
    review.score = this.reviewForm.value.rating
    review.comment = this.reviewForm.value.comment;

    this.eventsService.addReview(review).subscribe(
      (res: any) => {
        this.isSubmitting = false;

        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }

        this.reviewForm.reset();
        this.reviewForm.markAsPristine();
        this.reviewForm.markAsUntouched()

        this.getEventRewiews();
      },
      (error: any) => {
        this.isSubmitting = false;
        console.error('Error adding review:', error);
      }
    )
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

  scrollTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openModal() {
    this.viewProfile(this.eventDetails.createdBy._id);
  }

  redirectToHostProfile() {
    const hostId = this.eventDetails?.createdBy?._id;
    if (!hostId) return;

    this.routeService.navigateByState('/profile', { userId: hostId });
  }

  closeModal() {
    this.isOpen = false;
  }

  async onPhotoUpload(event: any): Promise<void> {
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
    this.uploadedPhotos.forEach(file => {
      formData.append('gallery', file);
    });

    this.eventsService.createEvent(formData).subscribe({
      next: res => {
        if (res?.success && res.statusCode === 201) {

        }
      },
      error: (err: any) => {
        console.error('Error:', err);
      }
    });


  }

  triggerPhotoUpload() {
    this.photoUpload.nativeElement.click();
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
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
    const area = this.eventDetails?.address?.area;
    const city = this.eventDetails?.address?.city;

    if (area && city && area !== city) return `${area}, ${city}`;
    return area || city || 'Location TBA';
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
