import { normalizeStock } from '../../utils/stock.js'

const STORAGE_KEY = 'vue-project-cart'

const loadCart = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const items = saved ? JSON.parse(saved) : []

    if (!Array.isArray(items)) return []

    return items
      .filter((item) => item && item.id != null && Number.isSafeInteger(item.quantity) && item.quantity > 0)
      .filter((item) => Number.isFinite(Number(item.price)) && Number(item.price) >= 0)
      .map((item) => ({ ...item, id: String(item.id), price: Number(item.price), stock: normalizeStock(item.stock) }))
  } catch {
    return []
  }
}

const saveCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn('Cart gagal disimpan:', error)
  }
}

const state = () => ({
  items: loadCart(),
})

const getters = {
  cartItems: (state) => state.items,

  canAddToCart: (state) => (product) => {
    const stock = normalizeStock(product.stock)
    const quantity = state.items.find((item) => item.id === String(product.id))?.quantity ?? 0
    return stock == null || quantity < stock
  },

  cartCount: (state) => {
    return state.items.reduce(
      (total, item) => total + item.quantity,
      0
    )
  },

  cartTotal: (state) => {
    return state.items.reduce(
      (total, item) => {
        return total + item.price * item.quantity
      },
      0
    )
  },

  isInCart: (state) => (productId) => {
    return state.items.some(
      (item) => item.id === String(productId)
    )
  },
}

const mutations = {
  ADD_TO_CART(state, product) {
    const stock = normalizeStock(product.stock)
    const existing = state.items.find(
      (item) => item.id === String(product.id)
    )

    if (existing) existing.stock = stock
    if (stock != null && (existing?.quantity ?? 0) >= stock) {
      saveCart(state.items)
      return
    }

    if (existing) {
      existing.quantity += 1
    } else {
      state.items.push({
        id: String(product.id),
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: 1,
        stock,
      })
    }

    saveCart(state.items)
  },

  REMOVE_FROM_CART(state, productId) {
    state.items = state.items.filter(
      (item) => item.id !== String(productId)
    )

    saveCart(state.items)
  },

  UPDATE_QUANTITY(state, { productId, quantity }) {
    const item = state.items.find(
      (item) => item.id === String(productId)
    )

    if (!item) return

    const nextQuantity = Number(quantity)

    if (!Number.isSafeInteger(nextQuantity)) return
    if (item.stock != null && nextQuantity > item.stock) return

    if (nextQuantity <= 0) {
      state.items = state.items.filter(
        (item) => item.id !== String(productId)
      )
    } else {
      item.quantity = nextQuantity
    }

    saveCart(state.items)
  },

  CLEAR_CART(state) {
    state.items = []
    saveCart(state.items)
  },
}

const actions = {
  addToCart({ commit }, product) {
    commit('ADD_TO_CART', product)
  },

  removeFromCart({ commit }, productId) {
    commit('REMOVE_FROM_CART', productId)
  },

  updateQuantity({ commit }, payload) {
    commit('UPDATE_QUANTITY', payload)
  },

  clearCart({ commit }) {
    commit('CLEAR_CART')
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
