const SET_MODEL = 'SET_MODEL'
const UPDATE_NODE = 'UPDATE_NODE'
const UPDATE_EDGE = 'UPDATE_EDGE'
const UPDATE_CONNECTOR = 'UPDATE_CONNECTOR'
const DELETE_CONNECTOR = 'DELETE_CONNECTOR'
const UPDATE_CANVAS_OFFSET = 'UPDATE_CANVAS_OFFSET'
const DESELECT_ALL = 'DESELECT_ALL'
const DESELECT_OBJECT = 'DESELECT_OBJECT'
const SELECT_OBJECT = 'SELECT_OBJECT'
const PUSH_NODE_ELEMENT = 'PUSH_NODE_ELEMENT'
const CanvasStore = function (canvas, initialState = {}) {
  if (!canvas) {
    throw new Error('Canvas is required.')
  }
  this.canvas = canvas

  this.state = {
    model: null,
    canvasOffset: {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    },
    connectors: {},
    // 当前选中的元素，包括节点和连线
    selectedObjects: [],
    nodeElements: {}
  }

  for (let prop in initialState) {
    if (initialState.hasOwnProperty(prop) && this.state.hasOwnProperty(prop)) {
      this.state[prop] = initialState[prop]
    }
  }
}

CanvasStore.prototype.mutations = {
  [SET_MODEL] (state, model) {
    state.model = model || {}
  },
  [UPDATE_CANVAS_OFFSET] (state, offset) {
    Object.assign(state.canvasOffset, offset)
  },
  [UPDATE_NODE] (state, {node, newNode}) {
    let index = state.model.nodes.indexOf(node)
    if (newNode) {
      Object.assign(state.model.nodes[index], newNode)
    } else {
      state.model.nodes.splice(index, 1)
      delete state.nodeElements[node.id]
    }
  },
  [UPDATE_EDGE] (state, {edge, newEdge}) {
    let index = state.model.edges.indexOf(edge)
    if (newEdge) {
      Object.assign(state.model.edges[index], newEdge)
    } else {
      state.model.edges.splice(index, 1)
    }
  },
  [UPDATE_CONNECTOR] (state, {connectorId, x, y}) {
    if (state.connectors[connectorId]) {
      state.connectors[connectorId].x = x
      state.connectors[connectorId].y = y
    } else {
      this._vm.$set(state.connectors, connectorId, {x, y})
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
    if (index === -1) {
      throw new Error('Tried to deselect an unselected object')
    }
    state.selectedObjects.splice(index, 1)
  },
  [PUSH_NODE_ELEMENT] (state, {nodeId, element}) {
    state.nodeElements[nodeId] = element
  }
}
CanvasStore.prototype.commit = function (name, ...args) {
  const mutations = this.mutations
  if (mutations[name]) {
    mutations[name].apply(this, [this.state].concat(args))
  } else {
    throw new Error(`Action not found: ${name}`)
  }
}
// getters
CanvasStore.prototype.isDropSource = function () {
  return !!this.state.dropTargetId
}
CanvasStore.prototype.isEditable = function () {
  return !this.state.dropTargetId
}
CanvasStore.prototype.isSelectedObject = function (object) {
  return this.state.selectedObjects.indexOf(object) !== -1
}
CanvasStore.prototype.isEditObject = function (object) {
  return this.state.selectedObjects.length === 1 &&
  this.state.selectedObjects.indexOf(object) !== -1
}
// actions
CanvasStore.prototype.updateNode = function ({node, newNode, isPushState}) {
  this.commit(UPDATE_NODE, {node, newNode})
  if (!newNode && node.connectors) {
    let connectorIds = node.connectors.map(item => item.id)
    for (let i = 0; i < this.state.model.edges.length; i++) {
      let edge = this.state.model.edges[i]
      if (connectorIds.indexOf(edge.source) !== -1 || connectorIds.indexOf(edge.destination) !== -1) {
        this.updateEdge({
          edge,
          newEdge: null,
          isPushState: false
        })
      }
    }
  }
  // if (isPushState) {
  //   commit(PUSH_STATE, state.model, { root: true })
  // }
}
CanvasStore.prototype.updateSelecctedObjects = function ({object, ctrlKey}) {
  if (ctrlKey) {
    this.toggleSelectedObject(object)
  } else {
    this.commit(DESELECT_ALL)
    this.commit(SELECT_OBJECT, object)
  }
}
CanvasStore.prototype.updateEdge = function ({edge, newEdge, isPushState}) {
  this.commit(UPDATE_EDGE, {edge, newEdge})
  if (!newEdge) {
    this.commit(DELETE_CONNECTOR, edge.source)
    this.commit(DELETE_CONNECTOR, edge.destination)
  }
  // if (isPushState) {
  //   this.commit(PUSH_STATE, state.model, { root: true })
  // }
}
CanvasStore.prototype.toggleSelectedObject = function (object) {
  if (this.isSelectedObject(object)) {
    this.commit(DESELECT_OBJECT, object)
  } else {
    this.commit(SELECT_OBJECT, object)
  }
}
export default CanvasStore
