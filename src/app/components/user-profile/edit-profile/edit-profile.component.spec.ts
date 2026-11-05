import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { EditProfileComponent } from './edit-profile.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SharedService } from '../../../shared/services/shared.service';
import { UserService } from '../../../shared/services/user/user.service';
import { AppDrawerService } from '../../../shared/services/drawer/app-drawer.service';
import { RouteService } from '../../../shared/services/route/route.service';

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;

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
      convertHeicToJpg: async (f: File) => f,
    };

    const mockUserService = {
      getUserProfile: () => of({ success: true, statusCode: 200, data: {} }),
      getIntrestList: () => of({ success: true, statusCode: 200, data: [] }),
    };

    const mockAppDrawerService = {
      close: jasmine.createSpy('close'),
      notifyProfileUpdated: jasmine.createSpy('notifyProfileUpdated'),
    };

    const mockRouteService = {
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };

    await TestBed.configureTestingModule({
      imports: [EditProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SharedService, useValue: mockSharedService },
        { provide: UserService, useValue: mockUserService },
        { provide: AppDrawerService, useValue: mockAppDrawerService },
        { provide: RouteService, useValue: mockRouteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Step 1: Profile image availability check on verifySelfie', () => {
    it('should return false for hasValidProfileImage when image is missing or default placeholder', () => {
      component.profilePreview = null;
      component.profilePhotoFile = null;
      expect(component.hasValidProfileImage()).toBeFalse();

      component.profilePreview = 'assets/images/default-profile.png';
      expect(component.hasValidProfileImage()).toBeFalse();
    });

    it('should return true for hasValidProfileImage when valid file or custom image preview is present', () => {
      component.profilePhotoFile = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });
      expect(component.hasValidProfileImage()).toBeTrue();

      component.profilePhotoFile = null;
      component.profilePreview = 'https://example.com/uploads/user-avatar.jpg';
      expect(component.hasValidProfileImage()).toBeTrue();
    });

    it('should show missing profile image modal and not open selfie verification if profile image is missing', () => {
      component.profilePreview = 'assets/images/default-profile.png';
      component.profilePhotoFile = null;
      component.isSelfieVerificationOpen = false;
      component.isMissingProfileImageModalOpen = false;

      component.verifySelfie();

      expect(component.isMissingProfileImageModalOpen).toBeTrue();
      expect(component.isSelfieVerificationOpen).toBeFalse();
    });

    it('should open selfie verification directly if valid profile image exists', () => {
      component.profilePreview = 'https://example.com/uploads/photo.jpg';
      component.isSelfieVerificationOpen = false;
      component.isMissingProfileImageModalOpen = false;

      component.verifySelfie();

      expect(component.isMissingProfileImageModalOpen).toBeFalse();
      expect(component.isSelfieVerificationOpen).toBeTrue();
    });
  });
});
