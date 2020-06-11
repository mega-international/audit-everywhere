<template>
  <router-link
    v-if="audit"
    :to="{ name: 'AuditDetail', params: { id: audit.id } }"
    class="ho-card mt-5 bg-white px-3 py-5 flex justify-between rounded-lg shadow outline-none hover:bg-lightgrey focus:bg-lightgrey">
    <div class="w-3/4">
      <h1 class="title text-sm font-semibold truncate">{{ audit.name }}</h1>
      <span class="dates text-xs text-gray-700">{{ audit.missionPlannedBeginDate | dateShort }} - {{ audit.missionPlannedEndDate | dateShort }}</span>
    </div>
    <div class="progress flex flex-col w-1/4 text-right text-sm text-gray-700">
      <span>{{ $t('text.progress') }}</span>
      <span class="mt-1">{{ validatedActivities }} / {{ audit.auditActivity.length }}</span>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'ho-card',
  props: {
    audit: {
      type: Object
    }
  },
  data() {
    return {
      validatedStatus: window.config.validatedStatus,
    };
  },
  computed: {
    validatedActivities: function() {
      return this.audit.auditActivity
        .filter(activity => {
          return this.validatedStatus.split('|').some(validatedStatus => {
            if (!activity.activityStatus) return false;
            return activity.activityStatus.toLowerCase() == validatedStatus.toLowerCase()
          });
        })
        .length
    }
  }
}
</script>

<style scoped>
.ho-card { transition: background-color 0.3s ease; }
</style>