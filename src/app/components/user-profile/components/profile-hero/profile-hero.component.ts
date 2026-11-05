import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';

export type PhotoPreviewItem = {
  url: string;
  index: number;
  label?: string;
};

@Component({
  selector: 'vl-profile-hero',
  imports: [BackButtonComponent],
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
  age = input<number | string | null | undefined>(undefined);
  gender = input('');
  location = input('');
  photoPreviewItems = input<PhotoPreviewItem[]>([]);
  hiddenPhotoCount = input(0);

  editProfile = output<void>();
  editAvatar = output<void>();
  photoSelected = output<number>();
  imageError = output<Event>();
  goBack = output<void>();
}
