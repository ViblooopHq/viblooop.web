import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vl-user-header',
  imports: [CommonModule],
  templateUrl: './user-header.component.html',
  styleUrl: './user-header.component.scss'
})
export class UserHeaderComponent {
  activeTab: string = 'Events Attended'; 
 name =  'Kamrujama Ansari';
 tabs: string[] = ['Events Attended', 'Events Hosted', 'Gallery', 'Reviews'];

 setActiveTab(tab: string) {
    this.activeTab = tab;
  }
 
}
