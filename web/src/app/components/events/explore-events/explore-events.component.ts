import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventData } from '../../../../../data';
import { EventsService } from '../../../shared/services/events/events.service';
import { SectionHeadersComponent } from '../../../shared/components/section-headers/section-headers.component';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
export interface EventFilter {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'vl-explore-events',
  standalone: true,
  imports: [CommonModule, SectionHeadersComponent, EventCardComponent, EmptyStateComponent],
  templateUrl: './explore-events.component.html',
  styleUrl: './explore-events.component.scss',
})
export class ExploreEventsComponent implements OnInit {
  categories: any[] = [];
  trendingEvents: any[] = [];
  justForYouEvents: any[] = [];
  allEvents: any[] = [];
  private eventsService = inject(EventsService);

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

  setActiveFilter(id: string) {
    this.activeFilterId = id;
    this.applyFilters();
  }

  setActiveCategory(id: string) {
    this.activeCategoryId = this.activeCategoryId === id ? 'all' : id;
    this.applyFilters();
  }

  resetFilters() {
    this.activeFilterId = 'all';
    this.activeCategoryId = 'all';
    this.applyFilters();
  }

  get emptyStateSubject(): string {
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
            cover: category.image
          };
        });
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
    let filteredEvents = [...this.allEvents];

    if (this.activeCategoryId !== 'all') {
      filteredEvents = filteredEvents.filter((event) => this.matchesCategory(event, this.activeCategoryId));
    }

    filteredEvents = filteredEvents.filter((event) => this.matchesQuickFilter(event, this.activeFilterId));

    this.trendingEvents = filteredEvents;
    this.justForYouEvents = [...this.allEvents];
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
      || this.normalize(category?.title) === this.normalize(selectedCategory?.label);
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

}
