import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title?: string;
  type?: ToastType;
  duration?: number;
  icon?: string;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration: number;
  icon?: string;
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
  isLeaving?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);

  private idCounter = 0;

  show(message: string, options?: ToastOptions): string {
    const id = `toast-${++this.idCounter}-${Date.now()}`;
    const toast: ToastItem = {
      id,
      message,
      title: options?.title,
      type: options?.type || 'info',
      duration: options?.duration !== undefined ? options.duration : 3500,
      icon: options?.icon || this.getDefaultIcon(options?.type || 'info'),
      dismissible: options?.dismissible !== false,
      action: options?.action,
      createdAt: Date.now(),
    };

    this.toasts.update((current) => [...current, toast]);

    if (toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, toast.duration);
    }

    return id;
  }

  success(message: string, title: string = 'Success', options?: Partial<ToastOptions>): string {
    return this.show(message, { ...options, title, type: 'success' });
  }

  error(message: string, title: string = 'Error', options?: Partial<ToastOptions>): string {
    return this.show(message, { ...options, title, type: 'error' });
  }

  info(message: string, title: string = 'Notice', options?: Partial<ToastOptions>): string {
    return this.show(message, { ...options, title, type: 'info' });
  }

  warning(message: string, title: string = 'Warning', options?: Partial<ToastOptions>): string {
    return this.show(message, { ...options, title, type: 'warning' });
  }

  dismiss(id: string): void {
    this.toasts.update((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, isLeaving: true } : toast))
    );

    // Remove from DOM after exit transition
    setTimeout(() => {
      this.toasts.update((current) => current.filter((toast) => toast.id !== id));
    }, 280);
  }

  clear(): void {
    this.toasts.set([]);
  }

  private getDefaultIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'error':
        return 'fa-solid fa-circle-exclamation';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation';
      case 'info':
      default:
        return 'fa-solid fa-circle-info';
    }
  }
}
