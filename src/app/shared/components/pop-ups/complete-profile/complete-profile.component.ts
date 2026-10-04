import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CompleteProfileService } from '../../../services/popup/complete-profile.service';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'vl-complete-profile',
  imports: [LottieComponent],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.scss'
})
export class CompleteProfileComponent {
  completeProfileService = inject(CompleteProfileService);
  options = {
    path: 'assets/json/complete-profile.json', // lottie file path
  };
  constructor(private router: Router) {}

  title = 'Complete your profile';
  description = `Your profile is only ${this.completeProfileService.completion} % complete. Complete it now to get the best experience.`;
  primaryBtnText = 'Complete Now';
  secondaryBtnText = 'Later';

  closePopup() {
    this.completeProfileService.hidePopup();
  }

  completeNow() {
    this.closePopup();
    this.router.navigate(['profile/edit']); // go to profile page
  }

  later() {
    this.closePopup();
  }

}
