import { Routes } from '@angular/router';
import { EventsListComponent } from './components/events/events-list/events-list.component';
import { EventDetailsComponent } from './components/events/event-details/event-details.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { LoginComponent } from './components/auth/login/login.component';
import { authGuard } from './guards/auth/auth.guard';
import { ProfileSetupComponent } from './components/user-profile/profile-setup/profile-setup.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { profileScoreGuard } from './guards/profile-score/profile-score.guard';
import { unsavedChangeGuard } from './guards/unsave-changes/unsave-change.guard';
import { CreateEventComponent } from './components/events/create-event/create-event.component';
import { EditProfileComponent } from './components/user-profile/edit-profile/edit-profile.component';
import { ExploreEventsComponent } from './components/events/explore-events/explore-events.component';
import { ViewAllEventsComponent } from './components/events/view-all-events/view-all-events.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ExploreEventsComponent,
    title: 'Viblooop — Discover, Experience & Connect Nearby',
    data: {
      description: 'Discover vibrant local events, meet genuine people, and experience real-life social gatherings near you with Viblooop.',
      robots: 'index, follow',
    },
  },
  {
    path: 'explore',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'events',
    component: EventsListComponent,
    title: 'Explore Local Events & Social Hangouts | Viblooop',
    data: {
      description: 'Browse upcoming parties, weekend escapes, sports meetups, and local hangouts near you on Viblooop.',
      robots: 'index, follow',
    },
  },
  {
    path: 'events/:eventId',
    component: EventDetailsComponent,
    title: 'Event Details | Viblooop',
    data: {
      robots: 'index, follow',
    },
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/user-profile/user-profile.component').then(c => c.UserProfileComponent),
    title: 'User Profile | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'profile/edit',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangeGuard],
    component: EditProfileComponent,
    title: 'Edit Profile | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'profile/update',
    canActivate: [authGuard],
    component: ProfileSetupComponent,
    title: 'Complete Profile | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    component: NotificationComponent,
    title: 'Notifications | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'chats',
    canActivate: [authGuard],
    loadComponent: () => import('./components/chat/inbox/inbox.component').then(c => c.InboxComponent),
    title: 'Chats | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'my-wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user-profile/wishlist/wishlist.component').then(c => c.WishlistComponent),
    title: 'My Wishlist | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'eventCategories/:categoryId',
    component: EventsListComponent,
    title: 'Category Events | Viblooop',
    data: {
      robots: 'index, follow',
    },
  },
  {
    path: 'events/view-all/:collection',
    component: ViewAllEventsComponent,
    title: 'View Events Collection | Viblooop',
    data: {
      robots: 'index, follow',
    },
  },
  {
    path: 'create-event',
    canActivate: [authGuard, profileScoreGuard],
    canDeactivate: [unsavedChangeGuard],
    component: CreateEventComponent,
    title: 'Host an Event | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Log In | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: LoginComponent,
    title: 'Admin Portal | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'terms',
    loadComponent: () => import('./components/legal/legal-policy/legal-policy.component').then(m => m.LegalPolicyComponent),
    title: 'Terms and Conditions | Viblooop',
    data: {
      tab: 'terms',
      description: 'Read the official Viblooop Terms and Conditions regarding event hosting, ticket sales, user conduct, and account policies.',
      robots: 'index, follow',
    },
  },
  {
    path: 'terms-and-conditions',
    redirectTo: 'terms',
    pathMatch: 'full',
  },
  {
    path: 'privacy',
    loadComponent: () => import('./components/legal/legal-policy/legal-policy.component').then(m => m.LegalPolicyComponent),
    title: 'Privacy Policy | Viblooop',
    data: {
      tab: 'privacy',
      description: 'Learn how Viblooop collects, protects, and manages your personal data and privacy.',
      robots: 'index, follow',
    },
  },
  {
    path: 'privacy-policy',
    redirectTo: 'privacy',
    pathMatch: 'full',
  },
  {
    path: 'safety-guidelines',
    loadComponent: () => import('./components/legal/legal-policy/legal-policy.component').then(m => m.LegalPolicyComponent),
    title: 'Safety Guidelines & Community Standards | Viblooop',
    data: {
      tab: 'safety',
      description: 'Our community rules, safety standards, and guidelines for attending and hosting events on Viblooop.',
      robots: 'index, follow',
    },
  },
  {
    path: 'safety',
    redirectTo: 'safety-guidelines',
    pathMatch: 'full',
  },
  {
    path: 'legal',
    redirectTo: 'terms',
    pathMatch: 'full',
  },
  {
    path: 'legal/:tab',
    loadComponent: () => import('./components/legal/legal-policy/legal-policy.component').then(m => m.LegalPolicyComponent),
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found | Viblooop',
    data: { robots: 'noindex, nofollow' },
  },
];
