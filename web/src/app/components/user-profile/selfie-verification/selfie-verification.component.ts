import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UserService } from '../../../shared/services/user/user.service';
import { SharedService } from '../../../shared/services/shared.service';

type SelfieVerificationStep = 'profile-photo' | 'selfie' | 'progress' | 'verified';

@Component({
  selector: 'vl-selfie-verification',
  imports: [CommonModule],
  templateUrl: './selfie-verification.component.html',
  styleUrl: './selfie-verification.component.scss',
})
export class SelfieVerificationComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() compareImage = '';
  @Input() defaultImage = 'assets/images/default-profile.png';
  @Output() closed = new EventEmitter<void>();
  @Output() verified = new EventEmitter<any>();

  @ViewChild('selfieVideo') selfieVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('selfieOval') selfieOval?: ElementRef<HTMLDivElement>;

  private userService = inject(UserService);
  private sharedService = inject(SharedService);

  selfieVerificationFile: File | null = null;
  verificationProfilePhotoFile: File | null = null;
  verificationProfilePhotoPreview = '';
  selfiePreviewUrl = '';
  selfieVerificationStep: SelfieVerificationStep = 'profile-photo';
  selfieCameraError = '';
  isVerificationSubmitting = false;
  private selfieCameraStream: MediaStream | null = null;
  private verificationRedirectTimer: ReturnType<typeof setTimeout> | null = null;

  get hasCapturedSelfie(): boolean {
    return !!this.selfieVerificationFile && !!this.selfiePreviewUrl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      this.resetVerification();
    }

    if (changes['isOpen']?.previousValue && !changes['isOpen'].currentValue) {
      this.stopSelfieCamera();
    }
  }

  ngOnDestroy(): void {
    this.stopSelfieCamera();
    this.clearVerificationRedirectTimer();
    this.revokeVerificationProfilePreview();
    this.revokeSelfiePreview();
  }

  async onVerificationPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    this.selfieCameraError = '';

    if (!file) return;

    let finalFile: File;
    try {
      finalFile = await this.sharedService.convertHeicToJpg(file);
    } catch {
      this.selfieCameraError = 'Unable to convert HEIC photo. Please try another image.';
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(finalFile.type)) {
      this.selfieCameraError = 'Please upload a JPG or PNG photo.';
      return;
    }

    if (finalFile.size > 5 * 1024 * 1024) {
      this.selfieCameraError = 'Photo must be 5MB or smaller.';
      return;
    }

    this.revokeVerificationProfilePreview();
    this.verificationProfilePhotoFile = finalFile;
    this.verificationProfilePhotoPreview = URL.createObjectURL(finalFile);
    await this.startSelfieCamera();
  }

  closeSelfieCamera(): void {
    if (this.isVerificationSubmitting) return;
    this.stopSelfieCamera();
    this.closed.emit();
  }

  captureSelfie(): void {
    const video = this.selfieVideo?.nativeElement;
    const oval = this.selfieOval?.nativeElement;
    if (!video || !oval || !video.videoWidth || !video.videoHeight) {
      this.selfieCameraError = 'Camera is still loading. Please try again.';
      return;
    }

    const canvas = this.createOvalSelfieCanvas(video, oval);

    canvas.toBlob((blob) => {
      if (!blob) {
        this.selfieCameraError = 'Unable to capture selfie. Please try again.';
        return;
      }

      this.selfieVerificationFile = new File([blob], `selfie-verification-${Date.now()}.png`, { type: 'image/png' });
      this.revokeSelfiePreview();
      this.selfiePreviewUrl = URL.createObjectURL(this.selfieVerificationFile);
      this.stopSelfieCamera();
    }, 'image/png');
  }

  onSelfiePrimaryAction(): void {
    if (this.hasCapturedSelfie) {
      this.submitSelfieVerification();
      return;
    }

    this.captureSelfie();
  }

  cancelSelfieStep(): void {
    if (this.hasCapturedSelfie) {
      this.retakeSelfie();
      return;
    }

    this.closeSelfieCamera();
  }

  private resetVerification(): void {
    this.clearVerificationRedirectTimer();
    this.stopSelfieCamera();
    this.revokeVerificationProfilePreview();
    this.revokeSelfiePreview();
    this.verificationProfilePhotoFile = null;
    this.selfieVerificationFile = null;
    this.selfieVerificationStep = 'profile-photo';
    this.selfieCameraError = '';
    this.isVerificationSubmitting = false;
  }

  private async startSelfieCamera(): Promise<void> {
    this.selfieVerificationStep = 'selfie';
    this.selfieCameraError = '';
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.selfieCameraError = 'Camera access is not available in this browser.';
      return;
    }

    this.stopSelfieCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      this.selfieCameraStream = stream;
      const video = this.selfieVideo?.nativeElement;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
    } catch {
      this.selfieCameraError = 'Camera access was blocked. Please allow camera permission and try again.';
    }
  }

  private submitSelfieVerification(): void {
    if (!this.verificationProfilePhotoFile || !this.selfieVerificationFile) {
      this.selfieCameraError = 'Please upload a profile photo and capture a selfie.';
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', this.verificationProfilePhotoFile);
    formData.append('selfieImage', this.selfieVerificationFile);

    this.isVerificationSubmitting = true;
    this.selfieVerificationStep = 'progress';
    this.selfieCameraError = '';
    this.stopSelfieCamera();

    this.userService.verifySelfieProfile(formData).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.selfieCameraError = res?.message || 'Unable to verify selfie. Please try again.';
          this.selfieVerificationStep = 'selfie';
          this.isVerificationSubmitting = false;
          this.selfieVerificationFile = null;
          this.revokeSelfiePreview();
          this.startSelfieCamera();
          return;
        }

        this.selfieVerificationStep = 'verified';
        this.scheduleVerifiedClose(res);
      },
      error: (err) => {
        this.selfieCameraError = err?.error?.message || err?.message || 'Unable to verify selfie. Please try again.';
        this.selfieVerificationStep = 'selfie';
        this.isVerificationSubmitting = false;
        this.selfieVerificationFile = null;
        this.revokeSelfiePreview();
        this.startSelfieCamera();
      },
      complete: () => {
        this.isVerificationSubmitting = false;
      },
    });
  }

  private scheduleVerifiedClose(response: any): void {
    this.clearVerificationRedirectTimer();
    this.verificationRedirectTimer = setTimeout(() => {
      this.verified.emit(response);
      this.closed.emit();
    }, 1600);
  }

  private clearVerificationRedirectTimer(): void {
    if (!this.verificationRedirectTimer) return;
    clearTimeout(this.verificationRedirectTimer);
    this.verificationRedirectTimer = null;
  }

  private revokeVerificationProfilePreview(): void {
    if (!this.verificationProfilePhotoPreview?.startsWith('blob:')) return;
    URL.revokeObjectURL(this.verificationProfilePhotoPreview);
    this.verificationProfilePhotoPreview = '';
  }

  private async retakeSelfie(): Promise<void> {
    this.selfieVerificationFile = null;
    this.revokeSelfiePreview();
    await this.startSelfieCamera();
  }

  private revokeSelfiePreview(): void {
    if (this.selfiePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.selfiePreviewUrl);
    }

    this.selfiePreviewUrl = '';
  }

  private stopSelfieCamera(): void {
    this.selfieCameraStream?.getTracks().forEach((track) => track.stop());
    this.selfieCameraStream = null;

    const video = this.selfieVideo?.nativeElement;
    if (video) {
      video.srcObject = null;
    }
  }

  private createOvalSelfieCanvas(video: HTMLVideoElement, oval: HTMLElement): HTMLCanvasElement {
    const videoRect = video.getBoundingClientRect();
    const ovalRect = oval.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(ovalRect.width));
    canvas.height = Math.max(1, Math.round(ovalRect.height));

    const context = canvas.getContext('2d');
    if (!context) return canvas;

    const scale = Math.max(videoRect.width / video.videoWidth, videoRect.height / video.videoHeight);
    const displayedWidth = video.videoWidth * scale;
    const displayedHeight = video.videoHeight * scale;
    const offsetX = (videoRect.width - displayedWidth) / 2;
    const offsetY = (videoRect.height - displayedHeight) / 2;
    const ovalLeft = ovalRect.left - videoRect.left;
    const ovalTop = ovalRect.top - videoRect.top;
    const sourceX = (videoRect.width - ovalLeft - ovalRect.width - offsetX) / scale;
    const sourceY = (ovalTop - offsetY) / scale;
    const sourceWidth = ovalRect.width / scale;
    const sourceHeight = ovalRect.height / scale;

    context.save();
    context.beginPath();
    context.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, Math.PI * 2);
    context.clip();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    context.restore();

    return canvas;
  }
}
