import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
  standalone: true
})
export class TimePipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';
    
    // Check if it's already in 12hr format
    if (value.toLowerCase().includes('am') || value.toLowerCase().includes('pm')) {
      return value;
    }

    try {
      const [hoursStr, minutesStr] = value.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = minutesStr || '00';
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      return `${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return value;
    }
  }
}
