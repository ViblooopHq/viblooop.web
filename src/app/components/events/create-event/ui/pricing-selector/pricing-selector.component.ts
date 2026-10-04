import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { EventCostType } from '../../create-event.types';

@Component({
  selector: 'vl-pricing-selector',
  standalone: true,
  templateUrl: './pricing-selector.component.html',
  styleUrl: './pricing-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingSelectorComponent {
  readonly cost = input.required<EventCostType>();
  readonly price = input<number | string>('');

  readonly costChange = output<EventCostType>();
  readonly priceInput = output<string>();

  onPriceInput(event: Event): void {
    this.priceInput.emit((event.target as HTMLInputElement).value);
  }
}
