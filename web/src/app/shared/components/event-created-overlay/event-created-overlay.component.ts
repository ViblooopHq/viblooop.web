import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type CreationOverlayState = 'idle' | 'loading' | 'success' | 'error';

export interface CategoryIconPack {
  primaryIcon: string;
  categoryName: string;
  satelliteIcons: string[];
  loaderSteps: string[];
}

const CATEGORY_ICON_PACKS: Record<string, CategoryIconPack> = {
  party: {
    primaryIcon: 'fa-solid fa-champagne-glasses',
    categoryName: 'Social & Party',
    satelliteIcons: ['fa-solid fa-music', 'fa-solid fa-champagne-glasses', 'fa-solid fa-icons', 'fa-solid fa-users'],
    loaderSteps: [
      'Setting up your vibe space...',
      'Tuning the sound & setting the mood...',
      'Pinning your party on Viblooop map...',
      'Opening the guest list for launch...',
    ],
  },
  travel: {
    primaryIcon: 'fa-solid fa-mountain-sun',
    categoryName: 'Travel & Trips',
    satelliteIcons: ['fa-solid fa-plane', 'fa-solid fa-mountain-sun', 'fa-solid fa-campground', 'fa-solid fa-compass'],
    loaderSteps: [
      'Plotting your journey & route...',
      'Packing the itinerary & vibes...',
      'Pinning escape on Viblooop map...',
      'Readying the travel crew...',
    ],
  },
  games: {
    primaryIcon: 'fa-solid fa-gamepad',
    categoryName: 'Games & Fun',
    satelliteIcons: ['fa-solid fa-gamepad', 'fa-solid fa-trophy', 'fa-solid fa-dice', 'fa-solid fa-volleyball'],
    loaderSteps: [
      'Setting up the play arena...',
      'Prepping the match details & squad...',
      'Publishing game to Viblooop map...',
      'Game time is almost ready...',
    ],
  },
  food: {
    primaryIcon: 'fa-solid fa-utensils',
    categoryName: 'Food & Cafe',
    satelliteIcons: ['fa-solid fa-utensils', 'fa-solid fa-mug-hot', 'fa-solid fa-wine-glass', 'fa-solid fa-burger'],
    loaderSteps: [
      'Curating table & culinary vibe...',
      'Setting the scene for great conversations...',
      'Pinning spot on Viblooop map...',
      'Ready to gather your foodies...',
    ],
  },
  shopping: {
    primaryIcon: 'fa-solid fa-bag-shopping',
    categoryName: 'Shopping & Style',
    satelliteIcons: ['fa-solid fa-bag-shopping', 'fa-solid fa-shirt', 'fa-solid fa-tags', 'fa-solid fa-store'],
    loaderSteps: [
      'Gathering the shopping spots...',
      'Setting up meet point & style itinerary...',
      'Publishing to Viblooop map...',
      'Ready for your shopping buddies...',
    ],
  },
  default: {
    primaryIcon: 'fa-solid fa-calendar-check',
    categoryName: 'Live Vibe',
    satelliteIcons: ['fa-solid fa-star', 'fa-solid fa-bolt', 'fa-solid fa-users', 'fa-solid fa-bullhorn'],
    loaderSteps: [
      'Creating your vibe space...',
      'Securing the scene & guest list...',
      'Placing your event on the Viblooop map...',
      'Polishing final touches for launch...',
    ],
  },
};

import { EngagingLoaderComponent } from '../engaging-loader/engaging-loader.component';

@Component({
  selector: 'vl-event-created-overlay',
  standalone: true,
  imports: [CommonModule, EngagingLoaderComponent],
  templateUrl: './event-created-overlay.component.html',
  styleUrl: './event-created-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCreatedOverlayComponent implements OnInit, OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() state: CreationOverlayState = 'loading';
  @Input() eventTitle: string = 'Your New Event';
  @Input() eventCategory?: any;
  @Input() eventDate?: string;
  @Input() eventTime?: string;
  @Input() errorMessage?: string;
  @Input() dismissOnBackdrop = false;

  @Output() done = new EventEmitter<void>();
  @Output() viewEvent = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();
  @Output() backToEdit = new EventEmitter<void>();

  readonly currentMessageIndex = signal(0);
  readonly progressPercent = signal(25);

  private messageTimer?: ReturnType<typeof setInterval>;
  private progressTimer?: ReturnType<typeof setInterval>;

  readonly iconPack = computed<CategoryIconPack>(() => {
    const cat = this.eventCategory;
    const key = (cat?.title || cat?.label || cat?.name || '').toLowerCase();

    if (key.includes('party') || key.includes('social') || key.includes('nightlife') || key.includes('drinks') || key.includes('music')) {
      return CATEGORY_ICON_PACKS['party'];
    }
    if (key.includes('travel') || key.includes('trip') || key.includes('escape') || key.includes('outdoor') || key.includes('trek') || key.includes('hike')) {
      return CATEGORY_ICON_PACKS['travel'];
    }
    if (key.includes('game') || key.includes('play') || key.includes('sport') || key.includes('gaming')) {
      return CATEGORY_ICON_PACKS['games'];
    }
    if (key.includes('food') || key.includes('cafe') || key.includes('dine') || key.includes('chai')) {
      return CATEGORY_ICON_PACKS['food'];
    }
    if (key.includes('shop') || key.includes('fashion') || key.includes('style')) {
      return CATEGORY_ICON_PACKS['shopping'];
    }

    return CATEGORY_ICON_PACKS['default'];
  });

  readonly currentLoadingMessage = computed(() => {
    const steps = this.iconPack().loaderSteps;
    return steps[this.currentMessageIndex() % steps.length];
  });

  ngOnInit(): void {
    if (this.state === 'loading') {
      this.startLoaderEngageSequence();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state']) {
      if (this.state === 'loading') {
        this.startLoaderEngageSequence();
      } else {
        this.stopLoaderSequence();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopLoaderSequence();
  }

  private startLoaderEngageSequence(): void {
    this.stopLoaderSequence();
    this.currentMessageIndex.set(0);
    this.progressPercent.set(20);

    // Cycle through messages every 1400ms
    this.messageTimer = setInterval(() => {
      this.currentMessageIndex.update(idx => idx + 1);
      this.cdr.markForCheck();
    }, 1400);

    // Animate progress smoothly
    this.progressTimer = setInterval(() => {
      this.progressPercent.update(p => (p < 92 ? p + 7 : p));
      this.cdr.markForCheck();
    }, 450);
  }

  private stopLoaderSequence(): void {
    if (this.messageTimer) {
      clearInterval(this.messageTimer);
      this.messageTimer = undefined;
    }
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = undefined;
    }
  }

  onBackdropClick(): void {
    if (this.dismissOnBackdrop && this.state !== 'loading') {
      this.handleClose();
    }
  }

  handleClose(): void {
    if (this.state === 'success') {
      this.done.emit();
    } else if (this.state === 'error') {
      this.backToEdit.emit();
    }
  }
}
