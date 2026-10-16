<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { formatPrice } from '../utils/currency.js'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const store = useStore()
const canAdd = computed(() => store.getters['cart/canAddToCart'](props.product))

const addToCart = (product) => {
  store.dispatch('cart/addToCart', product)
}
</script>


<template>
  <article class="product-card">
    <div class="product-image">
      <img
        :src="product.thumbnail"
        :alt="product.title"
      />
    </div>

    <div class="product-info">
      <p class="category">
        {{ product.category }}
      </p>

      <h3>{{ product.title }}</h3>

      <div v-if="product.rating != null" class="rating">
        ⭐ {{ product.rating }}
      </div>

      <p v-if="product.stock != null" class="stock">
        {{ product.stock === 0 ? 'Stok habis' : `Stok: ${product.stock}` }}
      </p>

      <div class="product-bottom">
        <span class="price">
          {{ formatPrice(product.price) }}
        </span>
        
        <button
          class="add-button"
          type="button"
          :disabled="!canAdd"
          @click="addToCart(product)"
        >
          {{ product.stock === 0 ? 'Stok habis' : !canAdd ? 'Batas stok tercapai' : '+ Tambah ke Keranjang' }}
        </button>

      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.product-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 210px;
  padding: 16px;
  background: #f8fafc;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 16px;
}

.category {
  color: #64748b;
  font-size: 12px;
  text-transform: capitalize;
}

.product-info h3 {
  min-height: 44px;
  margin: 8px 0;
  font-size: 16px;
}

.rating {
  margin-bottom: 16px;
  font-size: 14px;
}

.stock {
  color: #64748b;
  font-size: 13px;
}

.product-bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price {
  font-size: 21px;
  font-weight: 700;
}

.add-button {
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 8px;
  background: var(--accent-color, #2563eb);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-button:hover {
  opacity: 0.85;
}

.add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
