<template>
  <section class="relative h-full px-6 py-6 bg-white rounded-lg w-full lg:w-1/3">
    <header>
      <h1 class="text-darkblue font-semibold text-lg">{{ text.title }}</h1>
    </header>
    <footer class="absolute bottom-0 inset-x-0 pb-6 pr-6 mt-6 flex justify-end">
      <button
        class="w-20 text-center mr-3 font-semibold text-gray-700 rounded-lg bg-gray-400 px-3 py-2 outline-none"
        @click="action('unsave')"
      >{{ text.cancel }}</button>
      <button
        class="w-20 text-center font-semibold text-white rounded-lg bg-darkblue px-3 py-2 outline-none"
        @click="action('save')"
      >{{ text.validate }}</button>
    </footer>
  </section>
</template>

<script>
export default {
  name: "app-modal",
  props: {
    text: Object
  },
  methods: {
    action(action) {
      const event = new CustomEvent(`modal-action`, { detail: action });
      document.dispatchEvent(event);
    }
  }
};
</script>

<style scoped>
</style>