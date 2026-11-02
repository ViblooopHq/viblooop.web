import { Component, computed, input } from '@angular/core';
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
  slideIndex?: number;
  totalSlides?: number;
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
  slideIndex = input<number | undefined>();
  totalSlides = input<number | undefined>();

  readonly formattedIndex = computed(() => {
    const idx = this.slideIndex() ?? this.slide().slideIndex ?? 1;
    return idx.toString().padStart(2, '0');
  });

  readonly formattedTotal = computed(() => {
    const tot = this.totalSlides() ?? this.slide().totalSlides ?? 3;
    return tot.toString().padStart(2, '0');
  });
}

