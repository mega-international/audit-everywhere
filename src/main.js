import Vue from 'vue';

// Date filter
import { createDateFilter } from 'vue-date-fns';
// eslint-disable-next-line import/no-extraneous-dependencies
import locale from 'date-fns/locale/en';

import NProgress from 'vue-nprogress';

import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

// Check connectivity
import checkConnectivityfrom from './assets/js/connectivity.js';

// Import our main application style
import './assets/styles/main.css';
import './assets/styles/tailwind.css';
// import Nprogress style
import './assets/styles/nprogress.css';

import i18n from './assets/js/i18n.js';

Vue.config.productionTip = false;

import VueTheMask from 'vue-the-mask';
Vue.use(VueTheMask);

import VuePellEditor from 'vue-pell-editor';
Vue.use(VuePellEditor);

import Vue2TouchEvents from 'vue2-touch-events';
Vue.use(Vue2TouchEvents, {
  disableClick: true,
  touchHoldTolerance: 6000
});

import VModal from 'vue-js-modal';
Vue.use(VModal, { dynamic: true, injectModalsContainer: true });

if (window.config.connectivity) {
  checkConnectivityfrom({
    url: window.config.connectivity.url,
    timeToCount: window.config.connectivity.timeToCount,
    threshold: window.config.connectivity.threshold,
    interval: window.config.connectivity.interval,
  });
} else {
  console.error('[error] No connectivity check config!');
}

// Add filters
Vue.filter('dateShort', createDateFilter('DD MMM YYYY', { locale }));

store.dispatch('setIdb');

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');
