import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateEventFormService } from '../../state/create-event-form.service';
import { TimePickerDropdownComponent } from '../../ui/time-picker-dropdown/time-picker-dropdown.component';
import { CapacitySelectorComponent } from '../../ui/capacity-selector/capacity-selector.component';
import { AudiencePreferenceSelectorComponent } from '../../ui/audience-preference-selector/audience-preference-selector.component';
import { DatepickerComponent } from '../../../../../shared/components/datepicker/datepicker.component';

@Component({
  selector: 'vl-step-essentials',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatepickerComponent,
    TimePickerDropdownComponent,
    CapacitySelectorComponent,
    AudiencePreferenceSelectorComponent,
  ],
  templateUrl: './step-essentials.component.html',
  styleUrl: './step-essentials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepEssentialsComponent {
  protected readonly formService = inject(CreateEventFormService);

  readonly next = output<void>();

  setEventTime(value: string): void {
    this.formService.eventForm.get('eventTime')?.setValue(value);
  }

  setEndTime(value: string): void {
    this.formService.eventForm.get('endTime')?.setValue(value);
  }
}
