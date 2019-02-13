<template>
  <div class="main-container">
    <div
      ref="fc-canvas"
      :id="canvasId"
      :style="styleComputed"
      class="fc-canvas"
      @click="canvasClick"
      @dragover.prevent.stop="canvasDragover"
      @drop.prevent.stop="canvasDrop"
      v-on="listenersComputed">
      <svg>
        <defs>
          <marker
            :id="arrowDefId"
            class="fc-arrow-marker"
            markerWidth="5"
            markerHeight="5"
            viewBox="-6 -6 12 12"
            refX="10"
            refY="0"
            markerUnits="strokeWidth"
            orient="auto">
            <polygon
              points="-2,0 -5,5 5,0 -5,-5"
              stroke="gray"
              fill="gray"
              stroke-width="1px" />
          </marker>
          <marker
            :id="arrowDefId+'-selected'"
            class="fc-arrow-marker-selected"
            markerWidth="5"
            markerHeight="5"
            viewBox="-6 -6 12 12"
            refX="10"
            refY="0"
            markerUnits="strokeWidth"
            orient="auto">
            <polygon
              points="-2,0 -5,5 5,0 -5,-5"
              stroke="red"
              fill="red"
              stroke-width="1px" />
          </marker>
        </defs>
        <fc-edge
          v-for="(edge,index) in currentModel.edges"
          ref="fcEdge"
          :edge="edge"
          :key="index"
          :index="index"
          :edgeStyle="edgeStyle"
          :arrow-def-id="arrowDefId"
          :store="store"
          @mousedown="edgeMouseDown"
          @edge-dblclick="edgeDoubleClick"
          @edge-mouseenter="edgeMouseEnter"
          @edge-mouseleave="edgeMouseLeave"
          @edge-click="edgeClick"
        />
        <g v-if="edgeDragging.isDragging">

          <path
            :class="[flowchartConstants.edgeClass,flowchartConstants.draggingClass]"
            :d="getEdgeDAttribute(edgeDragging.dragPoint1, edgeDragging.dragPoint2, edgeStyle)"/>
          <circle
            :cx="edgeDragging.dragPoint2.x"
            :cy="edgeDragging.dragPoint2.y"
            class="edge-endpoint"
            r="4"/>

        </g>
      </svg>
      <!-- 连接节点 -->
      <fc-node
        v-for="node in currentModel.nodes"
        ref="fcNode"
        :key="node.id"
        :node="node"
        :store="store"
        :edge-dragging-service="edgeDraggingService"
        :node-dragging-service="nodeDraggingService"
        @node-dragstart="nodeDragstart"
        @node-dragging="nodeDragging"
        @node-dragend="nodeDragend"
        @node-click="nodeClick"
        @node-mouseover="nodeMouseover"
        @node-mouseOut="nodeMouseOut"
        @node-edit="nodeEdit"
      />

      <div
        v-if="edgeDragging.isDragging"
        :class="'fc-noselect ' + flowchartConstants.edgeLabelClass"
        :style="{ top: (getEdgeCenter(edgeDragging.dragPoint1, edgeDragging.dragPoint2).y)+'px',
                  left: (getEdgeCenter(edgeDragging.dragPoint1, edgeDragging.dragPoint2).x)+'px'}">
        <div class="fc-edge-label-text">
          <span
            v-if="edgeDragging.prevEdge&&edgeDragging.prevEdge.label">{{ edgeDragging.prevEdge.label }}</span>
        </div>
      </div>
      <!-- 连线的label -->
      <fc-edge-label
        v-for="(edge,index) in currentModel.edges"
        ref="fcEdgeLabel"
        :edge="edge"
        :key="'fc-edge-label-'+index"
        :index="index"
        :store="store"
        @mousedown="edgeMouseDown"
        @edge-dblclick="edgeDoubleClick"
        @edge-mouseenter="edgeMouseEnter"
        @edge-mouseleave="edgeMouseLeave"
        @edge-click="edgeClick"
        @edge-edit="edgeEdit"
      />
      <!-- 矩形选择区域 -->
      <div
        v-if="store.isEditable()"
        id="select-rectangle"
        :style="rectangleSelect"
        class="fc-select-rectangle" />
    </div>
  </div>
