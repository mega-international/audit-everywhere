<template>
  <section class="AuditList px-3">
    <section>
      <ho-card v-for="(audit, idx) in computedAudits" :key="idx" :audit="audit"></ho-card>
    </section>
  </section>
</template>

<script>
// @ is an alias to /src
import HoCard from '@/components/layout/card/ho-card.vue';
import { mapState } from 'vuex';
export default {
  name: 'AuditList',
  components: {
    HoCard
  },
  async mounted() {
    this.$store.dispatch('showSpinner');
    await this.$store.dispatch('getAllData');
    this.$store.dispatch('hideSpinner');
    this.$store.dispatch('setOutletSubTitle', this.$tc('text.audits', this.audits ? this.computedAudits.length : 0, { count: this.audits ? this.computedAudits.length : 0 }));
  },
  computed: {
    ...mapState({ audits: state => state.audit.audits }),
    computedAudits() {
      if (!this.audits) return [];
      return this.audits.filter(audit => audit.auditActivity.length > 0);
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
