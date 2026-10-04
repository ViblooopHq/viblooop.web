import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'vl-profile-setup',
  imports: [ ReactiveFormsModule],
  templateUrl: './profile-setup.component.html',
  styleUrl: './profile-setup.component.scss'
})
export class ProfileSetupComponent implements OnInit {

  @Input() mode: 'setup' | 'edit' = 'setup';   // decide flow
  @Input() userData: any;  // pass existing user profile for edit

  profileForm!: FormGroup;
  genders = ['Male', 'Female', 'Other'];
  pronouns = ['He/Him', 'She/Her', 'They/Them'];
  interestsList = ['Sports', 'Music', 'Travel', 'Gaming', 'Reading'];
  selectedInterests: string[] = []; 

  profilePhotoPreview: string | ArrayBuffer | null = null;
  coverImagePreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private sharedService: SharedService) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      pronoun: [''],
      interests: [[]],
      bio: ['']
    });

    // If editing, patch existing values
    if (this.mode === 'edit' && this.userData) {
      this.profileForm.patchValue({
        dob: this.userData.dob,
        gender: this.userData.gender,
        pronoun: this.userData.pronoun,
        interests: this.userData.interests,
        bio: this.userData.bio
      });

      this.profilePhotoPreview = this.userData.profilePhoto || null;
      this.coverImagePreview = this.userData.coverImage || null;
    }
  }

  async onFileSelect(event: any, type: 'profilePhoto' | 'coverImage'): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      const finalFile = await this.sharedService.convertHeicToJpg(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'profilePhoto') {
          this.profilePhotoPreview = reader.result;
        } else {
          this.coverImagePreview = reader.result;
        }
      };
      reader.readAsDataURL(finalFile);
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const profileData = {
        ...this.profileForm.value,
        profilePhoto: this.profilePhotoPreview,
        coverImage: this.coverImagePreview
      };

      console.log('Profile Submitted:', profileData);
      // call API (create or update depending on mode)
    }
  }
}
