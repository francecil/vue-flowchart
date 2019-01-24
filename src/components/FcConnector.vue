<template>
  <div
    :draggable="!dropTargetId"
    :class="[{[flowchartConstants.hoverClass]:underMouse},flowchartConstants.connectorClass]"
    v-on="listenersComputed"
  />
</template>
<script>
import flowchartConstants from '@/config/flowchart'
import { mapMutations, mapState } from 'vuex'
export default {
  props: {
    connector: {
      type: Object,
      default: () => {
        return {}
      }
    },
    modelservice: {
      type: Object,
      default: () => {
        return {}
      }
    },

    dropTargetId: {
      type: [String, Number],
      default: null
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
    ...mapState('flow', ['canvas']),
    listenersComputed () {
      if (!this.dropTargetId) {
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
    this.modelservice.connectors.setHtmlElement(this.connector.id, this.$el)
    this.offsetWidth = this.$el.offsetWidth
    this.offsetHeight = this.$el.offsetHeight
  },
  methods: {
    ...mapMutations('flow', [
      'UPDATE_CONNECTOR'
    ]),
    handleDragstart () {
      console.log('connector Dragstart:', event)
      this.$emit('connector-dragstart', this.connector)
    },
    handleDragging () {
    },
    handleDragend () {
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
        x: connectorElementBox.left - this.canvas.left,
        y: connectorElementBox.top - this.canvas.top
      }
      coords = {
        x: Math.round(coords.x + this.offsetWidth / 2),
        y: Math.round(coords.y + this.offsetHeight / 2)
      }
      return coords
    },
    updatePosition () {
      let coords = this.getCoords()
      this.UPDATE_CONNECTOR({
        'connectorId': this.connector.id,
        'x': coords.x,
        'y': coords.y
      })
    }
  }
}
</script>