</template>
<script>
// import MouseoverFactory from '@/service/mouseover'
import EdgedrawingService from '@/service/edgedrawing'
import flowchartConstants from '@/config/flowchart'
import FcNode from '@/components/FcNode'
import FcEdge from '@/components/FcEdge'
import FcEdgeLabel from '@/components/FcEdgeLabel'
import Store from '@/service/store'
import NodeDraggingFactory from '@/service/nodedragging'
import EdgeDraggingFactory from '@/service/edgedragging'
import RectangleSelectFactory from '@/service/rectangleselect'
import Modelvalidation from '@/service/modelvalidation'
let canvasIdSeed = 1
export default {
  components: {
    'fc-node': FcNode,
    'fc-edge': FcEdge,
    'fc-edge-label': FcEdgeLabel
  },
  props: {
    model: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 连线样式
    edgeStyle: {
      type: String,
      default: ''
    },
    // 是否自动拓展canvas大小
    automaticResize: {
      type: Boolean,
      default: true
    },
    // 拖拽动画
    dragAnimation: {
      type: String,
      default: flowchartConstants.dragAnimationRepaint
    },
    dropTargetId: {
      type: [String, Number],
      default: null
    },
    dragThreshold: {
      type: Number,
      default: 0
    },
    nodeAddCallback: {
      type: Function,
      default: () => {
        return () => {}
      }
    },
    edgeAddCallback: {
      type: Function,
      default: () => {
        return () => {}
      }
    }
  },
  data () {
    const store = new Store(this, {
      dropTargetId: this.dropTargetId
    })
    return {
      store,
      canvasId: 'fc-canvas_' + canvasIdSeed++,
      arrowDefId: 'arrow-' + Math.random(),
      flowchartConstants,
      nodeDraggingService: null,
      edgeDraggingService: null,
      rectangleSelectService: null
    }
  },
  computed: {
    currentModel () {
      return this.store.state.model
    },
    canvasOffset () {
      return this.store.state.canvasOffset
    },
    styleComputed () {
      let width = this.canvasOffset.width
      let height = this.canvasOffset.height
      if (width && height) {
        return {
          width: width + 'px',
          height: height + 'px'
        }
      } else {
        return ''
      }
    },
    edgeDragging () {
      return this.store.state.edgeDragging
    },
    listenersComputed () {
      if (this.store.isEditable()) {
        return {
          mousedown: this.canvasMousedown,
          mousemove: this.canvasMousemove,
          mouseup: this.canvasMouseup
        }
      } else {
        return {}
      }
    },
    rectangleSelect () {
      let rectangleSelect = this.store.state.rectangleSelect
      return {
        left: rectangleSelect.left + 'px',
        top: rectangleSelect.top + 'px',
        width: rectangleSelect.width + 'px',
        height: rectangleSelect.height + 'px',
        visibility: rectangleSelect.visibility
      }
    }
  },
  watch: {
    model: {
      immediate: true,
      handler (val) {
        this.store.commit('SET_MODEL', val)
      }
    }
  },
  created () {
    if (!this.dropTargetId && this.edgeStyle !== flowchartConstants.curvedStyle && this.edgeStyle !== flowchartConstants.lineStyle) {
      throw new Error('edgeStyle not supported.')
    }
    this.nodeDraggingService = new NodeDraggingFactory(this.store, {
      dragThreshold: this.dragThreshold,
      nodeAddCallback: this.nodeAddCallback
    })
    this.edgeDraggingService = new EdgeDraggingFactory(this.store, {
      edgeAddCallback: this.edgeAddCallback
    })
    this.rectangleSelectService = new RectangleSelectFactory(this.store)
    Modelvalidation.validateModel(this.model)
    // if (!this.dropTargetId) {
    //   this.initModel(this.model)
    // }
  },
  mounted () {
    let canvas = this.$refs['fc-canvas'].getBoundingClientRect()
    this.store.commit('UPDATE_CANVAS_OFFSET', {
      width: canvas.width,
      height: canvas.height
    })
    this.store.commit('SET_CANVAS_CONTAINER', this.$refs['fc-canvas'])
  },
  methods: {
    canvasClick (event) {
      console.log('canvasClick', event)
    },
    canvasDrop (event) {
      // 放置在目标元素时触发
      console.log('canvasDrop', event)
      if (!this.store.state.edgeDragging.isDragging) {
        this.nodeDraggingService.drop(event)
      }
    },

    canvasDragover (event) {
      if (this.store.state.edgeDragging.isDragging) {
        this.edgeDraggingService.dragover(event)
      } else {
        this.nodeDraggingService.dragover(event)
      }
    },

    canvasMousedown (event) {
      console.log('canvasMousedown', event)
      this.rectangleSelectService.mousedown(event)
    },

    canvasMousemove (event) {
      this.rectangleSelectService.mousemove(event)
    },

    canvasMouseup (event) {
      console.log('canvasMouseup', event)
      this.rectangleSelectService.mouseup(event)
    },

    edgeMouseDown (event) {
      event.stopPropagation()
    },

    edgeClick (event) {
      console.log('edgeClick')
    },
    edgeMouseEnter (index, isHover) {
      // console.log('edgeMouseEnter')
      if (this.$refs.fcEdge) {
        this.$refs.fcEdge[index].underMouse = isHover
      }
      if (this.$refs.fcEdgeLabel) {
        this.$refs.fcEdgeLabel[index].underMouse = isHover
      }
      this.$emit('edge-mouseenter')
    },
    edgeMouseLeave (index, isHover) {
      // console.log('edgeMouseLeave')
      if (this.$refs.fcEdge) {
        this.$refs.fcEdge[index].underMouse = isHover
      }
      if (this.$refs.fcEdgeLabel) {
        this.$refs.fcEdgeLabel[index].underMouse = isHover
      }
      this.$emit('edge-mouseleave')
    },
    edgeDoubleClick (edge) {
      console.log('edgeDoubleClick')
      this.$emit('edge-dblclick', edge)
    },
    edgeEdit (edge) {
      this.$emit('edge-edit', edge)
    },
    nodeDragstart (node) {
      this.$emit('node-dragstart', this.node)
    },
    nodeDragging (node, x, y) {
      this.$emit('node-dragging', node, x, y)
    },
    nodeDragend (node, event) {
      this.$emit('node-dragend', node, event)
    },
    nodeClick (node) {

    },
    nodeMouseover (node) {

    },
    nodeMouseOut (node) {

    },
    nodeEdit (node) {
      this.$emit('node-edit', node)
    },
    isValidEdge (edge) {

    },
    getEdgeDAttribute: EdgedrawingService.getEdgeDAttribute,
    getEdgeCenter: EdgedrawingService.getEdgeCenter
  }
}
</script>
<style>

