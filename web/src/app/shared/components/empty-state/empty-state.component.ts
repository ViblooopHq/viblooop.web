import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

type EmptyStateKind = 'party' | 'escape' | 'sports' | 'hangouts' | 'shopping' | 'past' | 'events';
type EmptyStateFilter = 'all' | 'tonight' | 'weekend' | 'free' | 'nearby' | 'search';

interface EmptyStatePresentation {
  action: string;
  image?: string;
  imageAlt?: string;
  primaryIcon: string;
  secondaryIcon: string;
}

interface EmptyStateMessage {
  title: string;
  description: string;
}

const EMPTY_STATE_PRESENTATIONS: Record<EmptyStateKind, EmptyStatePresentation> = {
  party: {
    action: 'Create Party',
    image: 'assets/images/empty-states/party.png',
    imageAlt: 'Disco ball, music, and party drinks',
    primaryIcon: 'nightlife',
    secondaryIcon: 'auto_awesome',
  },
  escape: {
    action: 'Plan Escape',
    image: 'assets/images/empty-states/escape.png',
    imageAlt: 'Travel backpack in front of mountains and a trail',
    primaryIcon: 'travel_explore',
    secondaryIcon: 'flight',
  },
  sports: {
    action: 'Start Game',
    image: 'assets/images/empty-states/sports.png',
    imageAlt: 'Equipment for football, cricket, badminton, and running',
    primaryIcon: 'sports_basketball',
    secondaryIcon: 'sports_soccer',
  },
  hangouts: {
    action: 'Create Hangout',
    image: 'assets/images/empty-states/hangouts.png',
    imageAlt: 'Two chairs and drinks at a cafe table',
    primaryIcon: 'local_cafe',
    secondaryIcon: 'local_drink',
  },
  shopping: {
    action: 'Create Plan',
    image: 'assets/images/empty-states/shopping.png',
    imageAlt: 'Shopping bags and a sale tag',
    primaryIcon: 'shopping_bag',
    secondaryIcon: 'favorite',
  },
  past: {
    action: 'Create New Plan',
    primaryIcon: 'photo_library',
    secondaryIcon: 'history',
  },
  events: {
    action: 'Create Event Plan',
    primaryIcon: 'celebration',
    secondaryIcon: 'auto_awesome',
  },
};

