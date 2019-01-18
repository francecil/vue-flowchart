<template>
  <div
    id="fc-canvas"
    ref="canvas"
    class="fc-canvas"
    @click="canvasClick($event)"
    @dragover="canvasDragover($event)"
    @drop="canvasDrop($event)"
    @mousedown="canvasMousedown($event)"
    @mousemove="canvasMousemove($event)"
    @mouseup="canvasMouseup($event)">
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
      <g
        v-for="(edge,index) in currentModel.edges"
        :key="index">
        <path
          :id="'fc-edge-path-'+index"
          :class="(modelservice.edges.isSelected(edge) && flowchartConstants.selectedClass + ' ' + flowchartConstants.edgeClass) || flowchartConstants.hoverClass + ' ' + flowchartConstants.edgeClass || edge.active && flowchartConstants.activeClass + ' ' + flowchartConstants.edgeClass || flowchartConstants.edgeClass"
          :d="getEdgeDAttribute(modelservice.edges.sourceCoord(edge), modelservice.edges.destCoord(edge), edgeStyle)"
          :marker-end="'url(#'+(modelservice.edges.isSelected(edge) ? arrowDefId+'-selected' : arrowDefId)+')'"
          @mousedown="edgeMouseDown(edge)"
          @dblclick="edgeDoubleClick(edge)"
          @mouseover="edgeMouseOver(edge)"
          @mouseenter="edgeMouseEnter(edge)"
          @mouseleave="edgeMouseLeave(edge)"
          @click="edgeClick(edge)" />
      </g>
      <!-- <g ng-if="dragAnimation == flowchartConstants.dragAnimationRepaint && edgeDragging.isDragging">

        <path
          class="{{ flowchartConstants.edgeClass }} {{ flowchartConstants.draggingClass }}"
          ng-attr-d="{{getEdgeDAttribute(edgeDragging.dragPoint1, edgeDragging.dragPoint2, edgeStyle)}}"/>
        <circle
          class="edge-endpoint"
          r="4"
          ng-attr-cx="{{edgeDragging.dragPoint2.x}}"
          ng-attr-cy="{{edgeDragging.dragPoint2.y}}"/>

      </g>
      <g
        ng-if="dragAnimation == flowchartConstants.dragAnimationShadow"
        class="shadow-svg-class {{ flowchartConstants.edgeClass }} {{ flowchartConstants.draggingClass }}"
        style="display:none">
        <path d=""/>
        <circle
          class="edge-endpoint"
          r="4"/>
      </g> -->
    </svg>
    <!-- 连接节点 -->
    <fc-node
      v-for="node in currentModel.nodes"
      :key="node.id"
      :node="node"
      :modelservice="modelservice"
      :selected="modelservice.nodes.isSelected(node)"
      :edit="modelservice.nodes.isEdit(node)"
      @node-dragstart="nodeDragstart"
      @node-dragging="nodeDragging"
      @node-dragend="nodeDragend"
      @node-click="nodeClick"
      @node-mouseover="nodeMouseover"
      @node-mouseOut="nodeMouseOut"
      @node-edit="nodeEdit"
    />

    <!-- <div
      ng-if="dragAnimation == flowchartConstants.dragAnimationRepaint && edgeDragging.isDragging"
      ng-attr-class="{{'fc-noselect ' + flowchartConstants.edgeLabelClass}}"
      ng-style="{ top: (getEdgeCenter(edgeDragging.dragPoint1, edgeDragging.dragPoint2).y)+'px',
                left: (getEdgeCenter(edgeDragging.dragPoint1, edgeDragging.dragPoint2).x)+'px'}">
      <div class="fc-edge-label-text">
        <span
          ng-attr-id="{{'fc-edge-label-dragging'}}"
          ng-if="edgeDragging.dragLabel">{{ edgeDragging.dragLabel }}</span>
      </div>
    </div> -->
    <!-- 连线的label -->
    <div
      v-for="(edge,$index) in currentModel.edges"
      :key="$index"
      :class="'fc-noselect ' + ((modelservice.edges.isEdit(edge) && flowchartConstants.editClass + ' ' + flowchartConstants.edgeLabelClass) || (modelservice.edges.isSelected(edge) && flowchartConstants.selectedClass + ' ' + flowchartConstants.edgeLabelClass) || flowchartConstants.hoverClass + ' ' + flowchartConstants.edgeLabelClass || edge.active && flowchartConstants.activeClass + flowchartConstants.edgeLabelClass || flowchartConstants.edgeLabelClass)"
      :style="{ top: (getEdgeCenter(modelservice.edges.sourceCoord(edge), modelservice.edges.destCoord(edge)).y)+'px',
                left: (getEdgeCenter(modelservice.edges.sourceCoord(edge), modelservice.edges.destCoord(edge)).x)+'px'}"
      :automatic-resize="automaticResize"
      :drag-animation="dragAnimation"
      @mousedown="edgeMouseDown(edge)"
      @click="edgeClick(edge)"
      @mouseover="edgeMouseOver(edge)"
      @mouseenter="edgeMouseEnter(edge)"
      @mouseleave="edgeMouseLeave(edge)"
      @dblclick="edgeDoubleClick(edge)">
      <div class="fc-edge-label-text">
        <div
          v-if="modelservice.isEditable()"
          class="fc-noselect fc-nodeedit"
          @click="edgeEdit(edge)">
          #
        </div>
        <div
          v-if="modelservice.isEditable()"
          class="fc-noselect fc-nodedelete"
          @click="edgeRemove(edge)">
          &times;
        </div>
        <span
          v-if="edge.label"
          :id="'fc-edge-label-'+$index">{{ edge.label }}</span>
      </div>
    </div>
    <!-- 矩形选择区域 -->
    <div
      id="select-rectangle"
      class="fc-select-rectangle"
      hidden />
  </div>

