export const PROFILE_CONSTANTS = {
    // Delete Account Confirmation Dialog
    DELETE_ACCOUNT_DIALOG_TITLE: 'Delete Account',
    DELETE_ACCOUNT_DIALOG_SUBTITLE: 'This action cannot be undone.',
    DELETE_ACCOUNT_WARNING_PROFILE: 'Your profile will be removed',
    DELETE_ACCOUNT_WARNING_EVENTS: 'Events you’ve created will be cancelled',
    DELETE_ACCOUNT_WARNING_DATA: 'Chats, reviews and data will be deleted',
    DELETE_ACCOUNT_CANCEL_BTN: 'Keep Account',
    DELETE_ACCOUNT_CONFIRM_BTN: 'Delete Forever',
    DELETE_ACCOUNT_DELETING_BTN: 'Deleting...',

    // Delete Account Response Modal
    DELETE_ACCOUNT_SUCCESS_TITLE: 'Account Deleted',
    DELETE_ACCOUNT_SUCCESS_MESSAGE: 'Your account has been permanently deleted.',
    DELETE_ACCOUNT_ERROR_TITLE: 'Unable to Delete Account',
    DELETE_ACCOUNT_ERROR_MESSAGE: 'Unable to delete account. Please try again.',
    DELETE_ACCOUNT_INFO_TITLE: 'Deletion Initiated',
    DELETE_ACCOUNT_INFO_MESSAGE: 'Your account deletion request has been received and is currently being processed. The account will be permanently deleted shortly.',
    DELETE_ACCOUNT_DEFAULT_MESSAGE: 'Account deletion has been initiated.',
    DELETE_RESULT_MODAL_CLOSE_BTN: 'Close',
    DELETE_RESULT_MODAL_OK_BTN: 'Okay',

    // Save Actions
    SAVE_PROFILE_BTN: 'Save Profile',
    SAVING_PROFILE_BTN: 'Saving Changes...',

    // Logout Dialog
    LOGOUT_DIALOG_TITLE: 'Sign out?',
    LOGOUT_DIALOG_MESSAGE: 'You’ll need to sign in again to access your account.',
    LOGOUT_CANCEL_BTN: 'Cancel',
    LOGOUT_CONFIRM_BTN: 'Logout',

    // Profile Save & General Errors
    PROFILE_UPDATE_ERROR: 'Unable to update profile.',
    INTEREST_OPTIONS_LOADING_ERROR: 'Interest options are still loading. Please try again.',
    MAX_INTERESTS_ERROR: (max: number) => `You can select up to ${max} interests.`,

    // Confirmation Prompts
    UNSAVED_CHANGES_CONFIRM: 'You have unsaved changes! Are you sure you want to leave this page?',
    LOGOUT_CONFIRM: 'Do you want to log out from this device?',

    // Media / Photo Errors
    HEIC_CONVERT_ERROR: 'Unable to convert HEIC photo. Please try another image.',
    HEIC_CONVERT_MULTI_ERROR: 'Unable to convert one of the HEIC photos. Please try another image.',
    MAX_PROFILE_PHOTOS_ERROR: (max: number) => `You can upload up to ${max} profile photos.`,
    REMAINING_PHOTOS_LIMIT_ERROR: (remaining: number) =>
        `Only ${remaining} more photo${remaining === 1 ? '' : 's'} can be added.`,
    PROFILE_PHOTOS_REFRESH_ERROR: 'Unable to refresh profile photos.',
    PROFILE_PHOTOS_UPDATE_ERROR: 'Unable to update profile photos.',

    // Social Links
    INVALID_SOCIAL_LINK_ERROR: (platform: string) => `Enter a valid ${platform} link.`,
} as const;