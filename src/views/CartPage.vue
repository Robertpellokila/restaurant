
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { formatPrice } from '../utils/currency.js'

// Mengakses Vuex Store
const store = useStore()

// Mengambil data cart dari Vuex getters
const items = computed(() => {
  return store.getters['cart/cartItems']
})

const totalItems = computed(() => {
  return store.getters['cart/cartCount']
})

const totalPrice = computed(() => {
  return store.getters['cart/cartTotal']
})

// Tambah quantity
function increaseQuantity(productId) {
  const item = items.value.find(
    (item) => item.id === productId
  )

  if (!item) return

  store.dispatch('cart/updateQuantity', {
    productId,
    quantity: item.quantity + 1,
  })
}

// Kurangi quantity
function decreaseQuantity(productId) {
  const item = items.value.find(
    (item) => item.id === productId
  )

  if (!item) return

  store.dispatch('cart/updateQuantity', {
    productId,
    quantity: item.quantity - 1,
  })
}

// Hapus produk
function removeFromCart(productId) {
  store.dispatch('cart/removeFromCart', productId)
}

// Kosongkan keranjang
function clearCart() {
  store.dispatch('cart/clearCart')
}

</script>

<template>
  <main class="cart-container">
    <h1>Shopping Cart</h1>

    <!-- Empty Cart -->
    <p v-if="items.length === 0">
      Keranjang kamu masih kosong.
    </p>

    <!-- Cart Items -->
    <template v-else>
      <article
        v-for="item in items"
        :key="item.id"
        class="cart-item"
      >
        <img
          :src="item.thumbnail"
          :alt="item.title"
        />

        <div class="item-info">
          <h3>{{ item.title }}</h3>

          <p>
            {{ formatPrice(item.price) }} / item
          </p>

          <!-- Quantity -->
          <div class="quantity">
            <button
              type="button"
              @click="decreaseQuantity(item.id)"
            >
              −
            </button>

            <span>{{ item.quantity }}</span>

            <button
              type="button"
              :disabled="item.stock != null && item.quantity >= item.stock"
              @click="increaseQuantity(item.id)"
            >
              +
            </button>
          </div>
        </div>

        <!-- Item Total -->
        <div class="item-total">
          <strong>
            {{ formatPrice(item.price * item.quantity) }}
          </strong>

          <button
            type="button"
            class="remove-button"
            @click="removeFromCart(item.id)"
          >
            Hapus
          </button>
        </div>
      </article>

      <!-- Cart Summary -->
      <div class="cart-summary">
        <p>
          Total item:
          <strong>{{ totalItems }}</strong>
        </p>

        <h2>
          Total: {{ formatPrice(totalPrice) }}
        </h2>

        <button
          type="button"
          class="clear-button"
          @click="clearCart"
        >
          Kosongkan Keranjang
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.cart-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #e5e7eb;
}

.cart-item img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  background: #f8fafc;
  border-radius: 10px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 16px;
}

.item-info p {
  color: #64748b;
}

.quantity {
  display: flex;
  align-items: center;
  gap: 14px;
}

.quantity button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.quantity button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.remove-button {
  border: none;
  background: none;
  color: #dc2626;
  cursor: pointer;
}

.cart-summary {
  margin-top: 28px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.clear-button {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: white;
  cursor: pointer;
}

@media (max-width: 520px) {
  .cart-item {
    gap: 12px;
    align-items: flex-start;
  }

  .cart-item img {
    width: 70px;
    height: 70px;
  }

  .item-total {
    font-size: 13px;
  }
}
</style>
