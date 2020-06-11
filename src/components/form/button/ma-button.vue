<template>
  <button class="ma-button" :class="{ 'ripple': ripple }" :type="type"><slot></slot></button>
</template>

<script>
  export default {
    name: "ma-button",
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
  .ma-button {
    background-color: rgba(var(--ma-button-background, 247, 250, 252, 1));
    color: rgba(var(--ma-button-color, 0, 0, 0, 1));
    border: none;
    border-radius: 5px;
    padding: 0.25rem 1.15rem;
    line-height: 1.65rem;
    transition: all 0.3s ease;
    font-size: inherit;
    font-family: inherit;
    cursor: pointer;
    box-shadow: var(--ma-button-shadow, 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24));
  }
  .ma-button:focus {
    outline: none;
  }
  .ma-button:focus,
  .ma-button:hover {
    background-color: rgba(var(--ma-button-background-hover, 235, 235, 235, 0.8));
    color: rgba(var(--ma-button-color-hover, 0, 0, 0, 1));
    box-shadow: var(--ma-button-shadow-hover, 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23));
  }

  /* Primary button */
  .ma-button.primary {
    background-color: rgba(var(--ma-button-bg-primary, 20, 141, 160, 1));
    color: rgba(var(--ma-button-color-primary, 255, 255, 255, 1));
  }
  .ma-button.primary:hover {
    background-color: rgba(var(--ma-button-bg-primary-hover, 20, 141, 160, 0.8));
  }

  /* Secondary button */
  .ma-button.secondary {
    background-color: rgba(var(--ma-button-bg-secondary, 90, 98, 104, 1));
    color: rgba(var(--ma-button-color-secondary, 255, 255, 255, 1));
  }
  .ma-button.secondary:hover {
    background-color: rgba(var(--ma-button-bg-secondary-hover, 90, 98, 104, 0.8));
  }

  /* White button */
  .ma-button.white {
    background-color: rgba(var(--ma-button-bg-white, 255, 255, 255, 1));
    color: rgba(var(--ma-button-color-white, 1, 1, 1, 1));
  }

  /* Danger button */
  .ma-button.danger {
    background-color: rgba(var(--ma-button-bg-danger, 248, 66, 66, 1));
    color: rgba(var(--ma-button-color-danger, 255, 255, 255, 1));
  }

  /*Create ripple effec*/
  .ripple {
    position: relative;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
  }
  .ripple:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(var(--ma-ripple-color, 255, 255, 255, 1)) 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform 0.5s, opacity 1s;
  }
  .ripple:active:after {
    transform: scale(0, 0);
    opacity: 0.3;
    transition: 0s;
  }
</style>