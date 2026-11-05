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
  expectations = input<string[] | undefined>(undefined);

  parsedExpectations = computed<string[]>(() => {
    const raw = this.expectations();
    if (!Array.isArray(raw)) return [];
    return raw.map(e => String(e).trim()).filter(Boolean);
  });
}

