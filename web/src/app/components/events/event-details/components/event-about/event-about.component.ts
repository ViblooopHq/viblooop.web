import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'vl-event-about',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-about.component.html',
  styleUrl: './event-about.component.scss',
})
export class EventAboutComponent {
  description = input('');
  categoryTitle = input('Event');
  attendeeLimit = input<number | undefined>(undefined);
}
