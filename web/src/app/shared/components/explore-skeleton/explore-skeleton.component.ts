import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vl-explore-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore-skeleton.component.html',
  styleUrl: './explore-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreSkeletonComponent {
  readonly categoryPlaceholders = Array.from({ length: 8 }, (_, i) => i);
  readonly trendingCardPlaceholders = Array.from({ length: 4 }, (_, i) => i);
  readonly forYouCardPlaceholders = Array.from({ length: 4 }, (_, i) => i);
  readonly pastCardPlaceholders = Array.from({ length: 3 }, (_, i) => i);
}
