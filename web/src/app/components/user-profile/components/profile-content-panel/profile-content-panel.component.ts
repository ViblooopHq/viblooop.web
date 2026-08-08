import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GalleryComponent } from '../../../../shared/components/gallery/gallery.component';
import { EventCardComponent } from '../../../../shared/components/event-card/event-card.component';
import { InterestPillListComponent } from '../interest-pill-list/interest-pill-list.component';

@Component({
  selector: 'vl-profile-content-panel',
  imports: [EventCardComponent, GalleryComponent, InterestPillListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-content-panel.component.html',
  styleUrl: './profile-content-panel.component.scss',
})
export class ProfileContentPanelComponent {
  tabs = input<string[]>([]);
  activeTab = input('');
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
