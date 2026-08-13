import { Component, CUSTOM_ELEMENTS_SCHEMA, input, ElementRef, viewChild, afterNextRender, inject, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperConfigService } from '../swiper-registry.service';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'vl-multi-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-carousel.component.html',
  styleUrl: './multi-carousel.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MultiCarouselComponent {
  items = input<any[]>();
  @ContentChild(TemplateRef) template!: TemplateRef<any>;
  gap = input<number>(16);
  showNavigation = input<boolean>(true);
  showPagination = input<boolean>(true);
  autoplay = input<boolean | { delay: number, disableOnInteraction: boolean }>(false);
  loop = input<boolean>(false);
  
  preTitle = input<string>();
  title = input<string>();
  description = input<string>();
  
  breakpoints = input<any>({
    320: { slidesPerView: 1.2, spaceBetween: 12 },
    640: { slidesPerView: 2.2, spaceBetween: 16 },
    1024: { slidesPerView: 3.2, spaceBetween: 24 },
    1280: { slidesPerView: 4, spaceBetween: 24 }
  });

  private swiperRegistry = inject(SwiperConfigService);
  private platformId = inject(PLATFORM_ID);
  
  swiperContainer = viewChild<ElementRef>('swiperContainer');
  isServer = isPlatformServer(this.platformId);

  slidePrev() {
    this.swiperContainer()?.nativeElement.swiper.slidePrev();
  }

  slideNext() {
    this.swiperContainer()?.nativeElement.swiper.slideNext();
  }

  constructor() {
    afterNextRender(async () => {
      await this.swiperRegistry.registerSwiperElements();
      
      const swiperEl = this.swiperContainer()?.nativeElement;
      if (swiperEl) {
        const swiperParams = {
          spaceBetween: this.gap(),
          breakpoints: this.breakpoints(),
          navigation: this.showNavigation(),
          pagination: this.showPagination() ? { clickable: true } : false,
          autoplay: this.autoplay(),
          loop: this.loop(),
          keyboard: { enabled: true },
          grabCursor: true,
          observer: true,
          observeParents: true,
          observeSlideChildren: true
        };
        
        Object.assign(swiperEl, swiperParams);
        
        // Sometimes Angular content projection takes a moment
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
