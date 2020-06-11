/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { createSnackbar } from '@snackbar/core';
import '@snackbar/core/dist/snackbar.css';
import i18n from '@/assets/js/i18n.js';

export default {
  state: {},
  mutations: {
    // eslint-disable-next-line object-curly-newline
    displaySnackbar(state, { text, mode = 'success', actionText = 'Close', position = 'right', timeout = 5000 }) {
      createSnackbar(text, {
        actions: [
          {
            text: actionText,
            style: {
              color: window.config.toast.actionTextColor
            },
            extraClasses: [ 'success' ],
          }
        ],
        theme: {
          backgroundColor: mode === 'error' ? window.config.toast.errorColor : window.config.toast.successColor,
        },
        position,
        timeout
      });
    }
  },
  actions: {
    displaySnackbar({ commit }, params) {
      commit('displaySnackbar', params);
    },
    updateAvailable() {
      createSnackbar(i18n.t('text.updateAvailable'), {
        actions: [
          {
            text: i18n.t('text.refresh'),
            style: {
              color: window.config.toast.actionTextColor
            },
            extraClasses: [ 'success' ],
            callback(button, snackbar) {
              window.location.reload();
            }
          }
        ],
        theme: {
          backgroundColor: window.config.toast.successColor,
        },
        position: 'right',
        timeout: 5000
      });
    }
  }
};
