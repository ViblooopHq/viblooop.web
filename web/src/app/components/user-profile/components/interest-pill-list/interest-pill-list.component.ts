import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PillComponent } from '../../../../shared/components/pill/pill.component';

@Component({
  selector: 'vl-interest-pill-list',
  standalone: true,
  imports: [PillComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './interest-pill-list.component.html',
  styleUrl: './interest-pill-list.component.scss',
})
export class InterestPillListComponent {
  interests = input<any[]>([]);
  extraCount = input(0);
  size = input<'sm' | 'md' | 'lg'>('md');

  getInterestLabel(interest: any): string {
    return typeof interest === 'string' ? interest : interest?.displayLabel || interest?.label || '';
  }
}

