import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class CompleteProfileService {
  completion: number;
  userService = inject(UserService);
  private _showPopup$ = new BehaviorSubject<boolean>(false);
  showPopup$ = this._showPopup$.asObservable();
  timerId: any;

  hidePopup() {
    this._showPopup$.next(false);
  }

  private calculateCompletion(profile: any): number {
    let filled = 0;
    let total = 8; // total fields we're checking

    if (profile.userName) filled++;
    if (profile.bio) filled++;
    if (profile.dob) filled++;
    if (profile.gender) filled++;
    if (profile.profileImage) filled++;
    if (profile.profileBanner) filled++;
    if (profile.interests && profile.interests.length > 0) filled++;  
    return Math.round((filled / total) * 100); // rounded %
  }

  checkProfileAndShowPopup(): Observable<boolean> {
    this.clearTimer();
    return this.userService.getMyProfile().pipe(
      map((response) => {
        if (response?.success && response.statusCode === 200) {
          const userProfile = response.data;
  
          const completion = this.calculateCompletion(userProfile);
          this.completion = completion;
  
          if (completion < 70) {
            this._showPopup$.next(true);
            return false; // profile incomplete
          } else {
            this._showPopup$.next(false);
            return true; // profile complete
          }
        }
        return false;
      }),
      catchError(() => {
        this._showPopup$.next(false);
        return of(false);
      })
    );
  }
  
  clearTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

}
