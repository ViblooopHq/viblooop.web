const apiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const apiServerUrl = `http://${apiHost || 'localhost'}:8000`;

export const Environment = {
  production: true,
  version: require('../package.json').version,

  // API URLs
  serverUrl: apiServerUrl,
  apiBaseUrl: `${apiServerUrl}/api`,
  authBaseUrl: `${apiServerUrl}/auth`,
  imageBaseUrl: `${apiServerUrl}/`,

  // Google Maps
  googleMapKey: 'AIzaSyBQKpsYqQb8hYmUsotg-7IDHcEW-hau_xg',

  // Google Analytics / Tag Manager
  gtmId: 'GTM-N6W7LSST',
  gaId: 'G-6HYQ5D4LEQ',

  // Google Maps URLs (external)
  googleMapsSearchUrl: 'https://www.google.com/maps/search/',
  googleMapsUrl: 'https://www.google.com/maps',

  // Firebase Config
  firebase: {
    apiKey: 'AIzaSyDFR44IK6FSl-N8zyrJOOi532C6133Un_Q',
    authDomain: 'rk-delta.firebaseapp.com',
    projectId: 'rk-delta',
    storageBucket: 'rk-delta.firebasestorage.app',
    messagingSenderId: '428932858018',
    appId: '1:428932858018:web:8ccca497cccfe186d117fb',
    measurementId: 'G-ZRC6SHW6KN',
  },

  // OG Meta
  ogImageUrl: 'https://www.viblooop.com/og.png',
  ogPageUrl: 'https://www.viblooop.com',
};
