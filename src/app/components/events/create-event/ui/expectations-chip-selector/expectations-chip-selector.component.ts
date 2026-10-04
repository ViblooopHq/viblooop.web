import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'vl-expectations-chip-selector',
  standalone: true,
  templateUrl: './expectations-chip-selector.component.html',
  styleUrl: './expectations-chip-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpectationsChipSelectorComponent {
  readonly selected = input<string[]>([]);
  readonly options = input.required<string[]>();

  readonly toggle = output<string>();

  isSelected(tag: string): boolean {
    return this.selected().includes(tag);
  }
}
