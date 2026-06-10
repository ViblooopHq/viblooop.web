import { Component, Input } from '@angular/core';


export interface InfoCardData {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'vl-info-card',
  imports: [],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.scss'
})
export class InfoCardComponent {
  @Input() cardData: InfoCardData = {
    icon: '',
    title: '',
    description: '',
    color: ''
  };

  @Input() height: string = '290px'
  @Input() width: string = '280px'

}
