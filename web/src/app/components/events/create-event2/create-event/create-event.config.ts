export type CreationKind = 'event' | 'play' | 'escape';

export interface CategoryDisplayConfig {
  matches: string[];
  title: string;
  description: string;
  materialIcon: string;
  accent: 'purple' | 'green' | 'blue' | 'orange' | 'pink';
  kind?: CreationKind;
  soon?: boolean;
}

export interface HostNoteQuickAdd {
  emoji: string;
  label: string;
  note: string;
}

export interface CreationTypeConfig {
  headerTitle: string;
  titleFieldLabel: string;
  titleFieldPlaceholder: string;
  defaultCoverImage: string;
  stepTwoDescription: string;
  stepThreeDescription: string;
  chatAccessSubtitle: string;
  everyoneChatMobileDescription: string;
  hostOnlyChatMobileDescription: string;
  hostNotesTitle: string;
  hostNotesSubtitle: string;
  hostNotesPlaceholder: string;
  hostNoteQuickAdds: HostNoteQuickAdd[];
  animationPath: string;
  usesDateRange: boolean;
}

export const CREATE_EVENT_STEPS = ['Vibe', 'Essentials', 'Scene', 'Review'];

export const CREATE_EVENT_EXPECTATIONS = ['Live DJ', 'Drinks', 'Games', 'Networking', 'Food', 'Music'];

export const CREATE_EVENT_HOST_NOTES_MAX_LENGTH = 500;

export const CREATE_EVENT_CAPACITY_CONFIG = {
  quickOptions: [10, 20, 50, 100],
  min: 2,
  max: 250,
  openLimit: 999999,
  defaultLimitedValue: 2,
};

export const CREATE_EVENT_TIME_PICKER_CONFIG = {
  hours: Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
  minutes: Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
  periods: ['AM', 'PM'],
};

const EVENT_HOST_NOTE_QUICK_ADDS: HostNoteQuickAdd[] = [
  {
    emoji: '🎵',
    label: 'Music & vibes',
    note: 'Good music, fun energy and chill vibes throughout the event 🎶'
  },
  {
    emoji: '🍕',
    label: 'Snacks included',
    note: 'Light snacks and munchies will be available during the gathering 🍕'
  },
  {
    emoji: '🌃',
    label: 'Rooftop setup',
    note: 'Open rooftop setup with a cozy evening atmosphere and city views 🌃'
  },
  {
    emoji: '📸',
    label: 'Photos planned',
    note: 'We’ll be capturing fun moments and group photos during the event 📸'
  },
  {
    emoji: '✨',
    label: 'Cozy gathering',
    note: 'Keeping the gathering small, comfortable and easy to vibe with ✨'
  },
  {
    emoji: '🤝',
    label: 'Meet new people',
    note: 'A friendly space to connect, socialize and meet new people 🤝'
  },
  {
    emoji: '⏰',
    label: 'Please be on time',
    note: 'Try to arrive on time so everyone can enjoy the full experience together ⏰'
  },
  {
    emoji: '📍',
    label: 'Exact location shared after joining',
    note: 'Exact venue details will be shared once your request is accepted 📍'
  },
];

const PLAY_HOST_NOTE_QUICK_ADDS: HostNoteQuickAdd[] = [
  {
    emoji: '🎮',
    label: 'Casual matches',
    note: 'Relaxed games focused on fun, interaction and good vibes.'
  },
  {
    emoji: '🏏',
    label: 'Beginner friendly',
    note: 'Open to players of all skill levels — no pressure, just enjoy.'
  },
  {
    emoji: '⚽',
    label: 'Teams will be shuffled',
    note: 'Teams will be decided before the game starts for a balanced session.'
  },
  {
    emoji: '🔥',
    label: 'Friendly competition',
    note: 'Fun and competitive energy while keeping the vibe respectful.'
  },
  {
    emoji: '🤝',
    label: 'Meet new players',
    note: 'A great way to connect and play with new people.'
  },
  {
    emoji: '⏰',
    label: 'Please be on time',
    note: 'Try to arrive a little early so everyone can start together.'
  },
];

const ESCAPE_HOST_NOTE_QUICK_ADDS: HostNoteQuickAdd[] = [
  {
    emoji: '🚗',
    label: 'Road trip vibes',
    note: 'Music, conversations and fun stops along the journey together.'
  },
  {
    emoji: '☕',
    label: 'Breakfast stops',
    note: 'Planning for coffee or breakfast breaks during the trip.'
  },
  {
    emoji: '📸',
    label: 'Photos planned',
    note: 'We’ll capture memories, scenic views and group moments together.'
  },
  {
    emoji: '🥾',
    label: 'Trek friendly',
    note: 'Comfortable for people who enjoy light adventure and exploring.'
  },
  {
    emoji: '🤝',
    label: 'Meet new travel buddies',
    note: 'A relaxed space to connect and travel with like-minded people.'
  },
  {
    emoji: '✨',
    label: 'Flexible travel plan',
    note: 'The itinerary is flexible and can adjust based on the group vibe.'
  },
];

