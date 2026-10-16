import assert from 'node:assert/strict'
import { beforeEach, afterEach, test } from 'node:test'
import { createStore } from 'vuex'
import { readFile } from 'node:fs/promises'
import api from '../src/services/api.js'
import products from '../src/store/modules/products.js'
import recipes from '../src/store/modules/recipes.js'
import testimonials from '../src/store/modules/testimonials.js'
import cart from '../src/store/modules/cart.js'
import { normalizeCollection } from '../src/services/firebase.js'
import { formatPrice } from '../src/utils/currency.js'

const originalAdapter = api.defaults.adapter
const originalStorage = globalThis.localStorage
let requests
let store

function createTestStore() {
  return createStore({ strict: true, modules: { products, recipes, testimonials, cart } })
}

function respondWith(data) {
  api.defaults.adapter = async (config) => {
    requests.push(config)
    return { data, status: 200, statusText: 'OK', headers: {}, config }
  }
}

beforeEach(() => {
  requests = []
  const storage = new Map()
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  }
  store = createTestStore()
})

afterEach(() => {
  api.defaults.adapter = originalAdapter
  if (originalStorage === undefined) delete globalThis.localStorage
  else globalThis.localStorage = originalStorage
})

test('Firebase object keys remain canonical IDs through product details and the cart', async () => {
  respondWith({ '-firebase-key': { id: 42, title: 'Kopi', price: '12.50' } })
  const [product] = await store.dispatch('products/fetchProducts')
  assert.equal(requests[0].url, '/products.json')
  assert.equal(requests[0].baseURL, 'https://vue-project-7c5c3-default-rtdb.asia-southeast1.firebasedatabase.app')
  assert.equal(requests[0].params, undefined)
  assert.equal(product.id, '-firebase-key')
  assert.equal(product.price, 12.5)
  assert.equal(store.getters['products/getProductById']('-firebase-key').title, 'Kopi')

  await store.dispatch('cart/addToCart', product)
  await store.dispatch('cart/addToCart', product)
  assert.equal(store.getters['cart/cartCount'], 2)
  assert.equal(store.getters['cart/cartTotal'], 25)
  assert.equal(store.getters['cart/isInCart']('-firebase-key'), true)

  respondWith({ id: 42, title: 'Kopi', price: '12.50' })
  const detail = await store.dispatch('products/fetchProductById', product.id)
  assert.equal(requests.at(-1).url, '/products/-firebase-key.json')
  assert.equal(detail.id, product.id)
})

test('Firebase array indices identify detail paths and null collections are empty', async () => {
  respondWith([null, { id: 55, title: 'Teh', price: 5 }])
  const result = await store.dispatch('products/fetchProducts')
  assert.equal(result[0].id, '1')
  assert.equal(store.getters['products/getProductById'](1).title, 'Teh')
  for (const [module, action, getter] of [
    ['products', 'fetchProducts', 'allProducts'],
    ['recipes', 'fetchRecipes', 'allRecipes'],
    ['testimonials', 'fetchTestimonials', 'allTestimonials'],
  ]) {
    respondWith(null)
    await store.dispatch(`${module}/${action}`, { force: true })
    assert.deepEqual(store.getters[`${module}/${getter}`], [])
    assert.equal(store.state[module].loading, false)
    assert.equal(store.state[module].error, null)
  }
  assert.throws(() => normalizeCollection('invalid'), /Format data/)
})

test('product search uses cached Firebase data without replacing the home catalog', async () => {
  respondWith({ coffee: { title: 'Kopi', price: 5 }, tea: { title: 'Teh', price: 4 } })
  await store.dispatch('products/fetchProducts')
  const results = await store.dispatch('products/searchProducts', ' KOPI ')
  assert.deepEqual(results.map((item) => item.id), ['coffee'])
  assert.equal(store.getters['products/allProducts'].length, 2)
  assert.equal(store.getters['products/totalProducts'], 2)
  assert.equal(requests.length, 1)
})

test('recipes preserve Firebase fields and support imported instructions, category and ingredient filters', async () => {
  respondWith({
    salad: { name: 'Salad', category: 'Siang', time: 15, steps: ['Campur'], ingredients: ['Tomat'] },
    soup: { name: 'Sup', mealType: ['Malam'], prepTimeMinutes: 10, cookTimeMinutes: 20, instructions: ['Rebus'], ingredients: { 0: 'Wortel' } },
  })
  await store.dispatch('recipes/fetchRecipes')
  assert.equal(requests[0].url, '/recipes.json')
  assert.equal(store.getters['recipes/getRecipeById']('salad').time, 15)
  assert.equal(store.getters['recipes/getRecipeById']('soup').time, 30)
  assert.deepEqual(store.getters['recipes/getRecipeById']('soup').steps, ['Rebus'])
  await store.dispatch('recipes/searchRecipes', 'wortel')
  assert.deepEqual(store.getters['recipes/filteredRecipes'].map((item) => item.id), ['soup'])
  store.commit('recipes/SET_CATEGORY', 'Siang')
  assert.equal(store.getters['recipes/filteredRecipes'].length, 0)
  await store.dispatch('recipes/resetFilters')
  assert.equal(store.getters['recipes/filteredRecipes'].length, 2)
  await store.dispatch('recipes/selectRecipe', 'salad')
  assert.equal(store.getters['recipes/selectedRecipe'].name, 'Salad')
  await store.dispatch('recipes/closeRecipe')
  assert.equal(store.getters['recipes/selectedRecipe'], null)

  respondWith({ name: 'Sup', ingredients: ['Wortel'], steps: ['Rebus'] })
  await store.dispatch('recipes/fetchRecipeById', 'soup')
  assert.equal(requests.at(-1).url, '/recipes/soup.json')
  assert.equal(store.getters['recipes/selectedRecipe'].id, 'soup')
})

