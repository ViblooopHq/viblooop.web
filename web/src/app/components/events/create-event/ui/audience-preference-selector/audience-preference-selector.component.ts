import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AudienceMixType } from '../../create-event.types';

@Component({
  selector: 'vl-audience-preference-selector',
  standalone: true,
  templateUrl: './audience-preference-selector.component.html',
  styleUrl: './audience-preference-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudiencePreferenceSelectorComponent {
  readonly mixType = input.required<AudienceMixType>();
  readonly mixTypeChange = output<AudienceMixType>();
}
