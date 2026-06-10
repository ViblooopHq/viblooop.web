import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'vl-dropdown-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dropdown-search.component.html',
  styleUrls: ['./dropdown-search.component.scss']
})
export class DropdownSearchComponent {
  allInterests: string[] = [
    'Music', 'Sports', 'Travel', 'Gaming', 'Cooking', 'Reading',
    'Technology', 'Fitness', 'Movies', 'Art'
  ];

  selectedInterests: string[] = [];

  toggleInterest(interest: string) {
    if (this.selectedInterests.includes(interest)) {
      this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
    } else {
      this.selectedInterests.push(interest);
    }
  }

}