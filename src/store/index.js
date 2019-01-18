import Vue from 'vue'
import Vuex from 'vuex'
import history from './modules/history'
import flow from './modules/flow'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    flow,
    history
  }
})
