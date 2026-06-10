import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vl-intrest',
  imports: [FormsModule, CommonModule],
  templateUrl: './intrest.component.html',
  styleUrl: './intrest.component.scss'
})
export class IntrestComponent {
  @Input() allInterests: any[]=[];
  @Output() selectedInterestsData: EventEmitter<any> = new EventEmitter<any>();

  @Input() selectedInterests: any[] = [];

  toggleInterest(interest: string) {
    if (this.selectedInterests.includes(interest)) {
      this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
    } else {
      this.selectedInterests.push(interest);
    }
    this.selectedInterestsData.emit(this.selectedInterests);
  }

}
