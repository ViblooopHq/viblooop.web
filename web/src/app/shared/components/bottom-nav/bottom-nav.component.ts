import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { SharedService } from '../../services/shared.service';
import { RouteService } from '../../services/route/route.service';
import { CommonModule } from '@angular/common';

export interface BottomNavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'vl-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  private readonly authService = inject(AuthService);
  readonly sharedService = inject(SharedService);
  private readonly router = inject(Router);
  private readonly routeService = inject(RouteService);

  readonly defaultProfileImage = 'assets/images/default-profile.png';

  // Fully reactive signals for user auth state
  readonly currentUser = toSignal(this.authService.userDetails$, { initialValue: this.authService.userDetails });
  readonly isLoggedIn = computed(() => {
    const user = this.currentUser();
    return !!(user?.id || user?._id || user?.username || user?.email);
  });

  readonly profileImage = computed(() => {
    const user = this.currentUser();
    return user?.profileImage || user?.avatar || this.defaultProfileImage;
  });

  readonly mobileMenu: BottomNavItem[] = [
    { path: '/', label: 'Explore', icon: 'explore' },
    { path: '/my-wishlist', label: 'Wishlist', icon: 'favorite' },
    { path: '/chats', label: 'Chats', icon: 'chat' },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ];

  readonly guestMobileMenu: BottomNavItem[] = [
    { path: '/', label: 'Explore', icon: 'explore' },
    { path: '/my-wishlist', label: 'Wishlist', icon: 'favorite' },
    { path: '/login', label: 'Sign In', icon: 'login' },
  ];

  // Reactive URL signal tracking all client-side route navigations
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects || event.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  // Reactive computed signals: hide bottom nav on create event routes
  isCreateRoute = computed(() => {
    const url = this.currentUrl() || '';
    return url.includes('/create-event');
  });

  handleItemClick(item: BottomNavItem): void {
    if (item.path === '/chats') {
      this.sharedService.requestChatConversations();
    }
  }

  navigateToCreate(): void {
    this.routeService.navigateToDrawer('create-event', '/create-event');
  }

  navigateToWishlist(): void {
    if (!this.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.routeService.navigateToDrawer('my-wishlist', '/my-wishlist');
  }

  getActiveFill(rla: RouterLinkActive): string {
    return rla.isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400";
  }
}
