import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'vl-create-event-header',
  standalone: true,
  templateUrl: './create-event-header.component.html',
  styleUrl: './create-event-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEventHeaderComponent {
  readonly steps = input<string[]>([]);
  readonly currentStep = input(0);
  readonly title = input('');
  readonly subtitle = input('');
  readonly showBack = input(false);

  readonly back = output<void>();

  private readonly stepHeading = viewChild<ElementRef<HTMLHeadingElement>>('stepHeading');
  private hasRenderedOnce = false;

  constructor() {
    // Move focus (not just scroll) to the step heading whenever the step changes, for screen-reader users.
    effect(() => {
      this.currentStep();
      const heading = this.stepHeading()?.nativeElement;
      if (!heading) return;

      if (this.hasRenderedOnce) {
        heading.focus({ preventScroll: true });
      }
      this.hasRenderedOnce = true;
    });
  }
}
