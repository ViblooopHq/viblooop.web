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
    if (!category) return undefined;
    if (category._displayConfig) {
      return category._displayConfig;
    }

    const searchable = this.getSearchableText(category);
    if (!searchable) return undefined;

    return CREATE_EVENT_CATEGORY_DISPLAY_CONFIGS.find(config =>
      config.matches.some(match => {
        const lowerMatch = match.toLowerCase();
        // Check for whole word match or phrase match
        if (searchable === lowerMatch) return true;
        const wordRegex = new RegExp(`(^|\\b|\\s)${lowerMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|\\s|$)`, 'i');
        return wordRegex.test(searchable) || searchable.includes(lowerMatch);
      })
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
    if (!category) return category;
    const config = this.getDisplayConfig(category);
    const expectationTags = config?.tags ?? [];
    return {
      ...category,
      rawTags: category.rawTags || (Array.isArray(category.tags) ? [...category.tags] : []),
      tags: expectationTags.length ? expectationTags : category.tags,
      _displayConfig: config,
    };
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
    const title = (category?.title || '').toLowerCase().trim();
    const description = (category?.description || '').toLowerCase().trim();
    const rawTags = category?.rawTags || (category?._displayConfig ? [] : category?.tags);
    const tags = Array.isArray(rawTags) ? rawTags.join(' ').toLowerCase().trim() : '';
    return `${title} ${description} ${tags}`.trim();
  }
}
