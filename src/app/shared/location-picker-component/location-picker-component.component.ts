// import { HttpClient } from '@angular/common/http';
// import { Component, EventEmitter, inject, NgZone, Output } from '@angular/core';
// import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
// import { BrowserService } from '../services/gsap/browser.service';

// let L: any;

// async function loadLeaflet() {
//   if (!L) {
//     L = await import('leaflet');
//   }
//   return L;
// }

// @Component({
//   selector: 'vl-location-picker-component',
//   imports: [],
//   templateUrl: './location-picker-component.component.html',
//   styleUrl: './location-picker-component.component.scss'
// })
// export class LocationPickerComponentComponent {
//   @Output() locationSelected = new EventEmitter<{ lat: number; lng: number; address: string }>();

//   private map!: L.Map;
//   private marker!: L.Marker;
//   searchResults: any[] = [];
//   private search$ = new Subject<string>();
//   searching = false;
//   apiBase = 'http://localhost:8000/api';
//   browserService = inject(BrowserService)

//   constructor(private http: HttpClient, private zone: NgZone) {
//     if (this.browserService.isBrowserPlatform()) {
//       loadLeaflet();
//     }

//     this.search$.pipe(
//       debounceTime(300),
//       distinctUntilChanged(),
//       switchMap(q => {
//         if (!q || q.length < 2) return Promise.resolve([]);
//         this.searching = true;
//         return this.http.get<any[]>(`${this.apiBase}/geocode/search?q=${encodeURIComponent(q)}`).toPromise();
//       })
//     ).subscribe((res: any) => {
//       this.zone.run(() => {
//         this.searchResults = res || [];
//         this.searching = false;
//       });
//     }, err => { this.zone.run(()=> this.searching = false); });
//   }

//   ngAfterViewInit(): void {
//     if (this.browserService.isBrowserPlatform()) {
//       this.initMap();
//       // this.tryGeolocation();
//     }
//   }

//   ngOnDestroy(): void {
//     this.search$.complete();
//   }

//   private initMap() {
//     if (this.browserService.isBrowserPlatform()) {
//       this.map = L.map('map', { center: [20.5937, 78.9629], zoom: 5 });

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '© OpenStreetMap contributors'
//       }).addTo(this.map);

//       this.map.on('click', (e: any) => {
//         this.placeMarker(e.latlng.lat, e.latlng.lng);
//       });
//     }
//   }

//   // use browser geolocation
//   tryGeolocation() {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(pos => {
//         const lat = pos.coords.latitude;
//         const lng = pos.coords.longitude;
//         if (!this.map) this.initMap();

//         this.map.setView([lat, lng], 14);
//         this.placeMarker(lat, lng);
//       }, err => {
//         console.log('geolocation denied or failed');
//       }, { enableHighAccuracy: true });
//     }
//   }

//   placeMarker(lat: number, lng: number, address?: string) {
//     if (this.marker) this.map.removeLayer(this.marker);
//     this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

//     this.marker.on('dragend', () => {
//       const pos = (this.marker as any).getLatLng();
//       this.reverseGeocode(pos.lat, pos.lng);
//     });

//     this.reverseGeocode(lat, lng, address);
//   }

//   reverseGeocode(lat: number, lng: number, fallbackAddress?: string) {
//     this.http.get<any>(`${this.apiBase}/geocode/reverse?lat=${lat}&lon=${lng}`).subscribe(res => {
//       const address = (res && res.display_name) ? res.display_name : (fallbackAddress || 'Unknown location');
//       this.locationSelected.emit({ lat, lng, address });
//     }, err => {
//       this.locationSelected.emit({ lat, lng, address: fallbackAddress || 'Unknown' });
//     });
//   }

//   onSearchInput(q: string) {
//     this.search$.next(q);
//   }

//   // when user selects one of the autocomplete results
//   selectSearchResult(item: any) {
//     const lat = parseFloat(item.lat);
//     const lon = parseFloat(item.lon);
//     this.map.setView([lat, lon], 14);
//     this.placeMarker(lat, lon, item.display_name);
//     this.searchResults = [];
//   }
// }
