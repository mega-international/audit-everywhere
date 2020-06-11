<template>
  <section class="ma-checkbox" :position="position">
    <label :for="id" class="pure-material-checkbox">
      <input
        type="checkbox"
        :id="id"
        :name="name"
        :checked="value"
        :disabled="disabled"
        @input="$emit('input', $event.target.checked)">
      <span><slot></slot></span>
    </label>
  </section>
</template>

<script>
  export default {
    name: 'ma-checkbox',
    props: {
      id: String,
      name: String,
      value: {
        type: Boolean,
        default: false
      },
      disabled: Boolean,
      position: {
        type: String,
        default: 'left'
      }
    },
    data() {
      return {
        checkedValue: this.value,
      }
    },
    computed: {
      computedValue() {
        return this.checkedValue;
      },
    },
    watch: {
      value(value) {
        this.checkedValue = value;
      }
    },
  }
</script>

<style scoped>
  .ma-checkbox { display: inline-block; }
  .ma-checkbox:focus { outline: none; }
  .pure-material-checkbox {
    z-index: 0;
    position: relative;
    display: inline-block;
    color: rgba(49, 172, 110, 0.87);
    line-height: 1.5;
  }
  /* Input */
  .pure-material-checkbox > input {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    z-index: -1;
    position: absolute;
    top: -7px;
    display: block;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    background-color: rgba(49, 172, 110, 0.6);
    box-shadow: none;
    outline: none;
    opacity: 0;
    transform: scale(1);
    pointer-events: none;
    transition: opacity 0.3s, transform 0.2s;
  }
  [position="left"] .pure-material-checkbox > input {
    left: -11px;
  }
  [position="right"] .pure-material-checkbox > input {
    right: 5px;
  }

  /* Span */
  .pure-material-checkbox > span {
    display: inline-block;
    width: 100%;
    cursor: pointer;
    margin-right: 1rem;
    /* Prevent outer style to interfer with the checkmark */
    text-align: left !important;
  }

  /* Box */
  [position="left"] .pure-material-checkbox > span::before {
    content: "";
    display: inline-block;
    box-sizing: border-box;
    margin: 3px 11px 3px 1px;
    border: solid 2px; /* Safari */
    border-color: rgba(0, 0, 0, 0.6);
    border-radius: 2px;
    width: 16px;
    height: 16px;
    vertical-align: bottom;
    transition: border-color 0.2s, background-color 0.2s;
  }
  [position="right"] .pure-material-checkbox > span::before {
    content: "";
    display: block;
    position: absolute;
    top: 5px;
    right: 23px;
    width: 8px;
    height: 4px;
    border: solid 2px transparent;
    border-right: none;
    border-top: none;
    transform: translate(3px, 4px) rotate(-45deg);
  }

  /* Checkmark */
  [position="left"] .pure-material-checkbox > span::after {
    content: "";
    display: block;
    position: absolute;
    top: 4px;
    left: 1px;
    width: 10px;
    height: 6px;
    border: solid 2px transparent;
    border-right: none;
    border-top: none;
    transform: translate(3px, 4px) rotate(-45deg);
  }
  [position="right"] .pure-material-checkbox > span::after {
    content: "";
    display: inline-block;
    box-sizing: border-box;
    margin: 3px 1px 3px 11px;
    border: solid 2px; /* Safari */
    border-color: rgba(49, 172, 110, 0.6);
    border-radius: 2px;
    width: 16px;
    height: 16px;
    vertical-align: bottom;
    transition: border-color 0.2s, background-color 0.2s;
  }

  /* Checked, Indeterminate */
  .pure-material-checkbox > input:checked,
  .pure-material-checkbox > input:indeterminate {
    background-color: rgb(49, 172, 110);
  }

  [position="left"] .pure-material-checkbox > input:checked + span::before,
  [position="left"] .pure-material-checkbox > input:indeterminate + span::before {
    border-color: rgb(49, 172, 110);
    background-color: rgb(49, 172, 110);
  }
  [position="right"] .pure-material-checkbox > input:checked + span::after,
  [position="right"] .pure-material-checkbox > input:indeterminate + span::after {
    border-color: rgb(49, 172, 110);
    background-color: rgb(49, 172, 110);
  }

  [position="left"] .pure-material-checkbox > input:checked + span::after,
  [position="left"] .pure-material-checkbox > input:indeterminate + span::after {
    border-color: rgb(var(--ab-checkmark-color, 255, 255, 255));
  }
  [position="right"] .pure-material-checkbox > input:checked + span::before,
  [position="right"] .pure-material-checkbox > input:indeterminate + span::before {
    border-color: rgb(var(--ab-checkmark-color, 255, 255, 255));
  }

  [position="left"] .pure-material-checkbox > input:indeterminate + span::after {
    border-left: none;
    transform: translate(4px, 3px);
  }
  [position="right"] .pure-material-checkbox > input:indeterminate + span::before {
    border-left: none;
    transform: translate(4px, 3px);
  }

  /* Hover, Focus */
  .pure-material-checkbox:hover > input {
    opacity: 0.04;
  }

  .pure-material-checkbox > input:focus {
    opacity: 0.12;
  }

  .pure-material-checkbox:hover > input:focus {
    opacity: 0.16;
  }

  /* Active */
  .pure-material-checkbox > input:active {
    opacity: 1;
    transform: scale(0);
    transition: transform 0s, opacity 0s;
  }

  [position="left"] .pure-material-checkbox > input:active + span::before {
    border-color: rgb(49, 172, 110);
  }
  [position="right"] .pure-material-checkbox > input:active + span::after {
    border-color: rgb(49, 172, 110);
  }

  [position="left"] .pure-material-checkbox > input:checked:active + span::before {
    border-color: transparent;
    background-color: rgba(49, 172, 110, 0.6);
  }
  [position="right"] .pure-material-checkbox > input:checked:active + span::after {
    border-color: transparent;
    background-color: rgba(49, 172, 110, 0.6);
  }

  /* Disabled */
  .pure-material-checkbox > input:disabled {
    opacity: 0;
  }

  .pure-material-checkbox > input:disabled + span {
    color: rgba(49, 172, 110, 0.38);
    cursor: initial;
  }

  [position="left"] .pure-material-checkbox > input:disabled + span::before {
    border-color: currentColor;
  }
  [position="right"] .pure-material-checkbox > input:disabled + span::after {
    border-color: currentColor;
  }

  [position="left"] .pure-material-checkbox > input:checked:disabled + span::before,
  [position="left"] .pure-material-checkbox > input:indeterminate:disabled + span::before {
    border-color: transparent;
    background-color: currentColor;
  }
  [position="right"] .pure-material-checkbox > input:checked:disabled + span::before,
  [position="right"] .pure-material-checkbox > input:indeterminate:disabled + span::before {
    border-color: transparent;
    background-color: currentColor;
  }
</style>