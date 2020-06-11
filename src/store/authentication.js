/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import Vue from 'vue';
import translations from '../translations/common.js';

// Import API
//  Authentication
import { login, refreshToken, getUser, getUserInfo, revokeToken } from '@/api/auth.js';

export default {
  state: {
    user: window.localStorage.getItem('user') || '',
    userInfo: JSON.parse(window.localStorage.getItem('userInfo')) || '',
    token: window.localStorage.getItem('token') || '',
    expires_in: window.localStorage.getItem('expires_in') || '',
    expires_at: window.localStorage.getItem('expires_at') || '',
    refresh_token: window.localStorage.getItem('refresh_token') || '',
    token_type: window.localStorage.getItem('token_type') || '',
  },
  getters: {
    getUser: state => state.user,
    getUserInfo: state => state.userInfo,
    getToken: state => state.token,
    getRefreshToken: state => state.refresh_token,
    expiresIn: state => state.expires_in,
    expiresAt: state => state.expires_at,
  },
  mutations: {
    // Authentication
    // eslint-disable-next-line object-curly-newline
    setToken(state, { access_token, expires_in, refresh_token, token_type }) {
      window.localStorage.setItem('token', access_token);
      state.token = access_token;

      // Timestamp at witch the token will expires
      const expiresAt = (expires_in * 1000) + Date.now();
      window.localStorage.setItem('expires_at', expiresAt);
      state.expires_at = expiresAt;

      window.localStorage.setItem('expires_in', expires_in);
      state.expires_in = expires_in;

      window.localStorage.setItem('refresh_token', refresh_token);
      state.refresh_token = refresh_token;

      window.localStorage.setItem('token_type', token_type);
      state.token_type = token_type;
    },
    setUser(state, user) {
      window.localStorage.setItem('user', user);
      state.user = user;
    },
    setUserInfo(state, userInfo) {
      window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
      state.userInfo = userInfo;
    },
    logout(state, force) {
      if (force) {
        window.localStorage.setItem('user', '');
        state.user = '';

        window.localStorage.setItem('token', '');
        state.token = '';
  
        window.localStorage.setItem('expires_in', '');
        state.expires_in = '';
  
        window.localStorage.setItem('expires_at', '');
        state.expires_at = '';
  
        window.localStorage.setItem('refresh_token', '');
        state.refresh_token = '';
      }
    }
  },
  actions: {
    // Authentication
    async login({ commit, dispatch }, params) {
      const data = await login(params);
      if (data !== false) {
        commit('setToken', data);
        const user = await getUser();
        if (user !== false) {
          commit('setUser', user);
          const userInfo = await getUserInfo(user);
          commit('setUserInfo', userInfo);
        }
      }
      return data;
    },
    async logout({ commit, dispatch }, params) {
      const data = await revokeToken();
      commit('logout', params.force);
      let text = translations.en.notification.error.expiredSession;
      if (params && params.message) {
        text = params.message.split('.').reduce((obj, key) => obj && obj[key], translations.en.notification);
      }
      dispatch('displaySnackbar', {
        text
      });
    },
    async refreshToken({ commit }) {
      const data = await refreshToken();
      // data.access_token is false if no connectivity
      if (data !== false && data.access_token !== false) {
        commit('setToken', data);
      }
      return data;
    }
  }
};
