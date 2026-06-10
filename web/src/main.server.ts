// SSR Mocks for browser-only globals
const mock = () => {};
const windowMock: any = {
  addEventListener: mock,
  removeEventListener: mock,
  dispatchEvent: mock,
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  location: { href: '', pathname: '', search: '', hash: '' },
  CustomEvent: function() { return this; },
};
windowMock.window = windowMock;
windowMock.self = windowMock;
const documentMock: any = {
  createElement: () => ({
    style: {}, getAttribute: () => '', setAttribute: mock,
    appendChild: mock, addEventListener: mock, removeEventListener: mock,
  }),
  getElementsByTagName: () => [],
  documentElement: { style: {} },
  body: { style: {} },
  addEventListener: mock,
  removeEventListener: mock,
};
(globalThis as any).window = windowMock;
(globalThis as any).document = documentMock;
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: '' },
    configurable: true,
    writable: true
  });
} catch (e) {
  // If it fails, navigator is likely already defined (Node 21+)
}
(globalThis as any).Node = function() {};
(globalThis as any).HTMLElement = function() {};

import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, {...config, providers: [provideZoneChangeDetection(), ...config.providers]}, context);

export default bootstrap;
