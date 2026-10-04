import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'vl-event-card-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-card-skeleton.component.html',
  styleUrl: './event-card-skeleton.component.scss'
})
export class EventCardSkeletonComponent {
  count = input<number>(6);

  items = computed(() => Array.from({ length: this.count() }, (_, i) => i + 1));
}
