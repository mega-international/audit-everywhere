<template>
  <section class="home">
    <section>
      <ho-card v-for="(audit, idx) in audits" :key="idx" :audit="audit"></ho-card>
    </section>
  </section>
</template>

<script>
// @ is an alias to /src
import HoCard from '@/components/layout/card/ho-card.vue';
import { mapState } from 'vuex';
export default {
  name: 'Home',
  components: {
    HoCard
  },
  async mounted() {
    await this.$store.dispatch('getAllData', {});
    this.$store.dispatch('hideSpinner');
  },
  computed: {
    ...mapState({ audits: state => state.audit.audits })
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
