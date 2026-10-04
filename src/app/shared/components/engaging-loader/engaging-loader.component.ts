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

@Component({
  selector: 'vl-engaging-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './engaging-loader.component.html',
  styleUrl: './engaging-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagingLoaderComponent implements OnInit, OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  /** Main title displayed in the loader */
  @Input() title: string = 'Please wait...';

  /** Small category/status badge tag at the top */
  @Input() tagLabel: string = 'In Progress';

  /** Primary icon in the center glowing orb */
  @Input() primaryIcon: string = 'fa-solid fa-bolt';

  /** 4 Satellite icons orbiting the center orb */
  @Input() satelliteIcons: string[] = [
    'fa-solid fa-star',
    'fa-solid fa-bolt',
    'fa-solid fa-sparkles',
    'fa-solid fa-circle-check',
  ];

  /** Whether the text should dynamically cycle through steps */
  @Input() enableCyclingText: boolean = true;

  /** Array of text steps to cycle through if enableCyclingText is true */
  @Input() cyclingTexts: string[] = [
    'Setting up your space...',
    'Securing the scene & details...',
    'Pinning to the Viblooop map...',
    'Polishing final touches...',
  ];

  /** Static description text shown if enableCyclingText is false */
  @Input() staticText?: string;

  /** Interval in milliseconds between changing text steps */
  @Input() cycleIntervalMs: number = 1400;

  /** Whether to display the live animated progress bar */
  @Input() showProgressBar: boolean = true;

  /** Whether the loader renders with a full-screen fixed backdrop */
  @Input() isFullscreen: boolean = true;

  /** Whether user can dismiss the loader */
  @Input() dismissible: boolean = false;

  @Output() dismiss = new EventEmitter<void>();

  readonly currentStepIndex = signal(0);
  readonly progressPercent = signal(25);

  private messageTimer?: ReturnType<typeof setInterval>;
  private progressTimer?: ReturnType<typeof setInterval>;

  readonly activeMessage = computed(() => {
    if (!this.enableCyclingText) {
      return this.staticText || 'Working on your request...';
    }
    const steps = this.cyclingTexts;
    if (!steps || steps.length === 0) return 'Working on your request...';
    return steps[this.currentStepIndex() % steps.length];
  });

  ngOnInit(): void {
    this.startSequence();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enableCyclingText'] || changes['cyclingTexts'] || changes['cycleIntervalMs']) {
      this.startSequence();
    }
  }

  ngOnDestroy(): void {
    this.stopSequence();
  }

  private startSequence(): void {
    this.stopSequence();
    this.currentStepIndex.set(0);
    this.progressPercent.set(20);

    if (this.enableCyclingText && this.cyclingTexts.length > 1) {
      this.messageTimer = setInterval(() => {
        this.currentStepIndex.update(idx => idx + 1);
        this.cdr.markForCheck();
      }, this.cycleIntervalMs);
    }

    if (this.showProgressBar) {
      this.progressTimer = setInterval(() => {
        this.progressPercent.update(p => (p < 92 ? p + 6 : p));
        this.cdr.markForCheck();
      }, 450);
    }
  }

  private stopSequence(): void {
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
    if (this.dismissible) {
      this.dismiss.emit();
    }
  }
}
