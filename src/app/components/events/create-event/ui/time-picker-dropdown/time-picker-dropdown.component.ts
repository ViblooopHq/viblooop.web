import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model, signal, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CREATE_EVENT_TIME_PICKER_CONFIG } from '../../create-event.config';

@Component({
  selector: 'vl-time-picker-dropdown',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './time-picker-dropdown.component.html',
  styleUrl: './time-picker-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimePickerDropdownComponent {
  /** 24h "HH:mm" value. */
  readonly value = model('');
  readonly placeholder = input('Select Time');

  readonly hours = CREATE_EVENT_TIME_PICKER_CONFIG.hours;
  readonly minutes = CREATE_EVENT_TIME_PICKER_CONFIG.minutes;
  readonly periods = CREATE_EVENT_TIME_PICKER_CONFIG.periods as ReadonlyArray<'AM' | 'PM'>;

  readonly isOpen = signal(false);
  readonly selectedHour = signal('12');
  readonly selectedMinute = signal('00');
  readonly selectedPeriod = signal<'AM' | 'PM'>('AM');

  private readonly triggerInput = viewChild<ElementRef<HTMLInputElement>>('triggerInput');

  readonly formattedDisplayTime = computed(() => {
    const val = this.value();
    if (!val) return '';
    const [h, m] = val.split(':');
    let hour = parseInt(h, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${m} ${period}`;
  });

  toggle(): void {
    this.isOpen.update(open => !open);
    if (this.isOpen()) this.syncFromValue();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.triggerInput()?.nativeElement.focus();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  onPickerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.close();
    }
  }

  selectHour(h: string): void {
    this.selectedHour.set(h);
    this.emitValue();
  }

  selectMinute(m: string): void {
    this.selectedMinute.set(m);
    this.emitValue();
  }

  selectPeriod(p: 'AM' | 'PM'): void {
    this.selectedPeriod.set(p);
    this.emitValue();
  }

  private syncFromValue(): void {
    const val = this.value();
    if (!val) return;

    const [h, m] = val.split(':');
    let hour = parseInt(h, 10);
    this.selectedPeriod.set(hour >= 12 ? 'PM' : 'AM');
    hour = hour % 12 || 12;
    this.selectedHour.set(String(hour).padStart(2, '0'));
    this.selectedMinute.set(m);
  }

  private emitValue(): void {
    let hour = parseInt(this.selectedHour(), 10);
    if (this.selectedPeriod() === 'PM' && hour < 12) hour += 12;
    if (this.selectedPeriod() === 'AM' && hour === 12) hour = 0;

    const formattedHour = String(hour).padStart(2, '0');
    this.value.set(`${formattedHour}:${this.selectedMinute()}`);
  }
}
