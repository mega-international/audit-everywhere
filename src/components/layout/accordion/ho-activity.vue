<template>
  <router-link
    :to="{ name: 'ActivityDetail', params: { id: $route.params.id, activityId: activity.id } }"
    tag="section"
    v-if="activity"
    class="activity-group bg-white rounded-lg shadow outline-none hover:bg-lightgrey focus:bg-lightgrey">
    <div class="activity flex justify-between items-center px-3 py-4">
      <h2 class="text-sm">{{ activityData.name }}</h2>
      <ma-icon v-if="isValidated" class="text-gray-500 validated" icon="check-circle" iconset="activity"></ma-icon>
    </div>
    <ma-iconset iconset="activity">
      <g id="check-circle"><path id="Path_20477" class="st0" d="M7.8 10.3l-1.2 1.3 4 4 8.9-8.9-1.3-1.3-7.7 7.7-2.7-2.8zM18.6 12c0 4-3.2 7.2-7.2 7.2S4.2 16 4.2 12s3.2-7.2 7.2-7.2c.7 0 1.3.1 2 .3l1.4-1.4c-1.1-.4-2.2-.6-3.4-.6-4.9 0-8.9 4-8.9 8.9s4 8.9 8.9 8.9 8.9-4 8.9-8.9h-1.7z"/></g>
    </ma-iconset>
  </router-link>
</template>

<script>
import MaIcon from '@/components/icon/ma-icon.vue';
import MaIconset from '@/components/icon/ma-iconset.vue';

import { getDB } from '@/assets/js/idbQl.js';
export default {
  name: 'ho-activity',
  components: {
    MaIcon,
    MaIconset
  },
  props: {
    activity: Object
  },
  async mounted() {
    const idb = await getDB();
    this.activityData = await idb.getFromIndex('activity', 'id', this.activity.id);
  },
  data() {
    return {
      activityData: {},
      validatedStatus: window.config.validatedStatus,
    };
  },
  computed: {
    isValidated() {
      return this.validatedStatus.split('|').some(validatedStatus => {
        if (!this.activityData.activityStatus) return false;
        return this.activityData.activityStatus.toLowerCase() == validatedStatus.toLowerCase();
      });
    }
  }
}
</script>

<style scoped>
  .validated { @apply text-green !important; }
  .activity-group { transition: background-color 0.3s ease; }
  .activity-group:hover { cursor: pointer; }
</style>
