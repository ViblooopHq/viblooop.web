import { inject, Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Environment } from '../../../../environment';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly domDocument = inject(DOCUMENT);

  readonly defaultSiteName = 'Viblooop';
  readonly defaultTitle = 'Viblooop — Discover, Experience & Connect';
  readonly defaultDescription =
    'Discover vibrant local events, meet genuine people, and experience real-life social gatherings near you with Viblooop.';
  readonly defaultImage = Environment.ogImageUrl;
  readonly baseUrl = Environment.ogPageUrl;

  /**
   * Update full SEO metadata at once
   */
  updateSeo(config: SeoConfig): void {
    const title = config.title ? `${config.title}` : this.defaultTitle;
    const description = config.description || this.defaultDescription;
    const url = config.canonicalUrl || (this.baseUrl + (this.domDocument.location?.pathname || ''));
    const image = config.ogImage || this.defaultImage;
    const robots = config.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    // 1. Page Title
    this.titleService.setTitle(title);

    // 2. Primary Meta Tags
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'robots', content: robots });
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    // 3. Open Graph Tags
    this.metaService.updateTag({ property: 'og:site_name', content: this.defaultSiteName });
    this.metaService.updateTag({ property: 'og:title', content: config.ogTitle || title });
    this.metaService.updateTag({ property: 'og:description', content: config.ogDescription || description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: config.ogUrl || url });
    this.metaService.updateTag({ property: 'og:type', content: config.ogType || 'website' });

    // 4. Twitter Card Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:site', content: '@viblooop' });
    this.metaService.updateTag({ name: 'twitter:title', content: config.twitterTitle || title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.twitterDescription || description });
    this.metaService.updateTag({ name: 'twitter:image', content: config.twitterImage || image });

    // 5. Canonical Link
    this.updateCanonicalUrl(url);
  }

  /**
   * Update or create the canonical <link> element
   */
  updateCanonicalUrl(url: string): void {
    try {
      let link: HTMLLinkElement | null = this.domDocument.querySelector('link[rel="canonical"]');
      if (!link) {
        link = this.domDocument.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.domDocument.head.appendChild(link);
      }
      link.setAttribute('href', url);
    } catch (e) {
      // In SSR edge cases where document might not have head
    }
  }

  /**
   * Inject or update JSON-LD structured data schema
   */
  setJsonLd(schema: Record<string, any>, scriptId = 'viblooop-jsonld-dynamic'): void {
    try {
      let script: HTMLScriptElement | null = this.domDocument.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = this.domDocument.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        this.domDocument.head.appendChild(script);
      }
      script.text = JSON.stringify(schema);
    } catch (e) {
      // safe fallback
    }
  }

  /**
   * Remove dynamic schema when navigating away
   */
  removeJsonLd(scriptId = 'viblooop-jsonld-dynamic'): void {
    try {
      const script = this.domDocument.getElementById(scriptId);
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    } catch (e) { }
  }

  /**
   * Formats and injects Schema.org/Event structured data for Google Event search
   */
  setEventJsonLd(event: any): void {
    if (!event) return;

    const eventUrl = `${this.baseUrl}/events/${event._id || event.id}`;
    const bannerUrl = event.banner || (Array.isArray(event.gallery) && event.gallery[0]) || this.defaultImage;

    const eventSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      description: event.description || `${event.title} on Viblooop`,
      startDate: event.eventDate || event.startDate || new Date().toISOString(),
      endDate: event.endDate || event.eventDate || event.startDate,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: event.isOnline
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
      image: [bannerUrl],
      url: eventUrl,
      organizer: {
        '@type': 'Person',
        name: event.createdBy?.username || event.createdBy?.name || 'Viblooop Host',
      },
      offers: {
        '@type': 'Offer',
        price: event.cost === 'Free' || !event.price ? '0' : String(event.price),
        priceCurrency: 'INR',
        url: eventUrl,
        availability: 'https://schema.org/InStock',
      },
    };

    if (event.location?.address || event.locationName) {
      eventSchema['location'] = {
        '@type': 'Place',
        name: event.locationName || event.location?.address || 'Event Venue',
        address: {
          '@type': 'PostalAddress',
          streetAddress: event.location?.address || event.locationName || '',
        },
      };
    }

    this.setJsonLd(eventSchema, 'viblooop-event-jsonld');
  }

  /**
   * Reset SEO to homepage defaults
   */
  resetToDefaults(): void {
    this.updateSeo({
      title: this.defaultTitle,
      description: this.defaultDescription,
      canonicalUrl: this.baseUrl,
    });
    this.removeJsonLd('viblooop-event-jsonld');
  }
}
