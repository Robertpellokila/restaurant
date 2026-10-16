import api, { getApiError } from '../../services/api.js'
import { normalizeCollection, normalizeProduct, normalizeRecord } from '../../services/firebase.js'

export default {
  namespaced: true,
  state: () => ({
    products: [],
    selectedProduct: null,
    searchQuery: '',
    loading: false,
    loaded: false,
    error: null,
  }),
  getters: {
    allProducts: (state) => state.products,
    selectedProduct: (state) => state.selectedProduct,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    totalProducts: (state) => state.products.length,
    getProductById: (state) => (id) => state.products.find((product) => product.id === String(id)),
    filteredProducts: (state) => {
      const query = state.searchQuery.toLowerCase().trim()
      return state.products.filter((product) =>
        [product.title, product.description, product.category].join(' ').toLowerCase().includes(query),
      )
    },
  },
  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products
      state.loaded = true
    },
    SET_SELECTED_PRODUCT(state, product) {
      state.selectedProduct = product
    },
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
  },
  actions: {
    async fetchProducts({ commit, state }, { force = false } = {}) {
      if (state.loaded && !force && !state.error) return state.products
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const { data } = await api.get('/products.json')
        const products = normalizeCollection(data, normalizeProduct)
        commit('SET_PRODUCTS', products)
        return products
      } catch (error) {
        commit('SET_ERROR', getApiError(error))
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchProductById({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      commit('SET_SELECTED_PRODUCT', null)
      try {
        const { data } = await api.get(`/products/${encodeURIComponent(id)}.json`)
        const product = normalizeRecord(data, id, normalizeProduct)
        commit('SET_SELECTED_PRODUCT', product)
        return product
      } catch (error) {
        commit('SET_ERROR', getApiError(error))
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async searchProducts({ commit, dispatch, getters }, keyword) {
      commit('SET_SEARCH_QUERY', keyword)
      await dispatch('fetchProducts')
      return getters.filteredProducts
    },
  },
}
