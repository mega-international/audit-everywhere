<template>
  <section class="AuditDetail px-3">
    <ho-accordion :items="activities"></ho-accordion>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import HoAccordion from '@/components/layout/accordion/ho-accordion.vue';

export default {
  name: 'AuditDetail',
  components: {
    HoAccordion,
  },
  async mounted() {
    this.$store.dispatch('showSpinner');
    const auditId = this.$route.params.id;
    await this.$store.dispatch('getAudit', auditId);

    if (this.audit) {
      this.$store.dispatch('setOutletTitle', this.audit.name);
      this.$store.dispatch('hideSpinner');
    }
  },
  data() {
    return {
      BASE_URL: process.env.BASE_URL
    };
  },
  computed: {
    ...mapState({ audit: state => state.audit.audit }),
    activities() {
      if (!this.audit || !this.audit.auditActivity || !this.audit.auditTheme) return [];
      const themed = this.audit.auditTheme.filter(theme => theme.auditActivity_ActivityWithTheme.length);
      const unthemed = this.audit.auditActivity.filter(activity => !activity.auditTheme_ActivityTheme.length);
      if (unthemed.length) {
        const unthemedGroup = {
          id: Date.now(),
          name: this.$t('text.unthemed'),
          auditActivity_ActivityWithTheme: unthemed
        };
        return [ ...themed, unthemedGroup ];
      }
      return themed;
    }
  },
  methods: {
    groupBy(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    }
  }
}
</script>

<style scoped>

</style>