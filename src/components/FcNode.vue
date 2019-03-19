<template>
  <div
    :id="node.id"
    :style="styleComputed"
    :class="classComputed"
    v-on="listenersComputed"
    @mouseover="handleMouseover"
    @mouseout="handleMouseout"
  >
    <div :class="flowchartConstants.nodeOverlayClass" />
    <div
      v-popover:popover
      class="innerNode"
    >
      <p>{{ node.name }}</p>

      <div :class="flowchartConstants.leftConnectorClass">
        <fc-magnet
          v-if="node.connectors&&node.connectors[flowchartConstants.leftConnectorType]"
          :connector="node.connectors[flowchartConstants.leftConnectorType]"
          :store="store"
          :edge-dragging-service="edgeDraggingService"
        >
          <fc-connector
            :connector="node.connectors[flowchartConstants.leftConnectorType]"
            :type="flowchartConstants.leftConnectorType"
            :node="node"
            :edge-dragging-service="edgeDraggingService"
            :store="store"
          />
        </fc-magnet>
      </div>
      <div :class="flowchartConstants.rightConnectorClass">
        <fc-magnet
          v-if="node.connectors&&node.connectors[flowchartConstants.rightConnectorType]"
          :connector="node.connectors[flowchartConstants.rightConnectorType]"
          :store="store"
          :edge-dragging-service="edgeDraggingService"
        >
          <fc-connector
            :type="flowchartConstants.leftConnectorType"
            :connector="node.connectors[flowchartConstants.rightConnectorType]"
            :node="node"
            :edge-dragging-service="edgeDraggingService"
            :store="store"
          />
        </fc-magnet>
      </div>
    </div>
    <div
      v-if="store.isEditable() && !node.readonly"
      class="fc-nodeedit"
      @click.stop.prevent="handleEdit"
    >
      #
    </div>
    <div
      v-if="store.isEditable() && !node.readonly"
      class="fc-nodedelete"
      @click.stop.prevent="handleDelete"
    >
      &times;
    </div>
    <el-popover
      ref="popover"
      v-model="underMouse"
      :title="node.name"
      :content="node.addition&&node.addition.desc"
      placement="right"
      width="200"
      trigger="manual"
    />
  </div>

</template>
<script>
import flowchartConstants from '@/config/flowchart'
import FcMagnet from '@/components/FcMagnet'
import FcConnector from '@/components/FcConnector'
// import NodedraggingFactory from '@/service/nodedragging'
// import _ from 'lodash'
export default {
  components: {
    'fc-magnet': FcMagnet,
    'fc-connector': FcConnector
  },
  props: {
    store: {
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
    nodeDraggingService: {
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
      dragging: false,
      eventPointOffset: {}
    }
  },
  computed: {
    listenersComputed () {
      if (!this.node.readonly) {
        return {
          // dragstart: this.handleDragstart,
          mousedown: this.handleMousedown,
          click: this.handleClick,
          dblclick: this.handleDoubleClick
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
    selected () {
      return this.store.isSelectedObject(this.node)
    },
    edit () {
      return this.store.isEditObject(this.node)
    },
    classComputed () {
      let classObj = {}
      classObj[flowchartConstants.selectedClass] = this.selected
      classObj[flowchartConstants.editClass] = this.edit
      classObj[flowchartConstants.hoverClass] = this.underMouse && !this.node.readonly
      classObj[flowchartConstants.draggingClass] = this.draggedNode
      classObj[flowchartConstants.nodeClass] = true
      return classObj
    }
  },
  watch: {
    node (val) {
      // 撤销重做时，整个node对象改变，需要重新上传$el
      this.$el && this.store.commit('SET_NODE_ELEMENT', {
        nodeId: this.node.id,
        element: this.$el
      })
    }
  },
  created () {
  },
  mounted () {
    this.store.commit('SET_NODE_ELEMENT', {
      nodeId: this.node.id,
      element: this.$el
    })
  },
  methods: {
    handleDoubleClick () {

    },
    handleMousedown (event) {
      console.log('node mousedown')
      event.stopPropagation()
      this.underMouse = false
      let elementBox = this.$el.getBoundingClientRect()
      let eventPointOffset = {
        x: event.clientX - elementBox.left,
        y: event.clientY - elementBox.top
      }
      this.nodeDraggingService.dragstart(event, this.node, eventPointOffset)
      this.$emit('node-dragstart', this.node)
    },
    // handleDragstart (event) {
    //   console.log('node Dragstart:', event)
    //   this.dragging = true
    //   this.underMouse = false
    //   let elementBox = this.$el.getBoundingClientRect()
    //   let eventPointOffset = {
    //     x: event.clientX - elementBox.left,
    //     y: event.clientY - elementBox.top
    //   }
    //   this.nodeDraggingService.dragstart(event, this.node, eventPointOffset)
    //   this.$emit('node-dragstart', this.node)
    // },
    handleClick (event) {
      event.stopPropagation()
      event.preventDefault()
      if (!this.store.isEditable()) {
        return
      }
      // Don't let the chart handle the mouse down.
      this.store.updateSelecctedObjects({
        object: this.node,
        ctrlKey: event.ctrlKey
      })
    },
    handleMouseover () {
      if (!this.store.state.edgeDragging.dragging && !this.store.state.nodeDragging.dragging) {
        this.underMouse = true
      }
    },
    handleMouseout () {
      this.underMouse = false
    },
    handleEdit () {
      let name = prompt('编辑节点名称', this.node.name)
      let newNode = Object.assign(this.node, {
        name
      })
      this.store.updateNode({
        node: this.node,
        newNode,
        isPushState: true
      })
      this.$emit('node-edit', this.node)
    },
    handleDelete () {
      this.store.deleteNode({
        node: this.node,
        isPushState: true
      })
    }
  }
}
</script>
<style>
.fc-node {
  z-index: 1;
}

.innerNode {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 50px;
  border-radius: 5px;

  background-color: #f15b26;
  color: #fff;
  font-size: 16px;
  pointer-events: none;
}

.fc-node .fc-node-overlay {
  position: absolute;
  pointer-events: none;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  opacity: 0;
}

.fc-node.fc-hover .fc-node-overlay {
  opacity: 0.25;
  transition: opacity 0.2s;
}

.fc-node.fc-selected .fc-node-overlay {
  opacity: 0.25;
}

.fc-node.fc-dragging {
  z-index: 10;
}

.fc-node p {
  padding: 0 15px;
  text-align: center;
}

.fc-leftConnectors,
.fc-rightConnectors {
  position: absolute;
  top: 0;
  height: 100%;

  display: flex;
  flex-direction: column;

  z-index: -10;
}

.fc-leftConnectors {
  left: -20px;
}

.fc-rightConnectors {
  right: -20px;
}

.fc-magnet {
  display: flex;
  flex-grow: 1;
  height: 60px;

  justify-content: center;
}

.fc-leftConnectors .fc-magnet {
  align-items: center;
}

.fc-rightConnectors .fc-magnet {
  align-items: center;
}

.fc-connector {
  width: 18px;
  height: 18px;

  border: 10px solid transparent;
  -moz-background-clip: padding; /* Firefox 3.6 */
  -webkit-background-clip: padding; /* Safari 4? Chrome 6? */
  background-clip: padding-box;
  border-radius: 50% 50%;
  background-color: #f7a789;
  color: #fff;
  pointer-events: all;
}

.fc-connector.fc-hover {
  background-color: #000;
}
</style>
