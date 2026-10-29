import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { UserProfileComponent } from './user-profile.component';
import { AuthService } from '../../shared/services/auth/auth.service';
import { SharedService } from '../../shared/services/shared.service';
import { AppDrawerService } from '../../shared/services/drawer/app-drawer.service';
import { RouteService } from '../../shared/services/route/route.service';
import { BrowserService } from '../../shared/services/browser/browser.service';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    const mockAuthService = {
      isAuthInitialized$: of(true),
      userDetails: { id: 'user-1' },
      logout: jasmine.createSpy('logout'),
      updateUserDetails: jasmine.createSpy('updateUserDetails'),
      refreshUserDetails: jasmine.createSpy('refreshUserDetails').and.returnValue(of(null)),
    };

    const mockSharedService = {
      getImageUrl: (url: string) => url,
      loadInitialProfile: () => of({ profile: { success: true, statusCode: 200, data: {} }, attendedEvents: [] }),
    };

    const mockAppDrawerService = {
      profileUpdated$: of(null),
      openEditProfile: jasmine.createSpy('openEditProfile'),
      notifyProfileUpdated: jasmine.createSpy('notifyProfileUpdated'),
    };

    const mockRouteService = {
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };

    const mockBrowserService = {
      isBrowserPlatform: () => false,
    };

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SharedService, useValue: mockSharedService },
        { provide: AppDrawerService, useValue: mockAppDrawerService },
        { provide: RouteService, useValue: mockRouteService },
        { provide: BrowserService, useValue: mockBrowserService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => 'user-1' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Step 1: Profile Image Check on Verify', () => {
    it('should return false for hasValidProfileImage if profileImage is missing or default', () => {
      component.userProfile = null;
      expect(component.hasValidProfileImage()).toBeFalse();

      component.userProfile = { profileImage: 'assets/images/default-profile.png' };
      expect(component.hasValidProfileImage()).toBeFalse();

      component.userProfile = { profileImage: 'https://example.com/default-avatar.png' };
      expect(component.hasValidProfileImage()).toBeFalse();
    });

    it('should return true for hasValidProfileImage if custom image is set', () => {
      component.userProfile = { profileImage: 'https://example.com/uploads/user-avatar.jpg' };
      expect(component.hasValidProfileImage()).toBeTrue();
    });

    it('should show missing profile image modal and NOT open selfie verification if user has no valid profile image', () => {
      component.userProfile = { profileImage: 'assets/images/default-profile.png' };
      component.isSelfieVerificationOpen = false;
      component.isMissingProfileImageModalOpen = false;

      component.verifyGovernmentID();

      expect(component.isMissingProfileImageModalOpen).toBeTrue();
      expect(component.isSelfieVerificationOpen).toBeFalse();
    });

    it('should open selfie verification if user has a valid profile image', () => {
      component.userProfile = { profileImage: 'https://example.com/uploads/photo.jpg' };
      component.isSelfieVerificationOpen = false;
      component.isMissingProfileImageModalOpen = false;

      component.verifyGovernmentID();

      expect(component.isMissingProfileImageModalOpen).toBeFalse();
      expect(component.isSelfieVerificationOpen).toBeTrue();
    });
  });
});
