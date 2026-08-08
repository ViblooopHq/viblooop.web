import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'vl-profile-verification-banner',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-verification-banner.component.html',
  styleUrl: './profile-verification-banner.component.scss',
})
export class ProfileVerificationBannerComponent {
  isVerified = input(false);

  verify = output<void>();
}
