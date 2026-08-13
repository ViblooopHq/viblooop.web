import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PopularCardConfig {
  image: string;
  badgeText: string;
  badgeType: 'live' | 'premier';
  viewCount: string;
  title: string;
}

@Component({
  selector: 'vl-popular-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular-card.component.html',
  styleUrl: './popular-card.component.scss'
})
export class PopularCardComponent {
  config = input.required<PopularCardConfig>();
}
