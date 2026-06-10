import { Component } from '@angular/core';

@Component({
  selector: 'vl-breadcrumb',
  imports: [],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  goBack() {
    window.history.back();
  }
}
