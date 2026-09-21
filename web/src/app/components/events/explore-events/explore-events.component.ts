import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EventsService } from '../../../shared/services/events/events.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { CompactEventCardComponent } from '../../../shared/components/compact-event-card/compact-event-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PastEventCardComponent, PastEventCardConfig } from '../../../shared/components/past-event-card/past-event-card.component';
import { RouteService } from '../../../shared/services/route/route.service';
import { MessageStore } from '../../../shared/store/message.store';
import { MultiCarouselComponent, FullPageCarouselComponent } from '../../../shared/components/carousels';
import { RouterModule } from '@angular/router';
import { ExploreSkeletonComponent } from '../../../shared/components/explore-skeleton/explore-skeleton.component';
import { EventFiltersComponent } from '../../../shared/components/event-filters/event-filters.component';

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
    ExploreSkeletonComponent,
    EventFiltersComponent,
  ],
  templateUrl: './explore-events.component.html',
  styleUrl: './explore-events.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExploreEventsComponent implements OnInit {
  isLoading = signal(true);
  categories = signal<any[]>([]);
  trendingEvents = signal<any[]>([]);
  justForYouEvents = signal<any[]>([]);
  pastEvents = signal<any[]>([]);
  hasMorePastEvents = signal(false);
  showPastEventsSeeMore = signal(false);
  private eventsService = inject(EventsService);
  private router = inject(RouteService);
  private messageStore = inject(MessageStore);
  private eventsRequestId = 0;

  filters = [
    { id: 'all', label: 'All', icon: 'celebration' },
    { id: 'tonight', label: 'Tonight', icon: 'sports_tennis' },
    { id: 'this_weekend', label: 'This weekend', icon: 'self_improvement' },
    { id: 'free', label: 'Free', icon: 'flight_takeoff' },
    { id: 'nearby', label: 'Nearby', icon: 'location_on' }
  ];

  fullPageDummyItems = [
    {
      image: 'assets/images/explore-hero/image-3.webp',
      trending: true,
      tags: ['Party', 'Nightlife'],
      title: 'Midnight Madness',
      description: 'The ultimate underground party experience. Secret location, exclusive DJ sets, and a night you won\'t forget.',
    },
    {
      image: 'assets/images/explore-hero/image-1.webp',
      trending: true,
      tags: ['Music', 'Festival'],
      title: 'Neon Nights Festival',
      description: 'Get ready for the biggest EDM festival of the year. Join thousands of music lovers for a night of unforgettable beats and lights.',
    },
    {
      image: 'assets/images/explore-hero/image-2.webp',
      trending: false,
      tags: ['Chill', 'Acoustic'],
      title: 'Acoustic Sunset',
      description: 'Relaxing vibes by the beach with top indie artists playing stripped-down acoustic versions of their hits.',
    }
  ];

  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      // On the server, keep isLoading(true) so initial SSR HTML is the skeleton loader, avoiding hydration flicker
      return;
    }
    this.loadInitialData();
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
        this.eventsService.getNearbyEvents(latitude, longitude, 50000, category).subscribe({
          next: (res: any) => {
            if (requestId !== this.eventsRequestId) return;

            if (res?.success && res?.data) {
              this.trendingEvents.set(res.data);
              if (this.trendingEvents().length === 0) {
                this.messageStore.addMessage('No nearby events found.', 'info');
              }
            } else {
              this.messageStore.addMessage('Failed to load nearby events.', 'error');
            }
          },
          error: () => {
            if (requestId !== this.eventsRequestId) return;
            this.messageStore.addMessage('Failed to load nearby events.', 'error');
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

    return {
      title: event?.title,
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
    this.isLoading.set(true);
    const requestId = ++this.eventsRequestId;
    const category = this.activeCategoryId === 'all' ? undefined : this.activeCategoryId;

    forkJoin({
      categories: this.eventsService.getEventCategories().pipe(
        catchError((error) => {
          console.error('Failed to load categories', error);
          return of({ success: false, data: { categories: [] } });
        })
      ),
      events: this.eventsService.getAllEvents(this.activeFilterId, category, undefined, 8).pipe(
        catchError((error) => {
          console.error('Failed to load events', error);
          this.messageStore.addMessage('Failed to load events.', 'error');
          return of({ data: [] });
        })
      ),
      forYouEvents: this.eventsService.getEventForYou('all', undefined, undefined, 8).pipe(
        catchError((error) => {
          console.error('Failed to load recommended events', error);
          return of({ data: [] });
        })
      ),
      pastEvents: this.eventsService.getPastEvents(undefined, 5).pipe(
        catchError((error) => {
          console.error('Failed to load past events', error);
          return of({ data: { events: [], nextCursor: null } });
        })
      )
    }).pipe(
      finalize(() => {
        if (requestId === this.eventsRequestId) {
          this.isLoading.set(false);
        }
      })
    ).subscribe({
      next: ({ categories, events, forYouEvents, pastEvents }) => {
        if (requestId !== this.eventsRequestId) return;

        // Populate categories
        if (categories?.success && categories?.statusCode === 200 && categories?.data?.categories) {
          this.categories.set(categories.data.categories.map((cat: any) => this.toExploreCategory(cat)));
        }

        // Populate events
        const filteredEvents = Array.isArray(events?.data) ? events.data : [];
        this.trendingEvents.set(filteredEvents);
        const recommendedEvents = Array.isArray(forYouEvents?.data) ? forYouEvents.data : [];
        this.justForYouEvents.set(recommendedEvents);

        // Populate past events
        const pastData = pastEvents?.data;
        this.pastEvents.set(Array.isArray(pastData?.events) ? pastData.events : []);
        this.hasMorePastEvents.set(Boolean(pastData?.nextCursor));
        this.showPastEventsSeeMore.set(false);
      }
    });
  }

  private loadCategories() {
    this.eventsService.getEventCategories().subscribe((categories: any) => {
      if (categories.success && categories.statusCode === 200) {
        this.categories.set(categories.data.categories.map((category: any) => this.toExploreCategory(category)));
      }
    }, (error: any) => {
      console.log(error);
    });
  }

  private loadEvents() {
    const requestId = ++this.eventsRequestId;
    const category = this.activeCategoryId === 'all' ? undefined : this.activeCategoryId;

    this.eventsService.getAllEvents(this.activeFilterId, category, undefined, 8).subscribe({
      next: (events: any) => {
        if (requestId !== this.eventsRequestId) return;

        const filteredEvents = Array.isArray(events?.data) ? events.data : [];
        this.trendingEvents.set(filteredEvents);

      },
      error: () => {
        if (requestId !== this.eventsRequestId) return;
        this.trendingEvents.set([]);
        this.messageStore.addMessage('Failed to load events.', 'error');
      }
    });
  }

  private loadPastEvents() {
    this.eventsService.getPastEvents(undefined, 5).subscribe({
      next: (events: any) => {
        const data = events?.data;
        this.pastEvents.set(Array.isArray(data?.events) ? data.events : []);
        this.hasMorePastEvents.set(Boolean(data?.nextCursor));
        this.showPastEventsSeeMore.set(false);
      },
      error: () => {
        this.pastEvents.set([]);
        this.hasMorePastEvents.set(false);
        this.showPastEventsSeeMore.set(false);
        this.messageStore.addMessage('Failed to load past events.', 'error');
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
      cover: category.image,
      tags: category.tags || []
    };
  }

}
