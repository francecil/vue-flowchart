<template>
  <div
    :class="[{[flowchartConstants.hoverClass]:underMouse},flowchartConstants.connectorClass]"
    v-on="listenersComputed"
  />
</template>
<script>
import flowchartConstants from '@/config/flowchart'
export default {
  props: {
    node: {
      type: Object,
      default: () => {
        return {}
      }
    },
    connector: {
      type: Object,
      default: () => {
        return {}
      }
    },
    type: {
      type: String,
      default: ''
    },
    store: {
      type: Object,
      default: () => {
        return {}
      }
    },
    edgeDraggingService: {
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
          mousedown: this.handleDragstart,
          mouseenter: this.handleMouseenter,
          mouseleave: this.handleMouseleave
        }
      } else {
        return {}
      }
    },
    nodeOffset () {
      return {
        x: this.node.x,
        y: this.node.y
      }
    },
    canvasOffset () {
      return this.store.state.canvasOffset
    }
  },
  watch: {
    nodeOffset: {
      deep: true,
      handler (val) {
        if (this.store.isEditable()) {
          this.updatePosition()
        }
      }
    },
    canvasOffset: {
      deep: true,
      handler (val) {
        if (this.store.isEditable()) {
          this.updatePosition()
        }
      }
    }
  },
  mounted () {
    this.offsetWidth = this.$el.offsetWidth
    this.offsetHeight = this.$el.offsetHeight
    if (this.store.isEditable()) {
      this.updatePosition()
    }
  },
  methods: {
    handleDragstart (event) {
      // event.preventDefault()
      event.stopPropagation()
      console.log('connector Dragstart:', event)
      this.edgeDraggingService.dragstart(event, this.connector, this.type)
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
        x: connectorElementBox.left - this.store.getCanvasOffsetRelativeLeft(),
        y: connectorElementBox.top - this.store.getCanvasOffsetRelativeTop()
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
