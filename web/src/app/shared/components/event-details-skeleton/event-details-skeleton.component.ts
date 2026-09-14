import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vl-event-details-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-details-skeleton.component.html',
  styleUrl: './event-details-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailsSkeletonComponent {
  readonly expectationPlaceholders = Array.from({ length: 3 }, (_, i) => i);
  readonly tagPlaceholders = Array.from({ length: 4 }, (_, i) => i);
  readonly factPlaceholders = Array.from({ length: 5 }, (_, i) => i);
  readonly reviewPlaceholders = Array.from({ length: 2 }, (_, i) => i);
  readonly relatedCardPlaceholders = Array.from({ length: 3 }, (_, i) => i);
}
