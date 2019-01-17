<template>
  <div
    id="fc-canvas"
    ref="canvas"
    class="fc-canvas"
    ng-click="canvasClick($event)"
    @dragover="dragover"
    @drop="drop"
    @mousedown="mousedown"
    @mousemove="mousemove"
    @mouseup="mouseup"
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
          :class="(modelservice.edges.isSelected(edge) && flowchartConstants.selectedClass + ' ' + flowchartConstants.edgeClass) || edge == mouseOver.edge && flowchartConstants.hoverClass + ' ' + flowchartConstants.edgeClass || edge.active && flowchartConstants.activeClass + ' ' + flowchartConstants.edgeClass || flowchartConstants.edgeClass"
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
      selected="modelservice.nodes.isSelected(node)"
      edit="modelservice.nodes.isEdit(node)"
      under-mouse="node === mouseOver.node"
      mouse-over-connector="mouseOver.connector"
      dragged-node="nodeDragging.draggedNode"
      callbacks="callbacks"
      user-node-callbacks="userNodeCallbacks"/>

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
      :class="'fc-noselect ' + ((modelservice.edges.isEdit(edge) && flowchartConstants.editClass + ' ' + flowchartConstants.edgeLabelClass) || (modelservice.edges.isSelected(edge) && flowchartConstants.selectedClass + ' ' + flowchartConstants.edgeLabelClass) || edge == mouseOver.edge && flowchartConstants.hoverClass + ' ' + flowchartConstants.edgeLabelClass || edge.active && flowchartConstants.activeClass + flowchartConstants.edgeLabelClass || flowchartConstants.edgeLabelClass)"
      :style="{ top: (getEdgeCenter(modelservice.edges.sourceCoord(edge), modelservice.edges.destCoord(edge)).y)+'px',
                left: (getEdgeCenter(modelservice.edges.sourceCoord(edge), modelservice.edges.destCoord(edge)).x)+'px'}"
      ng-mousedown="edgeMouseDown($event, edge)"
      ng-click="edgeClick($event, edge)"
      ng-dblclick="edgeDoubleClick($event, edge)"
      ng-mouseover="edgeMouseOver($event, edge)"
      ng-mouseenter="edgeMouseEnter($event, edge)"

      ng-mouseleave="edgeMouseLeave($event, edge)"
    >
      <div class="fc-edge-label-text">
        <div
          v-if="modelservice.isEditable()"
          class="fc-noselect fc-nodeedit"
          @click="edgeEdit($event, edge)">
          <i
            class="fa fa-pencil"
            aria-hidden="true"/>
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
import NodedraggingFactory from '@/service/nodedragging'
import EdgedraggingFactory from '@/service/edgedragging'
import MouseoverFactory from '@/service/mouseover'
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
    userCallbacks: {
      type: Object,
      default: () => {
        return {}
      },
      validator: function (userCallbacks) {
        let result = true
        for (let key in userCallbacks) {
          if (typeof userCallbacks[key] !== 'function' && key !== 'nodeCallbacks') {
            result = false
            break
          }
        }
        return result
      }
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
      mouseOver: {},
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
    this.modelservice = ModelFactory(this.model, this.selectedObjects, this.userCallbacks.dropNode, this.userCallbacks.createEdge, this.userCallbacks.edgeAdded || noop, this.userCallbacks.nodeRemoved || noop, this.userCallbacks.edgeRemoved || noop)
    this.canvasservice = CanvasFactory()

    var nodedraggingservice = NodedraggingFactory(this.modelservice, this.nodeDragging, this.$apply, this.automaticResize, this.dragAnimation)

    var edgedraggingservice = EdgedraggingFactory(this.modelservice, this.model, this.edgeDragging, this.userCallbacks.isValidEdge || null, this.$apply, this.dragAnimation, this.edgeStyle)

    var mouseoverservice = MouseoverFactory(this.mouseOver, this.$apply)

    this.rectangleselectservice = RectangleselectFactory(this.modelservice, this.$apply)

    this.edgeMouseEnter = mouseoverservice.edgeMouseEnter
    this.edgeMouseLeave = mouseoverservice.edgeMouseLeave

    this.edgeDoubleClick = this.userCallbacks.edgeDoubleClick || noop
    this.edgeMouseOver = this.userCallbacks.edgeMouseOver || noop
    this.edgeEdit = this.userCallbacks.edgeEdit || noop

    this.userNodeCallbacks = this.userCallbacks.nodeCallbacks
    this.callbacks = {
      nodeDragstart: nodedraggingservice.dragstart,
      nodeDragend: nodedraggingservice.dragend,
      edgeDragstart: edgedraggingservice.dragstart,
      edgeDragend: edgedraggingservice.dragend,
      edgeDrop: edgedraggingservice.drop,
      edgeDragoverConnector: edgedraggingservice.dragoverConnector,
      edgeDragoverMagnet: edgedraggingservice.dragoverMagnet,
      edgeDragleaveMagnet: edgedraggingservice.dragleaveMagnet,
      nodeMouseOver: mouseoverservice.nodeMouseOver,
      nodeMouseOut: mouseoverservice.nodeMouseOut,
      connectorMouseEnter: mouseoverservice.connectorMouseEnter,
      connectorMouseLeave: mouseoverservice.connectorMouseLeave,
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
  },
  mounted () {
    this.canvasservice.setCanvasHtmlElement(this.$refs.canvas)
    this.modelservice.setCanvasHtmlElement(this.$refs.canvas)
    this.modelservice.setSvgHtmlElement(this.$refs.canvas.querySelector('svg'))
  },
  methods: {
    drop  (event) {
      this.nodedraggingervice.drop(event)
      this.canvasservice._notifyDrop(event)
    },

    dragover  (event) {
      this.nodedraggingservice.dragover(event)
      this.edgedraggingservice.dragover(event)
      this.canvasservice._notifyDragover(event)
    },

    mousedown  (event) {
      this.rectangleselectservice.mousedown(event)
    },

    mousemove  (event) {
      this.rectangleselectservice.mousemove(event)
    },

    mouseup  (event) {
      this.rectangleselectservice.mouseup(event)
    },

    edgeMouseDown  (event, edge) {
      event.stopPropagation()
    },

    edgeClick  (event, edge) {
      this.modelservice.edges.handleEdgeMouseClick(edge, event.ctrlKey)
      // Don't let the chart handle the mouse down.
      event.stopPropagation()
      event.preventDefault()
    },

    edgeRemove  (event, edge) {
      this.modelservice.edges.delete(edge)
      event.stopPropagation()
      event.preventDefault()
    },
    getEdgeDAttribute: EdgedrawingService.getEdgeDAttribute,
    getEdgeCenter: EdgedrawingService.getEdgeCenter
  }
}
</script>
<style>

</style>
