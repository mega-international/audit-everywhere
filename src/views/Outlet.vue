<template>
  <section class="flex flex-col Outlet relative h-screen min-h-full ">
    <!-- Offline notice -->
    <div v-show="!online" class="offline dialogue w-full text-center bg-gray-800 text-white px-2 py-1">{{ $t('text.offline') }}</div>
    <header class="flex bg-darkblue sticky top-0 shadow-header overflow-hidden pr-3 z-10">
      <div class="flex justify-center items-center p-3">
        <!-- Navigation back -->
        <transition name="rotate">
          <button v-if="$route.name !== 'AuditList'" class="text-white outline-none" ref="openButton" @click="goBack"><ma-icon icon="arrow-back" iconset="outlet"></ma-icon></button>
        </transition>
      </div>
      <div class="flex flex-col flex-1 text-white truncate">
        <div class="title h-10 text-xl text-center truncate">{{ outletTitle }}</div>
        <div class="subtitle h-10 text-sm text-center">{{ outletSubTitle }}</div>
      </div>
      <!-- Menu burger -->
      <button class="text-white outline-none" ref="openButton" @click="open"><ma-icon icon="menu" iconset="outlet"></ma-icon></button>
    </header>
    <main class="main flex-1 pb-4 overflow-y-auto">
      <router-view></router-view>
      <!-- spinner -->
      <div v-if="spinner" class="z-20 fixed h-screen inset-0 flex justify-center items-center">
        <div class="fixed inset-0 transition-opacity bg-white"></div>
        <ho-spinner class="z-25" tabindex="-1"></ho-spinner>
      </div>
    </main>
    <!-- Drawer -->
    <!-- Off-canvas menu background overlay -->
    <transition
      enter-class="opacity-0"
      enter-active-class="ease-out transition-medium"
      enter-to-class="opacity-100"
      leave-class="opacity-100"
      leave-active-class="ease-out transition-medium"
      leave-to-class="opacity-0"
      appear>
      <div
        v-show="isOpen"
        class="z-10 fixed inset-0 transition-opacity"
        v-touch:swipeTolerance="100"
        v-touch:swipe="swipeHandler">
        <div @click="close" class="absolute inset-0 bg-black opacity-50" tabindex="-1"></div>
      </div>
    </transition>
    <aside
      class="fixed w-64 h-screen z-50 right-0"
      :class="isOpen ? 'open' : ''"
      v-touch:swipeTolerance="100"
      v-touch:swipe="swipeHandler">
      <!-- Off-canvas menu -->
        <div v-show="isOpen" class="flex flex-col z-10 h-screen max-w-xs w-full bg-white transition-transform overflow-y-auto">
          <div class="relative z-10 bg-white h-12">
            <div class="absolute top-0 right-0 p-4">
              <button ref="closeButton" @click="close" type="button" class="text-gray-600 focus:outline-none focus:text-gray-900" aria-label="Close">
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.2929 19.7071C18.6834 20.0976 19.3166 20.0976 19.7071 19.7071C20.0976 19.3166 20.0976 18.6834 19.7071 18.2929L13.4142 12L19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L12 10.5858L5.70711 4.29289C5.31658 3.90237 4.68342 3.90237 4.29289 4.29289C3.90237 4.68342 3.90237 5.31658 4.29289 5.70711L10.5858 12L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L12 13.4142L18.2929 19.7071Z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="mt-6 pb-2 flex border-b-2 px-4 w-full">
            <div class="uppercase bg-darkblue text-white font-bold text-xl flex justify-center items-center w-12 min-w-12 h-12 rounded-full">{{ avatar }}</div>
            <div class="info ml-3 w-9/12">
              <span class="block text-lg text-darkblue font-semibold">{{ user.name }}</span>
              <span class="block text-xs text-darkblue">{{ user.email }}</span>
              <span class="mt-3 block truncate text-darkblue text-xs">{{ $t('text.version') }} : v{{ version.semver }}</span>
              <span class="block truncate text-darkblue text-xs">{{ $t('text.build') }} : {{ version.build }}</span>
            </div>
          </div>
          <div class="relative bg-white flex-1">
            <div class="flex flex-col items-start h-full pt-4 pb-4">
              <router-link class="mt-4 px-4 block w-full cursor-pointer font-semibold text-gray-600 hover:text-gray-700" :to="{ path: '/' }" @click.native="close">
                <ma-icon class="align-middle" icon="format-list-bulleted" iconset="outlet"></ma-icon>{{ $t('title.audit.all')}}</router-link>
              <button @click="signOut" class="mt-4 px-4 block w-full text-left cursor-pointer font-semibold text-gray-600 hover:text-gray-700">
                <ma-icon class="align-middle" icon="exit-to-app" iconset="outlet"></ma-icon>{{ $t('text.signOut')}}</button>
              <span class="flex-1"></span>
              <div class="flex items-center text-xs truncate w-full border-t-2 pt-2 px-4 ">
                <ma-icon :icon="online ? 'wb-cloudy' : 'cloud-off'" iconset="outlet"></ma-icon>
                <span class="ml-2 font-medium text-base">{{ online ? $t('text.online') : $t('text.offline') }}</span>
              </div>
            </div>
          </div>
        </div>
    </aside>
    <footer></footer>

    <!-- Prevent from leaving unsaved changes -->
    <modals-container></modals-container>

    <ma-iconset iconset="outlet">
      <g id="arrow-back"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></g>
      <g id="menu">
        <defs>
          <path id="a" d="M-.5 0h24v24h-24z"/>
        </defs>
        <clipPath id="b">
          <use xlink:href="#a" overflow="visible"/>
        </clipPath>
        <g clip-path="url(#b)">
          <path d="M2.5 18h12v-2h-12v2zm0-12v2h18V6h-18zm0 7h18v-2h-18v2z" fill="#FAFAFA"/>
          <path d="M-.5 0h24v24h-24V0z" fill="none"/>
        </g>
      </g>
      <g id="format-list-bulleted"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12.17c-.74 0-1.33.6-1.33 1.33s.6 1.33 1.33 1.33 1.33-.6 1.33-1.33-.59-1.33-1.33-1.33zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"></path></g>
      <g id="exit-to-app"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></g>
      <g id="info-outline"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"></path></g>
      <g id="cloud-off"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"></path></g>
      <g id="wb-cloudy"><path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"></path></g>
    </ma-iconset>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import MaIcon from '@/components/icon/ma-icon.vue';
