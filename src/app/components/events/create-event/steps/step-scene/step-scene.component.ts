import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CreateEventFormService } from '../../state/create-event-form.service';
import { CoverImageUploadComponent } from '../../ui/cover-image-upload/cover-image-upload.component';
import { PricingSelectorComponent } from '../../ui/pricing-selector/pricing-selector.component';
import { ChatAccessSelectorComponent } from '../../ui/chat-access-selector/chat-access-selector.component';
import { HostNotesQuickAddComponent } from '../../ui/host-notes-quick-add/host-notes-quick-add.component';
import { ExpectationsChipSelectorComponent } from '../../ui/expectations-chip-selector/expectations-chip-selector.component';

@Component({
  selector: 'vl-step-scene',
  standalone: true,
  imports: [
    CoverImageUploadComponent,
    PricingSelectorComponent,
    ChatAccessSelectorComponent,
    HostNotesQuickAddComponent,
    ExpectationsChipSelectorComponent,
  ],
  templateUrl: './step-scene.component.html',
  styleUrl: './step-scene.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepSceneComponent {
  protected readonly formService = inject(CreateEventFormService);

  readonly next = output<void>();

  setPrice(value: string): void {
    this.formService.eventForm.get('price')?.setValue(value);
  }
}
