import { Component, CUSTOM_ELEMENTS_SCHEMA, input, ElementRef, viewChild, afterNextRender, inject } from '@angular/core';
import { SwiperConfigService } from '../swiper-registry.service';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'vl-banner-carousel',
  standalone: true,
  templateUrl: './banner-carousel.component.html',
  styleUrl: './banner-carousel.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BannerCarouselComponent {
  autoplayDelay = input<number>(3500);
  showProgress = input<boolean>(true);
  effect = input<'fade' | 'slide' | 'coverflow' | 'cards'>('fade');
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
          slidesPerView: 1,
          effect: this.effect(),
          navigation: true,
          pagination: { 
            type: this.showProgress() ? 'progressbar' : 'bullets',
            clickable: true 
          },
          autoplay: {
            delay: this.autoplayDelay(),
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          },
          loop: this.loop(),
          keyboard: { enabled: true },
          grabCursor: true
        };
        
        Object.assign(swiperEl, swiperParams);
        swiperEl.initialize();
      }
    });
  }
}
