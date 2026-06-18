import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventData } from '../../../../../data';
import { EventsService } from '../../../shared/services/events/events.service';
import { SectionHeadersComponent } from '../../../shared/components/section-headers/section-headers.component';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PastEventCardComponent, PastEventCardConfig } from '../../../shared/components/past-event-card/past-event-card.component';
import { RouteService } from '../../../shared/services/route/route.service';
export interface EventFilter {
  id: string;
  label: string;
  icon: string;
}

interface FeaturedVibe {
  id: string;
  label: string;
  description: string;
  icon: string;
  cover: string;
  matchTerms: string[];
  tone: 'party' | 'games' | 'travel';
}

@Component({
  selector: 'vl-explore-events',
  standalone: true,
  imports: [CommonModule, SectionHeadersComponent, EventCardComponent, EmptyStateComponent, PastEventCardComponent],
  templateUrl: './explore-events.component.html',
  styleUrl: './explore-events.component.scss',
})
export class ExploreEventsComponent implements OnInit {
  categories: any[] = [];
  trendingEvents: any[] = [];
  justForYouEvents: any[] = [];
  pastEvents: any[] = [];
  allEvents: any[] = [];
  private eventsService = inject(EventsService);
  private router = inject(RouteService);

  featuredVibes: FeaturedVibe[] = [
    {
      id: 'house-party',
      label: 'House Party',
      description: 'Host, chill & make memories',
      icon: 'fa-solid fa-house',
      cover: 'assets/vibe-previews/event_drinks_vibe_1778313033072.png',
      matchTerms: ['house', 'party', 'nightlife', 'drinks', 'music', 'social'],
      tone: 'party',
    },
    {
      id: 'games',
      label: 'Games',
      description: 'Play, compete & connect',
      icon: 'fa-solid fa-gamepad',
      cover: 'assets/images/play-page-bg.png',
      matchTerms: ['game', 'games', 'gaming', 'play', 'sports', 'compete'],
      tone: 'games',
    },
    {
      id: 'travel',
      label: 'Travel',
      description: 'Explore, escape & create stories',
      icon: 'fa-solid fa-plane',
      cover: 'assets/images/escape-page-bg.png',
      matchTerms: ['travel', 'escape', 'outdoor', 'adventure', 'trek', 'trip', 'hike'],
      tone: 'travel',
    },
  ];

  filters: EventFilter[] = [
    { id: 'all', label: 'All', icon: 'celebration' },
    { id: 'tonight', label: 'Tonight', icon: 'sports_tennis' },
    { id: 'this_weekend', label: 'This weekend', icon: 'self_improvement' },
    { id: 'free', label: 'Free', icon: 'flight_takeoff' }
  ];

  ngOnInit() {

    this.loadCategories();
    this.loadEvents();

    // Flatten some events for random distribution
    const allEvents = EventData.reduce((acc, cat) => {
      return [...acc, ...cat.events];
    }, [] as any[]);

    this.allEvents = allEvents;
    this.applyFilters();
  }

  activeFilterId: string = 'all'; // Default active filter
  activeCategoryId: string = 'all';
  activeFeaturedVibeId: string | null = null;

  setActiveFilter(id: string) {
    this.activeFilterId = id;
    this.applyFilters();
  }

  setActiveCategory(id: string) {
    this.activeCategoryId = this.activeCategoryId === id ? 'all' : id;
    this.activeFeaturedVibeId = null;
    this.applyFilters();
  }

  setFeaturedVibe(vibe: FeaturedVibe) {
    const isAlreadyActive = this.activeFeaturedVibeId === vibe.id;
    this.activeFeaturedVibeId = isAlreadyActive ? null : vibe.id;
    this.activeCategoryId = isAlreadyActive ? 'all' : (this.findCategoryForVibe(vibe)?.id || 'all');
    this.applyFilters();
  }

