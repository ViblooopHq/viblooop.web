import { Component, inject, Input,  ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { HttpService } from '../../../shared/services/http/http.service';
import { SharedService } from '../../../shared/services/shared.service';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
// import { SwiperOptions } from 'swiper/types';
// import SwiperCore, { Navigation, Pagination, Keyboard } from 'swiper';

// SwiperCore.use([Navigation, Pagination, Keyboard]);

@Component({
  selector: 'vl-profile',
  imports: [RouterLink, DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  @ViewChild('galleryModal') galleryModal!: ElementRef<HTMLDialogElement>;

  currentGallery: string[] = [];
  activeIndex: number = 0;

  swiperConfig = {
    navigation: true,
    pagination: { clickable: true },
    keyboard: { enabled: true },
  };

  @Input() userId: string = '';

  httpService = inject(HttpService);
  activeTab: string = 'attended';
  tabs: string[] = ['Events Attended', 'Events Hosted', 'Gallery'];
  userProfile: any = {};
  eventsGallery: any = []
  attendedEvents: any = []
  createdEvents: any = []

  mainService = inject(SharedService)
  authSerivice = inject(AuthService)

  ngOnInit(): void {
    this.mainService.viewProfile(this.userId).subscribe((res: any) => {
      if (res.profile.statusCode !== 200 || res.attendedEvents.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.userProfile = res.profile.data;
      this.attendedEvents = res.attendedEvents.data;
      this.createdEvents = res.createdEvents.data;
      this.eventsGallery = res.eventsGallery.data;
    });
  }

  openGallery(images: string[], index: number) {
    this.currentGallery = images;
    this.activeIndex = index;
    this.galleryModal.nativeElement.showModal();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getTabIcon(tab: string): string {
    switch (tab) {
      case 'Events Attended':
        return 'fa-solid fa-calendar-check';
      case 'Events Hosted':
        return 'fa-solid fa-calendar-plus';
      case 'Gallery':
        return 'fa-solid fa-images';
      case 'Reviews':
        return 'fa-solid fa-star';
      default:
        return '';
    }
  }

  getAttendedEvents() {
    this.mainService.getAttendedEvents(this.authSerivice.userDetails.id).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.attendedEvents = res.data
    })
  }

  getHostedEvents() {
    this.mainService.getCreatedEvents(this.authSerivice.userDetails.id).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.createdEvents = res.data
    })
  }

  getEventsGallery() {
    this.mainService.getEventsGallery(this.authSerivice.userDetails.id).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.eventsGallery = res.data
    })
  }
}
