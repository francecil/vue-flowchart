import UUIDjs from '@/utils/uuid'
const SET_MODEL = 'SET_MODEL'
const UPDATE_NODE = 'UPDATE_NODE'
const ADD_NODE = 'ADD_NODE'
const DELETE_NODE = 'DELETE_NODE'
const UPDATE_EDGE = 'UPDATE_EDGE'
const ADD_EDGE = 'ADD_EDGE'
const DELETE_EDGE = 'DELETE_EDGE'
const UPDATE_CONNECTOR = 'UPDATE_CONNECTOR'
const DELETE_CONNECTOR = 'DELETE_CONNECTOR'
const UPDATE_CANVAS_OFFSET = 'UPDATE_CANVAS_OFFSET'
const DESELECT_ALL = 'DESELECT_ALL'
const DESELECT_OBJECT = 'DESELECT_OBJECT'
const SELECT_OBJECT = 'SELECT_OBJECT'
const SET_NODE_ELEMENT = 'SET_NODE_ELEMENT'
const SET_CANVAS_CONTAINER = 'SET_CANVAS_CONTAINER'
const UPDATE_EDGE_DRAGGING = 'UPDATE_EDGE_DRAGGING'
const UPDATE_RECTANGLE_SELECT = 'UPDATE_RECTANGLE_SELECT'
const CanvasStore = function (canvas, initialState = {}) {
  if (!canvas) {
    throw new Error('Canvas is required.')
  }
  this.canvas = canvas

  this.state = {
    model: null,
    dropTargetId: null,
    canvasOffset: {
      width: 0,
      height: 0
    },
    connectors: {},
    // 当前选中的元素，包括节点和连线
    selectedObjects: [],
    // node对应的dom节点
    nodeElements: {},
    canvasContainer: null,
    // 连线相关
    edgeDragging: {
      isDragging: false,
      dragPoint1: null,
      dragPoint2: null,
      prevEdge: null
    },
    // 选择区域
    rectangleSelect: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      visibility: 'hidden'
    }
  }

  for (let prop in initialState) {
    if (initialState.hasOwnProperty(prop) && this.state.hasOwnProperty(prop)) {
      this.state[prop] = initialState[prop]
    }
  }
}
/** *************** mutations *****************/
CanvasStore.prototype.mutations = {
  [SET_MODEL] (state, model) {
    state.model = model || {}
  },
  [UPDATE_CANVAS_OFFSET] (state, offset) {
    Object.assign(state.canvasOffset, offset)
  },
  [ADD_NODE] (state, node) {
    state.model.nodes.push(node)
  },
  [UPDATE_NODE] (state, {node, newNode}) {
    let index = state.model.nodes.indexOf(node)
    if (index !== -1) {
      Object.assign(state.model.nodes[index], newNode)
    }
  },
  [DELETE_NODE] (state, node) {
    let index = state.model.nodes.indexOf(node)
    if (index !== -1) {
      state.model.nodes.splice(index, 1)
      delete state.nodeElements[node.id]
    }
  },
  [UPDATE_EDGE] (state, {edge, newEdge}) {
    let index = state.model.edges.indexOf(edge)
    if (index !== -1) {
      Object.assign(state.model.edges[index], newEdge)
    }
  },
  [DELETE_EDGE] (state, edge) {
    let index = state.model.edges.indexOf(edge)
    if (index !== -1) {
      state.model.edges.splice(index, 1)
    }
  },
  [ADD_EDGE] (state, edge) {
    state.model.edges.push(edge)
  },
  [UPDATE_CONNECTOR] (state, {connectorId, x, y}) {
    if (state.connectors[connectorId]) {
      state.connectors[connectorId].x = x
      state.connectors[connectorId].y = y
    } else {
      this.canvas.$set(state.connectors, connectorId, {x, y})
    }
  },
  [DELETE_CONNECTOR] (state, connectorId) {
    delete state.connectors[connectorId]
  },
  [DESELECT_ALL] (state) {
    state.selectedObjects.splice(0, state.selectedObjects.length)
  },
  [SELECT_OBJECT] (state, object) {
    if (object && state.selectedObjects.indexOf(object) === -1) {
      state.selectedObjects.push(object)
    }
  },
  [DESELECT_OBJECT] (state, object) {
    let index = state.selectedObjects.indexOf(object)
    if (index !== -1) {
      state.selectedObjects.splice(index, 1)
    }
  },
  [SET_NODE_ELEMENT] (state, {nodeId, element}) {
    state.nodeElements[nodeId] = element
  },
  [SET_CANVAS_CONTAINER] (state, element) {
    state.canvasContainer = element
  },
  [UPDATE_EDGE_DRAGGING] (state, edgeDragging) {
    Object.assign(state.edgeDragging, edgeDragging)
  },
  [UPDATE_RECTANGLE_SELECT] (state, rectangleSelect) {
    Object.assign(state.rectangleSelect, rectangleSelect)
  }
}
CanvasStore.prototype.commit = function (name, ...args) {
  console.log(name, args)
  const mutations = this.mutations
  if (mutations[name]) {
    mutations[name].apply(this, [this.state].concat(args))
  } else {
    throw new Error(`Action not found: ${name}`)
  }
}
/** *************** getters *****************/
// 预置节点画板
CanvasStore.prototype.isDropSource = function () {
  return !!this.state.dropTargetId
}
// 当前画板为主画板
CanvasStore.prototype.isEditable = function () {
  return !this.state.dropTargetId
}
// 当前元素是否被选中
CanvasStore.prototype.isSelectedObject = function (object) {
  return this.state.selectedObjects.indexOf(object) !== -1
}
// 当前元素是否为可编辑状态
CanvasStore.prototype.isEditObject = function (object) {
  return this.state.selectedObjects.length === 1 &&
  this.isSelectedObject(object)
}
CanvasStore.prototype.getConnector = function (id) {
  return this.state.connectors[id]
}
// 所有被选中的节点
CanvasStore.prototype.getSelectedNodes = function () {
  return this.state.model.nodes ? this.state.model.nodes.filter((node) => this.isSelectedObject(node)) : []
}
// canvas的绝对位置,left，top值不受滚动条影响
CanvasStore.prototype.getCanvasOffsetLeft = function () {
  return this.state.canvasContainer ? this.state.canvasContainer.getBoundingClientRect().left + this.state.canvasContainer.parentElement.scrollLeft : 0
}
CanvasStore.prototype.getCanvasOffsetTop = function () {
  return this.state.canvasContainer ? this.state.canvasContainer.getBoundingClientRect().top + this.state.canvasContainer.parentElement.scrollTop : 0
}
// canvas的相对位置，会偏小
CanvasStore.prototype.getCanvasOffsetRelativeLeft = function () {
  return this.state.canvasContainer ? this.state.canvasContainer.getBoundingClientRect().left : 0
}
CanvasStore.prototype.getCanvasOffsetRelativeTop = function () {
  return this.state.canvasContainer ? this.state.canvasContainer.getBoundingClientRect().top : 0
}
/** *************** actions *****************/
CanvasStore.prototype.addNode = function (node) {
  if (node.id === undefined) {
    node.id = UUIDjs.create('node')
  }
  if (node.x === undefined) {
    node.x = 400
  }
  if (node.y === undefined) {
    node.y = 400
  }
  this.commit(ADD_NODE, node)
}
CanvasStore.prototype.updateNode = function ({node, newNode, isPushState}) {
  this.commit(UPDATE_NODE, {node, newNode})
  // if (isPushState) {
  //   commit(PUSH_STATE, state.model, { root: true })
  // }
}
CanvasStore.prototype.deleteNode = function ({node, isPushState}) {
  this.commit(DELETE_NODE, node)
  this.commit(DESELECT_OBJECT, node)
  // 删除节点 同时删除连接点和相关连线
  if (node.connectors) {
    let connectorIds = []
    for (let type in node.connectors) {
      let connector = node.connectors[type]
      this.commit(DELETE_CONNECTOR, connector.id)
      connectorIds.push(connector.id)
    }
    for (let i = 0; i < this.state.model.edges.length;) {
      let edge = this.state.model.edges[i]
      if (connectorIds.indexOf(edge.source) !== -1 || connectorIds.indexOf(edge.destination) !== -1) {
        this.deleteEdge({
          edge,
          isPushState: false
        })
      } else {
        i++
      }
    }
  }
}
CanvasStore.prototype.addEdge = function (edge) {
  this.commit(ADD_EDGE, edge)
}
CanvasStore.prototype.updateEdge = function ({edge, newEdge, isPushState}) {
  this.commit(UPDATE_EDGE, {edge, newEdge})
  // if (!newEdge) {
  //   this.commit(DELETE_CONNECTOR, edge.source)
  //   this.commit(DELETE_CONNECTOR, edge.destination)
  // }
  // if (isPushState) {
  //   this.commit(PUSH_STATE, state.model, { root: true })
  // }
}
CanvasStore.prototype.deleteEdge = function ({edge, isPushState}) {
  this.commit(DELETE_EDGE, edge)
  this.commit(DESELECT_OBJECT, edge)
  // if (isPushState) {
  //   this.commit(PUSH_STATE, state.model, { root: true })
  // }
}
// 删除选中元素
CanvasStore.prototype.deleteSelected = function () {
  while (this.state.selectedObjects.length > 0) {
    let item = this.state.selectedObjects[0]
    if (item.id !== undefined) {
      this.deleteNode({
        node: item
      })
    } else {
      this.deleteEdge({
        edge: item
      })
    }
  }
}
// 更新选择元素列表
CanvasStore.prototype.updateSelecctedObjects = function ({object, ctrlKey}) {
  if (ctrlKey) {
    this.toggleSelectedObject(object)
  } else {
    this.deselectAll()
    this.commit(SELECT_OBJECT, object)
  }
}
// 全选
CanvasStore.prototype.selectAll = function () {
  this.deselectAll()
  for (let node of this.state.model.nodes) {
    this.commit(SELECT_OBJECT, node)
  }
  for (let edge of this.state.model.edges) {
    this.commit(SELECT_OBJECT, edge)
  }
}
// 反选全部数据
CanvasStore.prototype.deselectAll = function () {
  this.commit(DESELECT_ALL)
}
// 更新当前所选元素状态
CanvasStore.prototype.toggleSelectedObject = function (object) {
  if (this.isSelectedObject(object)) {
    this.commit(DESELECT_OBJECT, object)
  } else {
    this.commit(SELECT_OBJECT, object)
  }
}
// 选中选择框中元素
CanvasStore.prototype.selectAllInRect = function () {
  this.commit(DESELECT_ALL)
  let rectBox = {
    left: this.state.rectangleSelect.left,
    right: this.state.rectangleSelect.left + this.state.rectangleSelect.width,
    top: this.state.rectangleSelect.top,
    bottom: this.state.rectangleSelect.top + this.state.rectangleSelect.height
  }
  if (rectBox.left === rectBox.right && rectBox.top === rectBox.bottom) {
    // click handle
    return
  }
  let canvasLeft = this.getCanvasOffsetRelativeLeft()
  let canvasTop = this.getCanvasOffsetRelativeTop()
  for (let node of this.state.model.nodes) {
    let nodeElement = this.state.nodeElements[node.id]
    let nodeElementBox = nodeElement.getBoundingClientRect()
    if (!node.readonly) {
      let x = nodeElementBox.left + nodeElementBox.width / 2 - canvasLeft
      let y = nodeElementBox.top + nodeElementBox.height / 2 - canvasTop
      if (inRectBox(x, y, rectBox)) {
        this.commit(SELECT_OBJECT, node)
      }
    }
  }
  for (let edge of this.state.model.edges) {
    let start = this.getConnector(edge.source)
    let end = this.getConnector(edge.destination)
    let x = (start.x + end.x) / 2
    let y = (start.y + end.y) / 2
    if (inRectBox(x, y, rectBox)) {
      this.commit(SELECT_OBJECT, edge)
    }
  }
}
/** ******** utils *********/
function inRectBox (x, y, rectBox) {
  console.log(x, y, rectBox)
  return x >= rectBox.left && x <= rectBox.right &&
            y >= rectBox.top && y <= rectBox.bottom
}
export default CanvasStore
