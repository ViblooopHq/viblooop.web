export type SocialPlatformKey = 'instagram' | 'twitter' | 'linkedin' | 'youtube';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SocialPlatformConfig {
  key: SocialPlatformKey;
  label: string;
  baseUrl: string;
  prefix: string;
  placeholder: string;
  hint: string;
  usernamePattern: RegExp;
}

export const SUPPORTED_SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    baseUrl: 'https://instagram.com/',
    prefix: 'instagram.com/',
    placeholder: 'username',
    hint: 'e.g. username or profile link',
    usernamePattern: /^[a-zA-Z0-9._]{1,30}$/,
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    baseUrl: 'https://x.com/',
    prefix: 'x.com/',
    placeholder: 'username',
    hint: 'e.g. username or profile link',
    usernamePattern: /^[a-zA-Z0-9_]{1,15}$/,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    baseUrl: 'https://linkedin.com/in/',
    prefix: 'linkedin.com/in/',
    placeholder: 'username or profile URL',
    hint: 'e.g. username or profile link',
    usernamePattern: /^[a-zA-Z0-9-]{3,100}$/,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    baseUrl: 'https://youtube.com/',
    prefix: 'youtube.com/',
    placeholder: '@channel or channel name',
    hint: 'e.g. @channel or channel URL',
    usernamePattern: /^@?[a-zA-Z0-9._-]{2,100}$/,
  },
];

export function getPlatformKey(platform: string): SocialPlatformKey | 'generic' {
  const key = (platform || '').toLowerCase().trim();
  if (key.includes('insta')) return 'instagram';
  if (key.includes('twit') || key === 'x') return 'twitter';
  if (key.includes('linked')) return 'linkedin';
  if (key.includes('you') || key.includes('yt')) return 'youtube';
  return 'generic';
}

export function getPlatformLabel(platform: string): string {
  const key = getPlatformKey(platform);
  switch (key) {
    case 'instagram':
      return 'Instagram';
    case 'twitter':
      return 'X (Twitter)';
    case 'linkedin':
      return 'LinkedIn';
    case 'youtube':
      return 'YouTube';
    default:
      return 'Website';
  }
}

export function normalizeSocialUrl(rawValue: string, platformKey: string): string {
  const value = (rawValue || '').trim();
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    return /^https?:\/\/\S+\.\S+$/i.test(value) ? value : '';
  }

  if (value.includes('.') && value.includes('/')) {
    const url = `https://${value.replace(/^\/+/, '')}`;
    return /^https?:\/\/\S+\.\S+$/i.test(url) ? url : '';
  }

  const platform = SUPPORTED_SOCIAL_PLATFORMS.find((p) => p.key === platformKey);
  if (!platform) return '';

  const cleanUsername = value.replace(/^@/, '').replace(/^\/+|\/+$/g, '');
  const username = platform.key === 'youtube' && value.startsWith('@') ? `@${cleanUsername}` : cleanUsername;

  if (!platform.usernamePattern.test(username)) {
    return '';
  }

  return `${platform.baseUrl}${username}`;
}

export function getDisplayHandle(link: SocialLink): string {
  const url = (link?.url || '').trim();
  const key = getPlatformKey(link?.platform);
  if (!url) return getPlatformLabel(link?.platform);

  try {
    const cleaned = url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
    const parts = cleaned.split('/');

    if (key === 'instagram' && parts.length > 1) {
      return `@${parts[1].replace('@', '')}`;
    }
    if (key === 'twitter' && parts.length > 1) {
      return `@${parts[1].replace('@', '')}`;
    }
    if (key === 'youtube' && parts.length > 1) {
      return parts[1].startsWith('@') ? parts[1] : `@${parts[1]}`;
    }
    if (key === 'linkedin' && parts.length > 2 && parts[1] === 'in') {
      return `in/${parts[2]}`;
    }
    return parts[parts.length - 1] || getPlatformLabel(link.platform);
  } catch {
    return getPlatformLabel(link?.platform);
  }
}
