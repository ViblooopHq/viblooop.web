import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'vl-event-map-panel',
  imports: [GoogleMapsModule, GoogleMap, MapMarker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-map-panel.component.html',
  styleUrl: './event-map-panel.component.scss',
})
export class EventMapPanelComponent {
  locationLabel = input('Location TBA');
  locationSubtitle = input('');
  showLocationSubtitle = input(false);
  isMapVisible = input(false);
  mapOptions = input<google.maps.MapOptions>({ zoom: 16 });
  mapPosition = input<google.maps.LatLngLiteral>({ lat: 0, lng: 0 });

  openInMaps = output<void>();
}
