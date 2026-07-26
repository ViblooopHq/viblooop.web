import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { ImageUrlPipe } from '../../../../../shared/pipes/image-url.pipe';
import { EventDrawerPerson, RequestActionState } from '../../../../../shared/interfaces/event.interface';

export interface JoinRequestView {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  state: RequestActionState;
}

@Component({
  selector: 'vl-event-people-drawer',
  imports: [ImageUrlPipe, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-people-drawer.component.html',
  styleUrl: './event-people-drawer.component.scss',
})
export class EventPeopleDrawerComponent {
  mode = input<'requests' | 'attendees' | null>(null);
  eventTitle = input('Event');
  title = input('');
  subtitle = input('');
  pendingRequests = input<JoinRequestView[]>([]);
  attendees = input<EventDrawerPerson[]>([]);

  close = output<void>();
  accept = output<JoinRequestView>();
  reject = output<JoinRequestView>();
  viewPerson = output<string>();
}
