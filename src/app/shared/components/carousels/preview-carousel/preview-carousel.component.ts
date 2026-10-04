import { Component, CUSTOM_ELEMENTS_SCHEMA, input, ElementRef, viewChild, afterNextRender, inject } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { SwiperConfigService } from '../swiper-registry.service';

export interface PreviewSlide {
  type: 'image' | 'video';
  url: string;
  preTitle?: string;
  title: string;
  description?: string;
  subtitle?: string;
}

@Component({
  selector: 'vl-preview-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-carousel.component.html',
  styleUrl: './preview-carousel.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PreviewCarouselComponent {
  items = input.required<PreviewSlide[]>();
  
  private swiperRegistry = inject(SwiperConfigService);
  private platformId = inject(PLATFORM_ID);
  
  mainSwiper = viewChild<ElementRef>('mainSwiper');
  thumbSwiper = viewChild<ElementRef>('thumbSwiper');
  
  isServer = isPlatformServer(this.platformId);

  constructor() {
    afterNextRender(async () => {
      await this.swiperRegistry.registerSwiperElements();
      
      const mainEl = this.mainSwiper()?.nativeElement;
      const thumbEl = this.thumbSwiper()?.nativeElement;
      
      if (mainEl && thumbEl) {
        // Initialize thumbnails first
        const thumbParams = {
          spaceBetween: 16,
          slidesPerView: 2.5,
          watchSlidesProgress: true,
          observer: true,
          observeParents: true,
          loop: true,
          loopedSlides: 4,
          injectStyles: [
            `
              .swiper {
                overflow: visible !important;
              }
              .swiper-wrapper {
                overflow: visible !important;
              }
            `
          ]
        };
        Object.assign(thumbEl, thumbParams);
        // Initialize main swiper and link thumbs
        const mainParams = {
          spaceBetween: 0,
          effect: 'creative',
          speed: 800,
          creativeEffect: {
            prev: {
              shadow: true,
              translate: [0, 0, -400],
              scale: 0.8,
              opacity: 0,
            },
            next: {
              translate: ['100%', 0, 0],
            },
          },
          loop: true,
          navigation: {
            nextEl: '.vl-nav-next',
            prevEl: '.vl-nav-prev',
          },
          pagination: {
            el: '.vl-custom-pagination',
            type: 'custom',
            renderCustom: function (swiper: any, current: number, total: number) {
              const formattedCurrent = current < 10 ? `0${current}` : current;
              const progress = (current / total) * 100;
              return `
                <div class="slide-progress-bar">
                  <div class="slide-progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="slide-count">${formattedCurrent}</span>
              `;
            }
          },
          keyboard: { enabled: true },
          observer: true,
          observeParents: true,
          on: {
            init: (swiper: any) => {
              setTimeout(() => {
                const activeSlide = swiper.slides[swiper.activeIndex];
                if (activeSlide) {
                  const video = activeSlide.querySelector('.slide-media video');
                  if (video) video.play();
                }
                
                // Initialize thumb position to CURRENT slide
                if (thumbEl && thumbEl.swiper) {
                  thumbEl.swiper.slideToLoop(swiper.realIndex, 0); 
                }
              }, 100);
            },
            slideChange: (swiper: any) => {
              const slides = swiper.slides;
              slides.forEach((slide: any, index: number) => {
                const video = slide.querySelector('.slide-media video');
                if (video) {
                  if (index === swiper.activeIndex) {
                    video.play();
                  } else {
                    video.pause();
                    video.currentTime = 0;
                  }
                }
              });

              // Animate thumb swiper to CURRENT slide
              if (thumbEl && thumbEl.swiper) {
                thumbEl.swiper.slideToLoop(swiper.realIndex);
              }
            }
          }
        };
        Object.assign(mainEl, mainParams);
        
        const tryInit = () => {
          if (typeof thumbEl.initialize === 'function') {
            if (!thumbEl.initialized) thumbEl.initialize();
            if (!mainEl.initialized) mainEl.initialize();
          } else {
            setTimeout(tryInit, 50);
          }
        };
        tryInit();
      }
    });
  }
}
