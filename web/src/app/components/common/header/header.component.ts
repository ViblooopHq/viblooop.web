import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { MatTooltip } from '@angular/material/tooltip';

import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { RouteService } from '../../../shared/services/route/route.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SharedService } from '../../../shared/services/shared.service';
import { OutsideClickDirective } from '../../../directives/outside-click.directive';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { AsyncPipe } from '@angular/common';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';

export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'vl-header',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatSlideToggleModule, MatTooltip, OutsideClickDirective, AsyncPipe, NotificationComponent, BottomNavComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public socketService = inject(SocketService);
  sharedService = inject(SharedService);
  private toastService = inject(ToastService)
  private angularRouter = inject(Router)
  defaultProfileImage = 'assets/images/default-profile.png';

  // Computed: hide FAB when user is in create-event flow
  isCreateRoute = () => this.angularRouter.url.includes('/create-event');
  isEditProfileRoute = () => this.angularRouter.url.includes('/profile/edit');
  shouldShowNotification = () => !!this.userDetails;

  // Native Signal consumption for perfect change detection
  isLightTheme = this.themeService.isLightTheme;

  router = inject(RouteService)
  isUserProfileVisible = false;
  userName = ''

  mobileMenu = [
    { path: '/', label: 'Explore', icon: 'explore' },
    { path: '/events', label: 'Events', icon: 'event' },
    { path: '/my-events', label: 'My Vibes', icon: 'celebration' },
    { path: '/chats', label: 'Chats', icon: 'chat' },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ];

  guestMobileMenu = [
    { path: '/', label: 'Explore', icon: 'explore' },
    { path: '/events', label: 'Events', icon: 'event' },
    { path: '/login', label: 'Sign In', icon: 'login' },
  ];

  desktopMenu: any[] = [];

  isActiveLink: boolean = false
  userDetails: any = null;
  isNotificationVisible: boolean = false;
  lastNotificationId: string | null = null;

  ngOnInit(): void {
    this.authService.userDetails$.subscribe((user) => {
      if (user) {
        this.userDetails = user;
        const nameStr = this.userDetails.userName || this.userDetails.username || '';
        this.userName = nameStr ? nameStr.charAt(0).toUpperCase() : '';
      } else {
        this.userDetails = null;
        this.userName = ''
      }
    });

    this.socketService.notifications$.subscribe((notifications) => {
      if (notifications && notifications.length > 0) {
        const newNotif = notifications[0];

        // If this is a truly new notification (not just a refresh)
        if (this.lastNotificationId && this.lastNotificationId !== newNotif._id) {
          this.toastService.info(newNotif.message || 'You received a new update.', 'Notification');
        }

        this.lastNotificationId = newNotif._id;
      }
    });
  }

  getActiveFill(rla) {
    return rla.isActive ? "'FILL' 1" : "'FILL' 0"
  }

  getMobileMenu(): NavItem[] {
    return this.userDetails ? this.mobileMenu : this.guestMobileMenu;
  }

  handleMobileNavClick(item: NavItem) {
    if (item.path === '/chats') {
      this.sharedService.requestChatConversations();
    }
  }

  toggleNotification() {
    this.isNotificationVisible = !this.isNotificationVisible;
    if (this.isNotificationVisible) {
      this.isUserProfileVisible = false;
    }
  }

  closeNotification() {
    this.isNotificationVisible = false;
  }

  toggleUserProfile() {
    this.isUserProfileVisible = !this.isUserProfileVisible;
  }

  logout() {
    this.isUserProfileVisible = false;
    this.isNotificationVisible = false;
    this.socketService.disconnect();
    this.authService.logout();
  }

  getActiveLink(event: any) {
    this.isActiveLink = event;
  }

  navigateTo(url: string) {
    this.isNotificationVisible = false;
    this.isUserProfileVisible = false;
    if (url === '/my-wishlist') {
      this.router.navigateToDrawer('my-wishlist', '/my-wishlist');
      return;
    }
    if (url === '/notifications') {
      this.router.navigateToDrawer('notifications', '/notifications');
      return;
    }
    this.router.navigateByUrl(url);
  }

  navigateToCreate() {
    if (!this.userDetails) {
      this.redirectToLogin();
      return;
    }

    this.router.navigateByUrl('/create-event');
  }

  openCreateDrawer() {
    if (!this.userDetails) {
      this.redirectToLogin();
      return;
    }

    this.router.navigateToDrawer('create-event', '/create-event');
  }

  toggleTheme() {
    const currentTheme = this.sharedService.getFromLocalStorage('theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.themeService.setTheme(newTheme);
  }

  getThemeIcon(): string {
    return this.isLightTheme() ? 'light_mode' : 'dark_mode';
  }

  getMobileProfileImage(): string {
    const image = this.userDetails?.profileImage;
    return image ? this.sharedService.getImageUrl(image) || this.defaultProfileImage : this.defaultProfileImage;
  }

  redirectToLogin() {
    this.isNotificationVisible = false;
    this.router.navigateByUrl('/login');
  }

  closeDropDown(): void {
    console.log('close dropdown');
    this.isUserProfileVisible = false;
  }

}
