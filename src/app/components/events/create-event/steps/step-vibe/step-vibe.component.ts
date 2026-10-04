import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CreateEventFormService } from '../../state/create-event-form.service';
import { VibeCategoryCardComponent } from '../../ui/vibe-category-card/vibe-category-card.component';

@Component({
  selector: 'vl-step-vibe',
  standalone: true,
  imports: [VibeCategoryCardComponent],
  templateUrl: './step-vibe.component.html',
  styleUrl: './step-vibe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepVibeComponent {
  private readonly formService = inject(CreateEventFormService);

  readonly categories = this.formService.categories;
  readonly selectedCategoryId = this.formService.categoryValue;

  readonly categorySelected = output<string>();

  categoryKey(cat: any): string {
    return cat._id || cat.id;
  }

  select(catId: string): void {
    this.formService.eventForm.patchValue({ category: catId });
    this.categorySelected.emit(catId);
  }
}
