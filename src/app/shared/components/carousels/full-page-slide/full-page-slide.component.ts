import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface FloatingElement {
  text?: string;
  icon?: string;
  image?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface FullPageSlideConfig {
  kicker?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  ctaQuery?: Record<string, string>;
  image: string;
  imageAlt?: string;
  centerImage?: string;
  accentColor?: string;
  position?: string;
  floatingItems?: FloatingElement[];
}

@Component({
  selector: 'vl-full-page-slide',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './full-page-slide.component.html',
  styleUrl: './full-page-slide.component.scss'
})
export class FullPageSlideComponent {
  slide = input.required<FullPageSlideConfig>();
}

