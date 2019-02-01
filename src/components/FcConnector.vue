<template>
  <div
    :draggable="store.isEditable()"
    :class="[{[flowchartConstants.hoverClass]:underMouse},flowchartConstants.connectorClass]"
    v-on="listenersComputed"
  />
</template>
<script>
import flowchartConstants from '@/config/flowchart'
export default {
  props: {
    connector: {
      type: Object,
      default: () => {
        return {}
      }
    },
    store: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      underMouse: false,
      flowchartConstants: flowchartConstants,
      offsetWidth: 0,
      offsetHeight: 0
    }
  },
  computed: {
    listenersComputed () {
      if (this.store.isEditable()) {
        return {
          dragstart: this.handleDragstart,
          drag: this.handleDragging,
          dragend: this.handleDragend,
          mouseenter: this.handleMouseenter,
          mouseleave: this.handleMouseleave
        }
      } else {
        return {}
      }
    }
  },
  mounted () {
    this.offsetWidth = this.$el.offsetWidth
    this.offsetHeight = this.$el.offsetHeight
    this.updatePosition()
  },
  methods: {
    handleDragstart (event) {
      console.log('connector Dragstart:', event)
      this.$emit('connector-dragstart', this.connector)
    },
    handleDragging () {
    },
    handleDragend (event) {
      console.log('connector Dragend:', event)
      this.$emit('connector-dragend', event)
    },
    handleMouseenter () {
      this.underMouse = true
    },
    handleMouseleave () {
      this.underMouse = false
    },
    getCoords () {
      let element = this.$el
      if (!element) {
        return {x: 0, y: 0}
      }
      let connectorElementBox = element.getBoundingClientRect()
      let coords = {
        x: connectorElementBox.left - this.store.state.canvasOffset.left,
        y: connectorElementBox.top - this.store.state.canvasOffset.top
      }
      coords = {
        x: Math.round(coords.x + this.offsetWidth / 2),
        y: Math.round(coords.y + this.offsetHeight / 2)
      }
      return coords
    },
    updatePosition () {
      let coords = this.getCoords()
      this.store.commit('UPDATE_CONNECTOR', {
        'connectorId': this.connector.id,
        'x': coords.x,
        'y': coords.y
      })
    }
  }
}
</script>
