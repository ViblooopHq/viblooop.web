import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, PLATFORM_ID, AfterViewInit, ChangeDetectorRef, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { filter, finalize, single, take, tap } from 'rxjs/operators';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouteService } from '../../../shared/services/route/route.service';
import { OtpVerificationComponent } from '../otp-verification/otp-verification.component';
import type { ISourceOptions } from '@tsparticles/engine';

@Component({
  selector: 'vl-login',
  standalone: true,
  imports: [ReactiveFormsModule, OtpVerificationComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  router = inject(RouteService);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  titleService = inject(Title);
  metaService = inject(Meta);
  platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);

  isOtpSent = signal(false);
  isOtpSending = signal(false);
  otpError = signal('');
  userEmail = '';
  id = "tsparticles";
  private readonly particleIcons = [
    this.createParticleIcon('music', '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
    this.createParticleIcon('location', '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    this.createParticleIcon('gamepad', '<path d="M6 12h4m-2-2v4"/><path d="M15 13h.01"/><path d="M18 11h.01"/><path d="M8 7h8a6 6 0 0 1 5.7 4.2l.6 2A4 4 0 0 1 18.5 18c-1.2 0-2.2-.6-3-1.5h-7C7.7 17.4 6.7 18 5.5 18a4 4 0 0 1-3.8-4.8l.6-2A6 6 0 0 1 8 7Z"/>'),
    this.createParticleIcon('users', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>'),
    this.createParticleIcon('calendar', '<path d="M8 2v4m8-4v4"/><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18"/>'),
    this.createParticleIcon('camera', '<path d="M14.5 4 16 7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3l1.5-3h5Z"/><circle cx="12" cy="14" r="4"/>'),
    this.createParticleIcon('film', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14m10-14v14M3 9h4m-4 6h4m10-6h4m-4 6h4"/>'),
    this.createParticleIcon('coffee', '<path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M16 10h2a3 3 0 0 1 0 6h-2"/><path d="M6 2v3m4-3v3m4-3v3"/>'),
    this.createParticleIcon('utensils', '<path d="M4 3v7a4 4 0 0 0 8 0V3M8 3v18"/><path d="M19 3v18"/><path d="M16 3h3a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-3"/>'),
    this.createParticleIcon('sun', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.1-7.1-1.4 1.4M6.3 17.7l-1.4 1.4m14.2 0-1.4-1.4M6.3 6.3 4.9 4.9"/>'),
    this.createParticleIcon('gamepad-2', '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59l-.7 7A3 3 0 0 0 4.98 19h.22a3 3 0 0 0 2.12-.88L10 15.5h4l2.68 2.62a3 3 0 0 0 2.12.88h.22A3 3 0 0 0 22 15.59l-.7-7A4 4 0 0 0 17.32 5Z"/>'),
    this.createParticleIcon('map-pin', '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.76a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    this.createParticleIcon('party-popper', '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12 2.9 2.9 0 0 1-2 3.12L13 10"/><path d="m22 13-.82-.33a2.9 2.9 0 0 0-3.33 1.05 2.9 2.9 0 0 1-3.33 1.05L14 14"/><path d="M11 3a2.9 2.9 0 0 0-.74 3.16 2.9 2.9 0 0 1-.74 3.16L8 11"/><path d="m4 15 5 5"/><path d="m5 12 7 7"/>'),
    this.createParticleIcon('message-circle', '<path d="M2.99 11.6a9 9 0 1 1 4.4 7.77L3 21l1.63-4.39a9 9 0 0 1-1.64-5.01Z"/>'),
  ];

  particlesOptions: ISourceOptions = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.8,
        },
      },
    },
    particles: {
      color: {
        value: ["#8b5cf6", "#d946ef", "#ffffff"],
      },
      links: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: true,
        speed: 0.75,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          width: 800,
          height: 800
        },
        value: 40,
      },
      opacity: {
        value: 0.4,
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        }
      },
      shape: {
        type: "image",
        options: {
          image: this.particleIcons
        }
      },
      size: {
        value: { min: 10, max: 24 },
      },
    },
    detectRetina: true,
  };

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  private createParticleIcon(name: string, paths: string) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#a855f7" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        ${paths}
      </svg>
    `;

    return {
      name,
      src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
      width: 24,
      height: 24,
      replaceColor: false,
    };
  }

  private isDestroyed = false;
  private particleContainer: any = null;

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const { tsParticles } = await import("@tsparticles/engine");
        const { loadSlim } = await import("@tsparticles/slim");
        await loadSlim(tsParticles);
        if (this.isDestroyed) {
          return;
        }
        this.particleContainer = await tsParticles.load({ id: this.id, options: this.particlesOptions });
        if (this.isDestroyed && this.particleContainer) {
          this.particleContainer.destroy();
          this.particleContainer = null;
        }
      } catch (err) {
        console.error("Failed to load particles", err);
      }
    }
  }

  async ngOnDestroy(): Promise<void> {
    this.isDestroyed = true;
    if (isPlatformBrowser(this.platformId)) {
      try {
        if (this.particleContainer) {
          this.particleContainer.destroy();
          this.particleContainer = null;
        }
        const { tsParticles } = await import("@tsparticles/engine");
        const container = tsParticles.dom().find(c => (c as any).id === this.id);
        if (container) {
          container.destroy();
        }
        const elem = document.getElementById(this.id);
        if (elem) {
          elem.innerHTML = '';
        }
      } catch (err) {
        // ignore cleanup error
      }
    }
  }

  ngOnInit() {
    this.titleService.setTitle('Login | Viblooop - Find your vibe');
    this.metaService.updateTag({ name: 'description', content: 'Sign in to Viblooop to find your vibe and join the moment. Connect with amazing people and discover real plans near you.' });

    this.authService.userDetails$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(() => {
      const redirectUrl = this.route.snapshot.queryParams['redirect'] || this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(redirectUrl);
    });
  }

  loginWithGoogle() {
    window.location.href = "http://localhost:8000/auth/google";
  }

  goBack() {
    if (isPlatformBrowser(this.platformId) && window.history.length > 1) {
      window.history.back();
      return;
    }

    this.router.navigateByUrl('/');
  }

  sendOtp() {
    if (this.loginForm.valid) {
      this.userEmail = this.loginForm.value.email ?? '';
      this.otpError.set('');
      this.isOtpSent.set(true);

      this.isOtpSending.set(true);

      this.authService.sendOTP(this.userEmail).pipe(
        finalize(() => this.isOtpSending.set(false))
      ).subscribe({
        next: (res) => {
          this.otpError.set('');
        },
        error: (err) => {
          console.error(err);
          this.isOtpSent.set(false);
          this.otpError.set('Could not send OTP. Check that your phone can reach the API server and try again.');
          this.cdr.markForCheck();
        }
      })

    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  handleBack() {
    this.isOtpSent.set(false);
    this.otpError.set('');
    this.cdr.markForCheck();
  }
}
