import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'vl-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Select date';
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;
  @Input() outputType: 'iso' | 'date' = 'iso';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = true;

  readonly selectedDate = signal<Date | null>(null);

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (!value) {
      this.selectedDate.set(null);
      return;
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
      this.selectedDate.set(value);
      return;
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        this.selectedDate.set(parsed);
        return;
      }
    }

    this.selectedDate.set(null);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDateChange(event: any): void {
    const rawDate: Date | null = event.value;
    this.selectedDate.set(rawDate);

    if (!rawDate) {
      this.onChange(null);
      this.onTouched();
      return;
    }

    if (this.outputType === 'date') {
      this.onChange(rawDate);
    } else {
      // Format to YYYY-MM-DD local representation
      const year = rawDate.getFullYear();
      const month = String(rawDate.getMonth() + 1).padStart(2, '0');
      const day = String(rawDate.getDate()).padStart(2, '0');
      this.onChange(`${year}-${month}-${day}`);
    }

    this.onTouched();
  }
}
