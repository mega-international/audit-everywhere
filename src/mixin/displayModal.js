import AppModal from '@/components/layout/modal/app-modal.vue';

export default {
  methods: {
    displayModal({ name = 'app-modal', text }) {
      this.$modal.show(AppModal, {
        text
      }, {
        name,
        width: "75%",
        height: "25%",
      });
    },
    hideModal(name = 'app-modal') {
      this.$modal.hide(name);
    },
    modalAction(e) {}
  },
  created() {
    document.addEventListener('modal-action', this.modalAction);
  },
  beforeDestroy() {
    document.removeEventListener('modal-action', this.modalAction);
  }
};
