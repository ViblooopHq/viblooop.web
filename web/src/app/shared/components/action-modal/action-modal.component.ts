import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export type ActionModalVariant = 'confirm' | 'warning' | 'error' | 'success' | 'info';

@Component({
  selector: 'vl-action-modal',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './action-modal.component.html',
  styleUrl: './action-modal.component.scss',
})
export class ActionModalComponent {
  isOpen = input(false);
  variant = input<ActionModalVariant>('confirm');
  title = input('Are you sure?');
  message = input('');
  confirmLabel = input('Confirm');
  cancelLabel = input('Cancel');
  showCancelButton = input(true);
  showInput = input(false);
  inputPlaceholder = input('Enter a reason…');
  inputRequired = input(false);
  isLoading = input(false);

  confirmed = output<string>();
  cancelled = output<void>();

  inputValue = signal('');

  get variantIcon(): string {
    switch (this.variant()) {
      case 'warning': return 'fa-solid fa-triangle-exclamation';
      case 'error': return 'fa-solid fa-circle-xmark';
      case 'success': return 'fa-solid fa-circle-check';
      case 'info': return 'fa-solid fa-circle-info';
      default: return 'fa-solid fa-circle-question';
    }
  }

  get isConfirmDisabled(): boolean {
    if (this.isLoading()) return true;
    if (this.showInput() && this.inputRequired() && !this.inputValue().trim()) return true;
    return false;
  }

  onConfirm(): void {
    if (this.isConfirmDisabled) return;
    this.confirmed.emit(this.inputValue().trim());
  }

  onCancel(): void {
    if (this.isLoading()) return;
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('vl-modal-backdrop')) {
      this.onCancel();
    }
  }

  onInputChange(value: string): void {
    this.inputValue.set(value);
  }

  /** Reset input when modal closes (called by parent via ViewChild or on open). */
  resetInput(): void {
    this.inputValue.set('');
  }
}
