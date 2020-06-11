/* eslint-disable no-console */

import { register } from 'register-service-worker';
import store from '@/store.js';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready(registration) {
      console.log(
        'App is being served from cache by a service worker.\n'
        + 'For more details, visit https://goo.gl/AFskqB'
      );
      // We try to request a new version of the service worker every hour
      setInterval(() => {
        console.log('Requesting new service worker ...');
        registration.update(); 
      }, 2 * 3600 * 1000);
    },
    registered() {
      console.log('Service worker has been registered.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated(registration) {
      console.log('New content is available; please refresh.');
      store.dispatch('updateAvailable');
      registration.waiting.postMessage({action: "skipWaiting"});
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    }
  });
}
