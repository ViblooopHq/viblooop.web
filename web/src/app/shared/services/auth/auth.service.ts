import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { Environment } from '../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  logInbaseUrl = Environment.authBaseUrl;
  baseUrl = Environment.apiBaseUrl;
  imageBaseUrl = Environment.imageBaseUrl;
  http = inject(HttpClient);
  router = inject(Router);

  userDetails: any;
  userDetails$ = new BehaviorSubject<any>(undefined);
  isAuthInitialized$ = new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  googleLogin() {
    const url = this.logInbaseUrl + "/auth/google";
    window.location.href = url;
  }

  sendOTP(email: string) {
    return this.http.post(`${this.logInbaseUrl}/send-otp`, { email });
  }

  verifyOTP(email: string, otp: string) {
    return this.http.post(`${this.logInbaseUrl}/verify-otp`, { email, otp });
  }

  createUser(email: string, username: string) {
    return this.http.post(`${this.logInbaseUrl}/create-user`, { email, username });
  }

  login(data: any) {
    return this.http.post(`${this.logInbaseUrl}/login`, data);
  }

  signup(data: any) {
    return this.http.post(`${this.logInbaseUrl}/signup`, data);
  }

  initAuth() {
    return this.http.get(`${this.logInbaseUrl}/me`, { withCredentials: true }).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.userDetails = res.data;
          this.userDetails$.next(this.userDetails);
        }
        this.isAuthInitialized$.next(true);
      },
      error: () => {
        this.userDetails = null;
        this.userDetails$.next(null);
        this.isAuthInitialized$.next(true);
      }
    });
  }

  getUserProfile(userId: string) {
    return this.http.post(`${this.baseUrl}/getUserProfile`, { userId: userId });
  }

  toggleSavedEvent(eventId: string) {
    return this.http.post(`${this.baseUrl}/toggleWishlistEvent`, { eventId });
  }

  getWishlistedEvents() {
    return this.http.get(`${this.baseUrl}/getWishlistedEvents`);
  }

  isLoggedIn(): boolean {
    return !!this.userDetails$.value;
  }

  refreshToken() {
    return this.http.post(`${this.logInbaseUrl}/refresh-access-token`, { withCredentials: true });
  }

  logout(redirect: boolean = true) {
    this.http.delete(`${this.logInbaseUrl}/logout`, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.userDetails = null;
        this.userDetails$.next(null);
        if (redirect) {
          this.router.navigateByUrl('/');
        }
      },
      error: (err) => {
        this.userDetails = null;
        this.userDetails$.next(null);
        if (redirect) {
          this.router.navigateByUrl('/');
        }
      }
    });
  }
}