test('missing detail clears the previous selection and exposes a recoverable error', async () => {
  for (const [module, action, getter] of [
    ['products', 'fetchProductById', 'selectedProduct'],
    ['recipes', 'fetchRecipeById', 'selectedRecipe'],
  ]) {
    respondWith({ title: 'Produk', name: 'Resep' })
    await store.dispatch(`${module}/${action}`, 'exists')
    respondWith(null)
    await assert.rejects(store.dispatch(`${module}/${action}`, 'missing'), /tidak ditemukan/)
    assert.equal(store.getters[`${module}/${getter}`], null)
    assert.equal(store.state[module].loading, false)
    assert.match(store.getters[`${module}/getError`], /tidak ditemukan/)
  }
})

test('testimonials paginate Firebase records locally and clamp pages when data shrinks', async () => {
  respondWith(Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`review-${i}`, { body: `Review ${i}` }])))
  await store.dispatch('testimonials/fetchTestimonials')
  assert.equal(requests[0].url, '/testimonials.json')
  assert.equal(requests[0].params, undefined)
  assert.equal(store.getters['testimonials/totalPages'], 3)
  assert.equal(store.getters['testimonials/paginatedTestimonials'].length, 12)
  await store.dispatch('testimonials/setPage', 3)
  assert.equal(store.getters['testimonials/paginatedTestimonials'][0].id, 'review-24')
  await store.dispatch('testimonials/setPage', 999)
  assert.equal(store.state.testimonials.page, 3)
  respondWith({ only: { body: 'Satu' } })
  await store.dispatch('testimonials/fetchTestimonials', { force: true })
  assert.equal(store.state.testimonials.page, 1)
  assert.equal(store.getters['testimonials/paginatedTestimonials'].length, 1)
})

test('all collections expose denied access, reset loading, and recover after retry', async () => {
  for (const [module, action] of [
    ['products', 'fetchProducts'], ['recipes', 'fetchRecipes'], ['testimonials', 'fetchTestimonials'],
  ]) {
    api.defaults.adapter = async () => {
      const error = new Error('Request failed with status code 401')
      error.response = { status: 401, data: { error: 'Permission denied' } }
      throw error
    }
    await assert.rejects(store.dispatch(`${module}/${action}`))
    assert.match(store.getters[`${module}/getError`], /Akses data ditolak/)
    assert.equal(store.state[module].loading, false)
    assert.equal(store.state[module].loaded, false)
    respondWith(null)
    await store.dispatch(`${module}/${action}`)
    assert.equal(store.getters[`${module}/getError`], null)
    assert.equal(store.state[module].loaded, true)
  }
})

test('cart updates, reloads, removes and clears string IDs without confusing other products', async () => {
  const first = { id: '-key-a', title: 'Kopi', price: 3 }
  const second = { id: '-key-b', title: 'Teh', price: 4 }
  await store.dispatch('cart/addToCart', first)
  await store.dispatch('cart/addToCart', second)
  await store.dispatch('cart/updateQuantity', { productId: first.id, quantity: 3 })
  await store.dispatch('cart/updateQuantity', { productId: first.id, quantity: 'invalid' })
  assert.equal(store.getters['cart/cartTotal'], 13)
  const restored = createTestStore()
  assert.equal(restored.getters['cart/cartCount'], 4)
  await restored.dispatch('cart/removeFromCart', first.id)
  assert.equal(restored.getters['cart/isInCart'](first.id), false)
  assert.equal(restored.getters['cart/cartTotal'], 4)
  await restored.dispatch('cart/updateQuantity', { productId: second.id, quantity: 0 })
  assert.equal(restored.getters['cart/cartCount'], 0)
  await restored.dispatch('cart/addToCart', first)
  await restored.dispatch('cart/clearCart')
  assert.deepEqual(JSON.parse(localStorage.getItem('vue-project-cart')), [])
})

