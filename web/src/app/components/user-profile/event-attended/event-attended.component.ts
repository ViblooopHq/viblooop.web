import { Component, inject, OnInit } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'vl-event-attended',
  imports: [RouterLink, DatePipe],
  templateUrl: './event-attended.component.html',
  styleUrl: './event-attended.component.scss'
})
export class EventAttendedComponent implements OnInit {
  eventAttended = [];
  mainService = inject(SharedService);
  authSerivice = inject(AuthService);
  ngOnInit() {
    this.getAttendedEvents();
  }

  getAttendedEvents() {
    this.mainService.getAttendedEvents(this.authSerivice.userDetails.id).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }
      this.eventAttended = res.data
    })
  }

}
