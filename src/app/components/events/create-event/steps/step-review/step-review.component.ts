import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CreateEventFormService } from '../../state/create-event-form.service';
import { CreateEventImageUploadService } from '../../state/create-event-image-upload.service';
import { TimePipe } from '../../../../../shared/pipes/time.pipe';
import { SafetyAgreementCardComponent } from '../../ui/safety-agreement-card/safety-agreement-card.component';

@Component({
  selector: 'vl-step-review',
  standalone: true,
  imports: [DatePipe, TimePipe, SafetyAgreementCardComponent],
  templateUrl: './step-review.component.html',
  styleUrl: './step-review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepReviewComponent {
  protected readonly formService = inject(CreateEventFormService);
  protected readonly imageUpload = inject(CreateEventImageUploadService);

  readonly isSubmittingEvent = input.required<boolean>();

  readonly editScene = output<void>();
  readonly launch = output<void>();

  setSafetyAgreement(value: boolean): void {
    this.formService.eventForm.get('safetyAgreement')?.setValue(value);
  }
}