import MaIconset from '@/components/icon/ma-iconset.vue';
import HoSpinner from '@/components/layout/loader/ho-spinner.vue';
import displayModal from "@/mixin/displayModal.js";

export default {
  name: 'Outlet',
  components: {
    MaIconset,
    MaIcon,
    HoSpinner
  },
  mixins: [ displayModal ],
  mounted() {
    this.$store.dispatch('getVersion');
    this.user = this.$store.getters.getUserInfo;
  },
  computed: {
    ...mapState({
      outletTitle: 'outletTitle',
      outletSubTitle: 'outletSubTitle',
      preventLeave: 'preventLeave',
      isOpen: 'drawerOpened',
      spinner: 'spinner',
      online: state => state.connectivity.online,
      version: 'version'
    }),
    avatar() {
      if (this.user.name) {
        const matches = this.user.name.match(/\b(\w)/g);
        const acronym = matches.join('');
        return acronym;
      }
      return '';
    }
  },
  beforeRouteUpdate(to, from, next) {
      if (this.preventLeave) {
        const params = Object.keys(to.query).map((key, i) => `${i === 0 ? '?' : ''}${key}=${to.query[key]}`).join('&') || '';
        this.to = `${to.path}${params}`;
        next(false);
        return this.displayModal({
          name: 'confirmLeave',
          text: {
            title: this.$t('text.leaveConfirm'),
            cancel: this.$t('text.cancel'),
            validate: this.$t('text.ok'),
          }
        });
      }
      next();
  },
  data() {
    return {
      leaveResonse: {},
      user: {},
      to: ''
    };
  },
  methods: {
    modalAction(action) {
      this.confirmLeave();
    },
    open() {
      this.$store.dispatch('openDrawer');
      this.$nextTick(() => {
        this.$refs.closeButton.focus()
      });
    },
    close() {
      this.$store.dispatch('closeDrawer');
      this.$nextTick(() => {
        this.$refs.openButton.focus()
      });
    },
    confirmLeave() {
      // Reset prevent leave after confirm
      this.$modal.hide('confirmLeave');
      this.$store.dispatch('setPreventLeave', false);
      this.goBack();
    },
    swipeHandler(direction) {
      if (direction == 'left') return this.open();
      return this.close();
    },
    goBack() {
      if (this.preventLeave) {
        return this.displayModal({
          name: 'confirmLeave',
          text: {
            title: this.$t('text.leaveConfirm'),
            cancel: this.$t('text.cancel'),
            validate: this.$t('text.ok'),
          }
        });
      }

      const ariane = {
        'ActivityFindingsCreate': `/audit/${this.$route.params.id}/activities/${this.$route.params.activityId}?tab=findings`,
        'ActivityFindingsEdit': `/audit/${this.$route.params.id}/activities/${this.$route.params.activityId}?tab=findings`,
        'ActivityDetail': `/audit/${this.$route.params.id}`,
        'AuditDetail': '/',
        'About': '/'
      };
      this.$router.push({ path: this.to || ariane[this.$route.name] });
      this.to = '';
    },
    signOut() {
      document.body.style.removeProperty('overflow');
      this.$store.dispatch('logout', { message: 'message.logout', force: true });
      this.$store.dispatch('closeDrawer');
      this.$router.push({ path: '/login' });
    }
  },
  watch: {
    isOpen: {
      immediate: true,
      handler(isOpen) {
        if (isOpen) {
          document.body.style.setProperty('overflow', 'hidden');
        } else {
          document.body.style.removeProperty('overflow');
        }
      }
    }
  }
};
</script>
<style scoped>
.rotate-enter-active {
  transition: all .3s ease;
}
.rotate-leave-active {
  transition: all .3s ease;
}
.rotate-enter, .rotate-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: rotate(180deg);
  opacity: 0;
}

aside {
  transform: translateX(100%);
  transition: transform 0.3s ease;
  will-change: transform;
}
aside::after {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 100%;
  visibility: visible;
  width: 20px;
  content: '';
}

aside.open {
  transform: translateX(0);
  transition: transform 0.3s ease;
  will-change: transform;
}
.title {
  line-height: 2.8;
}
</style>
