import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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
  tags = input<string | string[] | undefined>(undefined);
  expectations = input<string[] | undefined>(undefined);
  audiencePreferenceLabel = input<string>('');
  audiencePreferenceIcon = input<string>('');
  eventPriceLabel = input<string>('');

  parsedTags = computed<string[]>(() => {
    const raw = this.tags();
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(t => String(t).trim()).filter(Boolean);
    }
    if (typeof raw === 'string') {
      return raw.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
  });

  parsedExpectations = computed<string[]>(() => {
    const raw = this.expectations();
    if (!Array.isArray(raw)) return [];
    return raw.map(e => String(e).trim()).filter(Boolean);
  });
}

