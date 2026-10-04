import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'vl-capacity-selector',
  standalone: true,
  templateUrl: './capacity-selector.component.html',
  styleUrl: './capacity-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapacitySelectorComponent {
  readonly limited = input.required<boolean>();
  readonly value = input.required<number>();
  readonly min = input(2);
  readonly max = input(250);
  readonly quickOptions = input<number[]>([]);

  readonly limitedChange = output<boolean>();
  readonly increment = output<void>();
  readonly decrement = output<void>();
  readonly valueInput = output<string>();
  readonly valueBlur = output<void>();
  readonly quickPick = output<number>();

  onInput(event: Event): void {
    this.valueInput.emit((event.target as HTMLInputElement).value);
  }
}
