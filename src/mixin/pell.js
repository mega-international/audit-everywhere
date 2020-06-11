import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({ hideFooter: state => state.audit.hideFooter }),
  },
  methods: {
    hideButtonOnFucus(ref = 'description') {
      this.$store.commit('setHideFooter', false);
      if (this.$refs[ref] && this.$refs[ref].pell) {
        const editor = this.$refs[ref].pell.querySelector('.pell-content');
        editor.addEventListener('focus', () => {
          this.$store.commit('setHideFooter', true);
        });
        editor.addEventListener('blur', () => {
          this.$store.commit('setHideFooter', false);
        });
      }
    }
  }
};