import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateEventFormService } from '../../state/create-event-form.service';
import { TimePickerDropdownComponent } from '../../ui/time-picker-dropdown/time-picker-dropdown.component';
import { CapacitySelectorComponent } from '../../ui/capacity-selector/capacity-selector.component';
import { AudiencePreferenceSelectorComponent } from '../../ui/audience-preference-selector/audience-preference-selector.component';
import { DatepickerComponent } from '../../../../../shared/components/datepicker/datepicker.component';
import { DurationPickerDropdownComponent } from '../../ui/duration-picker-dropdown/duration-picker-dropdown.component';

@Component({
  selector: 'vl-step-essentials',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatepickerComponent,
    TimePickerDropdownComponent,
    DurationPickerDropdownComponent,
    CapacitySelectorComponent,
    AudiencePreferenceSelectorComponent,
  ],
  templateUrl: './step-essentials.component.html',
  styleUrl: './step-essentials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepEssentialsComponent {
  protected readonly formService = inject(CreateEventFormService);
  readonly hangoutDurations = [
    { value: 2, label: '2 hours' },
    { value: 3, label: '3 hours' },
    { value: 4, label: '4 hours' },
    { value: 6, label: '6 hours' },
    { value: 8, label: '8 hours' },
    { value: 10, label: '10 hours' },
    { value: 12, label: '12 hours' },
  ];

  readonly next = output<void>();

  setEventTime(value: string): void {
    this.formService.eventForm.get('eventTime')?.setValue(value);
  }

  setEndTime(value: string): void {
    this.formService.eventForm.get('endTime')?.setValue(value);
  }

  setDuration(value: number): void {
    this.formService.eventForm.get('durationHours')?.setValue(value);
  }
}
