import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { GalleryComponent, GalleryImage } from '../../shared/components/gallery/gallery.component';
import { RouteService } from '../../shared/services/route/route.service';
import { SharedService } from '../../shared/services/shared.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { ReviewsComponent } from './reviews/reviews.component';
import { SelfieVerificationComponent } from './selfie-verification/selfie-verification.component';
import { ActivatedRoute } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { BrowserService } from '../../shared/services/browser/browser.service';
import { ProfileHeroComponent } from './components/profile-hero/profile-hero.component';
import { ProfileVerificationBannerComponent } from './components/profile-verification-banner/profile-verification-banner.component';
import { ProfileStatsComponent } from './components/profile-stats/profile-stats.component';
import { ProfileContentPanelComponent } from './components/profile-content-panel/profile-content-panel.component';
import { ProfileSocialLinksComponent, SocialLink } from './components/profile-social-links/profile-social-links.component';

@Component({
  selector: 'vl-user-profile',
  imports: [
    GalleryComponent,
    ReviewsComponent,
    SelfieVerificationComponent,
    ProfileHeroComponent,
    ProfileVerificationBannerComponent,
    ProfileStatsComponent,
    ProfileContentPanelComponent,
    ProfileSocialLinksComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  @ViewChild('profilePhotoViewer') profilePhotoViewer?: GalleryComponent;

  router = inject(RouteService);
  route = inject(ActivatedRoute);
  mainService = inject(SharedService);
  authSerivice = inject(AuthService);
  platform = inject(BrowserService);
  activeTab: string = 'Joined';
  userProfile: any;
  tabs: string[] = ['Joined', 'Hosted', 'Gallery'];
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
    const state = this.platform.isBrowserPlatform() ? history.state : null;
    const routeUserId = state?.userId || this.route.snapshot.queryParamMap.get('userId') || '';

    if (routeUserId) {
      this.initProfile(routeUserId);
      this.authSerivice.isAuthInitialized$
        .pipe(filter(Boolean), take(1))
        .subscribe(() => this.updateCurrentUserState());
      return;
    }

    this.authSerivice.isAuthInitialized$
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        const currentUserId = this.authSerivice.userDetails?.id;
        if (!currentUserId) {
          this.router.navigateByUrl('/login');
          return;
        }

        this.initProfile(currentUserId);
      });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  loadProfile() {
    if (!this.userId) return;

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
      profileBanner: this.mainService.getImageUrl(profile.profileBanner || '') || 'assets/images/default-cover.jpg',
      profilePhotos: this.normalizeProfilePhotos(profile.profilePhotos),
      socialLinks: this.normalizeSocialLinks(profile.socialLinks),
    };
  }

  private initProfile(userId: string) {
    this.userId = userId;
    this.updateCurrentUserState();
    this.loadProfile();
  }

  private updateCurrentUserState() {
    const currentUserId = this.authSerivice.userDetails?.id;
    this.isCurrentUser = !!currentUserId && this.userId === currentUserId;
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

  get profilePhotoUrls(): string[] {
    return this.normalizeProfilePhotos(this.userProfile?.profilePhotos)
      .map((url: string) => this.mainService.getImageUrl(url) || url);
  }

  get photoPreviewItems(): any[] {
    return this.profilePhotoUrls.slice(0, 6).map((url, index) => ({
      url,
      index,
      label: this.displayName,
    }));
  }

  get profilePhotoGallery(): GalleryImage[] {
    return this.profilePhotoUrls.map((url, index) => ({
      url,
      title: `${this.displayName} photo ${index + 1}`,
    }));
  }

  get hiddenPhotoCount(): number {
    return Math.max(this.profilePhotoUrls.length - this.photoPreviewItems.length, 0);
  }

  openProfilePhoto(index: number) {
    this.profilePhotoViewer?.openAtIndex(index);
  }

  get isVerified(): boolean {
    return Boolean(this.userProfile?.verified || this.userProfile?.isVerified || this.userProfile?.isPhoneVerified || this.userProfile?.isEmailVerified);
  }

  get visibleSocialLinks(): SocialLink[] {
    return Array.isArray(this.userProfile?.socialLinks) ? this.userProfile.socialLinks : [];
  }

  normalizeSocialLinks(links: any[]): SocialLink[] {
    if (!Array.isArray(links)) return [];

    return links
      .map((link: any) => ({
        platform: String(link?.platform || '').trim().toLowerCase(),
        url: String(link?.url || '').trim(),
      }))
      .filter((link: SocialLink) => link.platform && /^https?:\/\/\S+\.\S+$/i.test(link.url));
  }

  normalizeProfilePhotos(photos: any[]): string[] {
    if (!Array.isArray(photos)) return [];

    return photos
      .map((photo: any) => String(photo || '').trim())
      .filter(Boolean);
  }

  showAllJoined() {
    this.showAllJoinedEvents = true;
  }

  showAllHosted() {
    this.showAllHostedEvents = true;
  }

  editProfile() {
    this.router.navigateToDrawer('edit-profile', '/profile/edit');
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
