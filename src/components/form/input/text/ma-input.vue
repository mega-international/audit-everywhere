<template>
  <section class="ma-input"
    :class="{
      passwordReveal: passwordReveal ? 'password-reveal' : '',
      rightIcon : rightIcon ? 'right-icon' : '',
      error: error
    }"
    :disabled="disabled">
    <input
      v-if="type != 'number'"
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
    <input
      v-else
      ref="input"
      :type="type"
      :step="step"
      :name="name"
      :placeholder="placeholder"
      :value="computedValue"
      :disabled="disabled"
      v-mask="'##########'"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      @input="$emit('input', $event.target.value)">
    <span class="bar"></span>
    <label :class="activeClass">{{ label }}</label>
    <span class="error-msg" hidden>{{ errorMessage }}</span>
    <span v-if="passwordReveal" class="icon-button"><button type="button" @click="handleClick"><ma-icon :icon="passwordIcon" :iconset="iconset"></ma-icon></button></span>
    <span v-if="!passwordReveal && icon" class="icon-button"><ma-icon :icon="icon" :iconset="iconset"></ma-icon></span>
  </section>
</template>

<script>
  import { mask } from 'vue-the-mask';
  import MaIcon from '../../../icon/ma-icon.vue';
  export default {
    name: "ma-input",
    directives: { mask },
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
      rightIcon: Boolean,
      errorMessage: String,
      passwordReveal: Boolean,
      icon: String,
      iconset: String
    },
    data() {
      return {
        inputValue: this.value,
        passwordIcon: 'eye-close',
      }
    },
    computed: {
      computedValue() {
        return this.inputValue
      },
      activeClass() {
        return ( this.inputValue !== undefined && this.inputValue !== null && this.inputValue.toString().trim().length > 0 ) ? 'active' : '';
      },

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
          this.passwordIcon = this.passwordIcon == 'eye-close' ? 'eye' : 'eye-close';
          // Focusing back the input after changing the type
          this.$el.querySelector('input').focus();
        }
      },
    }
  }
</script>

<style scoped>
  /* MD input */
  /* INPUT ------------------------------- */
  .ma-input {
    position: relative;
    margin-top: 0.7rem;
  }
  .right-icon input { @apply pr-12 !important; }
  input {
    color: var(--ma-dark-grey, #4c515d);
    border: none;
    border-bottom: 2px solid var(--ma-input-bar, #EBEFF2);
    /* font-size: 0.9rem; */
    font-family: var(--ma-font-regular);
    padding: 3px 0;
    display: block;
    width: 100%;
    background: transparent;
    box-sizing: border-box;
    text-align: inherit;
  }
  input:focus { outline:none; }
  input:disabled {
    color: #cecece;
  }


  .ma-input.align-right input {
    text-align: right;
  }
  /* LABEL ======================================= */
  .ma-input label {
    @apply text-base text-darkblue font-normal;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    top: 4px;
    will-change: transform;

    transition: 0.2s ease all; 
    -moz-transition: 0.2s ease all; 
    -webkit-transition: 0.2s ease all;
    white-space: nowrap;
  }
  .ma-input[disabled] label { @apply text-gray-400 !important; }
  .ma-input.mandatory label::after {
    display: inline-block;
    margin-left: 0.1rem;
    line-height: 1rem;
    font-size: 1rem;
    @apply text-darkgrey;
    content: '*';
    vertical-align: middle;
  }
  /* active state */
  .ma-input.mandatory input:focus ~ label::after, .ma-input.mandatory .active::after {
    color: var(--ma-red-color, #E00202);
  }

  input:focus ~ label,
  input:valid ~ .ma-input label,
  .ma-input .active {
    font-size: 0.75rem;
    @apply text-green;
    transform: translateY(-20px);
  }
  input:-webkit-autofill ~ label {
    font-size: 0.75rem;
    @apply text-green;
    transform: translateY(-20px);
  }
  input:invalid ~ label {
    font-size: 0.75rem;
    transform: translateY(-20px);
  }
  /* BOTTOM BARS ================================= */
  .bar {
    position: relative;
    display: block;
    width: 100%;
  }
  .bar:before, .bar:after {
    @apply bg-green;

    content: '';
    height: 2px;
    width: 0;
    bottom: 0px;
    position: absolute;
    transition: 0.2s ease all;
    -moz-transition: 0.2s ease all;
    -webkit-transition: 0.2s ease all;
  }
  .bar:before {
    left: 50%;
  }
  .bar:after {
    right: 50%;
  }
  /* active state */
  input:focus ~ .bar:before, input:focus ~ .bar:after {
    width: 50%;
  }

  /* active state */
  input:focus ~ .highlight {
    -webkit-animation:inputHighlighter 0.3s ease;
    -moz-animation:inputHighlighter 0.3s ease;
    animation:inputHighlighter 0.3s ease;
  }
  /* MD input */

  /* Error state */
  /* .error : input type text, input:invalid : input type email */
  .error input ~ .bar:before, .error input ~ .bar:after,
  .error ~ .bar:before, .error ~ .bar:after,
  input:invalid ~ .bar:before, input:invalid ~ .bar:after {
    width: 50%;
    background: var(--ma-red-color, #E00202);
  }


  /* Icon-button */
  .icon-button {
    position: absolute;  
    display: inline-block;
    top: 0;
    right: 0;
  }
  .icon-button button {
    background: transparent;
    border: none;
    display: inline-block;
    cursor: pointer;
  }
  .icon-button button:focus { outline: none; }
  .ma-icon { @apply text-green; }
  .password-reveal input { padding-right: 3em; }
</style>