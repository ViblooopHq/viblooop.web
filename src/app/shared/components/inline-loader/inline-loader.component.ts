import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type InlineLoaderSize = 'xs' | 'sm' | 'md' | 'lg';
export type InlineLoaderColor = 'current' | 'primary' | 'white' | 'light';
export type InlineLoaderVariant = 'spinner' | 'dots' | 'pulse';

@Component({
  selector: 'vl-inline-loader',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inline-loader.component.html',
  styleUrl: './inline-loader.component.scss',
})
export class InlineLoaderComponent {
  size = input<InlineLoaderSize>('sm');
  color = input<InlineLoaderColor>('current');
  text = input<string>('');
  variant = input<InlineLoaderVariant>('spinner');
}
