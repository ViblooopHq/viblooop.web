import { Component, inject, OnInit } from '@angular/core';
import { SectionHeaderComponent } from "../../../shared/components/section-header/section-header.component";
import { EventsService } from '../../../shared/services/events/events.service';
import { RouteService } from '../../../shared/services/route/route.service';
import { SharedService } from '../../../shared/services/shared.service';
import { catchError, of } from 'rxjs';
import { ResponseFormat } from '../../../shared/interfaces/ResponseFormat';
import { NgClass } from '@angular/common';
import { SectionHeadersComponent } from "../../../shared/components/section-headers/section-headers.component";

@Component({
  selector: 'vl-find-your-vibe',
  imports: [NgClass, SectionHeadersComponent],
  templateUrl: './find-your-vibe.component.html',
  styleUrl: './find-your-vibe.component.scss'
})
export class FindYourVibeComponent implements OnInit {
  label = "Vibes & Events"
  title: string = 'Find Your Vibe'
  description: string = 'Dive into a world of experiences tailored for you. Click any category to explore live vibes and connect with new people.'
  titleColor: string = 'linear-gradient(90deg, #e91e63, #9c27b0, #3f51b5, #2196f3)'

  jsonPath = '../../../../assets/json/data.json'
  eventCategories: any = []
  eventService = inject(EventsService)
  router = inject(RouteService)
  _shared = inject(SharedService)

  ngOnInit() {
    // this.eventService.loadEventJson().subscribe(
    //   (data: any) => {
    //     this.eventCategories = data
    //   }
    // )
    this.getEventCategory();
  }

  goToEventCategory(path: string, params: any) {
    this.router.navigate(path, params)
  }

  getEventCategory(): void {
    this.eventService.getEventCategories().pipe(
      catchError((err: any) => {
        console.error('Error fetching event categories:', err);
        return of([]);
      })
    ).subscribe({
      next: (res: ResponseFormat<any>) => {
        if (!res?.success || res.statusCode !== 200) {
          console.warn('Unexpected response format or status code:', res);
          return;
        }
        this.eventCategories = res.data?.categories ?? [];
      },
      error: (err: any) => {
        console.error('Error fetching event categories:', err);
      }
    });
  }

  setActiveEventCategory(category: any): void {
    this._shared.setToLocalStorage('activeEventCategory', JSON.stringify(category));
  }

  getMaterialIcon(iconName: string): string {
    if (!iconName) return 'category';
    
    // Mapping FontAwesome/Legacy names to Material Symbols
    const mapping: Record<string, string> = {
      'fa-solid fa-music': 'music_note',
      'fa-solid fa-palette': 'palette',
      'fa-solid fa-person-running': 'fitness_center',
      'fa-solid fa-utensils': 'restaurant',
      'fa-solid fa-gamepad': 'sports_esports',
      'fa-solid fa-camera': 'photo_camera',
      'fa-solid fa-laptop-code': 'code',
      'fa-solid fa-theater-masks': 'theater_comedy',
      'fa-solid fa-glass-cheers': 'celebration',
      'fa-solid fa-graduation-cap': 'school'
    };

    return mapping[iconName] || 'category';
  }
}
