<template>
  <div
    ref="node"
    :id="node.id"
    :draggable="!node.readonly"
    :style="styleComputed"
    :class="classComputed"
    @dblclick="handleDoubleClick"
    @mousedown.stop="handleMousedown"
    v-on="listenersComputed">
    <div :class="flowchartConstants.nodeOverlayClass" />
    <div class="innerNode">
      <p>{{ node.name }}</p>

      <div :class="flowchartConstants.leftConnectorClass">
        <fc-magnet
          v-for="connector in modelservice.nodes.getConnectorsByType(node, flowchartConstants.leftConnectorType)"
          :key="connector.id"
          fc-magnet>
          <fc-connector
            :connector="connector"
            :modelservice="modelservice"/>
        </fc-magnet>
      </div>
      <div :class="flowchartConstants.rightConnectorClass">
        <fc-magnet
          v-for="connector in modelservice.nodes.getConnectorsByType(node, flowchartConstants.rightConnectorType)"
          :modelservice="modelservice"
          :key="connector.id"
        >
          <fc-connector
            :connector="connector"
            :modelservice="modelservice"/>
        </fc-magnet>
      </div>
    </div>
    <div
      v-if="modelservice.isEditable() && !node.readonly"
      class="fc-nodeedit"
      @click="handleEdit">
      #
    </div>
    <div
      v-if="modelservice.isEditable() && !node.readonly"
      class="fc-nodedelete"
      @click="handleDelete">
      &times;
    </div>
  </div>

</template>
<script>
import flowchartConstants from '@/config/flowchart'
import FcMagnet from '@/components/FcMagnet'
import FcConnector from '@/components/FcConnector'
export default {
  components: {
    'fc-magnet': FcMagnet,
    'fc-connector': FcConnector
  },
  props: {
    fcCallbacks: {
      type: Object,
      default: () => {
        return {}
      }
    },
    callbacks: {
      type: Object,
      default: () => {
        return {}
      }
    },
    node: {
      type: Object,
      default: () => {
        return {}
      }
    },
    selected: {
      type: Boolean,
      default: false
    },
    edit: {
      type: Boolean,
      default: false
    },
    underMouse: {
      type: Boolean,
      default: false
    },
    mouseOverConnector: {
      type: Boolean,
      default: false
    },
    modelservice: {
      type: Object,
      default: () => {
        return {}
      }
    },
    draggedNode: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      flowchartConstants: flowchartConstants
    }
  },
  computed: {
    listenersComputed () {
      if (!this.node.readonly) {
        return {
          dragstart: this.handleDragstart,
          dragend: this.handleDragend,
          click: this.handleClick,
          mouseover: this.handleMouseover,
          mouseout: this.handleMouseout
        }
      } else {
        return {}
      }
    },
    styleComputed () {
      return {
        position: 'absolute',
        top: this.node.y + 'px',
        left: this.node.x + 'px'
      }
    },
    classComputed () {
      let classObj = {}
      classObj[flowchartConstants.selectedClass] = this.selected
      classObj[flowchartConstants.editClass] = this.edit
      classObj[flowchartConstants.hoverClass] = this.underMouse
      classObj[flowchartConstants.draggingClass] = this.draggedNode
      classObj[flowchartConstants.nodeClass] = true
      return classObj
    }
  },
  mounted () {
    this.modelservice.nodes.setHtmlElement(this.node.id, this.$refs.node)
  },
  methods: {
    handleMousedown () {
      console.log('mousedown:', event)
    },
    handleDoubleClick () {

    },
    handleDragstart () {
      console.log('handleDragstart')
    },
    handleDragend () {

    },
    handleClick () {
      this.modelservice.edges.handleEdgeMouseClick(this.node, event.ctrlKey)
      // Don't let the chart handle the mouse down.
      event.stopPropagation()
      event.preventDefault()
    },
    handleMouseover () {

    },
    handleMouseout () {

    },
    handleEdit () {

    },
    handleDelete () {
      this.modelservice.nodes.delete(this.node)
    }
  }
}
</script>
