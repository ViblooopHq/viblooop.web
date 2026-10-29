import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { SelfieVerificationComponent } from './selfie-verification.component';
import { UserService } from '../../../shared/services/user/user.service';
import { SharedService } from '../../../shared/services/shared.service';
import { SELFIE_VERIFICATION_CONSTANTS } from '../constants/selfie-verification.constants';

describe('SelfieVerificationComponent', () => {
  let component: SelfieVerificationComponent;
  let fixture: ComponentFixture<SelfieVerificationComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockSharedService: jasmine.SpyObj<SharedService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['verifySelfieProfile']);
    mockSharedService = jasmine.createSpyObj('SharedService', ['getImageUrl', 'convertHeicToJpg']);

    await TestBed.configureTestingModule({
      imports: [SelfieVerificationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService },
        { provide: SharedService, useValue: mockSharedService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelfieVerificationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Requirement 1 & Step 1: Profile image availability checks', () => {
    it('should identify default or missing profile image as invalid', () => {
      component.defaultImage = 'assets/images/default-profile.png';

      component.compareImage = '';
      expect(component.hasValidProfileImage()).toBeFalse();

      component.compareImage = 'assets/images/default-profile.png';
      expect(component.hasValidProfileImage()).toBeFalse();

      component.compareImage = 'https://viblooop.com/assets/images/default-avatar.png';
      expect(component.hasValidProfileImage()).toBeFalse();

      component.compareImage = '   ';
      expect(component.hasValidProfileImage()).toBeFalse();
    });

    it('should identify custom profile images or uploaded files as valid', () => {
      component.compareImage = 'https://viblooop.com/uploads/users/avatar-123.jpg';
      expect(component.hasValidProfileImage()).toBeTrue();

      component.compareImage = 'assets/images/default-profile.png';
      component.profileImageFile = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' });
      expect(component.hasValidProfileImage()).toBeTrue();
    });

    it('should display the exact informational message and prevent camera initialization if no profile image exists', fakeAsync(() => {
      spyOn<any>(component, 'startSelfieCamera');
      component.compareImage = 'assets/images/default-profile.png';
      component.isOpen = true;

      component.ngOnChanges({
        isOpen: new SimpleChange(false, true, true),
      });
      tick();
      fixture.detectChanges();

      expect(component.selfieVerificationStep).toBe('no-profile-photo');
      expect((component as any).startSelfieCamera).not.toHaveBeenCalled();

      const element: HTMLElement = fixture.nativeElement;
      const notice = element.querySelector('.vl-selfie-verification__notice');
      expect(notice?.textContent?.trim()).toContain(
        SELFIE_VERIFICATION_CONSTANTS.NO_PROFILE_PHOTO_NOTICE
      );
    }));

    it('should immediately initiate camera-based flow when a valid profile image exists', fakeAsync(() => {
      const startCamSpy = spyOn<any>(component, 'startSelfieCamera').and.returnValue(Promise.resolve());
      component.compareImage = 'https://viblooop.com/uploads/profile.jpg';
      component.isOpen = true;

      component.ngOnChanges({
        isOpen: new SimpleChange(false, true, true),
      });
      tick();

      expect(component.selfieVerificationStep).toBe('selfie');
      expect(startCamSpy).toHaveBeenCalled();
    }));
  });

  describe('Requirement 2 & 3: Camera Capture, Retake, and Performance Optimization', () => {
    it('should keep camera stream active during review so retakes do not restart camera', fakeAsync(() => {
      const mockTrack = jasmine.createSpyObj('MediaStreamTrack', ['stop']);
      mockTrack.readyState = 'live';
      const mockStream = {
        getTracks: () => [mockTrack],
        getVideoTracks: () => [mockTrack],
      } as unknown as MediaStream;

      (component as any).selfieCameraStream = mockStream;
      component.selfieVerificationFile = new File(['selfie'], 'selfie.jpg', { type: 'image/jpeg' });
      component.selfiePreviewUrl = 'blob:http://localhost/dummy-selfie';

      expect(component.hasCapturedSelfie).toBeTrue();

      const startCamSpy = spyOn<any>(component, 'startSelfieCamera');

      // User retakes selfie
      component.retakeSelfie();
      tick();

      // Camera stream was NOT stopped, track.stop was NOT called, startSelfieCamera NOT called
      expect(mockTrack.stop).not.toHaveBeenCalled();
      expect(startCamSpy).not.toHaveBeenCalled();
      expect(component.hasCapturedSelfie).toBeFalse();
      expect(component.isCameraReady).toBeTrue();
    }));

    it('should stop media tracks and release resources on close or destroy', () => {
      const mockTrack = jasmine.createSpyObj('MediaStreamTrack', ['stop']);
      const mockStream = {
        getTracks: () => [mockTrack],
        getVideoTracks: () => [mockTrack],
      } as unknown as MediaStream;

      (component as any).selfieCameraStream = mockStream;
      component.selfiePreviewUrl = 'blob:http://localhost/preview-1';
      spyOn(URL, 'revokeObjectURL');

      component.closeSelfieCamera();

      expect(mockTrack.stop).toHaveBeenCalled();
      expect((component as any).selfieCameraStream).toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/preview-1');
    });
  });

  describe('Requirement 4 & 5: Facial Verification Submission and Outcome States', () => {
    it('should submit FormData with profileImage and selfieImage to UserService', fakeAsync(() => {
      component.selfieVerificationStep = 'selfie';
      component.profileImageBlob = new Blob(['profile-data'], { type: 'image/jpeg' });
      component.selfieVerificationFile = new File(['selfie-data'], 'selfie.jpg', { type: 'image/jpeg' });
      component.selfiePreviewUrl = 'blob:http://localhost/selfie-blob';

      mockUserService.verifySelfieProfile.and.returnValue(of({ success: true, message: 'Verified' }));
      const verifiedSpy = spyOn(component.verified, 'emit');

      component.submitSelfieVerification();
      tick();

      expect(mockUserService.verifySelfieProfile).toHaveBeenCalled();
      const submittedFormData: FormData = mockUserService.verifySelfieProfile.calls.mostRecent().args[0];
      expect(submittedFormData.has('profileImage')).toBeTrue();
      expect(submittedFormData.has('selfieImage')).toBeTrue();

      expect(component.selfieVerificationStep).toBe('verified');
      tick(1700);
      expect(verifiedSpy).toHaveBeenCalled();
    }));

    it('should show inline loader and disable action buttons during in-flight verification without full screen or screen replacement', fakeAsync(() => {
      component.isOpen = true;
      component.selfieVerificationStep = 'selfie';
      component.profileImageBlob = new Blob(['profile-data'], { type: 'image/jpeg' });
      component.selfieVerificationFile = new File(['selfie-data'], 'selfie.jpg', { type: 'image/jpeg' });
      component.selfiePreviewUrl = 'blob:http://localhost/selfie-blob';

      // UserService with delay to simulate in-flight network call
      const responseSubject = new Subject<any>();
      mockUserService.verifySelfieProfile.and.returnValue(responseSubject.asObservable());

      fixture.detectChanges();

      // Trigger verification
      component.submitSelfieVerification();
      fixture.detectChanges();

      // Modal stays on 'selfie' step (seamless inline loading, captured preview remains visible)
      expect(component.selfieVerificationStep).toBe('selfie');
      expect(component.isVerificationSubmitting).toBeTrue();

      const element: HTMLElement = fixture.nativeElement;
      const verifyButton = element.querySelector('.vl-selfie-verification__primary') as HTMLButtonElement;
      const retakeButton = element.querySelector('.vl-selfie-verification__secondary') as HTMLButtonElement;
      const inlineLoaders = element.querySelectorAll('vl-inline-loader');

      expect(verifyButton?.disabled).toBeTrue();
      expect(retakeButton?.disabled).toBeTrue();
      expect(inlineLoaders.length).toBeGreaterThan(0);
      expect(element.textContent).toContain(SELFIE_VERIFICATION_CONSTANTS.VERIFYING_IDENTITY_STATUS);

      // Complete request
      responseSubject.next({ success: true, message: 'Verified' });
      responseSubject.complete();
      tick();
      fixture.detectChanges();

      expect(component.isVerificationSubmitting).toBeFalse();
      expect(component.selfieVerificationStep).toBe('verified');
    }));

    it('should display failed result UI when verification is unsuccessful with a retry option', fakeAsync(() => {
      component.selfieVerificationStep = 'selfie';
      component.profileImageBlob = new Blob(['profile-data'], { type: 'image/jpeg' });
      component.selfieVerificationFile = new File(['selfie-data'], 'selfie.jpg', { type: 'image/jpeg' });
      component.selfiePreviewUrl = 'blob:http://localhost/selfie-blob';

      mockUserService.verifySelfieProfile.and.returnValue(
        of({ success: false, message: 'Faces do not match' })
      );

      component.submitSelfieVerification();
      tick();
      fixture.detectChanges();

      expect(component.selfieVerificationStep).toBe('failed');
      expect(component.verificationFailureMessage).toBe('Faces do not match');

      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).toContain(SELFIE_VERIFICATION_CONSTANTS.FAILED_PANEL_TITLE);
    }));

    it('should display technical error UI when API throws an error with retry verification option', fakeAsync(() => {
      component.selfieVerificationStep = 'selfie';
      component.profileImageBlob = new Blob(['profile-data'], { type: 'image/jpeg' });
      component.selfieVerificationFile = new File(['selfie-data'], 'selfie.jpg', { type: 'image/jpeg' });
      component.selfiePreviewUrl = 'blob:http://localhost/selfie-blob';

      mockUserService.verifySelfieProfile.and.returnValue(
        throwError(() => ({ error: { message: 'Network connection lost' } }))
      );

      component.submitSelfieVerification();
      tick();
      fixture.detectChanges();

      expect(component.selfieVerificationStep).toBe('error');
      expect(component.verificationErrorMessage).toBe('Network connection lost');

      const element: HTMLElement = fixture.nativeElement;
      expect(element.textContent).toContain(SELFIE_VERIFICATION_CONSTANTS.ERROR_PANEL_TITLE);
    }));
  });
});
