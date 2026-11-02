import { Component, CUSTOM_ELEMENTS_SCHEMA, input, output, ElementRef, viewChild, afterNextRender, inject, ContentChild, TemplateRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SwiperConfigService } from '../swiper-registry.service';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'vl-multi-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  endVisibilityChange = output<boolean>();
  
  preTitle = input<string>();
  title = input<string>();
  description = input<string>();
  headerActionLabel = input<string>();
  headerActionLink = input<string>();
  showHeaderAction = input<boolean>(false);
  
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

  readonly canSlide = signal<boolean>(false);
  readonly isBeginning = signal<boolean>(true);
  readonly isEnd = signal<boolean>(false);

  private updateNavState(swiper: any): void {
    if (!swiper) return;
    const isLocked = Boolean(swiper.isLocked) || (swiper.snapGrid && swiper.snapGrid.length <= 1);
    this.canSlide.set(!isLocked);
    this.isBeginning.set(Boolean(swiper.isBeginning));
    this.isEnd.set(Boolean(swiper.isEnd));
    this.endVisibilityChange.emit(Boolean(swiper.isEnd));
  }

  slidePrev() {
    this.swiperContainer()?.nativeElement?.swiper?.slidePrev();
  }

  slideNext() {
    this.swiperContainer()?.nativeElement?.swiper?.slideNext();
  }

  constructor() {
    effect(() => {
      // Re-evaluate navigation state when items list changes
      const itemsList = this.items();
      const swiperEl = this.swiperContainer()?.nativeElement;
      const swiper = swiperEl?.swiper;
      if (swiper) {
        requestAnimationFrame(() => {
          swiper.update();
          this.updateNavState(swiper);
        });
      }
    });

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
          observeSlideChildren: true,
          on: {
            init: (swiper: any) => this.updateNavState(swiper),
            slideChange: (swiper: any) => this.updateNavState(swiper),
            resize: (swiper: any) => this.updateNavState(swiper),
            reachEnd: (swiper: any) => this.updateNavState(swiper),
            reachBeginning: (swiper: any) => this.updateNavState(swiper),
            fromEdge: (swiper: any) => this.updateNavState(swiper),
            lock: (swiper: any) => this.updateNavState(swiper),
            unlock: (swiper: any) => this.updateNavState(swiper),
            update: (swiper: any) => this.updateNavState(swiper),
            observerUpdate: (swiper: any) => this.updateNavState(swiper)
          }
        };
        
        Object.assign(swiperEl, swiperParams);
        
        // Sometimes Angular content projection takes a moment
        requestAnimationFrame(() => {
          const tryInit = () => {
            if (swiperEl && typeof swiperEl.initialize === 'function') {
              if (!swiperEl.initialized) {
                swiperEl.initialize();
                this.updateNavState(swiperEl.swiper);
              }
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
