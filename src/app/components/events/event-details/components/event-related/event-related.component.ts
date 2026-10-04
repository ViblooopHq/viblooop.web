import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EventCardComponent } from '../../../../../shared/components/event-card/event-card.component';

@Component({
  selector: 'vl-event-related',
  imports: [EventCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-related.component.html',
  styleUrl: './event-related.component.scss',
})
export class EventRelatedComponent {
  events = input<any[]>([]);
}
