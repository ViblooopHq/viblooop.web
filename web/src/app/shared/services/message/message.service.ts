import { inject, Injectable, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ToastComponent } from '../../components/toast/toast.component';
import { MessageStore } from '../../store/message.store';
import { effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private overlay = inject(Overlay);
  private messageStore = inject(MessageStore);
  private toastRef: ComponentRef<ToastComponent> | null = null;
  private overlayRef = this.overlay.create(
    new OverlayConfig({
      hasBackdrop: false,
      positionStrategy: this.overlay.position()
        .global()
        .top('80px')
        .centerHorizontally()
    })
  );

  constructor() {
    effect(() => {
      const messages = this.messageStore.messages();
      if (messages.length > 0) {
        // Show the latest message
        const latest = messages[messages.length - 1];
        this.showToast(latest.text);
      } else {
        this.hideToast();
      }
    });
  }

  private showToast(message: string) {
    if (!this.overlayRef.hasAttached()) {
      const toastPortal = new ComponentPortal(ToastComponent);
      this.toastRef = this.overlayRef.attach(toastPortal);
    }
    if (this.toastRef) {
      this.toastRef.instance.message = message;
    }
  }

  private hideToast() {
    if (this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
      this.toastRef = null;
    }
  }
}
