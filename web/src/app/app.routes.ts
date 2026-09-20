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
  },
  {
    path: 'explore',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'events/:eventId',
    component: EventDetailsComponent,
  },
  { path: 'profile', loadComponent: () => import('./components/user-profile/user-profile.component').then(c => c.UserProfileComponent) },
  {
    path: 'profile/edit',
    canDeactivate: [unsavedChangeGuard],
    component: EditProfileComponent,
  },
  {
    path: 'profile/update',
    component: ProfileSetupComponent,

  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    component: NotificationComponent
  },
  {
    path: 'chats',
    canActivate: [authGuard],
    loadComponent: () => import('./components/chat/inbox/inbox.component').then(c => c.InboxComponent)
  },
  {
    path: 'my-wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user-profile/wishlist/wishlist.component').then(c => c.WishlistComponent)
  },
  {
    path: 'eventCategories/:categoryId',
    component: EventsListComponent,
  },
  {
    path: 'events/view-all/:collection',
    component: ViewAllEventsComponent
  },
  {
    path: 'create-event',
    canActivate: [authGuard, profileScoreGuard],
    canDeactivate: [unsavedChangeGuard],
    component: CreateEventComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: LoginComponent,
  },
  {
    path: 'terms',
    loadComponent: () => import('./components/legal/legal-policy/legal-policy.component').then(m => m.LegalPolicyComponent),
    data: { tab: 'terms' }
  },
  {
    path: 'terms-and-conditions',
    redirectTo: 'terms',
    pathMatch: 'full'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./components/legal/legal-policy/legal-policy.component').then(m => m.LegalPolicyComponent),
    data: { tab: 'privacy' }
  },
  {
    path: 'privacy-policy',
    redirectTo: 'privacy',
    pathMatch: 'full'
  },
  {
    path: 'safety-guidelines',
    loadComponent: () => import('./components/legal/legal-policy/legal-policy.component').then(m => m.LegalPolicyComponent),
    data: { tab: 'safety' }
  },
  {
    path: 'safety',
    redirectTo: 'safety-guidelines',
    pathMatch: 'full'
  },
  {
    path: 'legal',
    redirectTo: 'terms',
    pathMatch: 'full'
  },
  {
    path: 'legal/:tab',
    loadComponent: () => import('./components/legal/legal-policy/legal-policy.component').then(m => m.LegalPolicyComponent)
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
