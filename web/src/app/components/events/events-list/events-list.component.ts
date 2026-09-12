import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../../../shared/services/events/events.service';
import { EventCardComponent } from "../../../shared/components/event-card/event-card.component";
import { Location, NgClass } from '@angular/common';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MessageStore } from '../../../shared/store/message.store';

@Component({
  selector: 'vl-events-list',
  imports: [EventCardComponent, EmptyStateComponent, NgClass],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit, OnDestroy {
  breadcrumbs = [
    { label: 'Home', url: '/' },
  ];
  route: ActivatedRoute = inject(ActivatedRoute);
  eventService = inject(EventsService);
  private location = inject(Location);
  private router = inject(Router);
  private messageStore = inject(MessageStore);
  private searchTimer?: ReturnType<typeof setTimeout>;
  private eventsRequestId = 0;
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

  activeEventCategory: any = {};
  activeCategoryEvents: any = [];
  activeTimeFilter = 'all';
  categoryId = '';
  searchTerm = '';
  isLoading = false;
  hasLoaded = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.categoryId = params['categoryId'];
      this.activeTimeFilter = 'all';
      this.searchTerm = '';
      this.activeCategoryEvents = [];
      this.hasLoaded = false;
      this.loadCategoryDetails(this.categoryId);
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

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    if (this.searchTimer) clearTimeout(this.searchTimer);

    this.searchTimer = setTimeout(() => this.loadEventsByCategory(), 300);
  }

  clearSearch(): void {
    if (!this.searchTerm) return;
    this.searchTerm = '';
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.loadEventsByCategory();
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
        this.activeEventCategory = categories.find((category: any) => category._id === categoryId) || {};
      },
      error: () => {
        this.activeEventCategory = {};
      }
    });
  }
}
