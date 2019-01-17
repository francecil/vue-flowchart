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
    @mouseup="canvasMouseup($event)"
  >
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
            stroke-width="1px"/>
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
            stroke-width="1px"/>
        </marker>
      </defs>
      <g
        v-for="(edge,index) in model.edges"
        :key="index">
        <path
          :id="'fc-edge-path-'+index"
          :class="(modelservice.edges.isSelected(edge) && flowchartConstants.selectedClass + ' ' + flowchartConstants.edgeClass) || flowchartConstants.hoverClass + ' ' + flowchartConstants.edgeClass || edge.active && flowchartConstants.activeClass + ' ' + flowchartConstants.edgeClass || flowchartConstants.edgeClass"
          :d="getEdgeDAttribute(modelservice.edges.sourceCoord(edge), modelservice.edges.destCoord(edge), edgeStyle)"
          :marker-end="'url(#'+(modelservice.edges.isSelected(edge) ? arrowDefId+'-selected' : arrowDefId)+')'"
          @mousedown="edgeMouseDown($event, edge)"
          @dblclick="edgeDoubleClick($event, edge)"
          @mouseover="edgeMouseOver($event, edge)"
          @mouseenter="edgeMouseEnter($event, edge)"
          @mouseleave="edgeMouseLeave($event, edge)"
          @click="edgeClick($event, edge)"
        />
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
      v-for="node in model.nodes"
      :key="node.id"
      :node="node"
      :modelservice="modelservice"
      :selected="modelservice.nodes.isSelected(node)"
      :edit="modelservice.nodes.isEdit(node)"
      @node-dragstart="nodeDragstart"
      @node-dragend="nodeDragend"
      @node-click="nodeClick"
      @node-Mouseover="nodeMouseover"
      @node-MouseOut="nodeMouseOut"
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
      v-for="(edge,$index) in model.edges"
      :key="$index"
      :class="'fc-noselect ' + ((modelservice.edges.isEdit(edge) && flowchartConstants.editClass + ' ' + flowchartConstants.edgeLabelClass) || (modelservice.edges.isSelected(edge) && flowchartConstants.selectedClass + ' ' + flowchartConstants.edgeLabelClass) || flowchartConstants.hoverClass + ' ' + flowchartConstants.edgeLabelClass || edge.active && flowchartConstants.activeClass + flowchartConstants.edgeLabelClass || flowchartConstants.edgeLabelClass)"
      :style="{ top: (getEdgeCenter(modelservice.edges.sourceCoord(edge), modelservice.edges.destCoord(edge)).y)+'px',
                left: (getEdgeCenter(modelservice.edges.sourceCoord(edge), modelservice.edges.destCoord(edge)).x)+'px'}"
      @mousedown="edgeMouseDown($event, edge)"
      @click="edgeClick($event, edge)"
      @mouseover="edgeMouseOver($event, edge)"
      @mouseenter="edgeMouseEnter($event, edge)"
      @mouseleave="edgeMouseLeave($event, edge)"
      @dblclick="edgeDoubleClick($event, edge)"
    >
      <div class="fc-edge-label-text">
        <div
          v-if="modelservice.isEditable()"
          class="fc-noselect fc-nodeedit"
          @click="edgeEdit($event, edge)">
          #
        </div>
        <div
          v-if="modelservice.isEditable()"
          class="fc-noselect fc-nodedelete"
          @click="edgeRemove($event, edge)">
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
      hidden/>
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

