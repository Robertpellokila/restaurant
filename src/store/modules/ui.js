export default {
  namespaced: true,
  state: () => ({ isMenuOpen: false }),
  mutations: {
    SET_MENU_OPEN(state, open) {
      state.isMenuOpen = open
    },
  },
  actions: {
    toggleMenu({ commit, state }) {
      commit('SET_MENU_OPEN', !state.isMenuOpen)
    },
    closeMenu({ commit }) {
      commit('SET_MENU_OPEN', false)
    },
  },
}