export const CREATE_EVENT_TYPE_CONFIGS: Record<CreationKind, CreationTypeConfig> = {
  event: {
    headerTitle: 'Create Event',
    titleFieldLabel: 'Event Title',
    titleFieldPlaceholder: 'e.g. Rooftop Party at Sky Lounge',
    defaultCoverImage: 'assets/images/landing-page-bg.jpg',
    stepTwoDescription: 'Add the basics so people know about your event.',
    stepThreeDescription: 'Visuals and vibes make your event stand out.',
    chatAccessSubtitle: 'Manage chat access for this event.',
    everyoneChatMobileDescription: 'Joined attendees can chat and connect together.',
    hostOnlyChatMobileDescription: 'Attendees can only view host updates.',
    hostNotesTitle: 'Host Notes',
    hostNotesSubtitle: 'Share the key details guests should know ✨',
    hostNotesPlaceholder: 'E.g. Parking available. Casual dress code.\nExact location shared after joining.',
    hostNoteQuickAdds: EVENT_HOST_NOTE_QUICK_ADDS,
    animationPath: 'assets/json/event-created.json',
    usesDateRange: false,
  },
  play: {
    headerTitle: 'Create Play',
    titleFieldLabel: 'Session Title',
    titleFieldPlaceholder: 'Late Night FIFA Session',
    defaultCoverImage: 'assets/images/play-page-bg.png',
    stepTwoDescription: 'Add the key details so players know what to expect.',
    stepThreeDescription: 'Show players what the session feels like.',
    chatAccessSubtitle: 'Manage chat access for this session.',
    everyoneChatMobileDescription: 'Joined players can coordinate and chat together.',
    hostOnlyChatMobileDescription: 'Only the organizer can share game updates.',
    hostNotesTitle: 'Session Details',
    hostNotesSubtitle: 'Help players understand the format and vibe of the session.',
    hostNotesPlaceholder: 'Eg. Please arrive on time so everyone can start together.',
    hostNoteQuickAdds: PLAY_HOST_NOTE_QUICK_ADDS,
    animationPath: 'assets/json/gaming.json',
    usesDateRange: false,
  },
  escape: {
    headerTitle: 'Create Escape',
    titleFieldLabel: 'Trip Title',
    titleFieldPlaceholder: 'Pondicherry Road Trip',
    defaultCoverImage: 'assets/images/escape-page-bg.png',
    stepTwoDescription: 'Share the essentials so people know the journey ahead.',
    stepThreeDescription: 'Bring your trip vibe to life with great visuals.',
    chatAccessSubtitle: 'Manage chat access for this trip.',
    everyoneChatMobileDescription: 'Travel buddies can connect and plan in the trip chat.',
    hostOnlyChatMobileDescription: 'Only the trip organizer can share travel updates.',
    hostNotesTitle: 'Trip Details',
    hostNotesSubtitle: 'Share the journey plan and important travel details.',
    hostNotesPlaceholder: `Eg. A chill getaway with good company, local exploration and fun travel vibes ✨

Day 1: Travel and explore nearby places.
Day 2: Main activities and return journey 🌄`,
    hostNoteQuickAdds: ESCAPE_HOST_NOTE_QUICK_ADDS,
    animationPath: 'assets/json/Travel.json',
    usesDateRange: true,
  },
};

export const CREATE_EVENT_CATEGORY_DISPLAY_CONFIGS: CategoryDisplayConfig[] = [
  {
    matches: ['party', 'house party'],
    title: 'Events',
    description: 'Parties, meetups, rooftop & more',
    materialIcon: 'celebration',
    accent: 'purple',
    kind: 'event'
  },
  {
    matches: ['travel', 'trip', 'escape'],
    title: 'Escapes',
    description: 'Trips, treks, road trips & getaways',
    materialIcon: 'travel_explore',
    accent: 'green',
    kind: 'escape'
  },
  {
    matches: ['sports', 'play', 'game'],
    title: 'Play',
    description: 'Games, sports, fitness & more',
    materialIcon: 'sports_soccer',
    accent: 'blue',
    kind: 'play'
  },
  {
    matches: ['shopping', 'buddy', 'buddies'],
    title: 'Shopping Buddy',
    description: 'Shop together, explore & more',
    materialIcon: 'shopping_bag',
    accent: 'pink',
    soon: true
  },
  {
    matches: ['local events', 'events', 'quick'],
    title: 'Quickies',
    description: 'Coffee, chai, quick hangouts & more',
    materialIcon: 'local_cafe',
    accent: 'orange',
    soon: true
  }
];

export const CREATE_EVENT_CATEGORY_ICON_MAP: Record<string, string> = {
  party: 'celebration',
  travel: 'flight',
  sports: 'sports_soccer',
  events: 'event',
  shopping: 'shopping_bag',
  chill: 'local_cafe',
  hangout: 'groups',
  gaming: 'sports_esports',
  'play zone': 'sports_esports',
  food: 'restaurant',
  music: 'music_note',
  art: 'palette',
  fitness: 'fitness_center',
  nightlife: 'nightlife',
  outdoors: 'hiking',
  wellness: 'spa',
};
