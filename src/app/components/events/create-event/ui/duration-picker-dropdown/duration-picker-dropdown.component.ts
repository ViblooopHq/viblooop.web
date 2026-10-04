import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { OutsideClickDirective } from '../../../../../directives/outside-click.directive';

export interface DurationOption {
  value: number;
  label: string;
}

@Component({
  selector: 'vl-duration-picker-dropdown',
  standalone: true,
  imports: [OutsideClickDirective],
  templateUrl: './duration-picker-dropdown.component.html',
  styleUrl: './duration-picker-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DurationPickerDropdownComponent {
  readonly options = input.required<readonly DurationOption[]>();
  readonly value = input.required<number>();
  readonly valueChange = output<number>();
  readonly isOpen = signal(false);

  selectedLabel(): string {
    return this.options().find(option => option.value === this.value())?.label ?? '';
  }

  toggle(): void {
    this.isOpen.update(open => !open);
  }

  select(value: number): void {
    this.valueChange.emit(value);
    this.isOpen.set(false);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.isOpen.set(false);
  }
}
