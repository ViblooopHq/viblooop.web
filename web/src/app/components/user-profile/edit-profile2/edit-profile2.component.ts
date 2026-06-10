import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SharedService } from '../../../shared/services/shared.service';
import { UserService } from '../../../shared/services/user/user.service';
import { FormDrawerComponent } from '../../../shared/components/form-drawer/form-drawer.component';
import { SelfieVerificationComponent } from '../selfie-verification/selfie-verification.component';

@Component({
  selector: 'vl-edit-profile',
  templateUrl: './edit-profile2.component.html',
  styleUrls: ['./edit-profile2.component.scss'],
  imports: [ReactiveFormsModule, FormsModule, SelfieVerificationComponent, FormDrawerComponent]
})
export class EditProfile2Component implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private sharedService = inject(SharedService);
  private userService = inject(UserService);
  private router = inject(Router);

  profileForm!: FormGroup;
  defaultProfile = 'assets/images/default-profile.png';
  profilePreview: string | ArrayBuffer | null = null;
  profilePhotoFile: File | null = null;
  isSelfieVerificationOpen = false;
  isVerified = false;
  isSaving = false;
  saveError = '';
  showLogoutDialog = false;
  showDeleteDialog = false;
  readonly maxInterests = 8;
  readonly genderOptions = [
    { value: 'Woman', label: 'Woman', icon: 'fa-solid fa-venus' },
    { value: 'Man', label: 'Man', icon: 'fa-solid fa-mars' },
    { value: 'Non-binary', label: 'Non-binary', icon: 'fa-solid fa-genderless' },
    { value: 'Prefer not to say', label: 'Prefer not to say', icon: 'fa-regular fa-circle-question' },
  ];
  private interestCategories: any[] = [];
  private interestOptions: any[] = [];
  private selectedInterestLabels: string[] = [];

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      bio: ['', [Validators.maxLength(500)]],
      dob: [''],
      gender: [''],
      location: [''],
      interests: this.fb.array([]),
    });
    this.loadInterestOptions();
    this.loadProfileData();
  }

  get interests(): FormArray {
    return this.profileForm.get('interests') as FormArray;
  }

  get displayInterests(): any[] {
    return this.interestOptions;
  }

  get canSaveProfile(): boolean {
    return Boolean(this.profileForm?.dirty && !this.isSaving);
  }

  saveProfile(): void {
    this.profileForm.markAllAsTouched();
    this.saveError = '';

    if (!this.canSaveProfile || this.profileForm.invalid) {
      return;
    }

    const selectedInterests = this.interests.value || [];
    if (selectedInterests.length > this.maxInterests) {
      this.saveError = `You can select up to ${this.maxInterests} interests.`;
      return;
    }

    if (selectedInterests.length && !this.interestCategories.length) {
      this.saveError = 'Interest options are still loading. Please try again.';
      return;
    }

    const formData = this.buildProfileFormData();
    this.isSaving = true;

    this.userService.updateUserProfile(formData).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.saveError = res?.message || 'Unable to update profile.';
          return;
        }

        this.profileForm.markAsPristine();
        this.router.navigateByUrl('/profile');
      },
      error: (err) => {
        this.saveError = err?.error?.message || err?.message || 'Unable to update profile.';
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  canDeactivate(): boolean {
    if (this.profileForm?.dirty && !this.isSaving) {
      return confirm('You have unsaved changes! Are you sure you want to leave this page?');
    }
    return true;
  }

  goBack(): void {
    window.history.back();
  }

  logout(): void {
    if (!confirm('Do you want to log out from this device?')) return;
    this.authService.logout();
  }

  openLogoutDialog(): void {
    this.showDeleteDialog = false;
    this.showLogoutDialog = true;
  }

  closeLogoutDialog(): void {
    this.showLogoutDialog = false;
  }

  confirmLogout(): void {
    this.showLogoutDialog = false;
    this.authService.logout();
  }

  openDeleteDialog(): void {
    this.showLogoutDialog = false;
    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
  }

  confirmDeleteAccount(): void {
    this.showDeleteDialog = false;
    alert('Delete account is not connected yet.');
  }

  verifySelfie(): void {
    this.isSelfieVerificationOpen = true;
  }

  async onProfileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    let finalFile = file;
    try {
      finalFile = await this.sharedService.convertHeicToJpg(file);
    } catch {
      this.saveError = 'Unable to convert HEIC photo. Please try another image.';
      return;
    }

    this.profilePhotoFile = finalFile;
    this.profileForm.markAsDirty();
    const reader = new FileReader();
    reader.onload = () => this.profilePreview = reader.result;
    reader.readAsDataURL(finalFile);
  }

  closeSelfieVerification(): void {
    this.isSelfieVerificationOpen = false;
  }

  onSelfieVerified(): void {
    this.isVerified = true;
    this.profileForm.markAsPristine();
    this.router.navigateByUrl('/profile');
  }

  toggleInterest(interest: any): void {
    const index = this.interests.value.findIndex((selected: any) => this.isSameInterest(selected, interest));
    if (index > -1) {
      this.interests.removeAt(index);
      this.interests.markAsDirty();
      return;
    }

    if (this.interests.length >= this.maxInterests) {
      this.saveError = `You can select up to ${this.maxInterests} interests.`;
      return;
    }

    this.saveError = '';
    this.interests.push(this.fb.control(interest));
    this.interests.markAsDirty();
  }

  isInterestSelected(interest: any): boolean {
    return this.interests.value.some((selected: any) => this.isSameInterest(selected, interest));
  }

  isInterestDisabled(interest: any): boolean {
    return this.interests.length >= this.maxInterests && !this.isInterestSelected(interest);
  }

  selectGender(gender: string): void {
    const genderControl = this.profileForm.get('gender');
    genderControl?.setValue(gender);
    genderControl?.markAsDirty();
  }

  openDatePicker(input: HTMLInputElement): void {
    input.focus();

    try {
      const dateInput = input as HTMLInputElement & { showPicker?: () => void };
      dateInput.showPicker?.();
    } catch {
      // Some browsers only allow the native picker from direct user input.
    }
  }

  private loadProfileData(): void {
    const userId = this.authService.userDetails$.value?.id || this.authService.userDetails?.id || '';

    this.userService.getUserProfile(userId).subscribe({
      next: (res: any) => {
        if (!res?.success || res.statusCode !== 200) return;

        const data = res.data;
        this.isVerified = Boolean(data?.verified || data?.isVerified || data?.isPhoneVerified || data?.isEmailVerified);

        this.profileForm.patchValue({
          name: data.userName || '',
          username: data.userName || '',
          bio: data.bio || '',
          dob: this.toDateInputValue(data.dob),
          gender: data.gender || '',
          location: data.location || '',
        });

        this.selectedInterestLabels = Array.isArray(data.interests)
          ? data.interests.map((interest: any) => typeof interest === 'string' ? interest : interest?.label).filter(Boolean)
          : [];
        this.applySelectedInterests();

        this.profilePreview = this.sharedService.getImageUrl(data.profileImage) || this.defaultProfile;
        this.profileForm.markAsPristine();
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
      }
    });
  }

  private loadInterestOptions(): void {
    this.userService.getIntrestList().subscribe({
      next: (res: any) => {
        this.interestCategories = Array.isArray(res?.data) ? res.data : [];
        this.interestOptions = this.interestCategories.flatMap((category: any) =>
          (category.tags || []).map((tag: any) => ({
            ...tag,
            categoryId: category._id,
            categoryName: category.name
          }))
        );
        const shouldKeepPristine = this.profileForm.pristine;
        this.applySelectedInterests();
        if (shouldKeepPristine) {
          this.profileForm.markAsPristine();
        }
      },
      error: (err) => {
        console.error('Error fetching interest options:', err);
      }
    });
  }

  private buildProfileFormData(): FormData {
    const formValue = this.profileForm.value;
    const formData = new FormData();

    formData.append('username', formValue.username || '');
    formData.append('bio', formValue.bio || '');
    formData.append('dob', formValue.dob || '');
    formData.append('gender', formValue.gender || '');
    formData.append('location', formValue.location || '');
    formData.append('interests', JSON.stringify(this.buildInterestsPayload()));

    if (this.profilePhotoFile) {
      formData.append('profileImage', this.profilePhotoFile);
    }

    return formData;
  }

  private applySelectedInterests(): void {
    if (!this.selectedInterestLabels.length || !this.interestOptions.length) return;

    this.interests.clear();
    this.selectedInterestLabels.slice(0, this.maxInterests).forEach((label) => {
      const matchedInterest = this.interestOptions.find((interest) =>
        this.normalizeInterestLabel(interest.label) === this.normalizeInterestLabel(label)
      );

      if (matchedInterest) {
        this.interests.push(this.fb.control(matchedInterest));
      }
    });
    this.interests.markAsPristine();
  }

  private buildInterestsPayload(): any[] {
    const groupedInterests = new Map<string, string[]>();

    (this.interests.value || []).forEach((selectedInterest: any) => {
      const matchedTag = this.findInterestTag(selectedInterest);
      if (!matchedTag) return;

      const existingTagIds = groupedInterests.get(matchedTag.categoryId) || [];
      if (!existingTagIds.includes(matchedTag.tagId)) {
        existingTagIds.push(matchedTag.tagId);
      }
      groupedInterests.set(matchedTag.categoryId, existingTagIds);
    });

    return Array.from(groupedInterests.entries()).map(([categoryId, tagIds]) => ({
      categoryId,
      tagIds
    }));
  }

  private findInterestTag(selectedInterest: any): { categoryId: string; tagId: string } | null {
    if (selectedInterest?.categoryId && selectedInterest?._id) {
      return { categoryId: selectedInterest.categoryId, tagId: selectedInterest._id };
    }

    for (const category of this.interestCategories) {
      const tag = (category.tags || []).find((item: any) =>
        this.normalizeInterestLabel(item.label) === this.normalizeInterestLabel(selectedInterest?.label)
      );

      if (tag?._id && category?._id) {
        return { categoryId: category._id, tagId: tag._id };
      }
    }

    return null;
  }

  private isSameInterest(first: any, second: any): boolean {
    if (first?._id && second?._id) {
      return first._id === second._id;
    }

    return this.normalizeInterestLabel(first?.label) === this.normalizeInterestLabel(second?.label);
  }

  private normalizeInterestLabel(label: string): string {
    return (label || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
  }

  private toDateInputValue(value: string | Date | null | undefined): string {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }
}
