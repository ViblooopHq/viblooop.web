import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'vl-event-created-overlay',
  imports: [LottieComponent],
  templateUrl: './event-created-overlay.component.html',
  styleUrl: './event-created-overlay.component.scss'
})
export class EventCreatedOverlayComponent {
  @Input() dismissOnBackdrop = false;
  @Input() set animationPath(value: string) {
    this.animationOptions = {
      ...this.animationOptions,
      path: value || this.defaultAnimationPath,
    };
  }

  @Output() done = new EventEmitter<void>();
  @Output() viewEvent = new EventEmitter<void>();

  private readonly defaultAnimationPath = 'assets/json/event-created.json';
  animationOptions = {
    path: this.defaultAnimationPath,
    loop: true,
    autoplay: true,
  };

  onBackdropClick(): void {
    if (this.dismissOnBackdrop) {
      this.done.emit();
    }
  }
}
