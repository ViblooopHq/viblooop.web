import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { InterestPillListComponent } from '../interest-pill-list/interest-pill-list.component';

export type PhotoPreviewItem = {
  url: string;
  index: number;
  label?: string;
};

@Component({
  selector: 'vl-profile-hero',
  imports: [InterestPillListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-hero.component.html',
  styleUrl: './profile-hero.component.scss',
})
export class ProfileHeroComponent {
  profileImage = input('');
  profileBanner = input('');
  displayName = input('');
  handle = input('');
  bio = input('');
  isVerified = input(false);
  isCurrentUser = input(false);
  previewInterests = input<any[]>([]);
  photoPreviewItems = input<PhotoPreviewItem[]>([]);
  hiddenPhotoCount = input(0);

  editProfile = output<void>();
  logout = output<void>();
  photoSelected = output<number>();
  imageError = output<Event>();
}
