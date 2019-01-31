const INIT_MODEL = 'INIT_MODEL'
const UPDATE_NODE = 'UPDATE_NODE'
const UPDATE_EDGE = 'UPDATE_EDGE'
const UPDATE_CONNECTOR = 'UPDATE_CONNECTOR'
const DELETE_CONNECTOR = 'DELETE_CONNECTOR'
const UPDATE_CANVAS_OFFSET = 'UPDATE_CANVAS_OFFSET'
const DESELECT_ALL = 'DESELECT_ALL'
const DESELECT_OBJECT = 'DESELECT_OBJECT'
const SELECT_OBJECT = 'SELECT_OBJECT'
const PUSH_NODE_ELEMENT = 'PUSH_NODE_ELEMENT'

const HISTORY = 'history/'
export const PUSH_STATE = HISTORY + 'PUSH_STATE'

export const MAX_HISTORY = 100
const state = {
  model: [],
  connectors: {},
  // 当前选中的元素，包括节点和连线
  selectedObjects: [],
  nodeElements: {},
  canvas: {
    left: 0,
    top: 0,
    width: 0,
    height: 0
  }
}
const getters = {
  getConnector: (state) => (id) => {
    return state.connectors[id]
  },
  getSelectedNodes (state, getters) {
    return state.model.nodes ? state.model.nodes.filter((node) => getters.isSelectedObject(node)) : []
  },
  isSelectedObject: (state) => (object) => {
    return state.selectedObjects.indexOf(object) !== -1
  },
  isEditObject: (state) => (object) => {
    return state.selectedObjects.length === 1 &&
    state.selectedObjects.indexOf(object) !== -1
  }
}
// actions
const actions = {
  async initModel ({ commit }, model) {
    commit(INIT_MODEL, model)
    commit(PUSH_STATE, model, { root: true })
  },
  async updateNode ({ commit, dispatch }, {node, newNode, isPushState}) {
    commit(UPDATE_NODE, {node, newNode})
    if (!newNode && node.connectors) {
      let connectorIds = node.connectors.map(item => item.id)
      for (let i = 0; i < state.model.edges.length; i++) {
        let edge = state.model.edges[i]
        if (connectorIds.indexOf(edge.source) !== -1 || connectorIds.indexOf(edge.destination) !== -1) {
          await dispatch('updateEdge', {
            edge,
            newEdge: null,
            isPushState: false
          })
        }
      }
    }
    if (isPushState) {
      commit(PUSH_STATE, state.model, { root: true })
    }
  },
  async updateEdge ({commit}, {edge, newEdge, isPushState}) {
    commit(UPDATE_EDGE, {edge, newEdge})
    if (!newEdge) {
      commit(DELETE_CONNECTOR, edge.source)
      commit(DELETE_CONNECTOR, edge.destination)
    }
    if (isPushState) {
      commit(PUSH_STATE, state.model, { root: true })
    }
  },
  async updateSelecctedObjects ({dispatch, commit}, {object, ctrlKey}) {
    if (ctrlKey) {
      await dispatch('toggleSelectedObject', object)
    } else {
      commit(DESELECT_ALL)
      commit(SELECT_OBJECT, object)
    }
  },
  async toggleSelectedObject ({commit, getters}, object) {
    if (getters.isSelectedObject(object)) {
      commit(DESELECT_OBJECT, object)
    } else {
      commit(SELECT_OBJECT, object)
    }
  }
}

// mutations
const mutations = {
  [INIT_MODEL] (state, model) {
    state.model = model
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
  [UPDATE_CANVAS_OFFSET] (state, offset) {
    Object.assign(state.canvas, offset)
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

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
