import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../../../shared/services/events/events.service';
import { EventCardComponent } from "../../../shared/components/event-card/event-card.component";
import { CompactEventCardComponent } from "../../../shared/components/compact-event-card/compact-event-card.component";
import { EventCardSkeletonComponent } from "../../../shared/components/event-card-skeleton/event-card-skeleton.component";
import { Location } from '@angular/common';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MessageStore } from '../../../shared/store/message.store';
import { FullPageCarouselComponent } from '../../../shared/components/carousels';
import { EventFiltersComponent } from '../../../shared/components/event-filters/event-filters.component';

@Component({
  selector: 'vl-events-list',
  imports: [EventCardComponent, CompactEventCardComponent, EventCardSkeletonComponent, EmptyStateComponent, FullPageCarouselComponent, EventFiltersComponent],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit, OnDestroy {
  readonly partyHeroSlides = [
    {
      src: 'assets/images/party-hero/party-pool.jpg',
      alt: 'Friends enjoying a daytime pool party',
      position: 'center 48%'
    },
    {
      src: 'assets/images/party-hero/party-house.jpg',
      alt: 'Friends socializing at an evening house party',
      position: 'center 50%'
    },
    {
      src: 'assets/images/party-hero/party-rooftop.jpg',
      alt: 'Friends gathering at a rooftop party',
      position: 'center 45%'
    },
    {
      src: 'assets/images/party-hero/party-club.jpg',
      alt: 'Friends dancing together at a club',
      position: 'center 42%'
    }
  ];

  readonly travelHeroSlides = [
    {
      src: 'assets/images/travel-hero/travel-coast.jpg',
      alt: 'Friends watching the sunset over a tropical coast',
      position: 'center 56%'
    },
    {
      src: 'assets/images/travel-hero/travel-hike.jpg',
      alt: 'Friends hiking through green mountains',
      position: 'center 50%'
    },
    {
      src: 'assets/images/travel-hero/travel-cafe.jpg',
      alt: 'Travel companions working together at a coastal cafe',
      position: 'center 45%'
    },
    {
      src: 'assets/images/travel-hero/travel-road-trip.jpg',
      alt: 'Friends enjoying a sunset road trip',
      position: 'center 43%'
    }
  ];

  readonly playHeroSlides = [
    {
      src: 'assets/images/play-hero/play-board-games.jpg',
      alt: 'Friends playing a board game together at a cafe',
      position: 'center 52%'
    },
    {
      src: 'assets/images/play-hero/play-badminton.webp',
      alt: 'Players enjoying badminton on indoor courts',
      position: 'center center'
    },
    {
      src: 'assets/images/play-hero/play-cricket.webp',
      alt: 'Players enjoying a nighttime cricket match',
      position: 'center center'
    }
  ];

  private readonly noHeroSlides: any[] = [];

  route: ActivatedRoute = inject(ActivatedRoute);
  eventService = inject(EventsService);
  private location = inject(Location);
  private router = inject(Router);
  private messageStore = inject(MessageStore);
  private searchTimer?: ReturnType<typeof setTimeout>;
  private eventsRequestId = 0;
  private destroyRef = inject(DestroyRef);
  private currentCoordinates?: { latitude: number; longitude: number };

  timeFilters = [
    { id: 'all', label: 'All' },
    { id: 'tonight', label: 'Tonight' },
    { id: 'this_weekend', label: 'This weekend' },
    { id: 'free', label: 'Free' },
    { id: 'nearby', label: 'Nearby' },
  ];

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  activeEventCategory = signal<any>({});
  activeCategoryEvents: any = [];
  activeTimeFilter = 'all';
  categoryId = '';
  searchTerm = '';
  isLoading = false;
  hasLoaded = false;

  get isPartyCategory(): boolean {
    const title = String(this.activeEventCategory()?.title || '').trim().toLowerCase();
    return title === 'party' || title === 'social';
  }

  get isTravelCategory(): boolean {
    const title = String(this.activeEventCategory()?.title || '').trim().toLowerCase();
    return ['travel', 'travel companion', 'escape', 'escapes'].includes(title);
  }

  get isPlayCategory(): boolean {
    const title = String(this.activeEventCategory()?.title || '').trim().toLowerCase();
    return ['play', 'sports', 'sports activities', 'gaming', 'fitness'].includes(title);
  }

  get activeHeroSlides(): any[] {
    if (this.isPartyCategory) return this.partyHeroSlides;
    if (this.isTravelCategory) return this.travelHeroSlides;
    if (this.isPlayCategory) return this.playHeroSlides;
    return this.noHeroSlides;
  }

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([params, queryParams]) => {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.categoryId = params['categoryId'] || '';
      this.activeTimeFilter = this.timeFilters.some(filter => filter.id === queryParams['filter'])
        ? queryParams['filter'] : 'all';
      this.searchTerm = '';
      this.activeCategoryEvents = [];
      this.hasLoaded = false;
      const selectedCategory = this.eventService.selectedCategory;
      this.activeEventCategory.set(
        !this.categoryId
          ? { title: 'All Live Events', description: 'Find your next vibe across all categories.' }
          : selectedCategory?._id === this.categoryId
          ? this.withCatalogDisplayTitle(selectedCategory)
          : {}
      );
      if (this.categoryId) this.loadCategoryDetails(this.categoryId);
      this.loadEventsByCategory();
    });
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  setTimeFilter(filterId: string): void {
    if (filterId === this.activeTimeFilter) return;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.activeTimeFilter = filterId;
    this.loadEventsByCategory();
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    if (this.searchTimer) clearTimeout(this.searchTimer);

    if (!this.searchTerm) {
      this.loadEventsByCategory();
      return;
    }

    this.searchTimer = setTimeout(() => this.loadEventsByCategory(), 300);
  }

  get emptyStateContext(): string {
    if (this.searchTerm.trim()) return 'search';

    return this.activeTimeFilter;
  }

  loadEventsByCategory() {
    if (this.activeTimeFilter === 'nearby') {
      this.loadNearbyEvents();
      return;
    }

    const requestId = ++this.eventsRequestId;
    this.isLoading = true;

    this.eventService.getAllEvents(
      this.activeTimeFilter,
      this.categoryId,
      this.searchTerm.trim()
    ).subscribe({
      next: (res: any) => {
        if (requestId !== this.eventsRequestId) return;

        if (!res?.success || res.statusCode !== 200) {
          this.activeCategoryEvents = [];
          this.isLoading = false;
          this.hasLoaded = true;
          return;
        }

        this.activeCategoryEvents = res.data ?? [];
        this.isLoading = false;
        this.hasLoaded = true;
      },
      error: () => {
        if (requestId !== this.eventsRequestId) return;
        this.activeCategoryEvents = [];
        this.isLoading = false;
        this.hasLoaded = true;
      }
    });
  }

  private loadNearbyEvents(): void {
    const requestId = ++this.eventsRequestId;
    this.isLoading = true;

    if (this.currentCoordinates) {
      this.fetchNearbyEvents(this.currentCoordinates, requestId);
      return;
    }

    if (!navigator.geolocation) {
      this.handleLocationError('Geolocation is not supported by your browser.', requestId);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (requestId !== this.eventsRequestId) return;

        this.currentCoordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        this.fetchNearbyEvents(this.currentCoordinates, requestId);
      },
      (error) => {
        if (requestId !== this.eventsRequestId) return;

        let message = 'Unable to determine your current location.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please enable it to see nearby events.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out.';
        }
        this.handleLocationError(message, requestId);
      },
      { timeout: 10000 }
    );
  }

  private fetchNearbyEvents(
    coordinates: { latitude: number; longitude: number },
    requestId: number
  ): void {
    this.eventService.getNearbyEvents(
      coordinates.latitude,
      coordinates.longitude,
      50000,
      this.categoryId
    ).subscribe({
      next: (res: any) => {
        if (requestId !== this.eventsRequestId) return;

        const events = res?.success && Array.isArray(res.data) ? res.data : [];
        this.activeCategoryEvents = this.filterNearbySearchResults(events);
        this.isLoading = false;
        this.hasLoaded = true;
      },
      error: () => {
        if (requestId !== this.eventsRequestId) return;
        this.activeCategoryEvents = [];
        this.isLoading = false;
        this.hasLoaded = true;
        this.messageStore.addMessage('Failed to load nearby events.', 'error');
      }
    });
  }

  private filterNearbySearchResults(events: any[]): any[] {
    const search = this.searchTerm.trim().toLowerCase();
    if (!search) return events;

    return events.filter((event) => [
      event?.title,
      event?.description,
      event?.category?.title,
      event?.address?.area,
      event?.address?.city,
      event?.address?.state,
      ...(Array.isArray(event?.tags) ? event.tags : []),
    ].some((value) => String(value ?? '').toLowerCase().includes(search)));
  }

  private handleLocationError(message: string, requestId: number): void {
    if (requestId !== this.eventsRequestId) return;

    this.activeCategoryEvents = [];
    this.isLoading = false;
    this.hasLoaded = true;
    this.messageStore.addMessage(message, 'error');
  }

  private loadCategoryDetails(categoryId: string): void {
    this.eventService.getEventCategories().subscribe({
      next: (res: any) => {
        const categories = Array.isArray(res?.data?.categories) ? res.data.categories : [];
        const category = categories.find((item: any) => item._id === categoryId);
        if (category) {
          const displayCategory = this.withCatalogDisplayTitle(category);
          this.eventService.selectedCategory = displayCategory;
          this.activeEventCategory.set(displayCategory);
        }
      }
    });
  }

  private withCatalogDisplayTitle(category: any): any {
    if (!category) return {};

    const title = String(category.title || '').trim();
    const normalizedTitle = title.toLowerCase();
    const displayTitle = ['events', 'local events', 'quickies', 'hangout', 'hangouts'].includes(normalizedTitle)
      ? 'Hangouts'
      : title;

    return { ...category, title: displayTitle };
  }
}
