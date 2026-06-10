import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { SectionHeadersComponent } from "../../../shared/components/section-headers/section-headers.component";

@Component({
  selector: 'vl-how-viblooop-works',
  imports: [NgClass, SectionHeadersComponent],
  templateUrl: './how-viblooop-works.component.html',
  styleUrl: './how-viblooop-works.component.scss'
})
export class HowViblooopWorksComponent {
  infoCards = [
    {
      title: 'Discover Your Vibe',
      description: 'Explore fun categories and discover activities that match your energy. Your next adventure starts here!',
      materialIcon: 'explore',
    },
    {
      title: 'Connect & Plan',
      description: 'Meet like-minded Vibloopers, spark conversations, and plan exciting moments together—effortlessly.',
      materialIcon: 'group',
    },
    {
      title: 'Live the Moment',
      description: 'Dive into the vibe! Have fun, build real memories, and grow your social circle with every experience.',
      materialIcon: 'celebration',
    }
  ];
}
