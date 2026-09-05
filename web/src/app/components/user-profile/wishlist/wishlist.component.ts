import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';

@Component({
  selector: 'vl-wishlist',
  imports: [EventCardComponent, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  authService = inject(AuthService);
  private location = inject(Location);
  private router = inject(Router);
  wishlistedEvents: any[] = [];

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  ngOnInit() {
    this.fetchWishlist();
  }

  fetchWishlist() {
    if (!this.authService.isLoggedIn()) return;
    this.authService.getWishlistedEvents().subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {
          // Filter out any null/undefined entries just in case
          this.wishlistedEvents = res.data.filter((e: any) => !!e);
        }
      },
      error: (err) => console.error('Failed to load wishlist:', err)
    });
  }
}
