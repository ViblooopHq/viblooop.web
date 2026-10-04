import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';
import { ThemeService } from '../../../../shared/services/theme/theme.service';

@Component({
  selector: 'vl-ticket',
  standalone: true,
  imports: [ImageUrlPipe],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketComponent {
  readonly plan = input.required<any>();
  readonly selected = output<any>();
  readonly themeService = inject(ThemeService);

  selectPlan(): void {
    this.selected.emit(this.plan());
  }

  onImageError(event: Event, fallback: string): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith(fallback)) return;
    image.src = fallback;
  }

}