  isFeaturedVibeActive(vibe: FeaturedVibe): boolean {
    if (this.activeFeaturedVibeId === vibe.id) return true;
    if (this.activeFeaturedVibeId) return false;

    const selectedCategory = this.categories.find((category) => category.id === this.activeCategoryId);
    return !!selectedCategory && this.matchesVibeTerms(this.categorySearchText(selectedCategory), vibe);
  }

  resetFilters() {
    this.activeFilterId = 'all';
    this.activeCategoryId = 'all';
    this.activeFeaturedVibeId = null;
    this.applyFilters();
  }

  getFeaturedVibeEventCount(vibe: FeaturedVibe): number {
    return this.allEvents
      .filter((event) => this.matchesFeaturedVibe(event, vibe))
      .filter((event) => this.matchesQuickFilter(event, this.activeFilterId))
      .filter((event) => !this.isPastEvent(event))
      .length;
  }

  getPastEventCardConfig(event: any): PastEventCardConfig {
    const city = event?.address?.city || event?.city;
    const state = event?.address?.state || event?.state;
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

    return {
      title: event?.title,
      image: event?.image,
      eventDate: event?.eventDate,
      city,
      state,
      location: event?.location || [city, state].filter(Boolean).join(', '),
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
    const activeVibe = this.getActiveFeaturedVibe();
    if (activeVibe) return activeVibe.label;
    if (this.activeCategoryId === 'all') return 'events';

    const selectedCategory = this.categories.find((category) => category.id === this.activeCategoryId);
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

  private loadCategories() {
    this.eventsService.getEventCategories().subscribe((categories: any) => {
      if (categories.success && categories.statusCode === 200) {
        this.categories = categories.data.categories.map((category: any) => {
          return {
            id: category._id,
            label: category.title,
            icon: category.icon,
            cover: category.image,
            tags: category.tags || []
          };
        });
        this.applyFilters();
      }
    }, (error: any) => {
      console.log(error);
    });
  }

  private loadEvents() {
    this.eventsService.getAllEvents().subscribe((events: any) => {
      this.allEvents = Array.isArray(events.data) ? events.data : [];
      this.applyFilters();
    });
  }

  private applyFilters() {
    let filteredUpcomingEvents = this.allEvents.filter((event) => !this.isPastEvent(event));
    const activeVibe = this.getActiveFeaturedVibe();

    if (activeVibe) {
      filteredUpcomingEvents = filteredUpcomingEvents.filter((event) => this.matchesFeaturedVibe(event, activeVibe));
    } else if (this.activeCategoryId !== 'all') {
      filteredUpcomingEvents = filteredUpcomingEvents.filter((event) => this.matchesCategory(event, this.activeCategoryId));
    }

    filteredUpcomingEvents = filteredUpcomingEvents.filter((event) => this.matchesQuickFilter(event, this.activeFilterId));

    this.trendingEvents = filteredUpcomingEvents;
    this.justForYouEvents = this.allEvents.filter((event) => !this.isPastEvent(event));
    this.pastEvents = this.allEvents.filter((event) => this.isPastEvent(event));
  }

  private matchesQuickFilter(event: any, filterId: string): boolean {
    switch (filterId) {
      case 'tonight':
        return this.isTonight(event);
      case 'this_weekend':
        return this.isThisWeekend(event);
      case 'free':
        return this.isFreeEvent(event);
      default:
        return true;
    }
  }

  private matchesCategory(event: any, categoryId: string): boolean {
    const category = event?.category;
    const selectedCategory = this.categories.find((cat) => cat.id === categoryId);

    return category?._id === categoryId
      || category === categoryId
      || this.normalizeForMatch(category?.title) === this.normalizeForMatch(selectedCategory?.label)
      || this.normalizeForMatch(category?.name) === this.normalizeForMatch(selectedCategory?.label);
  }

  private getActiveFeaturedVibe(): FeaturedVibe | null {
    if (!this.activeFeaturedVibeId) return null;
    return this.featuredVibes.find((vibe) => vibe.id === this.activeFeaturedVibeId) || null;
  }

  private findCategoryForVibe(vibe: FeaturedVibe): any | null {
    return this.categories.find((category) => this.matchesVibeTerms(this.categorySearchText(category), vibe)) || null;
  }

  private matchesFeaturedVibe(event: any, vibe: FeaturedVibe): boolean {
    return this.matchesVibeTerms(this.eventSearchText(event), vibe);
  }

  private matchesVibeTerms(searchText: string, vibe: FeaturedVibe): boolean {
    const text = this.normalizeForMatch(searchText);
    return vibe.matchTerms.some((term) => text.includes(this.normalizeForMatch(term)));
  }

  private eventSearchText(event: any): string {
    const category = event?.category;
    const categoryId = typeof category === 'string' ? category : category?._id;
    const selectedCategory = this.categories.find((cat) => cat.id === categoryId);

    return [
      event?.title,
      event?.description,
      event?.location,
      event?.city,
      event?.type,
      event?.eventType,
      event?.vibe,
      event?.categoryTitle,
      category,
      category?.title,
      category?.name,
      selectedCategory?.label,
      ...(Array.isArray(event?.tags) ? event.tags : []),
      ...(Array.isArray(event?.vibes) ? event.vibes : []),
      ...(Array.isArray(event?.interests) ? event.interests : []),
      ...(Array.isArray(selectedCategory?.tags) ? selectedCategory.tags : []),
    ].filter(Boolean).join(' ');
  }

  private categorySearchText(category: any): string {
    return [
      category?.label,
      category?.title,
      category?.name,
      ...(Array.isArray(category?.tags) ? category.tags : []),
    ].filter(Boolean).join(' ');
  }

  private isTonight(event: any): boolean {
    const eventDateTime = this.getEventDateTime(event);
    if (!eventDateTime) return false;

    const now = new Date();
    return this.isSameDay(eventDateTime, now) && eventDateTime >= now;
  }

  private isThisWeekend(event: any): boolean {
    const eventDateTime = this.getEventDateTime(event);
    if (!eventDateTime) return false;

    const today = this.startOfDay(new Date());
    const eventDay = this.startOfDay(eventDateTime);
    if (eventDay < today) return false;

    const start = new Date(today);
    const end = new Date(today);
    const todayDay = today.getDay();

    if (todayDay === 0) {
      end.setDate(today.getDate());
    } else if (todayDay === 6) {
      end.setDate(today.getDate() + 1);
    } else {
      const daysUntilSaturday = 6 - todayDay;
      start.setDate(today.getDate() + daysUntilSaturday);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 1);
    }

    return eventDay >= start && eventDay <= end;
  }

  private isFreeEvent(event: any): boolean {
    const cost = this.normalize(event?.cost);
    const price = Number(event?.price || 0);

    return cost === 'free' || price === 0;
  }

  private isPastEvent(event: any): boolean {
    const eventDateTime = this.getEventDateTime(event);
    return !!eventDateTime && eventDateTime < new Date();
  }

  private getEventDateTime(event: any): Date | null {
    if (!event?.eventDate) return null;

    const eventDateTime = new Date(event.eventDate);
    if (Number.isNaN(eventDateTime.getTime())) return null;

    if (event.eventTime) {
      const parsedTime = this.parseEventTime(event.eventTime);
      eventDateTime.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    }

    return eventDateTime;
  }

  private parseEventTime(value: string): { hours: number; minutes: number } {
    const [time, modifier] = value.trim().split(/\s+/);
    let [hours, minutes] = time.split(':').map(Number);

    if (Number.isNaN(hours)) hours = 0;
    if (Number.isNaN(minutes)) minutes = 0;
    if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  }

  private isSameDay(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear()
      && first.getMonth() === second.getMonth()
      && first.getDate() === second.getDate();
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private normalize(value: any): string {
    return String(value || '').trim().toLowerCase();
  }

  private normalizeForMatch(value: any): string {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  }

}
