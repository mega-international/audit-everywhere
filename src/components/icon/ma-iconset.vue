<template>
  <section :id="iconset" style="display: none;"><svg><defs><slot></slot></defs></svg></section>
</template>

<script>
  export default {
    name: 'ma-iconset',
    props: {
      iconset: {
        type: String,
        default: 'iconset'
      }
    }
  }
</script>

<style>
  .iron-icon {
    display: -webkit-inline-flex;
    display: inline-flex;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    position: relative;
    fill: currentcolor;
    stroke: none;
    width: 100%;
    height: 100%;
    display: block;
  }
</style>