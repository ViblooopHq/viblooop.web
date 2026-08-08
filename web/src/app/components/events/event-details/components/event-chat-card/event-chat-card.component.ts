import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'vl-event-chat-card',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-chat-card.component.html',
  styleUrl: './event-chat-card.component.scss',
})
export class EventChatCardComponent {
  totalAttendeesCount = input(0);
  isChatOpen = input(false);

  toggleChat = output<void>();
}
