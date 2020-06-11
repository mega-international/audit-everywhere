/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */

export default {
  state: {
    online: true
  },
  getters: {
    isOnline: state => state.online
  },
  mutations: {
    setModeOnline(state, online) {
      state.online = online;
    },
    setModeOffline(state, online) {
      state.online = online;
    }
  },
  actions: {
    connectionChanged({ commit }, { online }) {
      if (online) commit('setModeOnline', online);
      else commit('setModeOffline', online);
    }
  }
};
