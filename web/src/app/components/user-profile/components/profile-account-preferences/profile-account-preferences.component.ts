import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'vl-profile-account-preferences',
  standalone: true,
  templateUrl: './profile-account-preferences.component.html',
  styleUrl: './profile-account-preferences.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileAccountPreferencesComponent {
  readonly editProfile = output<void>();
  readonly logout = output<void>();
}
