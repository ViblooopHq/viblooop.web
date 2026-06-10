import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';

@Component({
  selector: 'vl-wishlist',
  imports: [EventCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  authService = inject(AuthService);
  wishlistedEvents: any[] = [];

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
