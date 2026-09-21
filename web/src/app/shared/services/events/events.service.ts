import { inject, Injectable, signal } from '@angular/core';
import { } from '../../../../assets/json/data.json'
import { HttpService } from '../http/http.service';
import { map, Observable, shareReplay } from 'rxjs';
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
    'Hangouts'
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
    'festivals'
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
        map((response: any) => {
          const categories = Array.isArray(response?.data?.categories)
            ? response.data.categories.filter((category: any) => !this.isShoppingCategory(category))
            : [];

          return {
            ...response,
            data: {
              ...response?.data,
              categories,
            },
          };
        }),
        shareReplay(1)
      );
    }
    return this.categoriesCache$;
  }

  private isShoppingCategory(category: any): boolean {
    const title = String(category?.title || '').trim().toLowerCase();
    return ['shopping', 'shopping buddy', 'shopping buddies'].includes(title);
  }

  getAllEvents(filter: string = 'all', category?: string, search?: string, limit?: number): Observable<any> {
    const params: Record<string, string> = { filter };
    if (category) params['category'] = category;
    if (search) params['search'] = search;
    if (limit) params['limit'] = String(limit);

    return this.httpService.http.get(`${this.baseUrl}/getAllEvents`, { params });
  }

  getEventForYou(filter: string = 'all', category?: string, search?: string, limit?: number): Observable<any> {
    const params: Record<string, string> = { filter };
    if (category) params['category'] = category;
    if (search) params['search'] = search;
    if (limit) params['limit'] = String(limit);

    return this.httpService.http.get(`${this.baseUrl}/getEventForYou`, { params });
  }

  getPastEvents(cursor?: string, limit: number = 20): Observable<any> {
    const params: Record<string, string> = { limit: String(limit) };
    if (cursor) params['cursor'] = cursor;

    return this.httpService.http.get(`${this.baseUrl}/getPastEvents`, { params });
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

  getNearbyEvents(lat: number, lng: number, radius: number = 50000, category?: string): Observable<any> {
    const params: Record<string, string> = {
      lat: String(lat),
      lng: String(lng),
      radius: String(radius),
    };
    if (category) params['category'] = category;

    return this.httpService.http.get(`${this.baseUrl}/events/nearby`, { params });
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

  cancelJoinRequest(eventId: string, reason?: string): Observable<any> {
    return this.httpService.http.post(`${this.baseUrl}/cancelJoinRequest`, { eventId, reason });
  }

  getEventsCollection(collection: string, cursor?: string, limit: number = 20): Observable<any> {
    let url = `${this.baseUrl}/events/collection/${collection}?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    return this.httpService.http.get(url);
  }
}
