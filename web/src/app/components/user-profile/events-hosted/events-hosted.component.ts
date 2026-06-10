
import { Component, inject, OnInit } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'vl-events-hosted',
  imports: [RouterLink, DatePipe],
  templateUrl: './events-hosted.component.html',
  styleUrl: './events-hosted.component.scss'
})
export class EventsHostedComponent implements OnInit {
  eventHosted = [];
  mainService = inject(SharedService);
  authSerivice = inject(AuthService);
  ngOnInit() {
    this.getHostedEvents();
  }

  getHostedEvents() {
    this.mainService.getCreatedEvents(this.authSerivice.userDetails.id).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }
      this.eventHosted = res.data
    })
  }

}
