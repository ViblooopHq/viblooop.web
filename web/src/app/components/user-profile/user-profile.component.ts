import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryComponent } from '../../shared/components/gallery/gallery.component';
import { RouteService } from '../../shared/services/route/route.service';
import { SharedService } from '../../shared/services/shared.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { SelfieVerificationComponent } from './selfie-verification/selfie-verification.component';
@Component({
  selector: 'vl-user-profile',
  imports: [GalleryComponent, CommonModule, EventCardComponent, ReviewsComponent, SelfieVerificationComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  router = inject(RouteService);
  mainService = inject(SharedService);
  authSerivice = inject(AuthService);
  activeTab: string = 'Joined';
  userProfile: any;
  tabs: string[] = ['Joined', 'Hosted', 'Photos'];
  isCurrentUser: boolean = false;
  userId: string = '';
  attendedEvents: any[] = [];
  hostedEvents: any[] = [];
  userReviews: any[] = [];
  averageRating = 0;
  totalRatings = 0;
  showAllJoinedEvents = false;
  showAllHostedEvents = false;
  defaultProfileImage = 'assets/images/default-profile.png';
  isSelfieVerificationOpen = false;

  userGallery: any[] = [];

  ngOnInit(): void {
    const state = history.state || null;
    this.userId = state?.userId || this.authSerivice.userDetails.id;
    this.isCurrentUser = this.userId === this.authSerivice.userDetails.id;
    this.loadProfile();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  loadProfile() {
    this.mainService.viewProfile(this.userId).subscribe((response: any) => {
      if (response?.profile?.success && response.profile.statusCode === 200) {
        this.userProfile = this.normalizeProfile(response.profile.data);
      } else {
        console.warn('Unexpected profile response format or status code:', response?.profile);
      }

      this.attendedEvents = this.getResponseData(response?.attendedEvents);
      this.hostedEvents = this.getResponseData(response?.createdEvents);
      this.userGallery = this.buildGallery(response?.eventsGallery);
      this.setReviewSummary(response?.userReviews);
    });
  }

  normalizeProfile(profile: any) {
    if (!profile) return profile;

    return {
      ...profile,
      profileImage: this.mainService.getImageUrl(profile.profileImage || '') || this.defaultProfileImage,
      profileBanner: this.mainService.getImageUrl(profile.profileBanner || '') || 'assets/images/default-cover.jpg'
    };
  }

  useDefaultProfileImage(event: Event) {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith(this.defaultProfileImage)) return;
    image.src = this.defaultProfileImage;
  }

  getResponseData(response: any): any[] {
    return response?.success && response.statusCode === 200 && Array.isArray(response.data) ? response.data : [];
  }

  setReviewSummary(response: any) {
    const data = response?.success && response.statusCode === 200 ? response.data : null;

    this.userReviews = Array.isArray(data?.reviews) ? data.reviews : [];
    this.averageRating = Number(data?.averageRating ?? this.userProfile?.averageRating ?? 0);
    this.totalRatings = Number(data?.totalRatings ?? this.userProfile?.totalRatings ?? 0);
  }

  getTabIcon(tab: string): string {
    switch (tab) {
      case 'Joined':
        return 'event_available';
      case 'Hosted':
        return 'edit_calendar';
      case 'Photos':
        return 'photo_library';
      default:
        return '';
    }
  }

  buildGallery(response: any): any[] {
    if (!response?.success || response.statusCode !== 200 || !Array.isArray(response.data)) {
      return [];
    }

    return response.data
      .filter((item: any) => Array.isArray(item.gallery) && item.gallery.length > 0)
      .flatMap((item: any) =>
        item.gallery
          .filter((url: string) => !!url)
          .map((url: string) => ({
            url: this.mainService.getImageUrl(url),
            label: item.event,
          }))
      );
  }

  get displayName(): string {
    return this.userProfile?.userName || this.userProfile?.username || this.userProfile?.name || 'Viblooop User';
  }

  get handle(): string {
    return '@' + this.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)/g, '');
  }

  get shortBio(): string {
    return this.userProfile?.bio || 'Always up for new plans, good conversations, and a fresh vibe.';
  }

  get visibleInterests(): any[] {
    return (this.userProfile?.interests || []).slice(0, 6);
  }

  get hiddenInterestCount(): number {
    return Math.max((this.userProfile?.interests?.length || 0) - this.visibleInterests.length, 0);
  }

  get previewInterests(): any[] {
    return (this.userProfile?.interests || []).slice(0, 3);
  }

  get joinedPreviewEvents(): any[] {
    return this.attendedEvents.slice(0, 3);
  }

  get hostedPreviewEvents(): any[] {
    return this.hostedEvents.slice(0, 3);
  }

  get visibleJoinedEvents(): any[] {
    return this.showAllJoinedEvents ? this.attendedEvents : this.joinedPreviewEvents;
  }

  get visibleHostedEvents(): any[] {
    return this.showAllHostedEvents ? this.hostedEvents : this.hostedPreviewEvents;
  }

  get isVerified(): boolean {
    return Boolean(this.userProfile?.verified || this.userProfile?.isVerified || this.userProfile?.isPhoneVerified || this.userProfile?.isEmailVerified);
  }

  getInterestLabel(interest: any): string {
    return typeof interest === 'string' ? interest : interest?.label || '';
  }

  getInterestIconClass(interest: any): string {
    if (interest?.icon) return interest.icon;

    const value = this.getInterestLabel(interest).toLowerCase();

    if (value.includes('travel') || value.includes('trip')) return 'fa-solid fa-route';
    if (value.includes('drive')) return 'fa-solid fa-car-side';
    if (value.includes('food') || value.includes('dining')) return 'fa-solid fa-utensils';
    if (value.includes('coffee') || value.includes('cafe') || value.includes('chai')) return 'fa-solid fa-mug-hot';
    if (value.includes('music')) return 'fa-solid fa-music';
    if (value.includes('photo')) return 'fa-solid fa-camera';
    if (value.includes('movie')) return 'fa-solid fa-film';

    return 'fa-solid fa-star';
  }

  getInterestTone(index: number): string {
    return ['teal', 'green', 'blue', 'amber', 'purple'][index % 5];
  }

  showAllJoined() {
    this.showAllJoinedEvents = true;
  }

  showAllHosted() {
    this.showAllHostedEvents = true;
  }

  editProfile() {
    this.router.navigateToDrawer('edit-profile', '/profile/edit2');
  }

  verifyGovernmentID() {
    this.isSelfieVerificationOpen = true;
  }

  closeSelfieVerification() {
    this.isSelfieVerificationOpen = false;
  }

  onSelfieVerified() {
    if (this.userProfile) {
      this.userProfile = {
        ...this.userProfile,
        verified: true,
      };
    }
    this.router.navigateByUrl('/profile');
  }

}
