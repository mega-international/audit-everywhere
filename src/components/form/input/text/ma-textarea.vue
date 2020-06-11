<template>
  <div class="ho-textarea form__group">
    <textarea
      class="form__field"
      :rows="rows"
      ref="textarea"
      :name="name"
      :placeholder="placeholder"
      :value="computedValue"
      :disabled="disabled"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
      @keydown="autosize"
      @input="$emit('input', $event.target.value)"
      ></textarea>
    <label :class="activeClass" class="form__label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: 'ma-textarea',
  props: {
    label: String,
    rows: {
      type: String,
      default: '3'
    },
    name: String,
    placeholder: String,
    value: [ String, Number ],
    disabled: Boolean,
    error: Boolean,
    errorMessage: String,
    icon: String,
    iconset: String
  },
  data() {
    return {
      inputValue: this.value,
      timeout: null
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
  methods: {
    autosize(e) {
      clearTimeout(this.timeout);
      const el = e.target;
      this.timeout = setTimeout(() => {
        el.style.cssText = 'height:auto; padding:0';
        el.style.cssText = `height: ${el.scrollHeight + 16}px`;
      }, 0);
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
}
</script>

<style scoped>
.form__group {
  position: relative;
  padding: 15px 0 0;
  margin-top: 10px;
}

.form__field {
  font-family: inherit;
  width: 100%;
  height: auto;
  border: 0;
  border-bottom: 1px solid #d2d2d2;
  outline: 0;
  @apply text-base !important;
  color: #212121;
  padding: 7px 0;
  background: transparent;
  transition: border-color 0.2s;
}

.form__field::placeholder {
  color: transparent;
}

label,
.form__field:focus ~ .form__label {
  position: absolute;
  top: 8px;
  display: block;
  will-change: transform;

  transition: 0.2s ease all; 
  -moz-transition: 0.2s ease all; 
  -webkit-transition: 0.2s ease all;
  white-space: nowrap;
  @apply text-base text-darkblue font-normal;
}

.form__field:focus ~ label,
.form__field:valid ~ .ho-textarea label,
.ho-textarea .active {
  font-size: 0.75rem;
  @apply text-green;
  transform: translateY(-20px);
}
textarea:-webkit-autofill ~ label {
  font-size: 0.75rem;
  @apply text-green;
  transform: translateY(-20px);
}
.form__field:invalid ~ label {
  font-size: 0.75rem;
  transform: translateY(-20px);
}

.form__field:focus ~ .form__label {
  @apply text-green;
  font-size: 0.75rem;
}

.form__field:focus {
  padding-bottom: 6px;
  border-bottom: 2px solid #009788;
}

.form__field[disabled] label { @apply text-gray-600 !important; }
</style>