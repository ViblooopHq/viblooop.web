import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getInterestIcon } from '../../utils/interest-icons.util';

@Component({
  selector: 'vl-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pill.component.html',
  styleUrl: './pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillComponent {
  @Input() label: string = '';
  @Input() icon?: string;
  @Input() selected: boolean = false;
  @Input() selectable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() removable: boolean = false;
  @Input() interactive: boolean = false;

  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() toggle = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  get resolvedIcon(): string {
    if (this.icon) return this.icon;
    return getInterestIcon(this.label);
  }

  onPillClick(event: MouseEvent): void {
    if (this.disabled) return;

    if (this.selectable) {
      this.selected = !this.selected;
      this.selectedChange.emit(this.selected);
      this.toggle.emit();
    } else if (this.interactive) {
      this.toggle.emit();
    }
  }

  onRemoveClick(event: Event | MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.remove.emit();
  }
}
