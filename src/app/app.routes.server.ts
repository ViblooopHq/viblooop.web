import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 1. Core Public SEO Pages (Server-Side Rendered on demand)
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  {
    path: 'events',
    renderMode: RenderMode.Server,
  },
  {
    path: 'events/:eventId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'eventCategories/:categoryId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'events/view-all/:collection',
    renderMode: RenderMode.Server,
  },

  // 2. Static Legal Pages (Prerendered at build time for fast CDN caching)
  {
    path: 'terms',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'privacy',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'safety-guidelines',
    renderMode: RenderMode.Prerender,
  },

  // 3. User / Private / Interactive Pages (Client-Side Rendered)
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'create-event',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'chats',
    renderMode: RenderMode.Client,
  },
  {
    path: 'notifications',
    renderMode: RenderMode.Client,
  },
  {
    path: 'my-wishlist',
    renderMode: RenderMode.Client,
  },

  // 4. Fallback for all other routes
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
