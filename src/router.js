import Vue from 'vue';
import Router from 'vue-router';
import NProgress from 'nprogress';

import store from './store.js';

import i18n from './assets/js/i18n.js';

import Login from './views/Login.vue';
import Outlet from './views/Outlet.vue';

import { idbSyncData } from './api/api.js';

Vue.use(Router);

/**
 * The handleSessionError method, handle any case of error regarding session management
 * And proceed to the dispatch of the logout event
 * @param {String} error The error message
 * @param {Function} next The next middleware function
 */
function handleSessionError(error, next) {
  console.info('[info] session expired !');
  // store.dispatch('logout');
  // return next({ path: '/login' });
}

let refreshTokenInterval;
/**
 * The refreshToken method handle the refresh token dispatch
 */
async function refreshToken() {
  if (Date.now() / 1000 > store.getters.expires_in) {
    clearInterval(refreshTokenInterval);
    throw 'Session expired';
  }
  console.info('[info] refreshing the token');
  const data = await store.dispatch('refreshToken');
  if (data === false) throw 'Session expired';
  return data;
}

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: 'title.login'
      }
    },
    {
      path: '/',
      component: Outlet,
      children: [
        {
          path: '/',
          name: 'AuditList',
          component: () => import(/* webpackChunkName: "AuditList" */ './views/Audit/AuditList.vue'),
          meta: {
            title: 'title.audit.all'
          }
        },
        {
          path: '/audit/:id',
          name: 'AuditDetail',
          component: () => import(/* webpackChunkName: "AuditDetail" */ './views/Audit/AuditDetail.vue'),
          meta: {
            title: 'title.audit.details'
          }
        },
        {
          path: '/audit/:id/activities/:activityId',
          name: 'ActivityDetail',
          component: () => import(/* webpackChunkName: "ActivityDetail" */ './views/Audit/ActivityDetail.vue'),
          meta: {
            title: 'title.audit.details'
          }
        },
        {
          path: '/audit/:id/activities/:activityId/finding/create',
          name: 'ActivityFindingsCreate',
          component: () => import(/* webpackChunkName: "ActivityFindingsCreate" */ './views/Audit/ActivityFindings.vue'),
          meta: {
            title: 'title.audit.createFinding'
          }
        },
        {
          path: '/audit/:id/activities/:activityId/finding/:finding/edit',
          name: 'ActivityFindingsEdit',
          component: () => import(/* webpackChunkName: "ActivityFindingsEdit" */ './views/Audit/ActivityFindings.vue'),
          meta: {
            title: 'title.audit.editFinding'
          }
        },
      ]
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 };
  }
});

NProgress.configure({
  easing: 'ease',
  speed: 1000,
  showSpinner: false
});

router.beforeResolve((to, from, next) => {
  // If this isn't an initial page load.
  if (to.name) {
    NProgress.start();
    store.dispatch('showSpinner');
  }

  // Handle application title
  const title = i18n.t(to.meta.title);
  store.dispatch('setOutletTitle', title);
  store.dispatch('setOutletSubTitle', '');

  if (to.meta.title) document.title = `${window.config.title} - ${title}`;
  else document.title = window.config.title;

  next();
});

router.afterEach((to, from) => {
  // Complete the animation of the route progress bar.
  NProgress.done();
});

router.beforeEach(async (to, from, next) => {
  // Clear the refresh interval each time the user access a new page
  clearInterval(refreshTokenInterval);

  const token = window.localStorage.getItem('token');

  // If there is no token in session and auth is required,
  // we redirect to login page
  const authorized = [ 'Login' ];
  if (!token) return authorized.includes(to.name) ? next() : next({ name: 'Login' });

  try {
    if (Date.now() > store.getters.expires_in) throw 'Session expired';

    // Syncing data
    await idbSyncData();
    refreshTokenInterval = setInterval(async () => {
      // Syncing data
      await idbSyncData();
    }, 1 * window.config.synchroInterval);
  } catch (error) {
    return handleSessionError(error, next);
  }
  return next();
});

export default router;
