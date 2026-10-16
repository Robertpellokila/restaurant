import { createStore } from 'vuex'

import products from './modules/products.js'
import recipes from './modules/recipes.js'
import cart from './modules/cart.js'
import testimonials from './modules/testimonials.js'
import ui from './modules/ui.js'

const store = createStore({
  strict: import.meta.env?.DEV ?? false,
  modules: {
    products,
    recipes,
    cart,
    testimonials,
    ui,
  },
})

export default store