</template>
<script>
import CanvasFactory from '@/service/canvas'
import ModelFactory from '@/service/model'
// import NodedraggingFactory from '@/service/nodedragging'
// import EdgedraggingFactory from '@/service/edgedragging'
// import MouseoverFactory from '@/service/mouseover'
import RectangleselectFactory from '@/service/rectangleselect'
import EdgedrawingService from '@/service/edgedrawing'
import flowchartConstants from '@/config/flowchart'
import { mapActions, mapState } from 'vuex'
import FcNode from '@/components/FcNode'
export default {
  components: {
    'fc-node': FcNode
  },
  props: {
    model: {
      type: Object,
      default: () => {
        return {}
      }
    },
    selectedObjects: {
      type: Array,
      default: function () {
        return []
      }
    },
    edgeStyle: {
      type: String,
      default: ''
    },
    automaticResize: {
      type: Boolean,
      default: false
    },
    dragAnimation: {
      type: String,
      default: 'repaint'
    },
    nodeWidth: {
      type: Number,
      default: 200
    },
    nodeHeight: {
      type: Number,
      default: 200
    },
    dropTargetId: {
      type: [String, Number],
      default: null
    },
    control: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      arrowDefId: 'arrow-' + Math.random(),
      modelservice: null,
      canvasservice: null,
      edgeDragging: {},
      flowchartConstants: flowchartConstants
    }
  },
  computed: {
    ...mapState('flow', {
      currentModel: 'model'
    })
  },
  watch: {
    model (val) {
      if (val) {
        this.initModel(val)
      }
    }
  },
  created () {
    ; (function (scope) {
      if (!scope.dropTargetId && scope.edgeStyle !== flowchartConstants.curvedStyle && scope.edgeStyle !== flowchartConstants.lineStyle) {
        throw new Error('edgeStyle not supported.')
      }
    })(this)
    this.initModel(this.model)
    let noop = () => { }
    this.modelservice = ModelFactory(this.currentModel, this.selectedObjects, noop, noop, noop, noop, noop)
    this.canvasservice = CanvasFactory()

    // var nodedraggingservice = NodedraggingFactory(this.modelservice, this.nodeDragging, this.$apply, this.automaticResize, this.dragAnimation)

    // var edgedraggingservice = EdgedraggingFactory(this.modelservice, this.model, this.edgeDragging, null, this.$apply, this.dragAnimation, this.edgeStyle)

    this.rectangleselectservice = RectangleselectFactory(this.modelservice, this.$apply)
  },
  mounted () {
    this.canvasservice.setCanvasHtmlElement(this.$refs.canvas)
    this.modelservice.setCanvasHtmlElement(this.$refs.canvas)
    this.modelservice.setSvgHtmlElement(this.$refs.canvas.querySelector('svg'))
  },
  methods: {
    ...mapActions('flow', [
      'initModel',
      'updateEdge'
    ]),
    canvasClick (event) {
      console.log(event)
    },
    canvasDrop (event) {
      // this.nodedraggingervice.drop(event)
      // this.canvasservice._notifyDrop(event)
    },

    canvasDragover (event) {
      // this.nodedraggingservice.dragover(event)
      // this.edgedraggingservice.dragover(event)
      // this.canvasservice._notifyDragover(event)
    },

    canvasMousedown (event) {
      // this.rectangleselectservice.mousedown(event)
    },

    canvasMousemove (event) {
      // this.rectangleselectservice.mousemove(event)
    },

    canvasMouseup (event) {
      // this.rectangleselectservice.mouseup(event)
    },

    edgeMouseDown (edge) {
      event.stopPropagation()
    },

    edgeClick (edge) {
      console.log('edgeClick')
      this.modelservice.edges.handleEdgeMouseClick(edge, event.ctrlKey)
      // Don't let the chart handle the mouse down.
      event.stopPropagation()
      event.preventDefault()
    },
    edgeMouseOver (edge) {
      console.log('edgeMouseOver')
      this.$emit('edge-mouseover', edge)
    },
    edgeMouseEnter (edge) {
      console.log('edgeMouseEnter')
      this.$emit('edge-mouseenter', edge)
    },
    edgeMouseLeave (edge) {
      console.log('edgeMouseLeave')
      this.$emit('edge-mouseleave', edge)
    },
    edgeDoubleClick (edge) {
      console.log('edgeDoubleClick')
      this.$emit('edge-dblclick', edge)
    },
    edgeEdit (edge) {
      console.log('edgeEdit')
      let label = prompt('编辑连线label', edge.label)
      let newEdge = Object.assign(edge, {
        label
      })
      this.updateNode({
        edge,
        newEdge,
        isPushState: true
      })
      this.$emit('edge-edit', edge)
    },
    edgeRemove (edge) {
      this.modelservice.edges.delete(edge)
      event.stopPropagation()
      event.preventDefault()
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

.fc-arrow-marker polygon {
  stroke: gray;
  fill: gray;
}

.fc-arrow-marker-selected polygon {
  stroke: red;
  fill: red;
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

.fc-select-rectangle {
  border: 2px dashed #5262ff;
  position: absolute;
  background: rgba(20, 125, 255, 0.1);
  z-index: 2;
}

@keyframes dash {
  from {
    stroke-dashoffset: 500;
  }
}
</style>
