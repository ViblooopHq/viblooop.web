import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimePipe } from '../../../../../shared/pipes/time.pipe';
import { eventDurationLabel } from '../../event-schedule.util';

@Component({
  selector: 'vl-event-facts',
  imports: [DatePipe, TimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-facts.component.html',
  styleUrl: './event-facts.component.scss',
})
export class EventFactsComponent {
  isEscapeEvent = input(false);
  isEventEnded = input(false);
  tripDateRangeLabel = input('');
  eventDate = input<string | undefined>(undefined);
  endDate = input<string | undefined>(undefined);
  eventTime = input<string | undefined>(undefined);
  endTime = input<string | undefined>(undefined);
  isSocialEvent = input(false);
  readonly isMultiDay = computed(() => !!this.eventDate() && !!this.endDate() && new Date(this.eventDate()!).toDateString() !== new Date(this.endDate()!).toDateString());
  readonly durationLabel = computed(() => eventDurationLabel(this.eventDate(), this.eventTime(), this.endDate(), this.endTime()));
  eventPriceLabel = input('Free');
  audiencePreferenceIcon = input('fa-solid fa-earth-asia');
  audiencePreferenceLabel = input('Open to everyone');
  totalAttendeesCount = input(0);
  remainingSpotsLabel = input('No limit');
}