test('a failed refresh can be retried even when earlier data is cached', async () => {
  for (const [module, action] of [
    ['products', 'fetchProducts'], ['recipes', 'fetchRecipes'], ['testimonials', 'fetchTestimonials'],
  ]) {
    respondWith({ before: { title: 'Lama', name: 'Lama', body: 'Lama' } })
    await store.dispatch(`${module}/${action}`)
    api.defaults.adapter = async () => { throw new Error('Koneksi terputus') }
    await assert.rejects(store.dispatch(`${module}/${action}`, { force: true }))
    assert.equal(store.state[module][module][0].id, 'before')
    respondWith({ after: { title: 'Baru', name: 'Baru', body: 'Baru' } })
    await store.dispatch(`${module}/${action}`)
    assert.equal(store.state[module][module][0].id, 'after')
    assert.equal(store.getters[`${module}/getError`], null)
  }
})

test('cart recovers from invalid saved data and preserves legacy numeric IDs', () => {
  localStorage.setItem('vue-project-cart', '{broken')
  assert.deepEqual(createTestStore().getters['cart/cartItems'], [])
  localStorage.setItem('vue-project-cart', JSON.stringify([
    null, { id: 'invalid', price: 2, quantity: -1 }, { id: 7, price: '4', quantity: 2 },
  ]))
  const restored = createTestStore()
  assert.equal(restored.getters['cart/isInCart'](7), true)
  assert.equal(restored.getters['cart/cartTotal'], 8)
  assert.equal(restored.getters['cart/cartItems'].length, 1)
})

test('the supplied Firebase files match the screenshot schema and render through the stores', async () => {
  const combined = JSON.parse(await readFile(new URL('../firebase/database.example.json', import.meta.url), 'utf8'))
  const recipeData = JSON.parse(await readFile(new URL('../firebase/recipes.json', import.meta.url), 'utf8'))
  const reviewData = JSON.parse(await readFile(new URL('../firebase/testimonials.json', import.meta.url), 'utf8'))
  assert.deepEqual(combined.recipes, recipeData)
  assert.deepEqual(combined.testimonials, reviewData)
  assert.equal(Object.keys(recipeData).length, 8)
  assert.equal(Object.keys(reviewData).length, 15)

  respondWith(combined.products)
  const [product] = await store.dispatch('products/fetchProducts')
  assert.equal(product.id, 'prod_01')
  assert.equal(product.title, 'Buku Pemrograman Vue.js')
  assert.equal(product.thumbnail, 'https://picsum.photos/200/200?random=1')
  assert.equal(product.price, 95000)
  assert.equal(product.stock, 15)
  assert.equal(formatPrice(product.price).replace(/\s/g, ''), 'Rp95.000')
  await store.dispatch('cart/addToCart', product)
  assert.equal(store.getters['cart/cartItems'][0].thumbnail, product.thumbnail)

  respondWith(recipeData)
  const loadedRecipes = await store.dispatch('recipes/fetchRecipes')
  for (const recipe of loadedRecipes) {
    assert.equal(recipe.image, recipeData[recipe.id].imageUrl)
    assert.ok(recipe.name && recipe.description && recipe.category && recipe.difficulty)
    assert.ok(recipe.time > 0 && recipe.servings > 0)
    assert.ok(recipe.ingredients.length > 0 && recipe.steps.length > 0)
    assert.equal(recipeData[recipe.id].id, recipe.id)
  }

  respondWith(reviewData)
  await store.dispatch('testimonials/fetchTestimonials')
  assert.equal(store.getters['testimonials/totalPages'], 2)
  await store.dispatch('testimonials/setPage', 2)
  assert.equal(store.getters['testimonials/paginatedTestimonials'].length, 3)
  for (const [id, review] of Object.entries(reviewData)) {
    assert.equal(review.id, id)
    assert.equal(review.isSample, true)
    assert.ok(review.body && review.user.fullName && review.user.username)
  }
})

test('cart respects available stock on add, quantity changes, and restoration', async () => {
  respondWith({ limited: { name: 'Buku', imageUrl: 'https://example.com/book.jpg', price: 95000, stock: '2' } })
  const [product] = await store.dispatch('products/fetchProducts')
  assert.equal(store.getters['cart/canAddToCart'](product), true)
  for (let i = 0; i < 3; i++) await store.dispatch('cart/addToCart', product)
  assert.equal(store.getters['cart/cartCount'], 2)
  assert.equal(store.getters['cart/canAddToCart'](product), false)
  await store.dispatch('cart/updateQuantity', { productId: 'limited', quantity: 3 })
  assert.equal(store.getters['cart/cartCount'], 2)
  const restored = createTestStore()
  await restored.dispatch('cart/updateQuantity', { productId: 'limited', quantity: 999 })
  assert.equal(restored.getters['cart/cartCount'], 2)
  await restored.dispatch('cart/updateQuantity', { productId: 'limited', quantity: 1 })
  assert.equal(restored.getters['cart/canAddToCart'](product), true)
  const soldOut = { ...product, id: 'empty', stock: 0 }
  assert.equal(store.getters['cart/canAddToCart'](soldOut), false)
  await store.dispatch('cart/addToCart', soldOut)
  assert.equal(store.getters['cart/isInCart']('empty'), false)
})
