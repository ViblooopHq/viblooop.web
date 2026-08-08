import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'vl-profile-stats',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-stats.component.html',
  styleUrl: './profile-stats.component.scss',
})
export class ProfileStatsComponent {
  averageRating = input(0);
  totalRatings = input(0);
  joinedCount = input(0);
  hostedCount = input(0);
}
