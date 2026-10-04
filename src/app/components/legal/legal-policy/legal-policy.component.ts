import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type PolicyTab = 'terms' | 'privacy' | 'safety';

export interface TocItem {
  id: string;
  title: string;
  badge?: string;
}

@Component({
  selector: 'vl-legal-policy',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './legal-policy.component.html',
  styleUrl: './legal-policy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LegalPolicyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private platformId = inject(PLATFORM_ID);
  public themeService = inject(ThemeService);

  private destroy$ = new Subject<void>();

  // State
  activeTab = signal<PolicyTab>('terms');
  activeSectionId = signal<string>('terms-intro');
  copiedLink = signal<boolean>(false);
  lastUpdated = 'September 20, 2026';
  policyVersion = 'v2.4';

  // Computed tab details
  currentMeta = computed(() => {
    switch (this.activeTab()) {
      case 'terms':
        return {
          title: 'Terms and Conditions',
          subtitle: 'The foundational rules and agreements governing your participation, hosting, and ticketing on Viblooop.',
          readTime: '8 min read',
          icon: 'gavel',
          seoTitle: 'Terms and Conditions | Viblooop Community & Events',
          seoDesc: 'Read the official Viblooop Terms and Conditions regarding event hosting, ticket sales, user conduct, and account policies.'
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'Transparent practices regarding how we protect your personal data, geolocation, and communications.',
          readTime: '6 min read',
          icon: 'shield_lock',
          seoTitle: 'Privacy Policy | Viblooop Social Discovery',
          seoDesc: 'Learn how Viblooop collects, utilizes, and protects your information, location preferences, and user privacy rights.'
        };
      case 'safety':
        return {
          title: 'Safety Guidelines',
          subtitle: 'Our community-first standards, host safety agreement, and zero-tolerance commitments for in-person experiences.',
          readTime: '5 min read',
          icon: 'verified_user',
          seoTitle: 'Community Safety Guidelines | Viblooop',
          seoDesc: 'Explore Viblooop safety standards for hosts and guests, zero-tolerance drug and harassment policies, and meetup protocols.'
        };
    }
  });

  // Table of Contents for each tab
  termsToc: TocItem[] = [
    { id: 'terms-intro', title: '1. Acceptance & Vision' },
    { id: 'terms-eligibility', title: '2. Accounts & Vibes Score' },
    { id: 'terms-hosting', title: '3. Host Obligations & Ticketing' },
    { id: 'terms-conduct', title: '4. User Conduct & Content' },
    { id: 'terms-payments', title: '5. Payments, Fees & Refunds' },
    { id: 'terms-ip', title: '6. Intellectual Property' },
    { id: 'terms-liability', title: '7. Disclaimers & Liability' },
    { id: 'terms-contact', title: '8. Legal Inquiries' }
  ];

  privacyToc: TocItem[] = [
    { id: 'privacy-collection', title: '1. Data We Collect' },
    { id: 'privacy-usage', title: '2. How We Use Data' },
    { id: 'privacy-geolocation', title: '3. Geolocation & Discovery' },
    { id: 'privacy-sharing', title: '4. Third-Party Sharing' },
    { id: 'privacy-cookies', title: '5. Storage & Analytics' },
    { id: 'privacy-rights', title: '6. Your Rights & Data Export' },
    { id: 'privacy-security', title: '7. Security & Retention' },
    { id: 'privacy-dpo', title: '8. Privacy Office' }
  ];

  safetyToc: TocItem[] = [
    { id: 'safety-pledge', title: '1. The Viblooop Pledge', badge: 'Core' },
    { id: 'safety-zero-tolerance', title: '2. Zero-Tolerance Policy', badge: 'Strict' },
    { id: 'safety-host-agreement', title: '3. Host Safety Agreement' },
    { id: 'safety-meetup-rules', title: '4. In-Person Meetup Protocol' },
    { id: 'safety-verified-vibes', title: '5. Verified Vibes Trust' },
    { id: 'safety-reporting', title: '6. 24/7 Incident Reporting' },
    { id: 'safety-enforcement', title: '7. Penalties & Legal Action' }
  ];

  currentToc = computed(() => {
    switch (this.activeTab()) {
      case 'terms': return this.termsToc;
      case 'privacy': return this.privacyToc;
      case 'safety': return this.safetyToc;
    }
  });

  ngOnInit(): void {
    // Route determination
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data['tab']) {
        this.setTab(data['tab'] as PolicyTab, false);
      }
    });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['tab']) {
        const tab = params['tab'].toLowerCase();
        if (tab === 'terms' || tab === 'privacy' || tab === 'safety' || tab === 'safety-guidelines') {
          this.setTab(tab === 'safety-guidelines' ? 'safety' : tab as PolicyTab, false);
        }
      }
    });

    // Also check current url path directly
    const url = this.router.url.split('?')[0].split('#')[0];
    if (url.includes('privacy')) {
      this.setTab('privacy', false);
    } else if (url.includes('safety')) {
      this.setTab('safety', false);
    } else if (url.includes('terms')) {
      this.setTab('terms', false);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTab(tab: PolicyTab): void {
    this.setTab(tab, true);
  }

  private setTab(tab: PolicyTab, navigate: boolean): void {
    this.activeTab.set(tab);
    const meta = this.currentMeta();
    this.titleService.setTitle(meta.seoTitle);
    this.metaService.updateTag({ name: 'description', content: meta.seoDesc });

    const toc = this.currentToc();
    if (toc.length > 0) {
      this.activeSectionId.set(toc[0].id);
    }

    if (navigate) {
      const targetPath = tab === 'terms' ? '/terms' : tab === 'privacy' ? '/privacy' : '/safety-guidelines';
      this.router.navigateByUrl(targetPath);
    }

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  scrollToSection(sectionId: string): void {
    this.activeSectionId.set(sectionId);
    if (!isPlatformBrowser(this.platformId)) return;

    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      const offset = 100;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  printPolicy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }

  copyShareUrl(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      this.copiedLink.set(true);
      setTimeout(() => this.copiedLink.set(false), 2500);
    });
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.activeSectionId.set(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      }
    );

    setTimeout(() => {
      const sections = document.querySelectorAll('.policy-section');
      sections.forEach((section) => observer.observe(section));
    }, 400);
  }
}