const EMPTY_STATE_MESSAGES: Record<EmptyStateKind, Record<EmptyStateFilter, EmptyStateMessage>> = {
  party: {
    all: { title: 'No parties yet', description: 'Plan a night out and give everyone a reason to celebrate.' },
    tonight: { title: 'No parties happening tonight', description: 'Start the party and give your city somewhere to celebrate tonight.' },
    weekend: { title: 'No parties planned this weekend', description: 'Create the weekend party everyone has been waiting for.' },
    free: { title: 'No free parties right now', description: 'Host a free party and make it easy for everyone to join the fun.' },
    nearby: { title: 'No parties near you', description: 'Bring the nightlife closer by creating the first party in your area.' },
    search: { title: 'No parties match your search', description: 'Try another search, or start the party you already have in mind.' },
  },
  escape: {
    all: { title: 'No escape plans yet', description: 'Start a trip that other explorers can discover and join.' },
    tonight: { title: 'No escapes starting tonight', description: 'Turn a spontaneous idea into an adventure people can join tonight.' },
    weekend: { title: 'No weekend escapes yet', description: 'Plan a quick getaway and make this weekend worth remembering.' },
    free: { title: 'No free escapes right now', description: 'Create a budget-friendly adventure with no joining fee.' },
    nearby: { title: 'No escapes near you', description: 'Plan a nearby trail, drive, or day trip for local explorers.' },
    search: { title: 'No escapes match your search', description: 'Try another destination, or create the escape you want to take.' },
  },
  sports: {
    all: { title: 'No games lined up yet', description: 'Pick a sport, find players, and get the action started.' },
    tonight: { title: 'No games happening tonight', description: 'Start a game tonight and invite nearby players to join your team.' },
    weekend: { title: 'No weekend games yet', description: 'Set up a match and turn this weekend into game time.' },
    free: { title: 'No free games right now', description: 'Create a free-to-join game so everyone can get moving.' },
    nearby: { title: 'No games near you', description: 'Be the first to organize a match in your neighborhood.' },
    search: { title: 'No games match your search', description: 'Try another sport, or create the game you want to play.' },
  },
  hangouts: {
    all: { title: 'No hangouts yet', description: 'Create a relaxed meetup for coffee, conversations, and your people.' },
    tonight: { title: 'No hangouts happening tonight', description: 'Create a casual plan for tonight and see who is free to join.' },
    weekend: { title: 'No weekend hangouts yet', description: 'Plan a coffee, brunch, or catch-up for the weekend.' },
    free: { title: 'No free hangouts right now', description: 'Create an easy, free-to-join meetup for your community.' },
    nearby: { title: 'No hangouts near you', description: 'Choose a local spot and bring nearby people together.' },
    search: { title: 'No hangouts match your search', description: 'Try another search, or create the meetup you are looking for.' },
  },
  shopping: {
    all: { title: 'No shopping plans yet', description: 'Start a group shopping outing and discover new finds together.' },
    tonight: { title: 'No shopping plans tonight', description: 'Plan an evening shopping run and invite a buddy to join.' },
    weekend: { title: 'No weekend shopping plans yet', description: 'Create a weekend shopping trip for markets, malls, or local stores.' },
    free: { title: 'No free-to-join shopping plans', description: 'Start a shopping meetup with no joining fee.' },
    nearby: { title: 'No shopping plans near you', description: 'Pick a nearby market or mall and invite local shopping buddies.' },
    search: { title: 'No shopping plans match your search', description: 'Try another place, or create the shopping plan you want.' },
  },
  past: {
    all: { title: 'No past vibes yet', description: 'Memories from completed plans will appear here.' },
    tonight: { title: 'No past vibes yet', description: 'Memories from completed plans will appear here.' },
    weekend: { title: 'No past vibes yet', description: 'Memories from completed plans will appear here.' },
    free: { title: 'No past vibes yet', description: 'Memories from completed plans will appear here.' },
    nearby: { title: 'No past vibes yet', description: 'Memories from completed plans will appear here.' },
    search: { title: 'No past vibes match your search', description: 'Try a different search to find an earlier vibe.' },
  },
  events: {
    all: { title: 'No events yet', description: 'Be the first to create a vibe that people can join.' },
    tonight: { title: 'No events happening tonight', description: 'Create a plan for tonight and invite people to join.' },
    weekend: { title: 'No events planned this weekend', description: 'Start a weekend vibe and give everyone something to look forward to.' },
    free: { title: 'No free events right now', description: 'Create a free-to-join vibe and make it open to everyone.' },
    nearby: { title: 'No events near you', description: 'Be the first to create a vibe nearby that people can join.' },
    search: { title: 'No events match your search', description: 'Try different words or create the vibe you were searching for.' },
  },
};

@Component({
  selector: 'vl-empty-state',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  private authService = inject(AuthService);

  @Input() subject = 'events';
  @Input() context = 'all';
  @Input() contextPrefix = 'for';
  @Input() description = '';
  @Input() createRoute = '/create-event';
  @Input() image = '';
  @Input() imageAlt = '';

  @Output() exploreAll = new EventEmitter<void>();

  get presentation(): EmptyStatePresentation {
    return EMPTY_STATE_PRESENTATIONS[this.kind];
  }

  get artImage(): string {
    return this.image.trim() || this.presentation.image || '';
  }

  get artImageAlt(): string {
    return this.imageAlt.trim() || this.presentation.imageAlt || '';
  }

  get message(): EmptyStateMessage {
    return EMPTY_STATE_MESSAGES[this.kind][this.filter];
  }

  get emptyTitle(): string {
    return this.message.title;
  }

  get emptyDescription(): string {
    return this.description.trim() || this.message.description;
  }

  private get kind(): EmptyStateKind {
    const subject = this.subject.trim().toLowerCase();

    if (subject.includes('party') || subject.includes('social')) return 'party';
    if (subject.includes('escape') || subject.includes('travel') || subject.includes('trip')) return 'escape';
    if (subject.includes('sport') || subject.includes('play') || subject.includes('game') || subject.includes('fitness')) return 'sports';
    if (subject.includes('hangout') || subject.includes('quickie') || subject.includes('local event')) return 'hangouts';
    if (subject.includes('shop')) return 'shopping';
    if (subject.includes('past') || subject.includes('memories')) return 'past';
    return 'events';
  }

  private get filter(): EmptyStateFilter {
    const context = this.context.trim().toLowerCase().replace(/_/g, ' ');

    if (context.includes('search')) return 'search';
    if (context.includes('tonight')) return 'tonight';
    if (context.includes('weekend')) return 'weekend';
    if (context === 'free' || context.includes('for free')) return 'free';
    if (context === 'nearby' || context.includes('near you')) return 'nearby';
    return 'all';
  }

  get createLink(): string {
    return this.authService.isLoggedIn() ? this.createRoute : '/login';
  }
}
