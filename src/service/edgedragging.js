import flowchartConstants from '@/config/flowchart'

function EdgeDraggingFactory (store, initialState = {}) {
  this.isValidEdgeCallback = () => {
    return true
  }
  this.store = store
  this.draggedEdgeSource = null
  for (let prop in initialState) {
    if (initialState.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
      this[prop] = initialState[prop]
    }
  }
}
let dragImage = null
// 一个透明图像
const getDragImage = function () {
  if (!dragImage) {
    dragImage = new Image()
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    dragImage.style.visibility = 'hidden'
  }
  return dragImage
}
EdgeDraggingFactory.prototype.init = function () {
  let edgeDragging = {
    isDragging: false,
    dragPoint1: null,
    dragPoint2: null,
    dragLabel: '',
    prevEdge: null
  }
  this.store.commit('UPDATE_EDGE_DRAGGING', edgeDragging)
}
EdgeDraggingFactory.prototype.dragstart = function (event, connector, type) {
  let swapConnector = null
  let dragLabel = ''
  let prevEdge = null
  let edgeDragging = {}
  edgeDragging.isDragging = true
  // 拖拽点为左类型，则删去原来连线并记录
  if (type === flowchartConstants.leftConnectorType) {
    for (let edge of this.store.state.model.edges) {
      // 选择第一个，当多个的话 拖拽结束会把前面的edge放到列表后面
      if (edge.destination === connector.id) {
        swapConnector = {
          id: edge.source
        }
        dragLabel = edge.label
        prevEdge = edge
        this.store.updateEdge({
          edge,
          newEdge: null
        })
        break
      }
    }
  }

  if (swapConnector) {
    this.draggedEdgeSource = swapConnector
    edgeDragging.dragPoint1 = this.store.getConnector(swapConnector.id)
    edgeDragging.dragLabel = dragLabel
    edgeDragging.prevEdge = prevEdge
  } else {
    this.draggedEdgeSource = connector
    edgeDragging.dragPoint1 = this.store.getConnector(connector.id)
  }

  edgeDragging.dragPoint2 = {
    x: event.clientX - this.store.getCanvasOffsetRelativeLeft(),
    y: event.clientY - this.store.getCanvasOffsetRelativeTop()
  }
  try {
    event.dataTransfer.setData('text', 'Just to support firefox')
  } catch (error) {
    console.warn('ie will report error:', error)
  }
  if (event.dataTransfer.setDragImage) {
    event.dataTransfer.setDragImage(getDragImage(), 0, 0)
  }
  this.store.commit('UPDATE_EDGE_DRAGGING', edgeDragging)
}

EdgeDraggingFactory.prototype.drop = function (event) {
  this.init()
}
EdgeDraggingFactory.prototype.dragend = function (event) {
  let edgeDragging = this.store.state.edgeDragging
  if (edgeDragging.isDragging) {
    if (edgeDragging.prevEdge) {
      this.store.commit('ADD_EDGE', edgeDragging.prevEdge)
    }
    this.init()
  }
}
EdgeDraggingFactory.prototype.dragover = function (event) {
  let edgeDragging = this.store.state.edgeDragging
  if (edgeDragging.isDragging) {
    if (!edgeDragging.magnetActive) {
      this.store.commit('UPDATE_EDGE_DRAGGING', {
        dragPoint2: {
          x: event.clientX - this.store.getCanvasOffsetRelativeLeft(),
          y: event.clientY - this.store.getCanvasOffsetRelativeTop()
        }
      })
    }
  }
}
export default EdgeDraggingFactory
