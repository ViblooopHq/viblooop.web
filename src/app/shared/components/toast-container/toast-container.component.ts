import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastItem, ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'vl-toast-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  trackById(_index: number, toast: ToastItem): string {
    return toast.id;
  }

  onDismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
