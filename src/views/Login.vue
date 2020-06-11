<template>
  <section class="login sm:container mx-auto px-5 lg:flex lg:px-0">
    <aside class="lg:w-2/5"></aside>
    <section class="mt-24 mb-8 lg:w-3/5 lg:mx-auto lg:flex lg:flex-col lg:justify-center lg:items-center">
      <header class="lg:w-3/4 text-center">
        <h1 class="text-xl lg:text-3xl">{{ $t('text.welcome') }} {{ $t('text.to') }}</h1>
        <div class="w-full mt-5 mx-auto whitespace-no-wrap">
          <img class="inline-block object-contain w-8 lg:w-10 mr-4" src="@/assets/img/audit.svg" alt="Audit Everywhere logo">
          <h2 class="text-2xl lg:text-4xl inline-block align-middle">{{ $t('text.hopexName') }} {{ $t('text.hopex') }}</h2>
        </div>
      </header>
      <main class="lg:w-2/4">
        <form class="mt-12" @submit.prevent="handleSubmit">
          <div class="flex items-center text-green mt-4 border-b-2">
            <ma-icon icon="user" iconset="login"></ma-icon>
            <ma-input
              class="flex-grow"
              label="Username"
              type="text"
              name="username"
              v-model="username"></ma-input>
          </div>
          <div class="flex items-center text-green mt-4 border-b-2">
            <ma-icon icon="lock" iconset="login"></ma-icon>
            <ma-input
              class="flex-grow"
              label="Password"
              type="password"
              name="password"
              icon="password"
              iconset="login"
              :password-reveal="true"
              v-model="password"></ma-input>
          </div>
          <div class="mt-8">
            <ho-button
              class="w-full font-medium rounded-sm flex justify-center"
              :class="disableForm ? 'opacity-50 cursor-not-allowed': ''"
              :disabled="disableForm">
              <span>{{ $t('text.signIn') }}</span>
              <ma-icon icon="arrow-forward" iconset="login"></ma-icon>
            </ho-button>
          </div>
        </form>
      </main>
    </section>
    <ma-iconset iconset="login">
      <g id="user">
        <path class="st0" d="M-207.56 30.41v-8.88c0-4.51-3.95-8.18-8.8-8.18-4.85 0-8.8 3.67-8.8 8.18v8.88c-4.33 2.87-7.2 7.78-7.2 13.35 0 8.83 7.18 16 16 16s16-7.17 16-16c0-5.57-2.87-10.48-7.2-13.35zm-16-.93v-7.95c0-3.63 3.23-6.57 7.2-6.57s7.2 2.95 7.2 6.57v7.95c-.15-.07-.3-.14-.46-.21-.31-.14-.63-.28-.96-.41-.21-.08-.42-.16-.63-.23-.21-.07-.41-.14-.63-.21-.35-.1-.7-.19-1.06-.27a7.87 7.87 0 00-.47-.1c-.42-.08-.84-.15-1.26-.19l-.29-.03c-.48-.04-.96-.07-1.45-.07a17.38 17.38 0 00-1.74.1c-.42.05-.84.11-1.26.19-.16.03-.31.07-.46.1-.36.08-.71.17-1.06.27-.21.06-.42.14-.63.21-.21.07-.42.15-.63.23-.32.13-.65.27-.96.41l-.45.21zm7.2 28.68c-7.94 0-14.4-6.46-14.4-14.4 0-5.23 2.81-9.8 6.99-12.32.74-.45 1.51-.82 2.3-1.12.14-.05.28-.1.42-.16.22-.07.44-.15.66-.21.27-.08.55-.15.83-.21.2-.05.41-.09.61-.12.3-.06.59-.1.9-.14.14-.02.27-.03.41-.04.42-.04.85-.07 1.28-.07.43 0 .86.03 1.28.07.14.01.27.03.41.04.3.04.6.08.89.14.2.03.41.08.61.12.28.06.55.13.83.21l.66.21c.14.05.28.1.42.16.79.3 1.56.68 2.3 1.12 4.18 2.52 6.99 7.1 6.99 12.32 0 7.94-6.45 14.4-14.39 14.4zm0 0"/>
        <path class="st0" d="M-206.76 42.96h-2.45c-.15-1.39-.7-2.66-1.53-3.69l1.73-1.73c.31-.31.31-.82 0-1.13a.803.803 0 00-1.13 0l-1.73 1.73a7.216 7.216 0 00-3.69-1.54v-2.44c0-.44-.36-.8-.8-.8s-.8.36-.8.8v2.44c-1.39.16-2.65.71-3.69 1.54l-1.73-1.73a.803.803 0 00-1.13 0c-.31.31-.31.82 0 1.13l1.73 1.73a7.12 7.12 0 00-1.53 3.69h-2.45c-.44 0-.8.36-.8.8 0 .45.35.8.8.8h2.45c.15 1.39.7 2.65 1.53 3.69l-1.73 1.73c-.31.31-.31.82 0 1.13.16.16.36.23.57.23.21 0 .41-.08.57-.23l1.73-1.73c1.04.83 2.3 1.38 3.69 1.54v2.45c0 .44.36.8.8.8s.8-.36.8-.8v-2.45c1.39-.16 2.65-.71 3.69-1.54l1.73 1.73c.16.16.36.23.57.23.2 0 .41-.08.57-.23.31-.31.31-.82 0-1.13l-1.73-1.73a7.155 7.155 0 001.53-3.69h2.45c.44 0 .8-.35.8-.8-.03-.44-.38-.8-.82-.8zm-9.6 6.4c-3.09 0-5.6-2.51-5.6-5.6s2.52-5.6 5.6-5.6c3.09 0 5.6 2.51 5.6 5.6s-2.52 5.6-5.6 5.6zm0 0M-86.75 28.15l-11.71-5.85a3.236 3.236 0 01-1.79-2.9v-4.14c.28-.35.57-.74.88-1.17 1.52-2.14 2.73-4.53 3.62-7.11 1.73-.79 2.85-2.5 2.85-4.43v-4.91c0-1.18-.44-2.32-1.23-3.21v-6.52c.07-.67.34-4.69-2.56-7.99-2.52-2.87-6.61-4.33-12.15-4.33s-9.62 1.45-12.14 4.33c-2.9 3.31-2.63 7.32-2.56 7.99v6.52a4.89 4.89 0 00-1.23 3.21v4.91c0 1.49.68 2.88 1.84 3.81 1.12 4.45 3.47 7.8 4.29 8.87v4.06c0 1.19-.65 2.27-1.69 2.84l-10.93 5.97a11.043 11.043 0 00-5.76 9.71v3.97c0 5.82 18.44 7.35 28.18 7.35 9.75 0 28.19-1.54 28.19-7.35v-3.73c.01-4.22-2.33-8.01-6.1-9.9zm3.66 13.62c0 1.66-9.08 4.9-25.74 4.9-16.65 0-25.73-3.24-25.73-4.9V37.8c0-3.15 1.72-6.04 4.48-7.55l10.93-5.97c1.83-1 2.97-2.91 2.97-5v-4.92l-.29-.34c-.03-.04-3.03-3.67-4.18-8.66l-.11-.49-.42-.27a2.445 2.445 0 01-1.13-2.05v-4.91c0-.68.29-1.33.82-1.81l.4-.37v-7.79c-.01-.03-.43-3.43 1.96-6.15 2.03-2.32 5.5-3.49 10.3-3.49 4.79 0 8.25 1.16 10.28 3.46 2.39 2.7 1.99 6.15 1.99 6.18l-.01 7.79.41.37c.53.47.82 1.12.82 1.8v4.91c0 1.06-.7 2-1.74 2.33l-.61.19-.2.61c-.82 2.55-1.99 4.91-3.47 7-.37.51-.72.98-1.03 1.32l-.31.35v5.06c0 2.17 1.21 4.12 3.15 5.09l11.7 5.85a8.56 8.56 0 014.76 7.7v3.73zm0 0"/>
        <path id="Path_2145" class="st1" d="M12 12.6c3.26.24 6.1-2.21 6.34-5.47.24-3.26-2.21-6.1-5.47-6.34S6.77 3 6.53 6.26c-.01.14-.01.29-.01.43A5.719 5.719 0 0012 12.6zm0-10.13a4.231 4.231 0 014.53 3.9 4.231 4.231 0 01-3.9 4.53A4.231 4.231 0 018.1 7c-.01-.1-.02-.2-.02-.31A4.096 4.096 0 0112 2.47z"/>
        <path id="Path_2146" class="st1" d="M20.75 15.86c-2.68-1.5-5.68-2.33-8.75-2.42-3.07.09-6.07.92-8.75 2.42-1.64.9-2.66 2.63-2.64 4.51v.77a2.382 2.382 0 002.32 2.42h18.13a2.37 2.37 0 002.32-2.42v-.77c.02-1.88-.99-3.61-2.63-4.51zm1.01 5.29c.01.4-.3.73-.7.74H2.94a.717.717 0 01-.7-.74v-.77c-.01-1.26.67-2.42 1.76-3.02 2.45-1.38 5.19-2.14 8-2.23 2.81.09 5.55.85 8 2.23a3.4 3.4 0 011.77 3.01l-.01.78z"/>
      </g>
      <g id="lock">
        <path class="st0" d="M-207.6 30.4v-8.9c0-4.5-4-8.1-8.8-8.1-4.8 0-8.8 3.6-8.8 8.1v9a16 16 0 1017.6 0zm-16-1v-7.9c0-3.6 3.3-6.5 7.2-6.5s7.2 3 7.2 6.5v8l-.4-.2-1-.4-.6-.3-.6-.2a18.3 18.3 0 00-2.8-.5h-.3a17.4 17.4 0 00-4.5.1l-.4.1-1 .3-.7.2-.6.3c-.4 0-.7.2-1 .4l-.5.2zm7.2 28.8a14.4 14.4 0 01-5-27.9l.4-.1.6-.3a11.2 11.2 0 012.4-.4h.4a13.5 13.5 0 012.5 0h.4l1 .1.5.1.9.2.6.3.4.1 2.3 1.1a14.4 14.4 0 01-7.4 26.8zm0 0"/>
        <path class="st0" d="M-206.8 43h-2.4a7 7 0 00-1.5-3.7l1.7-1.8c.3-.3.3-.8 0-1a.8.8 0 00-1.1 0L-212 38c-1-.8-2.3-1.3-3.7-1.5v-2.4c0-.5-.3-.8-.8-.8s-.8.3-.8.8v2.4c-1.4.2-2.6.7-3.7 1.5l-1.7-1.7a.8.8 0 00-1.1 0c-.3.3-.3.8 0 1.1l1.7 1.8c-.8 1-1.4 2.3-1.5 3.7h-2.5c-.4 0-.8.3-.8.8 0 .4.4.8.8.8h2.5c.1 1.3.7 2.6 1.5 3.6l-1.7 1.8c-.3.3-.3.8 0 1.1.2.2.4.2.6.2.2 0 .4 0 .5-.2l1.8-1.7c1 .8 2.3 1.4 3.7 1.5v2.5c0 .4.3.8.7.8s.9-.4.9-.8v-2.5c1.3-.1 2.6-.7 3.6-1.5l1.8 1.7c.1.2.3.2.5.2s.4 0 .6-.2c.3-.3.3-.8 0-1.1l-1.7-1.8c.8-1 1.4-2.3 1.5-3.6h2.5c.4 0 .8-.4.8-.8 0-.5-.4-.8-.9-.8zm-9.6 6.4a5.6 5.6 0 110-11.2 5.6 5.6 0 010 11.2zm0 0M-86.8 28.1l-11.7-5.8a3.2 3.2 0 01-1.8-2.9v-4.1A29.6 29.6 0 00-95.8 7a4.9 4.9 0 002.9-4.5v-4.9c0-1.1-.4-2.3-1.2-3.2V-12c0-.7.3-4.7-2.6-8-2.5-2.9-6.6-4.3-12.1-4.3-5.6 0-9.7 1.4-12.2 4.3a11 11 0 00-2.5 8v6.5c-.8 1-1.3 2-1.3 3.2v5c0 1.4.7 2.8 1.9 3.8 1 4.4 3.4 7.8 4.3 8.8v4c0 1.3-.7 2.4-1.7 3l-11 5.9a11 11 0 00-5.7 9.7v4c0 5.8 18.4 7.3 28.2 7.3 9.7 0 28.1-1.5 28.1-7.3V38c0-4.2-2.3-8-6-9.9zm3.7 13.7c0 1.6-9 4.9-25.7 4.9s-25.8-3.3-25.8-5v-3.9c0-3.1 1.8-6 4.5-7.5l11-6c1.8-1 3-3 3-5v-5l-.4-.3s-3-3.7-4.2-8.6v-.5l-.5-.3a2.4 2.4 0 01-1.1-2v-5c0-.6.3-1.3.8-1.8l.4-.3v-7.8s-.4-3.5 2-6.2c2-2.3 5.5-3.5 10.3-3.5 4.8 0 8.2 1.2 10.2 3.5 2.4 2.7 2 6.1 2 6.2v7.8l.4.3c.6.5.9 1.1.9 1.8v5c0 1-.7 2-1.8 2.3l-.6.2-.2.6a25.7 25.7 0 01-4.5 8.3l-.3.3v5.1c0 2.2 1.2 4.1 3.1 5l11.7 6c3 1.4 4.8 4.4 4.8 7.6v3.8zm0 0"/>
        <g id="Group_29">
        <g id="Group_28">
          <circle id="Ellipse_1" class="st1" cx="16.7" cy="15.7" r="1.4"/>
          <path id="Path_2063" class="st1" d="M21 20.6c.5 0 1-.4 1-.9v-7.3c0-2-1.7-3.6-3.7-3.6h-1V5.6a5.4 5.4 0 00-10.8 0v3.2H5.4c-2 0-3.6 1.6-3.6 3.6v7.3c0 2 1.6 3.6 3.6 3.6h13c1.9 0 3.5-1.6 3.5-3.6 0-.5-.4-.9-.9-.9s-.9.4-.9 1c0 1-.8 1.7-1.8 1.7H5.4c-1 0-1.8-.8-1.8-1.8v-7.3c0-1 .8-1.8 1.8-1.8h13c1 0 1.7.8 1.7 1.8v7.3c0 .5.4 1 1 1zM15.4 8.8H8.3V5.6a3.6 3.6 0 017.1 0v3.2z"/>
          <circle id="Ellipse_2" class="st1" cx="10.3" cy="15.7" r="1.4"/>
          <circle id="Ellipse_3" class="st1" cx="7.1" cy="15.7" r="1.3"/>
          <circle id="Ellipse_4" class="st1" cx="13.5" cy="15.7" r="1.4"/>
        </g>
        </g>
      </g>
      <g id="eye"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></g>
      <g id="eye-close"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path></g>
      <g id="arrow-forward"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></g>
    </ma-iconset>
  </section>
