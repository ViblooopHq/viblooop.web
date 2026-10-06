// api/index.js
let app;

export default async (req, res) => {
  try {
    if (!app) {
      const serverModule = await import('../dist/viblooop/server/server.mjs');
      app = serverModule.default || serverModule.reqHandler || serverModule.app;
    }
    return app(req, res);
  } catch (err) {
    console.error('[Vercel SSR Function Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const detail = process.env.NODE_ENV !== 'production'
      ? `<pre>${err?.stack || err?.message || err}</pre>`
      : '';
    res.end(`<!DOCTYPE html><html><body><h1>Internal Server Error</h1>${detail}</body></html>`);

  }
};