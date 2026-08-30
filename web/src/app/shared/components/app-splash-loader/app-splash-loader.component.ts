import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vl-app-splash-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-splash-loader.component.html',
  styleUrl: './app-splash-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSplashLoaderComponent {
  @Input() isFadingOut: boolean = false;
  @Input() message: string = 'Finding your vibe...';
  @Input() subtitle: string = 'Discover • Connect • Experience';
  @Input() showBrandWatermark: boolean = true;
  @Input() showProgressDots: boolean = true;
  @Input() logoSrc: string = 'logo.png';
  @Input() brandName: string = 'Viblooop';
}
