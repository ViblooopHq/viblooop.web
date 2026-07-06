import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export type ToastMessage = {
  id: string;
  text: string;
  type: 'error' | 'success' | 'info';
};

export const MessageStore = signalStore(
  { providedIn: 'root' },
  withState({ messages: [] as ToastMessage[] }),
  withMethods((store) => ({
    addMessage(text: string, type: 'error' | 'success' | 'info' = 'info') {
      const id = Math.random().toString(36).substring(2, 9);
      patchState(store, (state) => ({ messages: [...state.messages, { id, text, type }] }));

      // Auto-remove after 4 seconds
      setTimeout(() => {
        patchState(store, (state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        }));
      }, 4000);
    },
    removeMessage(id: string) {
      patchState(store, (state) => ({
        messages: state.messages.filter((m) => m.id !== id),
      }));
    },
  }))
);
