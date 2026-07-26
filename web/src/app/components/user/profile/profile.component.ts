import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { HttpService } from '../../../shared/services/http/http.service';
import { SharedService } from '../../../shared/services/shared.service';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'vl-profile',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  @ViewChild('galleryModal') galleryModal!: ElementRef<HTMLDialogElement>;

  currentGallery = signal<string[]>([]);
  activeIndex = signal(0);

  swiperConfig = {
    navigation: true,
    pagination: { clickable: true },
    keyboard: { enabled: true },
  };

  userId = input('');

  httpService = inject(HttpService);
  activeTab = signal('attended');
  tabs: string[] = ['Events Attended', 'Events Hosted', 'Gallery'];
  userProfile = signal<any>({});
  eventsGallery = signal<any[]>([]);
  attendedEvents = signal<any[]>([]);
  createdEvents = signal<any[]>([]);

  mainService = inject(SharedService)
  authSerivice = inject(AuthService)

  private readonly loadProfileOnUserIdChange = effect(() => {
    const userId = this.userId();
    if (!userId) return;

    this.mainService.viewProfile(userId).subscribe((res: any) => {
      if (res.profile.statusCode !== 200 || res.attendedEvents.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.userProfile.set(res.profile.data);
      this.attendedEvents.set(res.attendedEvents.data);
      this.createdEvents.set(res.createdEvents.data);
      this.eventsGallery.set(res.eventsGallery.data);
    });
  });

  openGallery(images: string[], index: number) {
    this.currentGallery.set(images);
    this.activeIndex.set(index);
    this.galleryModal.nativeElement.showModal();
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
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

      this.attendedEvents.set(res.data);
    })
  }

  getHostedEvents() {
    this.mainService.getCreatedEvents(this.authSerivice.userDetails.id).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.createdEvents.set(res.data);
    })
  }

  getEventsGallery() {
    this.mainService.getEventsGallery(this.authSerivice.userDetails.id).subscribe((res: any) => {
      if (!res?.success || res.statusCode !== 200) {
        console.warn('Unexpected response format or status code:', res);
        return;
      }

      this.eventsGallery.set(res.data);
    })
  }
}
