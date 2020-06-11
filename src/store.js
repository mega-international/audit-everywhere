/* eslint-disable no-param-reassign */
/* eslint-disable import/no-unresolved */
import Vue from 'vue';
import Vuex from 'vuex';

// Import state modules
//  Connectivity
import connectivity from '@/store/connectivity.js';
//  Authentication
import authentication from '@/store/authentication.js';
//  Audit
import audit from '@/store/audit.js';
//  Notifications
import notifications from '@/store/notifications.js';
import { getDB } from './assets/js/idbQl';


Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    connectivity,
    authentication,
    audit,
    notifications
  },
  state: {
    idb: null,
    drawerOpened: false,
    spinner: true,
    outletTitle: '',
    outletSubTitle: '',
    preventLeave: false,
    version: JSON.parse(window.localStorage.getItem('version')) || {},
    pendingSync: false
  },
  getters: {
    getConnectivity: state => state.connectivity,
    getIdb: state => state.idb,
    getPendingSync: state => state.pendingSync,
  },
  mutations: {
    getVersion(state, version) {
      window.localStorage.setItem('version', JSON.stringify(version));
      state.version = version;
    },
    async setIdb(state, idb) {
      state.idb = idb;
    },
    openDrawer(state) {
      state.drawerOpened = true;
    },
    closeDrawer(state) {
      state.drawerOpened = false;
    },
    showSpinner(state) {
      state.spinner = true;
    },
    hideSpinner(state) {
      state.spinner = false;
    },
    setOutletTitle(state, title) {
      state.outletTitle = title;
    },
    setOutletSubTitle(state, title) {
      state.outletSubTitle = title;
    },
    setPreventLeave(state, flag) {
      state.preventLeave = flag;
    },
    setPendingSync(state, value) {
      state.pendingSync = value;
    }
  },
  actions: {
    getVersion({ commit }) {
      console.log('[Mega] Loading version file');
      fetch(`${process.env.BASE_URL}config/version.json`)
      .then((response) => {
        return response.json();
      })
      .then((version) => {
        commit('getVersion', version);
      });
    },
    async setIdb({ commit }) {
      const idb = await getDB();
      commit('setIdb', idb);
    },
    openDrawer({ commit }) {
      commit('openDrawer');
    },
    closeDrawer({ commit }) {
      commit('closeDrawer');
    },
    showSpinner({ commit }) {
      commit('showSpinner');
    },
    hideSpinner({ commit }) {
      commit('hideSpinner');
    },
    setOutletTitle({ commit }, title) {
      commit('setOutletTitle', title);
    },
    setOutletSubTitle({ commit }, title) {
      commit('setOutletSubTitle', title);
    },
    setPreventLeave({ commit }, flag) {
      commit('setPreventLeave', flag);
    }
  }
});
