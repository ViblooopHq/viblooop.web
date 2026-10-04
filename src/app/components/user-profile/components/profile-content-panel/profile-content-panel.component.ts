import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { GalleryComponent } from '../../../../shared/components/gallery/gallery.component';
import { EventCardComponent } from '../../../../shared/components/event-card/event-card.component';
import { CompactEventCardComponent } from '../../../../shared/components/compact-event-card/compact-event-card.component';
import { EventCardSkeletonComponent } from '../../../../shared/components/event-card-skeleton/event-card-skeleton.component';
import { InterestPillListComponent } from '../interest-pill-list/interest-pill-list.component';
import { RouteService } from '../../../../shared/services/route/route.service';

@Component({
  selector: 'vl-profile-content-panel',
  imports: [EventCardComponent, CompactEventCardComponent, EventCardSkeletonComponent, GalleryComponent, InterestPillListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-content-panel.component.html',
  styleUrl: './profile-content-panel.component.scss',
})
export class ProfileContentPanelComponent {
  private readonly routeService = inject(RouteService);

  tabs = input<string[]>([]);
  activeTab = input('');
  isCurrentUser = input<boolean>(false);
  isJoinedLoading = input<boolean>(false);
  isHostedLoading = input<boolean>(false);
  isGalleryLoading = input<boolean>(false);
  visibleJoinedEvents = input<any[]>([]);
  totalJoinedCount = input(0);
  visibleHostedEvents = input<any[]>([]);
  totalHostedCount = input(0);
  userGallery = input<any[]>([]);
  visibleInterests = input<any[]>([]);
  hiddenInterestCount = input(0);

  tabChange = output<string>();
  showMoreJoined = output<void>();
  showMoreHosted = output<void>();

  exploreEvents(): void {
    this.routeService.navigateByUrl('/');
  }

  createEvent(): void {
    this.routeService.navigateToDrawer('create-event', '/create-event');
  }

  getTabIcon(tab: string): string {
    switch (tab) {
      case 'Joined':
        return 'event_available';
      case 'Hosted':
        return 'edit_calendar';
      case 'Gallery':
        return 'photo_library';
      default:
        return '';
    }
  }
}
