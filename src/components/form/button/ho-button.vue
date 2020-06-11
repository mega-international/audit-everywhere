<template>
  <button class="ha-button bg-magenta rounded-full text-white p-3 outline-none" :type="type"><slot></slot></button>
</template>

<script>
  export default {
    name: "ha-button",
    props: {
      ripple: {
        type: Boolean,
        default: true
      },
      type: {
        type: String,
        default: "submit"
      }
    }
  }
</script>

<style scoped>
 .ha-button:focus {
   @apply shadow-input;
 }
</style>