import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCategoryPresentationService } from '../../../../../shared/services/events/event-category-presentation.service';

@Component({
  selector: 'vl-vibe-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vibe-category-card.component.html',
  styleUrl: './vibe-category-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VibeCategoryCardComponent {
  private readonly categoryPresentation = inject(EventCategoryPresentationService);

  readonly category = input.required<any>();
  readonly selected = input(false);
  readonly select = output<void>();

  readonly accent = computed(() => this.categoryPresentation.getAccent(this.category()));
  readonly isSoon = computed(() => this.categoryPresentation.isSoon(this.category()));
  readonly title = computed(() => this.categoryPresentation.getDisplayTitle(this.category()));
  readonly description = computed(() => this.categoryPresentation.getDisplayDescription(this.category()));
  readonly icon = computed(() => this.categoryPresentation.getDisplayIcon(this.category()));

  selectCategory(): void {
    if (!this.isSoon()) {
      this.select.emit();
    }
  }
}
