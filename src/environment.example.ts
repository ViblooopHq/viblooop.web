const apiHost = 'http://localhost:8000';
const apiServerUrl = `${apiHost}`;

export const Environment = {
  production: false,
  version: require('../package.json').version,

  // API URLs
  serverUrl: apiServerUrl,
  apiBaseUrl: `${apiServerUrl}/api`,
  authBaseUrl: `${apiServerUrl}/auth`,
  imageBaseUrl: `${apiServerUrl}/`,

  // Google Maps URLs (external)
  googleMapsSearchUrl: 'https://www.google.com/maps/search/',
  googleMapsUrl: 'https://www.google.com/maps',

  // Firebase Config (populated via environment variables)
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },

  // OG Meta
  ogImageUrl: '',
  ogPageUrl: '',
};
