import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vl-back-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {
  /** Hide on desktop screens (min-width: 768px) where a drawer close button is already present */
  @HostBinding('class.vl-hide-on-desktop') @Input() hideOnDesktop = false;

  /** Icon name from Google Material Symbols (default: 'chevron_left') */
  @Input() icon = 'chevron_left';

  /** Accessible label */
  @Input() ariaLabel = 'Go back';

  /** Tooltip / title text */
  @Input() title = 'Back';

  /** Button size: 'sm' (32px), 'md' (38px - default), 'lg' (44px) */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Variant: 'surface' (default white/dark card surface with border), 'ghost' (transparent with hover), 'filled' */
  @Input() variant: 'surface' | 'ghost' | 'filled' = 'surface';

  /** Button type attribute */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** Disabled state */
  @Input() disabled = false;

  /** Action event emitted when clicked */
  @Output() action = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.action.emit(event);
  }
}
