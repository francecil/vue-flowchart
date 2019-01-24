<template>
  <g>
    <path
      :id="'fc-edge-path-'+index"
      :class="classComputed"
      :d="dComputed"
      :marker-end="'url(#'+(modelservice.edges.isSelected(edge) ? arrowDefId+'-selected' : arrowDefId)+')'"
      @mousedown="handleMouseDown"
      @dblclick="handleDoubleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick" />
  </g>
</template>
<script>
import flowchartConstants from '@/config/flowchart'
import EdgedrawingService from '@/service/edgedrawing'
import { mapGetters } from 'vuex'
export default {
  props: {
    index: {
      type: Number,
      default: 0
    },
    edge: {
      type: Object,
      default: () => {
        return {}
      }
    },
    selected: {
      type: Boolean,
      default: false
    },
    arrowDefId: {
      type: String,
      default: ''
    },
    edgeStyle: {
      type: String,
      default: ''
    },
    modelservice: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      underMouse: false,
      flowchartConstants: flowchartConstants
    }
  },
  computed: {
    ...mapGetters('flow', ['getConnector']),
    dComputed () {
      let source = this.getConnector(this.edge.source) || {x: 0, y: 0}
      let destination = this.getConnector(this.edge.destination) || {x: 0, y: 0}
      return EdgedrawingService.getEdgeDAttribute(source, destination, this.edgeStyle)
    },
    classComputed () {
      let classObj = {}
      classObj[flowchartConstants.edgeClass] = true
      if (this.selected) {
        classObj[flowchartConstants.selectedClass] = true
      } else if (this.underMouse) {
        classObj[flowchartConstants.hoverClass] = true
      } else if (this.edge.active) {
        classObj[flowchartConstants.activeClass] = true
      }
      return classObj
    }
  },
  created () {

  },
  mounted () {
  },
  methods: {
    handleMouseDown () {
      event.stopPropagation()
    },

    handleClick () {
      console.log('edgeClick')
      this.modelservice.edges.handleEdgeMouseClick(this.edge, event.ctrlKey)
      // Don't let the chart handle the mouse down.
      event.stopPropagation()
      event.preventDefault()
    },
    handleMouseEnter () {
      this.underMouse = true
      console.log('handleMouseEnter')
      this.$emit('edge-mouseenter', this.index, true)
    },
    handleMouseLeave () {
      this.underMouse = false
      console.log('handleMouseLeave')
      this.$emit('edge-mouseleave', this.index, false)
    },
    handleDoubleClick () {
      console.log('edgeDoubleClick')
      this.$emit('edge-dblclick', this.edge)
    }
  }
}
</script>
<style>
.fc-edge {
  stroke: gray;
  stroke-width: 4;
  transition: stroke-width 0.2s;
  fill: transparent;
}

.fc-edge.fc-hover {
  stroke: gray;
  stroke-width: 6;
  fill: transparent;
}

.fc-edge.fc-selected {
  stroke: red;
  stroke-width: 4;
  fill: transparent;
}
.fc-edge.fc-active {
  animation: dash 3s linear infinite;
  stroke-dasharray: 20;
}

.fc-edge.fc-dragging {
  pointer-events: none;
}

.edge-endpoint {
  fill: gray;
}
</style>
