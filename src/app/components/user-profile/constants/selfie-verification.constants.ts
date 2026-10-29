export const SELFIE_VERIFICATION_CONSTANTS = {
  // Step 1: No Profile Photo
  NO_PROFILE_PHOTO_TITLE: 'Profile Photo Required',
  NO_PROFILE_PHOTO_SUBTITLE: 'A valid profile photo is required before starting verification.',
  NO_PROFILE_PHOTO_NOTICE: 'Please update your profile image before starting the selfie verification process.',
  UPDATE_PHOTO_BTN: 'Update Photo',

  // Step 1: Camera & Review Header
  STEP_1_PILL: 'Step 1 of 2',
  VERIFY_IDENTITY_TITLE: 'Verify Your Identity',
  REVIEW_SELFIE_TITLE: 'Review Your Selfie',
  VERIFY_IDENTITY_SUBTITLE: 'Take a clear selfie to get your Photo Verified badge',
  REVIEW_SELFIE_SUBTITLE: 'Make sure your face is clearly visible before continuing',

  // Comparing section
  COMPARING_WITH_LABEL: 'Comparing with your',
  PROFILE_PHOTO_LABEL: 'profile photo',

  // Live Camera Status & Buttons
  STARTING_CAMERA_STATUS: 'Starting Camera...',
  CAMERA_READY_STATUS: 'Camera Ready',
  SELFIE_CAPTURED_STATUS: 'Selfie Captured',
  VERIFYING_IDENTITY_STATUS: 'Verifying Identity...',
  TAKE_SELFIE_BTN: 'Take Selfie',
  CAPTURING_BTN: 'Capturing...',
  RETAKE_PHOTO_BTN: 'Retake Photo',
  VERIFY_SELFIE_BTN: 'Verify Selfie',
  VERIFYING_BTN: 'Verifying...',
  CANCEL_BTN: 'Cancel',
  PRIVACY_NOTICE: 'Used only for identity verification purposes.',

  // Progress Step
  STEP_2_PILL: 'Step 2 of 2',
  PROGRESS_TITLE: 'Verification in Progress',
  PROGRESS_SUBTITLE: 'Comparing your selfie with your profile photo',
  PROGRESS_PANEL_TITLE: 'Checking your photos',
  PROGRESS_PANEL_SUBTITLE: 'Please keep this window open while facial verification completes.',

  // Verified State
  VERIFIED_PILL: 'Verified',
  VERIFIED_TITLE: 'Photo Verified',
  VERIFIED_SUBTITLE: 'Your identity has been verified',
  VERIFIED_PANEL_TITLE: 'Verified successfully',
  VERIFIED_PANEL_SUBTITLE: 'Your verified badge is ready. Redirecting to your profile...',

  // Failed State
  FAILED_PILL: 'Unsuccessful',
  FAILED_TITLE: 'Verification Unsuccessful',
  FAILED_SUBTITLE: 'Face match was not confirmed',
  FAILED_PANEL_TITLE: 'Face match was not confirmed',
  FAILED_DEFAULT_MESSAGE:
    'We could not match your selfie with your profile photo. Please try again with good lighting and look directly into the camera.',
  TRY_AGAIN_BTN: 'Try Again',

  // Error State
  ERROR_TITLE: 'Verification Error',
  ERROR_SUBTITLE: 'We could not process your verification',
  ERROR_PANEL_TITLE: 'Technical error occurred',
  ERROR_DEFAULT_MESSAGE:
    'A network error occurred while verifying your selfie. Please check your connection and try again.',
  RETAKE_SELFIE_BTN: 'Retake Selfie',
  RETRY_VERIFICATION_BTN: 'Retry Verification',

  // Camera & Capture Errors
  CAMERA_LOADING_ERROR: 'Camera is still loading. Please try again.',
  CAPTURE_FAILED_ERROR: 'Unable to capture selfie. Please try again.',
  CAPTURE_EXCEPTION_ERROR: 'Error capturing selfie. Please try again.',
  CAMERA_PERMISSION_DENIED_ERROR:
    'Camera access was blocked. Please allow camera permissions in your browser settings and try again.',
  CAMERA_NOT_FOUND_ERROR: 'No camera was found on this device. Please connect a camera and try again.',
  CAMERA_IN_USE_ERROR:
    'Camera is currently in use by another application. Please close other camera apps and try again.',
  CAMERA_GENERIC_ERROR: 'Unable to start camera. Please check your camera settings and try again.',
  API_VERIFICATION_FALLBACK_ERROR:
    'A technical error occurred while verifying your selfie. Please try again.',

  // Aria Labels
  ARIA_CLOSE_VERIFICATION: 'Close verification',
  ARIA_CLOSE_CAMERA: 'Close camera',
} as const;
