import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EventsService } from '../../../shared/services/events/events.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { CompactEventCardComponent } from '../../../shared/components/compact-event-card/compact-event-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PastEventCardComponent, PastEventCardConfig } from '../../../shared/components/past-event-card/past-event-card.component';
import { RouteService } from '../../../shared/services/route/route.service';
import { MessageStore } from '../../../shared/store/message.store';
import { MultiCarouselComponent, FullPageCarouselComponent, PreviewCarouselComponent, PreviewSlide } from '../../../shared/components/carousels';
import { PopularCardConfig } from '../../../shared/components/popular-card/popular-card.component';
import { RouterModule } from '@angular/router';
import { ExploreSkeletonComponent } from '../../../shared/components/explore-skeleton/explore-skeleton.component';

export interface EventFilter {
  id: string;
  label: string;
  icon: string;
}
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
    PreviewCarouselComponent,
    ExploreSkeletonComponent,
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

  filters: EventFilter[] = [
    { id: 'all', label: 'All', icon: 'celebration' },
    { id: 'tonight', label: 'Tonight', icon: 'sports_tennis' },
    { id: 'this_weekend', label: 'This weekend', icon: 'self_improvement' },
    { id: 'free', label: 'Free', icon: 'flight_takeoff' },
    { id: 'nearby', label: 'Nearby', icon: 'location_on' }
  ];

  dummyImages = [
    { url: 'https://picsum.photos/800/400?random=1', alt: 'Dummy 1' },
    { url: 'https://picsum.photos/800/400?random=2', alt: 'Dummy 2' },
    { url: 'https://picsum.photos/800/400?random=3', alt: 'Dummy 3' }
  ];

  previewItems: PreviewSlide[] = [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=1200&h=800',
      preTitle: 'Iceland, a Nordic island nation',
      title: 'Iceland',
      description: 'Iceland, a Nordic island nation, is defined by its dramatic landscape with volcanoes, geysers, hot springs and lava fields.',
      subtitle: 'Nordic island nation'
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200&h=800',
      preTitle: 'New Zealand, an island country',
      title: 'New Zealand',
      description: 'New Zealand is a country in the southwestern Pacific Ocean consisting of 2 main landmasses and over 700 smaller islands.',
      subtitle: 'Island country'
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1786614840853-ab60bacc1cd2?auto=format&fit=crop&q=80&w=1200&h=800',
      preTitle: 'Norway, a Scandinavian country',
      title: 'Norway',
      description: 'Norway is a Scandinavian country encompassing mountains, glaciers and deep coastal fjords.',
      subtitle: 'Scandinavian country'
    },
    {
      type: 'video',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      preTitle: 'Video Example',
      title: 'Video Background',
      description: 'This slide demonstrates how seamless video playback looks as a background element with the modern carousel layout.',
      subtitle: 'Video demo'
    }
  ];

  fullPageDummyItems = [
    {
      image: 'https://images.unsplash.com/photo-1540039155733-d7696d5eb3fc?auto=format&fit=crop&q=80&w=1200&h=600',
      trending: true,
      tags: ['Music', 'Festival'],
      title: 'Neon Nights Festival',
      description: 'Get ready for the biggest EDM festival of the year. Join thousands of music lovers for a night of unforgettable beats and lights.',
    },
    {
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200&h=600',
      trending: false,
      tags: ['Chill', 'Acoustic'],
      title: 'Acoustic Sunset',
      description: 'Relaxing vibes by the beach with top indie artists playing stripped-down acoustic versions of their hits.',
    },
    {
      image: 'https://images.unsplash.com/photo-1478147424098-b80a56391b15?auto=format&fit=crop&q=80&w=1200&h=600',
      trending: true,
      tags: ['Party', 'Nightlife'],
      title: 'Midnight Madness',
      description: 'The ultimate underground party experience. Secret location, exclusive DJ sets, and a night you won\'t forget.',
    }
  ];

  popularNowItems: PopularCardConfig[] = [
    {
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400&h=533', // Food/Pancakes
      badgeText: 'Live',
      badgeType: 'live',
      viewCount: '12K',
      title: 'Food'
    },
    {
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=400&h=533', // Food plate
      badgeText: 'Premier',
      badgeType: 'premier',
      viewCount: '12K',
      title: 'Nathan 5'
    },
    {
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=400&h=533', // Adventure/Mountain
      badgeText: 'Live',
      badgeType: 'live',
      viewCount: '12K',
      title: 'Adventure'
    },
    {
      image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=400&h=533', // Photographer/Travel
      badgeText: 'Premier',
      badgeType: 'premier',
      viewCount: '8.5K',
      title: 'Travel Vibes'
    }
  ];

  ngOnInit() {
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
    switch (this.activeFilterId) {
      case 'tonight':
        return 'tonight';
      case 'this_weekend':
        return 'this weekend';
      case 'free':
        return 'for free';
      default:
        return 'near you';
    }
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
          this.categories.set(categories.data.categories.map((cat: any) => ({
            id: cat._id,
            label: cat.title,
            icon: cat.icon,
            cover: cat.image,
            tags: cat.tags || []
          })));
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
        this.categories.set(categories.data.categories.map((category: any) => {
          return {
            id: category._id,
            label: category.title,
            icon: category.icon,
            cover: category.image,
            tags: category.tags || []
          };
        }));
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

}
