import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventsService } from '../../../shared/services/events/events.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { CompactEventCardComponent } from '../../../shared/components/compact-event-card/compact-event-card.component';
import { EventCardSkeletonComponent } from '../../../shared/components/event-card-skeleton/event-card-skeleton.component';
import { PastEventCardComponent, PastEventCardConfig } from '../../../shared/components/past-event-card/past-event-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { RouteService } from '../../../shared/services/route/route.service';

@Component({
  selector: 'vl-view-all-events',
  standalone: true,
  imports: [CommonModule, RouterModule, EventCardComponent, CompactEventCardComponent, EventCardSkeletonComponent, PastEventCardComponent, EmptyStateComponent],
  templateUrl: './view-all-events.component.html',
  styleUrls: ['./view-all-events.component.scss']
})
export class ViewAllEventsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private eventsService = inject(EventsService);
  private routeService = inject(RouteService);
  private location = inject(Location);

  collectionType = signal<string>('all');
  events = signal<any[]>([]);
  nextCursor = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  isInitialLoad = signal<boolean>(true);

  // Dynamic banner variables
  bannerTitle = signal<string>('All Events');
  bannerDescription = signal<string>('Discover amazing events around you');
  bannerImage = signal<string>('assets/images/default-banner.jpg');

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.routeService.navigateByUrl('/');
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const type = params.get('collection') || 'all';
      this.collectionType.set(type);
      this.updateBannerInfo(type);
      this.events.set([]); // Reset on route change
      this.nextCursor.set(null);
      this.loadEvents();
    });
  }

  updateBannerInfo(type: string): void {
    if (type === 'past-vibes' || type === 'past') {
      this.bannerTitle.set('Past Vibes');
      this.bannerDescription.set('Relive the best moments from our past events.');
      this.bannerImage.set('assets/images/escape-page-bg.png');
    } else if (type === 'trending') {
      this.bannerTitle.set('Trending Vibes');
      this.bannerDescription.set('Discover the most hyped and trending events right now.');
      this.bannerImage.set('assets/images/play-page-bg.png');
    } else if (type === 'popular') {
      this.bannerTitle.set('Popular Now');
      this.bannerDescription.set('Events that everyone is talking about.');
      this.bannerImage.set('assets/vibe-previews/event_drinks_vibe_1778313033072.png');
    } else {
      this.bannerTitle.set('All Events');
      this.bannerDescription.set('Explore a wide variety of amazing experiences.');
      this.bannerImage.set('assets/images/escape-page-bg.png'); // dummy default
    }
  }

  loadEvents(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    const cursor = this.nextCursor();
    const eventsRequest = this.isPastCollection()
      ? this.eventsService.getPastEvents(cursor || undefined, 20)
      : this.eventsService.getEventsCollection(this.collectionType(), cursor || undefined, 20);

    eventsRequest.subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.events.update(current => [...current, ...res.data.events]);
          this.nextCursor.set(res.data.nextCursor);
        }
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.isLoading.set(false);
        this.isInitialLoad.set(false);
      }
    });
  }

  loadMore(): void {
    if (this.nextCursor()) {
      this.loadEvents();
    }
  }

  isPastCollection(): boolean {
    const type = this.collectionType();
    return type === 'past-vibes' || type === 'past';
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
    };
  }

  viewEvent(event: any): void {
    if (event?._id) {
      this.routeService.navigate('/events', event._id);
    }
  }
}