.main-container {
  width: 100%;
  height: 100vh;
  z-index: 0;
  overflow: auto;
}
.fc-canvas {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: relative;
  width: 100%;
  height: 100%;
  background-size: 25px 25px;
  background-image: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.1) 1px,
      transparent 0
    ),
    linear-gradient(180deg, rgba(0, 0, 0, 0.1) 1px, transparent 0);
  background-color: transparent;
}
.fc-canvas svg {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
}
.fc-divider {
  flex: 0.01;
}

.fc-right-pane {
  flex: 0.74;
  overflow: auto;
}

.fc-arrow-marker polygon {
  stroke: gray;
  fill: gray;
}

.fc-arrow-marker-selected polygon {
  stroke: red;
  fill: red;
}

.fc-nodedelete {
  display: none;
  font-size: 18px;
}

.fc-nodeedit {
  display: none;
  font-size: 15px;
}

.fc-edit .fc-nodedelete,
.fc-edit .fc-nodeedit {
  display: block;
  position: absolute;
  border: solid 2px #eee;

  border-radius: 50%;
  font-weight: 600;
  line-height: 20px;

  height: 20px;
  padding-top: 2px;
  width: 22px;

  background: #494949;
  color: #fff;
  text-align: center;
  vertical-align: bottom;

  cursor: pointer;
}

.fc-edit .fc-nodeedit {
  top: -24px;
  right: 16px;
}

.fc-edit .fc-nodedelete {
  top: -24px;
  right: -13px;
}

.fc-noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}

.fc-select-rectangle {
  border: 2px dashed #5262ff;
  position: absolute;
  background: rgba(20, 125, 255, 0.1);
  z-index: 2;
}

.edge-endpoint {
  fill: gray;
}
@keyframes dash {
  from {
    stroke-dashoffset: 500;
  }
}
</style>
