import { Injectable } from '@angular/core';
import {
  CategoryDisplayConfig,
  CREATE_EVENT_CATEGORY_DISPLAY_CONFIGS,
  CREATE_EVENT_CATEGORY_ICON_MAP,
  CreationKind,
} from '../../../components/events/create-event/create-event.config';

@Injectable({
  providedIn: 'root'
})
export class EventCategoryPresentationService {
  getDisplayConfig(category: any): CategoryDisplayConfig | undefined {
    const searchable = this.getSearchableText(category);

    return CREATE_EVENT_CATEGORY_DISPLAY_CONFIGS.find(config =>
      config.matches.some(match => searchable.includes(match))
    );
  }

  getDisplayTitle(category: any): string {
    return this.getDisplayConfig(category)?.title || category?.title || '';
  }

  getDisplayDescription(category: any): string {
    return this.getDisplayConfig(category)?.description || category?.description || '';
  }

  getDisplayIcon(category: any): string {
    return this.getDisplayConfig(category)?.materialIcon || this.getFallbackIcon(category);
  }

  getAccent(category: any): string {
    return this.getDisplayConfig(category)?.accent || 'purple';
  }

  isSoon(category: any): boolean {
    return !!this.getDisplayConfig(category)?.soon;
  }

  getCreationKind(category: any): CreationKind {
    return this.getDisplayConfig(category)?.kind ?? 'event';
  }

  getExpectationTags(category: any): string[] {
    return this.getDisplayConfig(category)?.tags ?? [];
  }

  withDisplayTags(category: any): any {
    const tags = this.getExpectationTags(category);
    return tags.length ? { ...category, tags } : category;
  }

  private getFallbackIcon(category: any): string {
    if (category?.materialIcon) return category.materialIcon;

    const key = (category?.title || '').toLowerCase();
    for (const [match, icon] of Object.entries(CREATE_EVENT_CATEGORY_ICON_MAP)) {
      if (key.includes(match)) return icon;
    }

    return 'celebration';
  }

  private getSearchableText(category: any): string {
    const title = (category?.title || '').toLowerCase();
    const description = (category?.description || '').toLowerCase();
    const tags = Array.isArray(category?.tags) ? category.tags.join(' ').toLowerCase() : '';
    return `${title} ${description} ${tags}`;
  }
}
