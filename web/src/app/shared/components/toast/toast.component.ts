import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'vl-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent implements OnInit {
  @Input() message: string = '';

  ngOnInit() {
    console.log('🔔 Toast Component Initialized with message:', this.message);
  }
}