import FcNode from '@/components/FcNode'
import $ from 'jquery'
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
      nodeDragging: {},
      flowchartConstants: flowchartConstants
    }
  },
  computed: {},
  watch: {
    model: function (fit) {
      if (this.model) {
        var maxX = 0
        var maxY = 0
        this.model.nodes.forEach(function (node, key) {
          maxX = Math.max(node.x + this.nodeWidth, maxX)
          maxY = Math.max(node.y + this.nodeHeight, maxY)
        })
        var width, height
        if (fit) {
          width = maxX
          height = maxY
        } else {
          width = Math.max(maxX, $('#fc-canvas').prop('offsetWidth'))
          height = Math.max(maxY, $('#fc-canvas').prop('offsetHeight'))
        }
        $('#fc-canvas').css('width', width + 'px')
        $('#fc-canvas').css('height', height + 'px')
      }
    }
  },
  created () {
    ;(function (scope) {
      if (!scope.dropTargetId && scope.edgeStyle !== flowchartConstants.curvedStyle && scope.edgeStyle !== flowchartConstants.lineStyle) {
        throw new Error('edgeStyle not supported.')
      }
    })(this)

    let noop = () => {}
    this.modelservice = ModelFactory(this.model, this.selectedObjects, noop, noop, noop, noop, noop)
    this.canvasservice = CanvasFactory()

    // var nodedraggingservice = NodedraggingFactory(this.modelservice, this.nodeDragging, this.$apply, this.automaticResize, this.dragAnimation)

    // var edgedraggingservice = EdgedraggingFactory(this.modelservice, this.model, this.edgeDragging, null, this.$apply, this.dragAnimation, this.edgeStyle)

    this.rectangleselectservice = RectangleselectFactory(this.modelservice, this.$apply)

    // this.edgeDoubleClick = this.userCallbacks.edgeDoubleClick || noop
    // this.edgeMouseOver = this.userCallbacks.edgeMouseOver || noop
    // this.edgeEdit = this.userCallbacks.edgeEdit || noop

    // this.userNodeCallbacks = this.userCallbacks.nodeCallbacks
    /*
    this.callbacks = {
      nodeDragstart: nodedraggingservice.dragstart,
      nodeDragend: nodedraggingservice.dragend,
      edgeDragstart: edgedraggingservice.dragstart,
      edgeDragend: edgedraggingservice.dragend,
      edgeDrop: edgedraggingservice.drop,
      edgeDragoverConnector: edgedraggingservice.dragoverConnector,
      edgeDragoverMagnet: edgedraggingservice.dragoverMagnet,
      edgeDragleaveMagnet: edgedraggingservice.dragleaveMagnet,
      // nodeMouseOver: mouseoverservice.nodeMouseOver,
      // nodeMouseOut: mouseoverservice.nodeMouseOut,
      // connectorMouseEnter: mouseoverservice.connectorMouseEnter,
      // connectorMouseLeave: mouseoverservice.connectorMouseLeave,
      nodeClicked: function (node) {
        return function (event) {
          this.modelservice.nodes.handleClicked(node, event.ctrlKey)
          this.$apply()

          // Don't let the chart handle the mouse down.
          event.stopPropagation()
          event.preventDefault()
        }
      }
    }
    */
  },
  mounted () {
    this.canvasservice.setCanvasHtmlElement(this.$refs.canvas)
    this.modelservice.setCanvasHtmlElement(this.$refs.canvas)
    this.modelservice.setSvgHtmlElement(this.$refs.canvas.querySelector('svg'))
  },
  methods: {
    canvasClick (event) {
      console.log(event)
    },
    canvasDrop  (event) {
      // this.nodedraggingervice.drop(event)
      // this.canvasservice._notifyDrop(event)
    },

    canvasDragover  (event) {
      // this.nodedraggingservice.dragover(event)
      // this.edgedraggingservice.dragover(event)
      // this.canvasservice._notifyDragover(event)
    },

    canvasMousedown  (event) {
      // this.rectangleselectservice.mousedown(event)
    },

    canvasMousemove  (event) {
      // this.rectangleselectservice.mousemove(event)
    },

    canvasMouseup  (event) {
      // this.rectangleselectservice.mouseup(event)
    },

    edgeMouseDown  (event, edge) {
      event.stopPropagation()
    },

    edgeClick  (event, edge) {
      console.log('edgeClick')
      this.modelservice.edges.handleEdgeMouseClick(edge, event.ctrlKey)
      // Don't let the chart handle the mouse down.
      event.stopPropagation()
      event.preventDefault()
    },
    edgeMouseOver  (event, edge) {
      console.log('edgeMouseOver')
      this.$emit('edge-mouseover', event, edge)
    },
    edgeMouseEnter  (event, edge) {
      console.log('edgeMouseEnter')
      this.$emit('edge-mouseenter', event, edge)
    },
    edgeMouseLeave  (event, edge) {
      console.log('edgeMouseLeave')
      this.$emit('edge-mouseleave', event, edge)
    },
    edgeDoubleClick  (event, edge) {
      console.log('edgeDoubleClick')
      this.$emit('edge-dblclick', event, edge)
    },
    edgeEdit (event, edge) {
      console.log('edgeEdit')
      this.$emit('edge-edit', event, edge)
    },
    edgeRemove  (event, edge) {
      this.modelservice.edges.delete(edge)
      event.stopPropagation()
      event.preventDefault()
    },
    nodeDragstart (event, node) {

    },
    nodeDragend (event, node) {

    },
    nodeClick (event, node) {

    },
    nodeMouseover (event, node) {

    },
    nodeMouseOut (event, node) {

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

.button-overlay {
  position: absolute;
  top: 40px;
  z-index: 10;
}

.button-overlay button {
  display: block;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 10px;
  border: none;
  box-shadow: none;
  color: #fff;
  font-size: 20px;
  background-color: #F15B26;
}

.button-overlay button:hover:not(:disabled) {
  border: 4px solid #b03911;
  border-radius: 5px;

  margin: -4px;
  margin-bottom: 11px;
}

.button-overlay button:disabled {
  -webkit-filter: brightness(70%);
  filter: brightness(70%);
}

.fc-node {
  z-index: 1;
}

.innerNode {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100px;
  border-radius: 5px;

  background-color: #F15B26;
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
  transition: opacity .2s;
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

.fc-leftConnectors, .fc-rightConnectors {
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
  background-color: #F7A789;
  color: #fff;
  pointer-events: all;
}

.fc-connector.fc-hover {
  background-color: #000;
}

.fc-edge {
  stroke: gray;
  stroke-width: 4;
  transition: stroke-width .2s;
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

.fc-edit .fc-nodedelete, .fc-edit .fc-nodeedit {
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
  transition: transform .2s;
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

.fc-edge-label.fc-selected .fc-edge-label-text span, .fc-edge-label.fc-edit .fc-edge-label-text span {
  border: solid red;
  color: #fff;
  font-weight: 600;
  background-color: red;
}

.fc-select-rectangle {
  border: 2px dashed #5262ff;
  position: absolute;
  background: rgba(20,125,255,0.1);
  z-index: 2;
}

@keyframes dash {
  from {
    stroke-dashoffset: 500;
  }
}
</style>
