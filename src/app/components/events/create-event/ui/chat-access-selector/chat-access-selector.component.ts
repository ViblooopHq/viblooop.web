import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'vl-chat-access-selector',
  standalone: true,
  templateUrl: './chat-access-selector.component.html',
  styleUrl: './chat-access-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatAccessSelectorComponent {
  readonly hostOnlyChat = input.required<boolean>();
  readonly subtitle = input('');
  readonly everyoneDescription = input('');
  readonly hostOnlyDescription = input('');

  readonly hostOnlyChatChange = output<boolean>();
}
