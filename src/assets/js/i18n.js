import Vue from 'vue';
import VueI18n from 'vue-i18n';

// Import  translations
import translations from '../../translations/common.js';

Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: 'en',
  messages: translations
});

export default i18n;
