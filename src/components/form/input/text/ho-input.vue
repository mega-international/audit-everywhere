<template>
  <section
    class="ho-input rounded-full"
    :class="{
      passwordReveal: passwordReveal ? 'password-reveal' : '',
      error: error
    }"
    :disabled="disabled">
    <input
      class="block w-full py-3 pl-4 rounded-full shadow-input"
      ref="input"
      :type="type"
      :step="step"
      :name="name"
      :placeholder="placeholder"
      :value="computedValue"
      :disabled="disabled"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      @input="$emit('input', $event.target.value)">
    <label class="text-darkblue opacity-25 font-medium" :class="activeClass">{{ label }}</label>
    <span class="error-msg" hidden>{{ errorMessage }}</span>
    <span v-if="passwordReveal" class="icon-button"><button type="button" @click="handleClick"><ma-icon :icon="icon" :iconset="iconset"></ma-icon></button></span>
    <span class="icon absolute"><ma-icon :icon="inputIcon" :iconset="iconset"></ma-icon></span>
  </section>
</template>

<script>
import MaIcon from '../../../icon/ma-icon.vue';
export default {
  name: "ho-input",
  components: {
    MaIcon
  },
  props: {
    label: String,
    type: {
      type: String,
      default: 'text'
    },
    step: {
      type: [ String, Number ],
      default: '0.0000001'
    },
    name: String,
    placeholder: String,
    value: [ String, Number ],
    disabled: Boolean,
    error: Boolean,
    errorMessage: String,
    passwordReveal: Boolean,
    inputIcon: String,
    iconset: String
  },
  data() {
    return {
      inputValue: this.value,
      icon: 'eye-close',
    }
  },
  computed: {
    computedValue() {
      return this.inputValue
    },
    activeClass() {
      return ( this.inputValue !== undefined && this.inputValue !== null && this.inputValue.toString().trim().length > 0 ) ? 'active' : '';
    }
  },
  watch: {
    /**
     * When v-model is changed:
     *   1. Set internal value.
     */
    value(value) {
      this.inputValue = value
    }
  },
  methods: {
    handleClick(e) {
      if (this.type == 'password') {
        this.$refs.input.type = this.$refs.input.type == 'password' ? 'text' : 'password';
        this.icon = this.icon == 'eye-close' ? 'eye' : 'eye-close';
        // Focusing back the input after changing the type
        this.$el.querySelector('input').focus();
      }
    }
  }
};
</script>

<style scoped>
  .ho-input {
    position: relative;
    margin-top: 0.7rem;
  }
  .ho-input label {
    color: var(--ma-dark-grey, #4c515d);
    background-color: transparent;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    top: 0.75rem;
    left: 1.3rem;
    will-change: transform;
    transition: 0.2s ease all;
    -moz-transition: 0.2s ease all;
    -webkit-transition: 0.2s ease all;
    white-space: nowrap;
  }
  .ho-input .icon {
    position: absolute;
    @apply text-green;
    top: 0.75rem;
    right: 1.3rem;
  }
  input:focus { outline: none; }
  input:focus ~ label,
  input:valid ~ .ho-input label,
  .ho-input .active {
    font-size: 0.8rem;
    transform: translateY(-1.3rem);
    @apply text-green !important;
    opacity: 0.8 !important;
  }
  input:-webkit-autofill ~ label {
    font-size: 0.8rem;
    transform: translateY(-1.3rem);
    @apply text-green !important;
    opacity: 0.8 !important;
  }
  input:invalid ~ label {
    font-size: 0.8rem;
    transform: translateY(-1.3rem);
  }
</style>
