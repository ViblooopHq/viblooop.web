import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UserService } from '../../../shared/services/user/user.service';
import { SharedService } from '../../../shared/services/shared.service';
import { InlineLoaderComponent } from '../../../shared/components/inline-loader/inline-loader.component';
import { SELFIE_VERIFICATION_CONSTANTS } from '../constants/selfie-verification.constants';

export type SelfieVerificationStep =
  | 'selfie'
  | 'progress'
  | 'verified'
  | 'failed'
  | 'error'
  | 'no-profile-photo';

@Component({
  selector: 'vl-selfie-verification',
  imports: [CommonModule, InlineLoaderComponent],
  templateUrl: './selfie-verification.component.html',
  styleUrl: './selfie-verification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelfieVerificationComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() compareImage = '';
  @Input() defaultImage = 'assets/images/default-profile.png';
  @Input() profileImageFile?: File | Blob | null;

  @Output() closed = new EventEmitter<void>();
  @Output() verified = new EventEmitter<any>();
  @Output() requestUpdateProfile = new EventEmitter<void>();

  @ViewChild('selfieVideo') selfieVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('selfieOval') selfieOval?: ElementRef<HTMLDivElement>;

  private userService = inject(UserService);
  private sharedService = inject(SharedService);
  private cdr = inject(ChangeDetectorRef);

  readonly selfieConstants = SELFIE_VERIFICATION_CONSTANTS;

  selfieVerificationFile: File | null = null;
  selfiePreviewUrl = '';
  profileImageBlob: Blob | null = null;
  selfieVerificationStep: SelfieVerificationStep = 'selfie';
  selfieCameraError = '';
  verificationFailureMessage = '';
  verificationErrorMessage = '';

  isVerificationSubmitting = false;
  isCameraInitializing = false;
  isCameraReady = false;
  isCapturing = false;

  // Performance telemetry
  lastCaptureDurationMs = 0;
  lastEncodeDurationMs = 0;

  private selfieCameraStream: MediaStream | null = null;
  private verificationRedirectTimer: ReturnType<typeof setTimeout> | null = null;

  // Cache & request deduplication to prevent 429 Too Many Requests
  private profileImageBlobCache = new Map<string, Blob>();
  private profileImageFetchPromise: Promise<Blob | null> | null = null;
  private failedFetchUrls = new Set<string>();

  get hasCapturedSelfie(): boolean {
    return !!this.selfieVerificationFile && !!this.selfiePreviewUrl;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isOpenChange = changes['isOpen'];

    // Only initialize when transitioning from false -> true
    if (isOpenChange && isOpenChange.currentValue && !isOpenChange.previousValue) {
      this.initVerificationFlow();
    }

    // Cleanup when closing
    if (isOpenChange && !isOpenChange.currentValue && isOpenChange.previousValue) {
      this.cleanupVerification();
    }
  }

  ngOnDestroy(): void {
    this.cleanupVerification();
  }

  /**
   * Evaluates whether a valid, non-default profile image is available.
   */
  hasValidProfileImage(): boolean {
    if (this.profileImageFile && this.profileImageFile.size > 0) {
      return true;
    }
    if (!this.compareImage || typeof this.compareImage !== 'string') {
      return false;
    }
    const normalized = this.compareImage.trim().toLowerCase();
    if (
      !normalized ||
      normalized === this.defaultImage.toLowerCase() ||
      normalized.includes('default-profile.png') ||
      normalized.includes('default-avatar') ||
      normalized.includes('default-cover')
    ) {
      return false;
    }
    return true;
  }

  closeSelfieCamera(): void {
    if (this.isVerificationSubmitting) return;
    this.cleanupVerification();
    this.closed.emit();
  }

  onUpdateProfileRequested(): void {
    this.closeSelfieCamera();
    this.requestUpdateProfile.emit();
  }

  /**
   * Captures the current video frame immediately, cropping the oval face area
   * at native source camera resolution without quality-degrading downscaling.
   */
  async captureSelfie(): Promise<void> {
    if (!this.isCameraReady || this.isCapturing || this.hasCapturedSelfie) {
      return;
    }

    const video = this.selfieVideo?.nativeElement;
    const oval = this.selfieOval?.nativeElement;

    if (!video || !oval || !video.videoWidth || !video.videoHeight) {
      this.selfieCameraError = this.selfieConstants.CAMERA_LOADING_ERROR;
      this.cdr.markForCheck();
      return;
    }

    this.isCapturing = true;
    this.selfieCameraError = '';
    this.cdr.markForCheck();

    const t0 = performance.now();

    try {
      const { blob, frameTimeMs, encodeTimeMs } = await this.captureFrameToBlob(video, oval);

      if (!blob) {
        this.selfieCameraError = this.selfieConstants.CAPTURE_FAILED_ERROR;
        this.isCapturing = false;
        this.cdr.markForCheck();
        return;
      }

      this.lastCaptureDurationMs = frameTimeMs;
      this.lastEncodeDurationMs = encodeTimeMs;
      const totalCaptureMs = performance.now() - t0;

      console.debug(
        `[SelfieVerification] Frame grabbed in ${frameTimeMs.toFixed(1)}ms, encoded in ${encodeTimeMs.toFixed(1)}ms (total: ${totalCaptureMs.toFixed(1)}ms)`
      );

      this.selfieVerificationFile = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
      this.revokeSelfiePreview();
      this.selfiePreviewUrl = URL.createObjectURL(blob);

      // CRITICAL: We do NOT stop the camera here!
      // Keeping the stream active allows immediate retakes with 0ms hardware restart penalty.
      this.isCapturing = false;
      this.cdr.markForCheck();
    } catch (e) {
      console.error('[SelfieVerification] Capture error:', e);
      this.selfieCameraError = this.selfieConstants.CAPTURE_EXCEPTION_ERROR;
      this.isCapturing = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Resets the preview and immediately returns to the live camera stream.
   * Ensures the video element remains bound to the active stream.
   */
  async retakeSelfie(): Promise<void> {
    if (this.isVerificationSubmitting) return;

    this.selfieVerificationFile = null;
    this.revokeSelfiePreview();
    this.selfieCameraError = '';

    // Check if the current stream has live tracks
    const isStreamAlive =
      this.selfieCameraStream &&
      this.selfieCameraStream.getVideoTracks().some((t) => t.readyState === 'live');

    if (isStreamAlive) {
      this.isCameraReady = true;

      // Stream is active, re-bind and ensure playback
      let video = this.selfieVideo?.nativeElement;
      if (!video) {
        // Wait a microtask in case of DOM repaint
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
        video = this.selfieVideo?.nativeElement;
      }

      if (video) {
        if (video.srcObject !== this.selfieCameraStream) {
          video.srcObject = this.selfieCameraStream;
        }
        try {
          await video.play();
        } catch {
          // ignore autoplay restrictions
        }
      }

      this.cdr.markForCheck();
      return;
    }

    // If stream was stopped or closed, re-initialize camera completely
    await this.startSelfieCamera();
  }

  /**
   * Submits the profile image and captured selfie to the facial verification service.
   */
  async submitSelfieVerification(): Promise<void> {
    if (this.isVerificationSubmitting || !this.hasCapturedSelfie || !this.selfieVerificationFile) {
      return;
    }

    this.selfieCameraError = '';

    // Verify and ensure profile image blob is available
    let profileBlob = this.profileImageBlob;
    if (!profileBlob || profileBlob.size === 0) {
      profileBlob = await this.prepareProfileImageBlob();
    }

    if (!profileBlob || profileBlob.size === 0) {
      this.selfieCameraError = this.selfieConstants.NO_PROFILE_PHOTO_NOTICE;
      this.selfieVerificationStep = 'no-profile-photo';
      this.stopSelfieCamera();
      this.cdr.markForCheck();
      return;
    }

    // Stop camera stream now that verification submission has started
    this.stopSelfieCamera();

    const formData = new FormData();
    formData.append('profileImage', profileBlob, 'profile.jpg');
    formData.append('selfieImage', this.selfieVerificationFile, this.selfieVerificationFile.name);

    this.isVerificationSubmitting = true;
    this.selfieVerificationStep = 'selfie';
    this.cdr.markForCheck();

    this.userService.verifySelfieProfile(formData).subscribe({
      next: (res: any) => {
        this.isVerificationSubmitting = false;
        if (!res?.success) {
          this.selfieVerificationStep = 'failed';
          this.verificationFailureMessage =
            res?.message || this.selfieConstants.FAILED_DEFAULT_MESSAGE;
          this.cdr.markForCheck();
          return;
        }

        this.selfieVerificationStep = 'verified';
        this.scheduleVerifiedClose(res);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isVerificationSubmitting = false;
        this.selfieVerificationStep = 'error';
        this.verificationErrorMessage =
          err?.error?.message ||
          err?.message ||
          this.selfieConstants.API_VERIFICATION_FALLBACK_ERROR;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.isVerificationSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  retryVerification(): void {
    if (this.hasCapturedSelfie && this.selfieVerificationFile) {
      this.submitSelfieVerification();
    } else {
      this.retryCapture();
    }
  }

  async retryCapture(): Promise<void> {
    this.selfieVerificationStep = 'selfie';
    this.selfieVerificationFile = null;
    this.revokeSelfiePreview();
    this.selfieCameraError = '';
    this.isCameraReady = false;
    this.cdr.markForCheck();

    await this.startSelfieCamera();
  }

  private async initVerificationFlow(): Promise<void> {
    this.clearVerificationRedirectTimer();
    this.revokeSelfiePreview();
    this.selfieVerificationFile = null;
    this.selfieCameraError = '';
    this.verificationFailureMessage = '';
    this.verificationErrorMessage = '';
    this.isVerificationSubmitting = false;
    this.isCapturing = false;

    // Check whether the user has a valid profile image available
    if (!this.hasValidProfileImage()) {
      this.selfieVerificationStep = 'no-profile-photo';
      this.stopSelfieCamera();
      this.cdr.markForCheck();
      return;
    }

    // Step 2: Open Camera immediately as part of streamlined verification flow
    this.selfieVerificationStep = 'selfie';
    this.cdr.markForCheck();

    // Pre-cache profile image blob asynchronously in background (once)
    this.prepareProfileImageBlob();

    await this.startSelfieCamera();
  }

  private async startSelfieCamera(): Promise<void> {
    this.selfieCameraError = '';
    this.isCameraReady = false;
    this.isCameraInitializing = true;
    this.cdr.markForCheck();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.selfieCameraError = 'Camera access is not available in this browser or security context.';
      this.isCameraInitializing = false;
      this.cdr.markForCheck();
      return;
    }

    // Reuse existing stream if live
    if (this.selfieCameraStream && this.selfieCameraStream.getVideoTracks().some((t) => t.readyState === 'live')) {
      let video = this.selfieVideo?.nativeElement;
      if (!video) {
        await new Promise<void>((resolve) => setTimeout(resolve, 30));
        video = this.selfieVideo?.nativeElement;
      }

      if (video) {
        if (video.srcObject !== this.selfieCameraStream) {
          video.srcObject = this.selfieCameraStream;
        }
        await this.attachVideoReadyHandler(video);
      }
      this.isCameraInitializing = false;
      this.isCameraReady = true;
      this.cdr.markForCheck();
      return;
    }

    this.stopSelfieCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback for devices not supporting ideal resolution constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      }

      this.selfieCameraStream = stream;

      let video = this.selfieVideo?.nativeElement;
      if (!video) {
        // Give Angular time to mount the video element if needed
        await new Promise<void>((resolve) => setTimeout(resolve, 40));
        video = this.selfieVideo?.nativeElement;
      }

      if (video) {
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        await this.attachVideoReadyHandler(video);
      }

      this.isCameraInitializing = false;
      this.isCameraReady = true;
      this.cdr.markForCheck();
    } catch (err: any) {
      this.isCameraInitializing = false;
      this.isCameraReady = false;
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        this.selfieCameraError = this.selfieConstants.CAMERA_PERMISSION_DENIED_ERROR;
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        this.selfieCameraError = this.selfieConstants.CAMERA_NOT_FOUND_ERROR;
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        this.selfieCameraError = this.selfieConstants.CAMERA_IN_USE_ERROR;
      } else {
        this.selfieCameraError = this.selfieConstants.CAMERA_GENERIC_ERROR;
      }
      this.cdr.markForCheck();
    }
  }

  private async attachVideoReadyHandler(video: HTMLVideoElement): Promise<void> {
    try {
      await video.play();
    } catch {
      // Inline play error handler
    }

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      return;
    }

    return new Promise<void>((resolve) => {
      const onLoaded = () => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('canplay', onLoaded);
        resolve();
      };
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('canplay', onLoaded, { once: true });
      setTimeout(resolve, 800);
    });
  }

  private captureFrameToBlob(
    video: HTMLVideoElement,
    oval: HTMLElement
  ): Promise<{ blob: Blob | null; frameTimeMs: number; encodeTimeMs: number }> {
    const t0 = performance.now();

    const videoRect = video.getBoundingClientRect();
    const ovalRect = oval.getBoundingClientRect();

    const scale = Math.max(videoRect.width / video.videoWidth, videoRect.height / video.videoHeight);
    const displayedWidth = video.videoWidth * scale;
    const displayedHeight = video.videoHeight * scale;
    const offsetX = (videoRect.width - displayedWidth) / 2;
    const offsetY = (videoRect.height - displayedHeight) / 2;

    const ovalLeft = ovalRect.left - videoRect.left;
    const ovalTop = ovalRect.top - videoRect.top;

    // Source coordinates on the video frame (accounting for CSS transform: scaleX(-1) on video)
    const sourceX = (videoRect.width - ovalLeft - ovalRect.width - offsetX) / scale;
    const sourceY = (ovalTop - offsetY) / scale;
    const sourceWidth = ovalRect.width / scale;
    const sourceHeight = ovalRect.height / scale;

    // Retain full camera resolution - avoid downscaling to tiny CSS bounds!
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sourceWidth));
    canvas.height = Math.max(1, Math.round(sourceHeight));

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      return Promise.resolve({ blob: null, frameTimeMs: 0, encodeTimeMs: 0 });
    }

    // Mirror to match the user's front-facing preview
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const frameTimeMs = performance.now() - t0;
    const encodeStart = performance.now();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const encodeTimeMs = performance.now() - encodeStart;
          resolve({ blob, frameTimeMs, encodeTimeMs });
        },
        'image/jpeg',
        0.95
      );
    });
  }

  private async prepareProfileImageBlob(): Promise<Blob | null> {
    if (this.profileImageBlob && this.profileImageBlob.size > 0) {
      return this.profileImageBlob;
    }

    if (this.profileImageFile && this.profileImageFile.size > 0) {
      this.profileImageBlob = this.profileImageFile;
      return this.profileImageBlob;
    }

    if (!this.hasValidProfileImage()) {
      return null;
    }

    const url = this.compareImage;

    // Check memory cache
    if (this.profileImageBlobCache.has(url)) {
      this.profileImageBlob = this.profileImageBlobCache.get(url)!;
      return this.profileImageBlob;
    }

    // If previously failed for this URL (e.g. rate limit), don't hammer again
    if (this.failedFetchUrls.has(url)) {
      return null;
    }

    // Deduplicate in-flight fetch
    if (this.profileImageFetchPromise) {
      return this.profileImageFetchPromise;
    }

    this.profileImageFetchPromise = this.doFetchProfileImageBlob(url);
    try {
      const blob = await this.profileImageFetchPromise;
      if (blob && blob.size > 0) {
        this.profileImageBlob = blob;
        this.profileImageBlobCache.set(url, blob);
        return blob;
      } else {
        this.failedFetchUrls.add(url);
        return null;
      }
    } finally {
      this.profileImageFetchPromise = null;
    }
  }

  private async doFetchProfileImageBlob(url: string): Promise<Blob | null> {
    // 1. Fast path: Blob URL or Data URL
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      try {
        const res = await fetch(url);
        const b = await res.blob();
        if (b && b.size > 0) return b;
      } catch (e) {
        console.warn('[SelfieVerification] Blob/Data URL fetch failed:', e);
      }
      return null;
    }

    // 2. Fetch with credentials: 'omit' and mode: 'cors'
    // NOTE: credentials MUST be 'omit' so that 3rd-party CDNs (like lh3.googleusercontent.com)
    // with 'Access-Control-Allow-Origin: *' are accepted by the browser CORS policy.
    try {
      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'force-cache',
      });
      if (res.ok) {
        const b = await res.blob();
        if (b && b.size > 0) return b;
      }
    } catch (err) {
      console.warn('[SelfieVerification] Direct CORS fetch omitted:', err);
    }

    // 3. Fallback: Image element with crossOrigin='anonymous'
    try {
      const b = await this.loadImageElementToBlob(url);
      if (b && b.size > 0) return b;
    } catch {
      // Failed
    }

    return null;
  }

  private loadImageElementToBlob(url: string): Promise<Blob | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 400;
          canvas.height = img.naturalHeight || 400;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private stopSelfieCamera(): void {
    if (this.selfieCameraStream) {
      this.selfieCameraStream.getTracks().forEach((track) => track.stop());
      this.selfieCameraStream = null;
    }

    const video = this.selfieVideo?.nativeElement;
    if (video) {
      video.srcObject = null;
    }
    this.isCameraReady = false;
    this.isCameraInitializing = false;
  }

  private revokeSelfiePreview(): void {
    if (this.selfiePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.selfiePreviewUrl);
    }
    this.selfiePreviewUrl = '';
  }

  private cleanupVerification(): void {
    this.clearVerificationRedirectTimer();
    this.stopSelfieCamera();
    this.revokeSelfiePreview();
    this.selfieVerificationFile = null;
    this.isCapturing = false;
    this.isVerificationSubmitting = false;
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
}
