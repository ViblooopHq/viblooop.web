import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { EventsListComponent } from './components/events/events-list/events-list.component';
import { EventDetailsComponent } from './components/events/event-details/event-details.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { LoginComponent } from './components/auth/login/login.component';
import { authGuard } from './guards/auth/auth.guard';
import { MyEventsComponent } from './components/user/my-events/my-events.component';
import { ProfileSetupComponent } from './components/user-profile/profile-setup/profile-setup.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { profileScoreGuard } from './guards/profile-score/profile-score.guard';
import { unsavedChangeGuard } from './guards/unsave-changes/unsave-change.guard';
import { CreateEventComponent } from './components/events/create-event2/create-event/create-event.component';
import { EditProfile2Component } from './components/user-profile/edit-profile2/edit-profile2.component';
import { ExploreEventsComponent } from './components/events/explore-events/explore-events.component';
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'events/:eventId',
    component: EventDetailsComponent,
  },
  // {
  //   path: 'profile',
  //   canActivate: [authGuard, profileScoreGuard],
  //   component: UserProfileComponent,

  // },
  { path: 'profile', loadComponent: () => import('./components/user-profile/user-profile.component').then(c => c.UserProfileComponent) },
  {
    path: 'profile/edit',
    redirectTo: 'profile/edit2',
    pathMatch: 'full',
  },
  {
    path: 'profile/edit2',
    canDeactivate: [unsavedChangeGuard],
    component: EditProfile2Component,

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
    path: 'my-events',
    component: MyEventsComponent
  },
  {
    path: 'chats',
    canActivate: [authGuard],
    loadComponent: () => import('./components/chat/inbox/inbox.component').then(c => c.InboxComponent)
  },
  {
    path: 'my-wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user/wishlist/wishlist.component').then(c => c.WishlistComponent)
  },
  {
    path: 'eventCategories/:categoryId',
    component: EventsListComponent,
  },
  {
    path: 'explore',
    component: ExploreEventsComponent
  },
  {
    path: 'create-event',
    canActivate: [authGuard, profileScoreGuard],
    canDeactivate: [unsavedChangeGuard],
    component: CreateEventComponent,
  },
  {
    path: 'edit-profile',
    outlet: 'drawer',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangeGuard],
    component: EditProfile2Component,
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
    path: '**',
    component: NotFoundComponent,
  },
];
