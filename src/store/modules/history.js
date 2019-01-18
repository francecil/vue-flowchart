export const PUSH_STATE = 'PUSH_STATE'

export const MAX_HISTORY = 100
export const DEFAULT_MODEL = JSON.stringify({nodes: [], edges: []})
const state = {
  snapshots: [],
  cursor: -1
}
const getters = {
  currentModelJSON (state) {
    return state.cursor >= 0 ? state.snapshots[state.cursor] : DEFAULT_MODEL
  },
  currentModel (state, getters) {
    return JSON.parse(getters.currentModelJSON)
  }
}
// actions
const actions = {
}

// mutations
const mutations = {
  [PUSH_STATE] (state, model) {
    state.snapshots.push(JSON.stringify(model))
    state.cursor = state.cursor + 1
  }

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
