import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'vl-interest-pill-list',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './interest-pill-list.component.html',
  styleUrl: './interest-pill-list.component.scss',
})
export class InterestPillListComponent {
  interests = input<any[]>([]);
  extraCount = input(0);

  getInterestLabel(interest: any): string {
    return typeof interest === 'string' ? interest : interest?.label || '';
  }

  getInterestIconClass(interest: any): string {
    if (interest?.icon) return interest.icon;

    const value = this.getInterestLabel(interest).toLowerCase();

    if (value.includes('travel') || value.includes('trip')) return 'fa-solid fa-route';
    if (value.includes('drive')) return 'fa-solid fa-car-side';
    if (value.includes('food') || value.includes('dining')) return 'fa-solid fa-utensils';
    if (value.includes('coffee') || value.includes('cafe') || value.includes('chai')) return 'fa-solid fa-mug-hot';
    if (value.includes('music')) return 'fa-solid fa-music';
    if (value.includes('photo')) return 'fa-solid fa-camera';
    if (value.includes('movie')) return 'fa-solid fa-film';

    return 'fa-solid fa-star';
  }

  getInterestTone(index: number): string {
    return ['teal', 'green', 'blue', 'amber', 'purple'][index % 5];
  }
}
