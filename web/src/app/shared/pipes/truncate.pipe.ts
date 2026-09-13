import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    limit: number = 25,
    completeWords: boolean = false,
    ellipsis: string = '...'
  ): string {
    if (!value) return '';
    const str = String(value).trim();
    if (str.length <= limit) return str;

    if (completeWords) {
      const truncated = str.substring(0, limit);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + ellipsis;
      }
    }

    return str.substring(0, limit) + ellipsis;
  }
}
