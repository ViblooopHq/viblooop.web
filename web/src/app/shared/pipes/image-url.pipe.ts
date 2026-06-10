import { Pipe, PipeTransform, inject } from '@angular/core';
import { SharedService } from '../services/shared.service';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  private _shared = inject(SharedService);

  transform(value: string | undefined | null): string {
    if (!value) return '';
    return this._shared.getImageUrl(value);
  }
}
