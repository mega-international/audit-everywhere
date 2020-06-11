export default {
  data() {
    return {
      validatedStatus: window.config.validatedStatus,
      unvalidatedStatus: window.config.unvalidatedStatus
    };
  },
  computed: {
    isValidated() {
      if (!this.activity || !this.activity.id) return false;
      return this.validatedStatus.split('|').some(validatedStatus => {
        if (!this.activity.activityStatus) return false;
        return this.activity.activityStatus.toLowerCase() == validatedStatus.toLowerCase();
      });
    },
  }
};
