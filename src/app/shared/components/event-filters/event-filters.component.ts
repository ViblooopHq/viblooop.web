import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

export interface EventFilterOption {
  id: string;
  label: string;
}

@Component({
  selector: 'vl-event-filters',
  standalone: true,
  templateUrl: './event-filters.component.html',
  styleUrl: './event-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventFiltersComponent {
  readonly filters = input<readonly EventFilterOption[]>([]);
  readonly activeFilterId = input('all');
  readonly placeholder = input('Search events, vibes, or locations...');
  readonly searchAriaLabel = input('Search events');
  readonly searchTerm = model('');
  readonly filterChange = output<string>();

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  selectFilter(filterId: string): void {
    this.filterChange.emit(filterId);
  }
}
