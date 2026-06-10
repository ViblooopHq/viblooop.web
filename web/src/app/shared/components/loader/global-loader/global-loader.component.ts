import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent } from 'ngx-lottie';
import { LoaderService } from '../../../services/loader/loader.service';

@Component({
  selector: 'vl-global-loader',
  imports: [CommonModule, LottieComponent],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss'
})
export class GlobalLoaderComponent {
  loaderService = inject(LoaderService);
  options = {
    path: 'assets/json/Loading.json', // lottie file path
  };
}
