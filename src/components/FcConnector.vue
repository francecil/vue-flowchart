<template>
  <div
    :draggable="store.isEditable()"
    :class="[{[flowchartConstants.hoverClass]:underMouse},flowchartConstants.connectorClass]"
    @dragstart.prevent.stop="handleDragstart"
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
    connectors: {
      type: Array,
      default: () => {
        return []
      }
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
          dragstart: this.handleDragstart,
          drag: this.handleDragging,
          dragend: this.handleDragend,
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
      console.log('connector Dragstart:', event, this.edgeDraggingService)
      this.edgeDraggingService.dragstart(event, this.connectors[0])
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
      for (let connector of this.connectors) {
        this.store.commit('UPDATE_CONNECTOR', {
          'connectorId': connector.id,
          'x': coords.x,
          'y': coords.y
        })
      }
    }
  }
}
</script>
