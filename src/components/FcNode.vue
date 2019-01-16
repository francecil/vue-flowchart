<template>
  <div
    ref="node"
    :id="node.id"
    :draggable="!node.readonly"
    :style="styleComputed"
    :class="classComputed"
    ng-dblclick="callbacks.doubleClick($event)"
    @mousedown.stop="mousedown"
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
    <!-- <div
      ng-if="modelservice.isEditable() && !node.readonly"
      class="fc-nodeedit"
      ng-click="callbacks.nodeEdit($event, node)">
      <i
        class="fa fa-pencil"
        aria-hidden="true" />
    </div>
    <div
      ng-if="modelservice.isEditable() && !node.readonly"
      class="fc-nodedelete"
      ng-click="modelservice.nodes.delete(node)">
      &times;
    </div> -->
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
    mousedown () {
      console.log('mousedown')
    },
    handleDragstart () {
      console.log('handleDragstart')
    },
    handleDragend () {

    },
    handleClick () {

    },
    handleMouseover () {

    },
    handleMouseout () {

    }
  }
}
</script>
