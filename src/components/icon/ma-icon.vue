<template>
  <span class="ma-icon"><i></i></span>
</template>

<script>
  export default {
    name: 'ma-icon',
    props: {
      size: {
        type: String,
        default: "24"
      },
      icon: {
        type: String,
        required: true
      },
      iconset: {
        type: String,
        default: 'iconset'
      }
    },
    mounted() {
      const iconset = document.body.querySelector(`#${this.iconset}`);
      if (!iconset) return console.error('[ma-icon] Iconset not found in the document')

      let icon = iconset.querySelector("#" + this.icon);
      if (!icon) return console.error('[ma-icon] Icon not found in the document');

      this.$el.querySelector("i").innerHTML = "";
      this._cloneIcon(icon);
    },
    methods: {
      _cloneIcon(icon) {
        let content = icon.cloneNode(true);
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
         */
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // Add iron-icon class in order to add control over color
        svg.classList.add("iron-icon");
        icon.classList.add("iron-icon");
        let viewBox = content.getAttribute("viewBox") || `0 0 ${this.size} ${this.size}`;
        let cssText = "pointer-events: none; display: block; width: 100%; height: 100%;";
        svg.setAttribute("viewBox", viewBox);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.setAttribute("focusable", "false");
        svg.style.cssText = cssText;
        let clonedIcon = icon.cloneNode(true);
        svg.appendChild(clonedIcon);
        const i = this.$el.querySelector("i");

        i.style.height = this.size;
        i.style.width = this.size;

        i.appendChild(svg);
      }
    },
    watch: {
      size: function(size) {
        this.$el.querySelector("i").style.height = size;
        this.$el.querySelector("i").style.width = size;
      },
      icon: function() {
        const iconset = document.body.querySelector(`#${this.iconset}`);
        let icon = iconset.querySelector("#" + this.icon);

        if (!icon) return;
        this.$el.querySelector("i").innerHTML = "";
        this._cloneIcon(icon);
      }
    }
  };
</script>

<style scoped>
  .ma-icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 0 5px;
    box-sizing: content-box;
    vertical-align: sub;
  }
  i {
    display: flex;
    justify-content: center;
    align-items: center;
    font-style: normal;
    height: 100%;
    width: 100%;
    min-width: 100%;
  }
</style>
