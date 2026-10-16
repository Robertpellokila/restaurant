import api, { getApiError } from '../../services/api.js'
import { normalizeCollection } from '../../services/firebase.js'

export default {
  namespaced: true,
  state: () => ({
    testimonials: [],
    loading: false,
    loaded: false,
    error: null,
    page: 1,
    limit: 12,
  }),
  getters: {
    allTestimonials: (state) => state.testimonials,
    paginatedTestimonials: (state) => state.testimonials.slice(
      (state.page - 1) * state.limit, state.page * state.limit,
    ),
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    totalPages: (state) => Math.ceil(state.testimonials.length / state.limit),
  },
  mutations: {
    SET_TESTIMONIALS(state, testimonials) {
      state.testimonials = testimonials
      state.loaded = true
      state.page = Math.min(state.page, Math.max(1, Math.ceil(testimonials.length / state.limit)))
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_PAGE(state, page) {
      const lastPage = Math.max(1, Math.ceil(state.testimonials.length / state.limit))
      state.page = Math.min(lastPage, Math.max(1, Math.trunc(Number(page)) || 1))
    },
  },
  actions: {
    async fetchTestimonials({ commit, state }, { force = false } = {}) {
      if (state.loaded && !force && !state.error) return state.testimonials
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const { data } = await api.get('/testimonial.json')
        const testimonials = normalizeCollection(data)
        commit('SET_TESTIMONIALS', testimonials)
        return testimonials
      } catch (error) {
        commit('SET_ERROR', getApiError(error))
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    setPage({ commit }, page) {
      commit('SET_PAGE', page)
    },
  },
}
