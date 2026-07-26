import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { ImageUrlPipe } from '../../../../../shared/pipes/image-url.pipe';
import { EventCreator } from '../../../../../shared/interfaces/event.interface';

@Component({
  selector: 'vl-event-host-card',
  imports: [DecimalPipe, MatTooltip, ImageUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-host-card.component.html',
  styleUrl: './event-host-card.component.scss',
})
export class EventHostCardComponent {
  host = input<EventCreator | undefined>(undefined);
  hostEventCount = input(1);
  isNewHost = input(false);
  shouldShowRating = input(false);
  hostRating = input(0);

  viewProfile = output<void>();
}
