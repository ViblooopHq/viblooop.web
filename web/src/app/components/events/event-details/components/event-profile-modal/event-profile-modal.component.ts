import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { ProfileComponent } from '../../../../user-profile/profile/profile.component';

@Component({
  selector: 'vl-event-profile-modal',
  imports: [ProfileComponent, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-profile-modal.component.html',
  styleUrl: './event-profile-modal.component.scss',
})
export class EventProfileModalComponent {
  isOpen = input(false);
  userId = input('');

  close = output<void>();
}
