import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { RouteService } from '../../../shared/services/route/route.service';
import { AppDrawerService } from '../../../shared/services/drawer/app-drawer.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { FormDrawerComponent } from '../../../shared/components/form-drawer/form-drawer.component';

@Component({
  selector: 'vl-wishlist',
  standalone: true,
  imports: [CommonModule, EventCardComponent, FormDrawerComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  @Output() drawerClosed = new EventEmitter<void>();

  authService = inject(AuthService);
  private appDrawerService = inject(AppDrawerService);
  private routeService = inject(RouteService);
  private router = inject(Router);
  wishlistedEvents: any[] = [];
  isLoading = true;

  goBack(): void {
    this.appDrawerService.close();
    this.drawerClosed.emit();
  }

  exploreEvents(): void {
    this.appDrawerService.close();
    this.drawerClosed.emit();
    this.router.navigateByUrl('/');
  }

  ngOnInit() {
    this.fetchWishlist();
  }

  fetchWishlist() {
    if (!this.authService.isLoggedIn()) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.authService.getWishlistedEvents().subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          this.wishlistedEvents = res.data.filter((e: any) => !!e);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load wishlist:', err);
        this.isLoading = false;
      }
    });
  }
}
