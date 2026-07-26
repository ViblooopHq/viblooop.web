import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { HostNoteQuickAdd } from '../../create-event.config';
import { CreateEventFormService } from '../../state/create-event-form.service';

@Component({
  selector: 'vl-host-notes-quick-add',
  standalone: true,
  templateUrl: './host-notes-quick-add.component.html',
  styleUrl: './host-notes-quick-add.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostNotesQuickAddComponent {
  private readonly formService = inject(CreateEventFormService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly quickAdds = input.required<HostNoteQuickAdd[]>();

  readonly descriptionValue = this.formService.descriptionValue;
  readonly maxLength = this.formService.hostNotesMaxLength;

  readonly isExpanded = signal(true);
  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);

  private readonly pillsRef = viewChild<ElementRef<HTMLElement>>('pillsEl');
  private pillsElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      this.pillsElement = this.pillsRef()?.nativeElement ?? null;
      this.scheduleScrollStateUpdate();
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleScrollStateUpdate();
  }

  onDescriptionInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.formService.eventForm.get('description')?.setValue(value);
  }

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }

  addNote(note: string): void {
    this.formService.addHostNote(note);
  }

  isNoteSelected(note: string): boolean {
    return this.formService.isHostNoteSelected(note);
  }

  updateScrollState(): void {
    const pills = this.pillsElement;

    if (!pills) {
      this.canScrollLeft.set(false);
      this.canScrollRight.set(false);
      return;
    }

    const maxScrollLeft = Math.max(pills.scrollWidth - pills.clientWidth, 0);
    const edgeTolerance = 2;

    this.canScrollLeft.set(pills.scrollLeft > edgeTolerance);
    this.canScrollRight.set(maxScrollLeft - pills.scrollLeft > edgeTolerance);
  }

  scrollPills(direction: 'left' | 'right'): void {
    const pills = this.pillsElement;
    if (!pills) return;

    const scrollDistance = Math.max(pills.clientWidth * 0.75, 180);

    pills.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth',
    });
  }

  private scheduleScrollStateUpdate(): void {
    if (!this.pillsElement || !isPlatformBrowser(this.platformId)) {
      this.updateScrollState();
      return;
    }

    requestAnimationFrame(() => this.updateScrollState());
  }
}
