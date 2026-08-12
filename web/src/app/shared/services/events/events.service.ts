import { inject, Injectable, signal } from '@angular/core';
import { } from '../../../../assets/json/data.json'
import { HttpService } from '../http/http.service';
import { Observable, shareReplay } from 'rxjs';
import { Environment } from '../../../../environment';
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  eventCategories: any = []
  eventDetails: any = []
  selectedCategory: any = {};
  categoryList: string[] = [
    'Social',
    'Travel Companion',
    'Sports Activities',
    'Local Events',
    'Shopping Buddies'
  ];

  eventTags = [
    'party',
    'house',
    'friends',
    'travel',
    'adventure',
    'explore',
    'sports',
    'football',
    'fitness',
    'community',
    'festivals',
    'shopping',
    'buddies',
    'fashion'
  ]

  jsonPath = '../../../assets/json/data.json'
  httpService = inject(HttpService)
  baseUrl = Environment.apiBaseUrl;

  constructor() {
    this.getCategoriesList();
  }

  getEventDetailsById(eventId: number) {
    return this.eventCategories.flatMap((eventCategory: any) => eventCategory.events).find((event: any) => event.eventId === eventId)
  }

  getEventReviews(eventId: string) {
    return this.httpService.http.post(`${this.baseUrl}/review/getEventReviews`, { eventId: eventId })
  }

  addReview(review: any) {
    return this.httpService.http.post(`${this.baseUrl}/review/add`, review);
  }

  deleteReview(reviewId: string) {
    return this.httpService.http.post(`${this.baseUrl}/review/delete`, { reviewId });
  }

  getAttendeeDetails(attendeeIds: string[]) {
    return this.httpService.http.post(`${this.baseUrl}/getAttendeeDetails`, { attendeeIds: attendeeIds })
  }

  getLocationCoord(address: string) {
    return this.httpService.http.post(`${this.baseUrl}/getGeoLocation`, { address: address })
  }

  getCategoriesList() {
    return this.getEventCategories();
  }

  loadEventJson(): Observable<any> {
    return this.httpService.loadJsonFile(this.jsonPath);
  }

  getEventsListByCategoryId(categoryId: number) {
    if (this.eventCategories.length === 0) this.getCategoriesList();

    return this.eventCategories.filter((eventCategory: any) => eventCategory.categoryId === categoryId)
  }

  private categoriesCache$?: Observable<any>;

  getEventCategories(): Observable<any> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.httpService.http.get(`${this.baseUrl}/categories`).pipe(
        shareReplay(1)
      );
    }
    return this.categoriesCache$;
  }

  getAllEvents(): Observable<any> {
    return this.httpService.http.get(`${this.baseUrl}/getAllEvents`);
  }

  getEventsByCategory(category: string): Observable<any> {
    const body: any = {
      category: category
    };
    return this.httpService.http.post(`${this.baseUrl}/getAllEventsByCategory`, body);
  }

  getEventDetails(eventId: string): Observable<any> {
    const body: any = {
      eventId: eventId
    };
    return this.httpService.http.post(`${this.baseUrl}/getEventDetails`, body);
  }

  createEvent(eventData: any): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/createEvent`, eventData);
  }

  updateEvent(eventData: any): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/updateEvent`, eventData);
  }

  removeEventGalleryImage(eventId: string, imagePath: string): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/removeEventGalleryImage`, { eventId, imagePath });
  }

  getInfoByPostalCode(postalCode: string): Observable<any> {
    const body: any = {
      postalCode: postalCode
    };
    return this.httpService.http.post(`${this.baseUrl}/getAddressFromPinCode`, body);
  }

  getJoinStatus(eventId: string, userId: string): Observable<any> {
    const body: any = {
      eventId: eventId,
      userId: userId
    };
    return this.httpService.http.post(`${this.baseUrl}/getJoinStatus`, body);
  }

  getNearbyEvents(lat: number, lng: number, radius: number = 50000): Observable<any> {
    return this.httpService.http.get(`${this.baseUrl}/events/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  getRelatedNearbyEvents(eventId: string): Observable<any> {
    return this.httpService.http.get(`${this.baseUrl}/events/getRelatedEvents?eventId=${eventId}`);
  }

  requestJoinEvent(eventId: string, userId: string): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/requestJoinEvent`, { eventId, userId });
  }

  acceptJoinRequest(eventId: string, userId: string): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/acceptJoinRequest`, { eventId, userId });
  }

  rejectJoinEventRequest(eventId: string, userId: string): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/rejectJoinEventRequest`, { eventId, userId });
  }

  deleteEvent(eventId: string): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/deleteEvent`, { eventId });
  }

  cancelEvent(eventId: string, reason: string): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/cancelEvent`, { eventId, reason });
  }

  leaveEvent(eventId: string, reason: string): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/leaveEvent`, { eventId, reason });
  }
}
