<template>
  <section class="ho-accordion">
    <ho-accordion-item
      v-for="item in itemsData"
      :item="item"
      @accordion:open="openItem(item)"
      :key="item.id"></ho-accordion-item>
  </section>
</template>

<script>
import HoAccordionItem from './ho-accordion-item.vue';

export default {
  name: 'ho-accordion',
  components: {
    HoAccordionItem
  },
  props: {
    items: Array
  },
  data() {
    return {
      itemsData: []
    };
  },
  methods: {
    openItem(item) {
      const _item = { ...item };
      if (typeof item.opened === 'undefined') this.itemsData.map((item, idx) => this.$set(this.itemsData[idx], 'opened', false));
      this.itemsData.map(item => item.opened = false);
      if (_item.opened !== true) item.opened = true;
    }
  },
  watch: {
    items() {
      this.itemsData = this.items.map(item => ({
        ...item,
        opened: false
      }));
    }
  }
}
</script>

<style scoped>

</style>