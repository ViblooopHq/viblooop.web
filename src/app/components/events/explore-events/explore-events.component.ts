import { ChangeDetectorRef, Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject, NgZone, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventsService } from '../../../shared/services/events/events.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { CompactEventCardComponent } from '../../../shared/components/compact-event-card/compact-event-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PastEventCardComponent, PastEventCardConfig } from '../../../shared/components/past-event-card/past-event-card.component';
import { RouteService } from '../../../shared/services/route/route.service';
import { MessageStore } from '../../../shared/store/message.store';
import { MultiCarouselComponent, FullPageCarouselComponent, FullPageSlideComponent, FullPageSlideConfig } from '../../../shared/components/carousels';
import { RouterModule } from '@angular/router';
import { EventCardSkeletonComponent } from '../../../shared/components/event-card-skeleton/event-card-skeleton.component';
import { EVENT_LIMIT_OFFSET } from '../../../shared/constants/common.constants';

const CATEGORY_FILTER_IMAGES: Record<string, string> = {
  party: 'assets/images/category-filter/party.png',
  social: 'assets/images/category-filter/party.png',
  'social events': 'assets/images/category-filter/party.png',
  escape: 'assets/images/category-filter/escape.png',
  escapes: 'assets/images/category-filter/escape.png',
  travel: 'assets/images/category-filter/escape.png',
  'travel companion': 'assets/images/category-filter/escape.png',
  sports: 'assets/images/category-filter/sports.png',
  'sports activities': 'assets/images/category-filter/sports.png',
  events: 'assets/images/category-filter/hangouts.png',
  'local events': 'assets/images/category-filter/hangouts.png',
  quickies: 'assets/images/category-filter/hangouts.png',
  hangout: 'assets/images/category-filter/hangouts.png',
  hangouts: 'assets/images/category-filter/hangouts.png',
};

