import { Component } from '@angular/core';
import { SectionHeadersComponent } from "../../../shared/components/section-headers/section-headers.component";

@Component({
  selector: 'vl-why-choose-us',
  imports: [SectionHeadersComponent],
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.scss',
})
export class WhyChooseUsComponent {
  whyChooseUsData = [
    {
      icon: 'verified_user',
      title: 'Vetted Safety',
      description: 'Every event and host is verified by our community trust protocol.'
    },
    {
      icon: 'bolt',
      title: 'Instant Access',
      description: 'Booking and ticketing happen in milliseconds, not minutes.'
    },
    {
      icon: 'diversity_3',
      title: 'Global Network',
      description: 'Connect with a global community of explorers and creators.'
    }
  ]
}
