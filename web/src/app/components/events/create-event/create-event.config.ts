export type CreationKind = 'event' | 'play' | 'escape' | 'hangout';

export interface CategoryDisplayConfig {
  matches: string[];
  title: string;
  description: string;
  materialIcon: string;
  accent: 'purple' | 'green' | 'blue' | 'orange' | 'pink';
  tags: string[];
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
  titleFieldHint: string;
  titleFieldPlaceholder: string;
  timingTitle: string;
  timingHint: string;
  locationHint: string;
  addressFieldLabel: string;
  addressFieldHint: string;
  addressFieldPlaceholder: string;
  areaFieldHint: string;
  areaFieldPlaceholder: string;
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
  requiresEndTime: boolean;
}

export const CREATE_EVENT_STEPS = ['Vibe', 'Essentials', 'Scene', 'Review'];

export const CREATE_EVENT_EXPECTATIONS = ['Music', 'Food', 'Drinks', 'Networking', 'Games', 'Photography'];

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
    headerTitle: 'Create Party',
    titleFieldLabel: 'Party Title',
    titleFieldHint: 'Give your party a catchy name',
    titleFieldPlaceholder: 'e.g. Rooftop Party at Sky Lounge',
    timingTitle: 'Date & Time',
    timingHint: 'When is your party happening?',
    locationHint: 'Where is your party taking place?',
    addressFieldLabel: 'Venue / Address',
    addressFieldHint: 'Venue name, building, or street',
    addressFieldPlaceholder: 'e.g. Sky Lounge, 12th Main Road',
    areaFieldHint: 'Neighbourhood or locality',
    areaFieldPlaceholder: 'e.g. Indiranagar',
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
    requiresEndTime: false,
  },
  play: {
    headerTitle: 'Create Play',
    titleFieldLabel: 'Game Title',
    titleFieldHint: 'Give your game or session a clear name',
    titleFieldPlaceholder: 'e.g. Sunday Badminton Doubles',
    timingTitle: 'Date & Time',
    timingHint: 'When does the game start?',
    locationHint: 'Where are you playing?',
    addressFieldLabel: 'Venue / Court',
    addressFieldHint: 'Court, turf, arena, or ground',
    addressFieldPlaceholder: 'e.g. Smash Arena, 7th Main Road',
    areaFieldHint: 'Neighbourhood or locality',
    areaFieldPlaceholder: 'e.g. HSR Layout',
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
    requiresEndTime: false,
  },
  escape: {
    headerTitle: 'Create Escape',
    titleFieldLabel: 'Trip Title',
    titleFieldHint: 'Give your trip a memorable name',
    titleFieldPlaceholder: 'e.g. Weekend Trek to Nandi Hills',
    timingTitle: 'Trip Dates',
    timingHint: 'When is your trip happening?',
    locationHint: 'Where does the trip begin?',
    addressFieldLabel: 'Meeting / Starting Point',
    addressFieldHint: 'Landmark, pickup point, or trailhead',
    addressFieldPlaceholder: 'e.g. Metro Station Gate 2, MG Road',
    areaFieldHint: 'Starting area or locality',
    areaFieldPlaceholder: 'e.g. Central Bengaluru',
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
    requiresEndTime: false,
  },
  hangout: {
    headerTitle: 'Create Hangout',
    titleFieldLabel: 'Hangout Title',
    titleFieldHint: 'Give your hangout a friendly name',
    titleFieldPlaceholder: 'e.g. Coffee and Conversations',
    timingTitle: 'Date & Time',
    timingHint: 'When does your hangout start and end?',
    locationHint: 'Where are you meeting?',
    addressFieldLabel: 'Meeting Spot',
    addressFieldHint: 'Cafe, park, landmark, or venue',
    addressFieldPlaceholder: 'e.g. Third Wave Coffee, 12th Main Road',
    areaFieldHint: 'Neighbourhood or locality',
    areaFieldPlaceholder: 'e.g. Indiranagar',
    defaultCoverImage: 'assets/images/landing-page-bg.jpg',
    stepTwoDescription: 'Add the details so people know when and where to meet.',
    stepThreeDescription: 'Show people the vibe of your hangout.',
    chatAccessSubtitle: 'Manage chat access for this hangout.',
    everyoneChatMobileDescription: 'Joined guests can coordinate and chat together.',
    hostOnlyChatMobileDescription: 'Only the host can share hangout updates.',
    hostNotesTitle: 'Hangout Details',
    hostNotesSubtitle: 'Share anything your guests should know before joining.',
    hostNotesPlaceholder: 'E.g. Meet near the entrance. Casual, friendly hangout.',
    hostNoteQuickAdds: EVENT_HOST_NOTE_QUICK_ADDS,
    animationPath: 'assets/json/event-created.json',
    usesDateRange: false,
    requiresEndTime: true,
  },
};

export const CREATE_EVENT_CATEGORY_DISPLAY_CONFIGS: CategoryDisplayConfig[] = [
  {
    matches: ['party', 'house party', 'social', 'meetup'],
    title: 'Social',
    description: 'Parties, meetups, rooftop & more',
    materialIcon: 'celebration',
    accent: 'purple',
    tags: ['Music', 'Live DJ', 'Drinks', 'Food', 'Dance Floor', 'Networking'],
    kind: 'event'
  },
  {
    matches: ['travel companion', 'travel', 'trip', 'escape', 'escapes', 'trek', 'getaway'],
    title: 'Escapes',
    description: 'Trips, treks, road trips & getaways',
    materialIcon: 'travel_explore',
    accent: 'green',
    tags: ['Scenic Stops', 'Road Trip', 'Trekking', 'Photography', 'Local Food', 'Campfire'],
    kind: 'escape'
  },
  {
    matches: ['sports activities', 'sports', 'play', 'gaming', 'fitness'],
    title: 'Play',
    description: 'Games, sports, fitness & more',
    materialIcon: 'sports_soccer',
    accent: 'blue',
    tags: ['Friendly Matches', 'Team Games', 'Fitness', 'Coaching', 'Equipment', 'Refreshments'],
    kind: 'play'
  },
  {
    matches: ['hangout', 'hangouts', 'local events', 'events', 'quick', 'quickies', 'local'],
    title: 'Hangouts',
    description: 'Coffee, chai, quick hangouts & more',
    materialIcon: 'local_cafe',
    accent: 'orange',
    tags: ['Coffee', 'Chai', 'Conversation', 'Board Games', 'Walk & Talk', 'Work Friendly'],
    kind: 'hangout'
  }
];

export const CREATE_EVENT_CATEGORY_ICON_MAP: Record<string, string> = {
  party: 'celebration',
  travel: 'flight',
  sports: 'sports_soccer',
  events: 'event',
  hangouts: 'groups',
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
