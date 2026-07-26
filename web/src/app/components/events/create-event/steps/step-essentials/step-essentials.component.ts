import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateEventFormService } from '../../state/create-event-form.service';
import { TimePickerDropdownComponent } from '../../ui/time-picker-dropdown/time-picker-dropdown.component';
import { CapacitySelectorComponent } from '../../ui/capacity-selector/capacity-selector.component';
import { AudiencePreferenceSelectorComponent } from '../../ui/audience-preference-selector/audience-preference-selector.component';

@Component({
  selector: 'vl-step-essentials',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
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
}
