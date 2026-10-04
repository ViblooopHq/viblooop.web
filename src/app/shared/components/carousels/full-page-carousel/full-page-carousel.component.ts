import { Component, CUSTOM_ELEMENTS_SCHEMA, input, ElementRef, viewChild, afterNextRender, inject, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperConfigService } from '../swiper-registry.service';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'vl-full-page-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './full-page-carousel.component.html',
  styleUrl: './full-page-carousel.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FullPageCarouselComponent {
  items = input<any[]>();
  @ContentChild(TemplateRef) template!: TemplateRef<any>;
  direction = input<'horizontal' | 'vertical'>('horizontal');
  showPagination = input<boolean>(true);
  autoplay = input<boolean>(true);
  loop = input<boolean>(true);
  
  private swiperRegistry = inject(SwiperConfigService);
  private platformId = inject(PLATFORM_ID);
  
  swiperContainer = viewChild<ElementRef>('swiperContainer');
  isServer = isPlatformServer(this.platformId);

  constructor() {
    afterNextRender(async () => {
      await this.swiperRegistry.registerSwiperElements();
      
      const swiperEl = this.swiperContainer()?.nativeElement;
      if (swiperEl) {
        const swiperParams = {
          direction: this.direction(),
          slidesPerView: 1,
          spaceBetween: 0,
          mousewheel: true,
          pagination: this.showPagination() ? { clickable: true } : false,
          speed: 800,
          keyboard: { enabled: true },
          autoplay: this.autoplay() ? { delay: 4000, disableOnInteraction: false } : false,
          loop: this.loop(),
          observer: true,
          observeParents: true,
          observeSlideChildren: true
        };
        
        Object.assign(swiperEl, swiperParams);
        
        // Use a tiny timeout to allow Angular's HMR to finish rendering the DOM nodes
        // before Swiper initializes, preventing the slider from going blank on save.
        // 10ms is fast enough to prevent the visual layout jump we saw earlier.
        requestAnimationFrame(() => {
          const tryInit = () => {
            if (swiperEl && typeof swiperEl.initialize === 'function') {
              if (!swiperEl.initialized) swiperEl.initialize();
            } else {
              setTimeout(tryInit, 50);
            }
          };
          tryInit();
        });
      }
    });
  }
}
