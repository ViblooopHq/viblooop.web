import { Component, Input } from '@angular/core';

@Component({
  selector: 'vl-section-header',
  imports: [],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss'
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() titleColor: string = '';
  @Input() headerData = {};

  ngOnInit() {

  }
}
