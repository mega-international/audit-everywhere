<template>
  <section v-if="item.auditActivity_ActivitywithTheme"
    class="ho-accordion-item mt-5" :class="item.opened ? 'opened' : ''">
    <header class="py-6 px-3 flex justify-between items-center cursor-pointer bg-white rounded-lg shadow outline-none hover:bg-lightgrey focus:bg-lightgrey" @click="$emit('accordion:open', item)">
      <h1 class="flex-1 text-sm font-semibold truncate">{{ item.name }}</h1>
      <span v-if="validatedActivities"
        class="px-4 py-1 flex justify-center items-center text-xs badge font-semibold rounded-full">
        {{ validatedActivities }} {{ $tc('text.incomplete', validatedActivities) }}</span>
      <button class="arrow text-gray-500 outline-none text-magenta"><ma-icon icon="chevron-right" iconset="accordion"></ma-icon></button>
    </header>
    <transition name="fade">
      <div v-show="item.opened">
        <ho-activity  class="mt-2" v-for="activity of item.auditActivity_ActivitywithTheme" :key="activity.id" v-show="item.opened" :activity="activity"></ho-activity>
      </div>
    </transition>
    <ma-iconset iconset="accordion">
      <g id="chevron-right"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></g>
    </ma-iconset>
  </section>
</template>

<script>
import HoActivity from './ho-activity.vue';
import MaIcon from '@/components/icon/ma-icon.vue';
import MaIconset from '@/components/icon/ma-iconset.vue';
import { getDB } from '@/assets/js/idbQl.js';
export default {
  name: 'ho-accordion-item',
  components: {
    HoActivity,
    MaIcon,
    MaIconset
  },
  props: {
    item: Object
  },
  data() {
    return {
      localActivities: [],
      validatedStatus: window.config.validatedStatus,
    };
  },
  async mounted() {
    const idb = await getDB();
    for (let activity of this.item.auditActivity_ActivitywithTheme) {
      const localActivity = await idb.getFromIndex('activity', 'id', activity.id);
      if (localActivity) this.localActivities.push(localActivity);
    }
  },
  computed: {
    validatedActivities() {
      return this.localActivities
        .filter(activity => {
          return this.validatedStatus.split('|').every(validatedStatus => {
            if (!activity.activityStatus) return false;
            return activity.activityStatus.toLowerCase() != validatedStatus.toLowerCase();
          });
        })
        .length;
    }
  }
}
</script>

<style scoped>
  .ho-accordion-item header { transition: background-color 0.3s ease; }
  .badge {
    @apply text-white bg-magenta !important;
    min-width: 6rem;
  }
  .opened .badge {
    @apply bg-white text-magenta !important;
  }
  .arrow { transition: transform 0.3s ease, color 0.3s ease; }
  .opened header {
    @apply bg-magenta text-white !important;
  }
  .opened .arrow {
    transform: rotate(90deg);
    @apply text-white !important;
  }
  .fade-enter-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
  .activity-group .activity:last-child {
    margin-bottom: 0 !important;
  }
</style>