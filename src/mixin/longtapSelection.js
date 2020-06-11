import { mapState } from 'vuex';
export default {
  data() {
    return {
      touchTimeout: [],
      selectable: true,
    };
  },
  computed: {
    ...mapState({ deleteMode: state => state.audit.deleteMode }),
  },
  methods: {
    longtapHandler(item, entity = '') {
      return (event) => {
        if (this.isValidated) return;
        // Prevent opening context menu on selection
        window.oncontextmenu = function(event) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        };
        this.selectable = true;
        // Wait for long tap
        const timeout = setTimeout(() => {
          this.selectItem(item, entity);
        }, 600);
        this.touchTimeout.push(timeout);
      }
    },
    selectItem(idx, entity = '') {
      if (!this.selectable) return;
      this.$store.commit('setDeleteMode', true);
      this.updateSelected(idx, entity);
      // window.navigator.vibrate(50);
      this.resetTimer();
    },
    updateSelected(idx, entity) {},
    resetTimer() {
      if (this.deleteMode) return;
      window.oncontextmenu = function() { return true; };
    },
    handleScroll() {
      this.touchTimeout.forEach(timeout => {
        clearTimeout(timeout)
      });
      this.selectable = false;
    },
    handleScrollEnd() {
      this.selectable = true;
    },
    clearSelected() {

    },
    getOffsetPosition() {
      const supportPageOffset = window.pageXOffset !== undefined;
      const isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

      const x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
      const y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
      return { x, y };
    }
  }
};
