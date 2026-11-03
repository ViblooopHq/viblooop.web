import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps';
import { MatTooltip } from '@angular/material/tooltip';
import { BrowserService } from '../../../../../shared/services/browser/browser.service';
import { ToastComponent } from '../../../../../shared/components/toast/toast.component';

@Component({
  selector: 'vl-event-map-panel',
  imports: [GoogleMapsModule, GoogleMap, MapMarker, MatTooltip, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-map-panel.component.html',
  styleUrl: './event-map-panel.component.scss',
})
export class EventMapPanelComponent {
  locationLabel = input('Location TBA');
  locationSubtitle = input('');
  showLocationSubtitle = input(false);
  canAccessPrivateLocation = input(false);
  isMapVisible = input(false);
  mapOptions = input<google.maps.MapOptions>({ zoom: 16 });
  mapPosition = input<google.maps.LatLngLiteral>({ lat: 0, lng: 0 });

  browserPlatformService = inject(BrowserService)
  isAddressCopied = signal(false);
  toastMessage = signal("Address copied successfully.")

  openInMaps = output<void>();

  copyAddress() {
    if (this.browserPlatformService.isBrowserPlatform()) {
      navigator.clipboard.writeText(this.locationLabel())
        .then(() => {
          this.isAddressCopied.set(true);
        })
        .catch(err => {
          this.toastMessage.set("Something went wrong during copy");
        });
    }
  }
}
