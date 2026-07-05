import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppDrawerState = {
  type: 'create-event';
  mode: 'create' | 'edit';
  eventId?: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class AppDrawerService {
  private readonly drawerSubject = new BehaviorSubject<AppDrawerState | null>(null);
  readonly drawer$ = this.drawerSubject.asObservable();

  get hasOpenDrawer(): boolean {
    return this.drawerSubject.value !== null;
  }

  openCreateEvent(): void {
    this.drawerSubject.next({ type: 'create-event', mode: 'create' });
  }

  openEditEvent(eventId: string): void {
    this.drawerSubject.next({ type: 'create-event', mode: 'edit', eventId });
  }

  close(): void {
    this.drawerSubject.next(null);
  }
}