</template>

<script>
import MaInput from '@/components/form/input/text/ma-input.vue';
import HoButton from '@/components/form/button/ho-button.vue';
import MaIcon from '@/components/icon/ma-icon.vue';
import MaIconset from '@/components/icon/ma-iconset.vue';
import { required } from 'vuelidate/lib/validators';

import messages from '@/translations/common.js';

import { validationMixin } from 'vuelidate';

export default {
  name: "Login",
  mixins: [ validationMixin ],
  components: {
    MaInput,
    HoButton,
    MaIconset,
    MaIcon
  },
  async mounted() {
    if ('PasswordCredential' in window) {
      if (window.localStorage.getItem('token')) {
        const cred = await navigator.credentials.get({ password: true });
        if (cred) {
          this.username = cred.id;
          this.password = cred.password;
          this.handleSubmit();
        }
      }
    }
  },
  data() {
    return {
      disableForm: false,
      username: '',
      password: '',
      BASE_URL: process.env.BASE_URL
    }
  },
  validations: {
    username: {
      required,
    },
  },
  methods: {
    async handleSubmit() {
      if (this.disableForm) return;
      if (!this.username || !this.password) return this.$store.dispatch('displaySnackbar', { text: messages.en.notification.error.missingFields });
      this.disableForm = true;
      const result = await this.$store.dispatch('login', {
        username: this.username,
        password: this.password
      });
      if (result === false ) {
        return this.disableForm = false;
      }
      this.disableForm = true;
      this.$router.push({ name: 'AuditList' });
    }
  }
};
</script>

<style scoped>
 .login {
   height: 100vh;
 }

 aside {
   background-image: url('~@/assets/img/hero.png');
   background-repeat: no-repeat;
   background-position: top center;
   background-size: cover;
 }
</style>
