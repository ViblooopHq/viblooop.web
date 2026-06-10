import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../../../shared/services/events/events.service';
import { EventCardComponent } from "../../../shared/components/event-card/event-card.component";
import { SharedService } from '../../../shared/services/shared.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'vl-events-list',
  imports: [EventCardComponent, NgClass],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit {
  breadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Discover', url: '/discover' }
  ];
  route: ActivatedRoute = inject(ActivatedRoute)
  eventService = inject(EventsService)
  mainService = inject(SharedService);

  activeEventCategory: any = {};
  activeCategoryEvents: any = [];

  ngOnInit() {
    const eventCategory = this.mainService.getFromLocalStorage('activeEventCategory');
    this.activeEventCategory = eventCategory ? JSON.parse(eventCategory) : {};
    console.log('Active Event Category:', this.activeEventCategory);
    this.route.params.subscribe(params => {
      const categoryId = params['categoryId'];
      this.loadEventsByCategory(categoryId);
    });
  }

  loadEventsByCategory(categoryId: string) {
    this.eventService.getEventsByCategory(categoryId).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }
        this.activeCategoryEvents = res.data ?? [];
        this.activeCategoryEvents.forEach((event: any) => {
          event.image = this.mainService.getImageUrl(event.image); // Ensure image URL is complete
        });
      },
      error: (err: any) => {
        console.error('Error fetching events by category:', err);
      }
    });
  }
}
