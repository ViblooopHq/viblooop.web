import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppDrawerService } from '../../services/drawer/app-drawer.service';

@Component({
  selector: 'vl-not-found',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  private location = inject(Location);
  private router = inject(Router);
  private appDrawerService = inject(AppDrawerService);

  searchQuery = '';

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/events'], { queryParams: { q } });
    } else {
      this.router.navigate(['/events']);
    }
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  hostEvent(): void {
    this.appDrawerService.openCreateEvent();
  }
}
