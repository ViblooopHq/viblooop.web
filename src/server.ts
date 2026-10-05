import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

// SSR Mocks for browser-only globals
const mock = () => {};
const windowMock: any = {
  addEventListener: mock,
  removeEventListener: mock,
  dispatchEvent: mock,
  getComputedStyle: () => ({
    getPropertyValue: () => '',
  }),
  location: {
    href: '',
    pathname: '',
    search: '',
    hash: '',
  },
  CustomEvent: function() { return this; },
};

windowMock.window = windowMock;
windowMock.self = windowMock;

const documentMock: any = {
  createElement: () => ({
    style: {},
    getAttribute: () => '',
    setAttribute: mock,
    appendChild: mock,
    addEventListener: mock,
    removeEventListener: mock,
  }),
  getElementsByTagName: () => [],
  documentElement: { style: {} },
  body: { style: {} },
  addEventListener: mock,
  removeEventListener: mock,
};

(global as any).window = windowMock;
(global as any).document = documentMock;
try {
  Object.defineProperty(global, 'navigator', {
    value: { userAgent: '' },
    configurable: true,
    writable: true
  });
} catch (e) {}

(global as any).Node = function() {};
(global as any).HTMLElement = function() {};
if (typeof URL !== 'undefined') {
  if (!(URL as any).createObjectURL) {
    (URL as any).createObjectURL = () => '';
  }
  if (!(URL as any).revokeObjectURL) {
    (URL as any).revokeObjectURL = () => '';
  }
}

// Also apply to globalThis for Vite SSR compatibility
(globalThis as any).window = windowMock;
(globalThis as any).document = documentMock;
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: windowMock.navigator || { userAgent: '' },
    configurable: true,
    writable: true
  });
} catch (e) {}
(globalThis as any).Node = (global as any).Node;
(globalThis as any).HTMLElement = (global as any).HTMLElement;

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
app.set('trust proxy', true);
const commonEngine = new CommonEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;
  const host = headers['x-forwarded-host'] || headers.host || 'localhost';
  const proto = headers['x-forwarded-proto'] || protocol || 'https';

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${proto}://${host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => {
      console.error('[SSR Render Error - Falling back to CSR]', err);
      const csrHtml = join(browserDistFolder, 'index.csr.html');
      res.sendFile(csrHtml, (sendErr) => {
        if (sendErr) {
          next(err);
        }
      });
    });
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = app;
export default app;
