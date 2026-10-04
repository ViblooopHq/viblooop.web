import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vl-profile-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-skeleton.component.html',
  styleUrl: './profile-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSkeletonComponent {
  readonly interestPlaceholders = Array.from({ length: 3 }, (_, i) => i);
  readonly photoPlaceholders = Array.from({ length: 4 }, (_, i) => i);
  readonly eventCardPlaceholders = Array.from({ length: 3 }, (_, i) => i);
}
