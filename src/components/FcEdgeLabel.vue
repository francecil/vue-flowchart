<template>
  <div
    :class="classComputed"
    :style="styleComputed"
    @mousedown="handleMouseDown"
    @dblclick="handleDoubleClick"
    @mouseover="handleMouseOver"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick">
    <div class="fc-edge-label-text">
      <div
        v-if="modelservice.isEditable()"
        class="fc-noselect fc-nodeedit"
        @click="handleEdit">
        #
      </div>
      <div
        v-if="modelservice.isEditable()"
        class="fc-noselect fc-nodedelete"
        @click="handleRemove">
        &times;
      </div>
      <span
        v-if="edge.label"
        :id="'fc-edge-label-'+index">{{ edge.label }}</span>
    </div>
  </div>
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
    modelservice: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      flowchartConstants: flowchartConstants
    }
  },
  computed: {
    ...mapGetters('flow', ['getConnector']),
    styleComputed () {
      let source = this.getConnector(this.edge.source) || {x: 0, y: 0}
      let destination = this.getConnector(this.edge.destination) || {x: 0, y: 0}
      let center = EdgedrawingService.getEdgeCenter(source, destination)
      return {
        top: center.y + 'px',
        left: center.x + 'px'
      }
    },
    classComputed () {
      let classObj = {}
      classObj['fc-noselect'] = true
      classObj[flowchartConstants.edgeLabelClass] = true
      if (this.modelservice.edges.isEdit(this.edge)) {
        classObj[flowchartConstants.editClass] = true
      } else if (this.modelservice.edges.isSelected(this.edge)) {
        classObj[flowchartConstants.selectedClass] = true
      } else if (this.edge === this.mouseOver) {
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
    handleMouseOver () {
      console.log('edgeMouseOver')
      this.$emit('edge-mouseover', this.edge)
    },
    handleMouseEnter () {
      console.log('edgeMouseEnter')
      this.$emit('edge-mouseenter', this.edge)
    },
    handleMouseLeave () {
      console.log('edgeMouseLeave')
      this.$emit('edge-mouseleave', this.edge)
    },
    handleDoubleClick () {
      console.log('edgeDoubleClick')
      this.$emit('edge-dblclick', this.edge)
    },
    handleEdit () {
      this.$emit('edge-edit', this.edge)
    },
    handleRemove () {
      this.$emit('edge-remove', this.edge)
    }
  }
}
</script>
<style>
.fc-edge-label {
  position: absolute;
  opacity: 0.8;
  transition: transform 0.2s;
  transform-origin: bottom left;
  margin: 0 auto;
}

.fc-edge-label .fc-nodeedit {
  top: -30px;
  right: 14px;
}

.fc-edge-label .fc-nodedelete {
  top: -30px;
  right: -13px;
}

.fc-edge-label-text {
  position: absolute;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  white-space: nowrap;
  text-align: center;
  font-size: 16px;
}

.fc-edge-label-text span {
  cursor: default;
  border: solid #ff3d00;
  border-radius: 10px;
  color: #ff3d00;
  background-color: #fff;
  padding: 3px 5px;
}

.fc-edge-label.fc-hover {
  transform: scale(1.25);
}

.fc-edge-label.fc-selected .fc-edge-label-text span,
.fc-edge-label.fc-edit .fc-edge-label-text span {
  border: solid red;
  color: #fff;
  font-weight: 600;
  background-color: red;
}

</style>