@Component({
  selector: 'vl-explore-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EventCardComponent,
    CompactEventCardComponent,
    EmptyStateComponent,
    PastEventCardComponent,
    MultiCarouselComponent,
    FullPageCarouselComponent,
    FullPageSlideComponent,
    EventCardSkeletonComponent,
  ],
  templateUrl: './explore-events.component.html',
  styleUrl: './explore-events.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExploreEventsComponent implements OnInit {
  readonly pastVibeBreakpoints = {
    320: { slidesPerView: 2.15, spaceBetween: 10 },
    480: { slidesPerView: 2.25, spaceBetween: 12 },
    640: { slidesPerView: 2.8, spaceBetween: 14 },
    1024: { slidesPerView: 3.2, spaceBetween: 16 },
    1280: { slidesPerView: 3.8, spaceBetween: 20 },
    1440: { slidesPerView: 4.2, spaceBetween: 20 },
  };

  isCategoriesLoading = signal(true);
  isTrendingLoading = signal(true);
  isPastEventsLoading = signal(true);
  isLoading = computed(() => this.isTrendingLoading() || this.isCategoriesLoading());

  readonly categoryPlaceholders = Array.from({ length: 7 }, (_, i) => i);
  readonly pastCardPlaceholders = Array.from({ length: 4 }, (_, i) => i);

  categories = signal<any[]>([]);
  trendingEvents = signal<any[]>([]);
  pastEvents = signal<any[]>([]);
  hasMorePastEvents = signal(false);
  showPastEventsSeeMore = signal(false);

  private eventsService = inject(EventsService);
  private router = inject(RouteService);
  private messageStore = inject(MessageStore);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private eventsRequestId = 0;

  filters = [
    { id: 'all', label: 'All', icon: 'celebration' },
    { id: 'tonight', label: 'Tonight', icon: 'sports_tennis' },
    { id: 'this_weekend', label: 'Weekend', icon: 'self_improvement' },
    { id: 'free', label: 'Free', icon: 'flight_takeoff' }
  ];

  marketingSlides: FullPageSlideConfig[] = [
    {
      kicker: 'ESCAPE THE ORDINARY',
      title: 'ESCAPE<br>TOGETHER!',
      description: 'Conquer breathtaking mountain trails, scenic summits, and unforgettable outdoor getaways with companions who share your wanderlust.',
      ctaText: 'DISCOVER ESCAPES',
      ctaLink: '/events',
      ctaQuery: { filter: 'this_weekend' },
      image: 'assets/images/explore-hero/escape-together.jpg',
      imageAlt: 'Friends trekking together on a mountain summit with Himalayan backdrop',
      accentColor: '#38bdf8',
    },
    {
      kicker: 'LIVE & ELECTRIC',
      title: 'NEON<br>NIGHTS!',
      description: 'Immerse yourself in pulsating festival beats, electric laser stages, and high-energy crowds that keep the vibe alive all night long.',
      ctaText: 'FIND CONCERTS',
      ctaLink: '/events',
      ctaQuery: { filter: 'tonight' },
      image: 'assets/images/explore-hero/image-1.webp',
      imageAlt: 'Live music concert stage with lasers, EDM DJ, and vibrant crowd',
      accentColor: '#ec4899',
    },
    {
      kicker: 'CONNECT & CREATE',
      title: 'WORKATION<br>HITS DIFFERENT!',
      description: 'Trade routine for inspiring mountain cafés. Co-work with ambitious creators, remote nomads, and innovators in scenic destinations.',
      ctaText: 'JOIN HANGOUTS',
      ctaLink: '/events',
      ctaQuery: { filter: 'all' },
      image: 'assets/images/explore-hero/image-2.webp',
      imageAlt: 'Remote creators co-working on laptops at a scenic outdoor mountain café',
      accentColor: '#f59e0b',
    },
    {
      kicker: 'GOOD PEOPLE, BETTER PLANS',
      title: 'ROOFTOP<br>SOCIALS!',
      description: 'Experience intimate sunset gatherings, craft cocktails, and genuine connections against glowing city skylines with your city\'s coolest crowd.',
      ctaText: 'EXPLORE VIBES',
      ctaLink: '/events',
      ctaQuery: { filter: 'tonight' },
      image: 'assets/images/explore-hero/image-3.webp',
      imageAlt: 'Friends relaxing on a sunset rooftop terrace couch with illuminated city skyline',
      accentColor: '#c084fc',
    }
  ];

  private platformId = inject(PLATFORM_ID);

  eventLimitOffset = EVENT_LIMIT_OFFSET;
  totalUpcomingEvents = 0;

  ngOnInit() {
    this.loadInitialData();

    this.eventsService.refreshUpcomingEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.ngZone.run(() => {
          if (this.activeFilterId === 'nearby') {
            this.requestBrowserLocation();
          } else {
            this.loadEvents();
          }
          this.cdr.markForCheck();
        });
      });
  }

  activeFilterId: string = 'all'; // Default active filter
  activeCategoryId: string = 'all';

  setActiveFilter(id: string) {
    this.activeFilterId = id;
    if (id === 'nearby') {
      this.requestBrowserLocation();
    } else {
      this.loadEvents();
    }
  }

  requestBrowserLocation() {
    const requestId = ++this.eventsRequestId;
    this.isTrendingLoading.set(true);

    if (!navigator.geolocation) {
      this.messageStore.addMessage('Geolocation is not supported by your browser.', 'error');
      this.activeFilterId = 'all';
      this.loadEvents();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== this.eventsRequestId) return;

        const { latitude, longitude } = position.coords;
        const category = this.activeCategoryId === 'all' ? undefined : this.activeCategoryId;
        this.eventsService.getNearbyEvents(latitude, longitude, 50000, category).pipe(
          finalize(() => {
            if (requestId === this.eventsRequestId) {
              this.isTrendingLoading.set(false);
              this.cdr.markForCheck();
            }
          })
        ).subscribe({
          next: (res: any) => {
            if (requestId !== this.eventsRequestId) return;

            if (res?.success && res?.data) {
              this.trendingEvents.set(res.data);
              if (this.trendingEvents().length === 0) {
                this.messageStore.addMessage('No nearby events found.', 'info');
              }
            } else {
              this.trendingEvents.set([]);
              this.messageStore.addMessage('Failed to load nearby events.', 'error');
            }
            this.cdr.markForCheck();
          },
          error: () => {
            if (requestId !== this.eventsRequestId) return;
            this.trendingEvents.set([]);
            this.messageStore.addMessage('Failed to load nearby events.', 'error');
            this.cdr.markForCheck();
          }
        });
      },
      (error) => {
        if (requestId !== this.eventsRequestId) return;

        let msg = 'Unable to determine current location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please enable it to see nearby events.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        this.messageStore.addMessage(msg, 'error');
        this.activeFilterId = 'all';
        this.loadEvents();
      },
      { timeout: 10000 }
    );
  }

  setActiveCategory(id: string) {
    const category = this.categories().find((item) => item.id === id);
    if (category) {
      this.eventsService.selectedCategory = {
        _id: category.id,
        title: category.label,
        description: category.description,
        image: category.cover,
        icon: category.icon,
        tags: category.tags,
      };
    }
    this.router.navigate('/eventCategories', id);
  }

  resetFilters() {
    this.activeFilterId = 'all';
    this.activeCategoryId = 'all';
    this.loadEvents();
  }

  getPastEventCardConfig(event: any): PastEventCardConfig {
    const area = event?.address?.area || event?.area;
    const city = event?.address?.city || event?.city;
    const state = event?.address?.state || event?.state;
    const pinCode = event?.address?.pinCode || event?.pinCode;
    const attendees = Array.isArray(event?.attendees) ? event.attendees.length : Number(event?.attendedCount || 0);
    const reviews = Array.isArray(event?.reviews)
      ? event.reviews.length
      : Number(event?.totalRatings || event?.reviewCount || event?.reviewsCount || event?.ratingCount || 0);
    const averageRating = Number(event?.averageRating || event?.rating || event?.hostRating || 0);
    const photos = Array.isArray(event?.photos)
      ? event.photos.length
      : Array.isArray(event?.gallery)
        ? event.gallery.length
        : Number(event?.photoCount || 0);

    const rawLoc = event?.location;
    const locString = typeof rawLoc === 'string' && rawLoc && !rawLoc.includes('[object') ? rawLoc : null;
    const location = locString || [area || city, pinCode || state].filter(Boolean).join(', ') || 'Location';

    const memoryPhoto = Array.isArray(event?.photos) && event.photos.length > 0
      ? event.photos[0]
      : Array.isArray(event?.gallery) && event.gallery.length > 0
        ? event.gallery[0]
        : event?.memoryImage || null;

    return {
      title: event?.title,
      category: event?.category,
      attendeeImages: Array.isArray(event?.attendees)
        ? event.attendees.map((attendee: any) => attendee?.profileImage).filter(Boolean)
        : [],
      image: event?.image,
      eventDate: event?.eventDate,
      city: area || city,
      state,
      location,
      hostName: event?.createdBy?.name || event?.createdBy?.username || event?.hostName,
      hostVerified: Boolean(event?.createdBy?.isVerified || event?.hostVerified),
      attendedCount: attendees,
      rating: averageRating,
      reviewCount: reviews,
      photoCount: photos,
      memoryImage: memoryPhoto,
    };
  }

  viewPastEvent(event: any) {
    if (event?._id) {
      this.router.navigate('/events', event._id);
    }
  }

  get emptyStateSubject(): string {
    if (this.activeCategoryId === 'all') return 'events';

    const selectedCategory = this.categories().find((category) => category.id === this.activeCategoryId);
    return this.normalize(selectedCategory?.label) || 'events';
  }

  get emptyStateContext(): string {
    return this.activeFilterId;
  }

  get emptyStateContextPrefix(): string {
    return '';
  }

  private loadInitialData() {
    this.loadCategories();
    this.loadEvents();
    this.loadPastEvents();
  }

  private loadCategories() {
    this.isCategoriesLoading.set(true);
    this.eventsService.getEventCategories().pipe(
      catchError((error) => {
        console.error('Failed to load categories', error);
        return of({ success: false, data: { categories: [] } });
      }),
      finalize(() => {
        this.isCategoriesLoading.set(false);
        this.cdr.markForCheck();
      })
    ).subscribe((categories: any) => {
      if (categories?.success && categories?.statusCode === 200 && categories?.data?.categories) {
        this.categories.set(categories.data.categories.map((category: any) => this.toExploreCategory(category)));
      } else {
        this.categories.set([]);
      }
      this.cdr.markForCheck();
    });
  }

  private loadEvents() {
    const requestId = ++this.eventsRequestId;
    this.isTrendingLoading.set(true);
    const category = this.activeCategoryId === 'all' ? undefined : this.activeCategoryId;

    this.eventsService.getAllEvents(this.activeFilterId, category, undefined, this.eventLimitOffset).pipe(
      catchError((error) => {
        console.error('Failed to load events', error);
        this.messageStore.addMessage('Failed to load events.', 'error');
        return of({ data: [] });
      }),
      finalize(() => {
        if (requestId === this.eventsRequestId) {
          this.isTrendingLoading.set(false);
          this.cdr.markForCheck();
        }
      })
    ).subscribe({
      next: (events: any) => {
        if (requestId !== this.eventsRequestId) return;
        this.totalUpcomingEvents = events.totalCount;
        const filteredEvents = Array.isArray(events?.data) ? events.data : [];
        this.trendingEvents.set(filteredEvents);
        this.cdr.markForCheck();
      }
    });
  }

  private loadPastEvents() {
    this.isPastEventsLoading.set(true);
    this.eventsService.getPastEvents(undefined, 5).pipe(
      catchError((error) => {
        console.error('Failed to load past events', error);
        return of({ data: { events: [], nextCursor: null } });
      }),
      finalize(() => {
        this.isPastEventsLoading.set(false);
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (events: any) => {
        const data = events?.data;
        this.pastEvents.set(Array.isArray(data?.events) ? data.events : []);
        this.hasMorePastEvents.set(Boolean(data?.nextCursor));
        this.showPastEventsSeeMore.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private normalize(value: any): string {
    return String(value || '').trim().toLowerCase();
  }

  private toExploreCategory(category: any): any {
    const title = String(category?.title || '').trim();
    const normalizedTitle = title.toLowerCase();
    let label = title;

    if (normalizedTitle === 'travel' || normalizedTitle === 'travel companion') {
      label = 'Escape';
    } else if (['events', 'local events', 'quickies', 'hangout', 'hangouts'].includes(normalizedTitle)) {
      label = 'Hangouts';
    }

    return {
      id: category._id,
      label,
      description: category.description,
      icon: category.icon,
      cover: CATEGORY_FILTER_IMAGES[normalizedTitle] || category.image,
      tags: category.tags || []
    };
  }

}

