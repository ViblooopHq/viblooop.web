import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import { filter, take, switchMap, tap, catchError } from 'rxjs/operators';
import { Environment } from '../../../../environment';
import { AppSplashService } from '../app-splash/app-splash.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  logInbaseUrl = Environment.authBaseUrl;
  baseUrl = Environment.apiBaseUrl;
  imageBaseUrl = Environment.imageBaseUrl;
  http = inject(HttpClient);
  router = inject(Router);
  appSplashService = inject(AppSplashService);

  userDetails: any;
  userDetails$ = new BehaviorSubject<any>(undefined);
  isAuthInitialized$ = new BehaviorSubject<boolean>(false);

  private isAuthInitializing = false;
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  googleLogin() {
    this.appSplashService.show({
      message: 'Connecting to Google...',
      subtitle: 'Redirecting to secure login',
    });
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

  initAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // On the server during SSR, we do not have browser cookies.
      // Mark as initialized so server-side rendering can finish without waiting/hanging.
      this.isAuthInitialized$.next(true);
      return;
    }

    if (this.isAuthInitializing) {
      return;
    }
    this.isAuthInitializing = true;

    this.http.get(`${this.logInbaseUrl}/me`, { withCredentials: true }).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.userDetails = res.data;
          this.userDetails$.next(this.userDetails);
        }
        this.isAuthInitializing = false;
        this.isAuthInitialized$.next(true);
      },
      error: (err) => {
        if (err.status === 401) {
          // Access token might be expired; attempt silent token refresh with refresh_token cookie
          this.refreshToken().subscribe({
            next: () => {
              // Token refreshed successfully; retry getting user details
              this.http.get(`${this.logInbaseUrl}/me`, { withCredentials: true }).subscribe({
                next: (retryRes: any) => {
                  if (retryRes?.success) {
                    this.userDetails = retryRes.data;
                    this.userDetails$.next(this.userDetails);
                  }
                  this.isAuthInitializing = false;
                  this.isAuthInitialized$.next(true);
                },
                error: () => {
                  this.userDetails = null;
                  this.userDetails$.next(null);
                  this.isAuthInitializing = false;
                  this.isAuthInitialized$.next(true);
                }
              });
            },
            error: () => {
              // Refresh token is expired or invalid; mark user as unauthenticated
              this.userDetails = null;
              this.userDetails$.next(null);
              this.isAuthInitializing = false;
              this.isAuthInitialized$.next(true);
            }
          });
        } else {
          this.userDetails = null;
          this.userDetails$.next(null);
          this.isAuthInitializing = false;
          this.isAuthInitialized$.next(true);
        }
      }
    });
  }

  getUserProfile(userId: string) {
    return this.http.post(`${this.baseUrl}/getUserProfile`, { userId: userId });
  }

  getMyProfile() {
    return this.http.post(`${this.baseUrl}/getMyProfile`, {});
  }

  toggleSavedEvent(eventId: string) {
    return this.http.post(`${this.baseUrl}/toggleWishlistEvent`, { eventId });
  }

  getWishlistedEvents() {
    return this.http.get(`${this.baseUrl}/getWishlistedEvents`);
  }

  isEventWishlisted(eventId: string): boolean {
    return (this.userDetails?.wishlist || []).some((item: any) => {
      const wishlistEventId = item?._id || item?.id || item;
      return String(wishlistEventId) === String(eventId);
    });
  }

  setEventWishlistState(eventId: string, isWishlisted: boolean): void {
    const wishlist = (this.userDetails?.wishlist || [])
      .map((item: any) => item?._id || item?.id || item)
      .filter(Boolean);
    const nextWishlist = isWishlisted
      ? Array.from(new Set([...wishlist.map(String), String(eventId)]))
      : wishlist.filter((id: any) => String(id) !== String(eventId));

    this.replaceWishlist(nextWishlist);
  }

  replaceWishlist(wishlist: any[]): void {
    const currentUser = this.userDetails$.value;
    if (!currentUser) return;

    this.userDetails = {
      ...currentUser,
      wishlist: [...wishlist],
    };
    this.userDetails$.next(this.userDetails);
  }

  isLoggedIn(): boolean {
    return !!this.userDetails$.value;
  }

  refreshToken(): Observable<any> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((result): result is boolean => result !== null),
        take(1),
        switchMap((success) => {
          if (success) {
            return of({ success: true });
          }
          return throwError(() => new Error('Token refresh failed'));
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.http
      .post(`${this.logInbaseUrl}/refresh-access-token`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(false);
          return throwError(() => err);
        })
      );
  }

  logout(redirect: boolean = true, isUserInitiated: boolean = true) {
    if (isUserInitiated) {
      this.appSplashService.showLogoutSplash();
    }

    this.http.delete(`${this.logInbaseUrl}/logout`, { withCredentials: true }).subscribe({
      next: () => {
        this.userDetails = null;
        this.userDetails$.next(null);
        if (redirect) {
          this.router.navigateByUrl('/').then(() => {
            if (isUserInitiated) {
              this.appSplashService.hide(3000);
            }
          });
        } else if (isUserInitiated) {
          this.appSplashService.hide(3000);
        }
      },
      error: () => {
        this.userDetails = null;
        this.userDetails$.next(null);
        if (redirect) {
          this.router.navigateByUrl('/').then(() => {
            if (isUserInitiated) {
              this.appSplashService.hide(3000);
            }
          });
        } else if (isUserInitiated) {
          this.appSplashService.hide(3000);
        }
      }
    });
  }
}
