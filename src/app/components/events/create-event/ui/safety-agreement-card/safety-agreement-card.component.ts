import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';

@Component({
  selector: 'vl-safety-agreement-card',
  standalone: true,
  templateUrl: './safety-agreement-card.component.html',
  styleUrl: './safety-agreement-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SafetyAgreementCardComponent {
  readonly agreed = model(false);
  readonly isExpanded = signal(false);

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }

  onCheckboxChange(event: Event): void {
    this.agreed.set((event.target as HTMLInputElement).checked);
  }
}
