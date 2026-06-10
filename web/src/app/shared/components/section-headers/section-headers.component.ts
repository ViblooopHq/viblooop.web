import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'vl-section-headers',
  imports: [NgClass],
  templateUrl: './section-headers.component.html',
  styleUrl: './section-headers.component.scss',
})
export class SectionHeadersComponent {
  @Input() label?: string; // The pre-main title (e.g., "Features")
  @Input() title!: string; // The main title (e.g., "The Viblooop Edge")
  @Input() description?: string; // The paragraph
  @Input() alignment: 'center' | 'left' = 'center';
}
