import { Component, EventEmitter, Input, Output, ViewChildren, QueryList, ElementRef, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification/notification.service';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { SharedService } from '../../../shared/services/shared.service';
import { finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSplashService } from '../../../shared/services/app-splash/app-splash.service';

@Component({
  selector: 'vl-otp-verification',
  standalone: true,
  imports: [ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.scss',
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  @Input() email: string = '';
  @Output() back = new EventEmitter<void>();

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otp: string[] = ['', '', '', ''];

  authService = inject(AuthService);
  sharedService = inject(SharedService);
  socketService = inject(SocketService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  appSplashService = inject(AppSplashService);

  isUserAlreadyExist: boolean = true;
  isLoading = signal(false);
  isResending = signal(false);
  resendTimer = signal(300); // 5 minutes in seconds

  private timerInterval: any;

  createUsernameForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
  });

  ngOnInit() {
    this.startResendTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startResendTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.resendTimer.set(300);
    this.timerInterval = setInterval(() => {
      if (this.resendTimer() > 0) {
        this.resendTimer.update(val => val - 1);
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onBack() {
    this.back.emit();
    this.isUserAlreadyExist = true;
  }

  resendOtp() {
    this.isResending.set(true);
    this.authService.sendOTP(this.email)
      .pipe(finalize(() => this.isResending.set(false)))
      .subscribe({
        next: () => {
          this.startResendTimer();
          this.snackBar.open('OTP sent successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error resending OTP', err);
          this.snackBar.open('Failed to resend OTP', 'Close', { duration: 3000 });
        }
      });
  }

  verifyOtp() {
    if (this.otp.join('').length < 4) return;

    this.isLoading.set(true);
    this.authService.verifyOTP(this.email, this.otp.join(''))
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (!res.success) {
            this.isUserAlreadyExist = false;
          } else {
            this.saveLoginData(res.message);
          }
        },
        error: (err) => {
          console.log('Error: ', err);
          this.snackBar.open('Invalid OTP. Please try again.', 'Close', { duration: 3000 });
        }
      });
  }

  createUsername() {
    if (this.createUsernameForm.valid) {
      this.isLoading.set(true);
      const username = this.createUsernameForm.value.username ?? '';

      this.authService.createUser(this.email, username)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (data: any) => {
            this.isUserAlreadyExist = true;
            this.saveLoginData(data.message, true);
          },
          error: (err) => {
            console.log(err);
            this.snackBar.open('Username creation failed', 'Close', { duration: 3000 });
          }
        });
    } else {
      this.createUsernameForm.markAllAsTouched();
    }
  }

  saveLoginData(data: any, isNewUser: boolean = false) {
    this.appSplashService.showLoginSplash(isNewUser);

    this.authService.initAuth();

    // Show success toast then navigate
    const msg = isNewUser ? 'Account created successfully! Welcome.' : 'Verified successfully! Welcome back.';
    this.snackBar.open(msg, 'Close', { duration: 2500 });

    // Navigate to homepage and smoothly hide splash after 3s
    setTimeout(() => {
      this.router.navigateByUrl('/').then(() => {
        this.appSplashService.hide(3000);
      });
    }, 600);
  }

  onInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length > 1) {
      input.value = value.charAt(0);
    }

    this.otp[index] = input.value;

    if (input.value && index < 3) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  onFocus(index: number) {
    const firstEmptyIndex = this.otp.findIndex(digit => digit === '');
    if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
      this.otpInputs.toArray()[firstEmptyIndex].nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 4).split('') || [];

    pastedData.forEach((char, i) => {
      if (i < 4) {
        this.otp[i] = char;
        const inputElement = this.otpInputs.toArray()[i].nativeElement;
        inputElement.value = char;
      }
    });

    const nextToFocus = Math.min(pastedData.length, 3);
    this.otpInputs.toArray()[nextToFocus].nativeElement.focus();
  }
}
