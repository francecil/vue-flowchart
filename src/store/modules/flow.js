export const INIT_MODEL = 'INIT_MODEL'
export const UPDATE_NODE = 'UPDATE_NODE'
export const UPDATE_EDGE = 'UPDATE_EDGE'
const HISTORY = 'history/'
export const PUSH_STATE = HISTORY + 'PUSH_STATE'

export const MAX_HISTORY = 100
const state = {
  model: []
}
const getters = {

}
// actions
const actions = {
  async initModel ({ commit }, model) {
    await commit(INIT_MODEL, model)
    await commit(PUSH_STATE, model, { root: true })
  },
  async updateNode ({commit}, {node, newNode, isPushState}) {
    await commit(UPDATE_NODE, {node, newNode})
    if (isPushState) {
      commit(PUSH_STATE, state.model, { root: true })
    }
  },
  async updateEdge ({commit}, {edge, newEdge, isPushState}) {
    await commit(UPDATE_EDGE, {edge, newEdge})
    if (isPushState) {
      commit(PUSH_STATE, state.model, { root: true })
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
    Object.assign(state.model.nodes[index], newNode)
  },
  [UPDATE_EDGE] (state, {edge, newEdge}) {
    let index = state.model.edges.indexOf(edge)
    Object.assign(state.model.edges[index], newEdge)
  }

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
