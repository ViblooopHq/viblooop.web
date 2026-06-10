export const Environment = {
  production: true,
  version: require('../package.json').version,

  // API URLs
  serverUrl: 'http://localhost:8000',
  apiBaseUrl: 'http://localhost:8000/api',
  authBaseUrl: 'http://localhost:8000/auth',
  imageBaseUrl: 'http://localhost:8000/',

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
  ogImageUrl: 'https://example.com/image.jpg',
  ogPageUrl: 'https://example.com/page',
};
