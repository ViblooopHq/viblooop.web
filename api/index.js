// api/index.js
let app;

export default async (req, res) => {
    if (!app) {
        const serverModule = await import('../dist/viblooop/server/server.mjs');
        app = serverModule.default || serverModule.reqHandler || serverModule.app;
    }
    return app(req, res);
};