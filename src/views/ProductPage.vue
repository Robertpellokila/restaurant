<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import ProductCard from '../components/ProductCard.vue'

const store = useStore()
const products = computed(() => store.getters['products/filteredProducts'])
const loading = computed(() => store.getters['products/isLoading'])
const error = computed(() => store.getters['products/getError'])
const searchQuery = computed({
  get: () => store.state.products.searchQuery,
  set: (value) => store.commit('products/SET_SEARCH_QUERY', value),
})

async function loadProducts() {
  try {
    await store.dispatch('products/fetchProducts')
  } catch {
    // The Vuex error is displayed below, including when a retry fails.
  }
}

onMounted(loadProducts)
</script>

<template>
  <main class="container">
    <header class="page-header">
      <p class="eyebrow">OUR COLLECTION</p>
      <h1>Product Catalog</h1>
      <p>Temukan produk favoritmu.</p>
    </header>

    <input
      v-model="searchQuery"
      class="product-search"
      type="search"
      placeholder="Cari produk..."
      aria-label="Cari produk"
    />

    <p v-if="loading" role="status">Memuat produk...</p>

    <div v-else-if="error" role="alert">
      <p>{{ error }}</p>
      <button type="button" @click="loadProducts">Coba lagi</button>
    </div>

    <section v-else-if="products.length" class="product-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </section>
    <p v-else>{{ searchQuery ? 'Produk tidak ditemukan.' : 'Produk belum tersedia.' }}</p>
  </main>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.page-header {
  margin-bottom: 32px;
}

.product-search {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font: inherit;
}

.eyebrow {
  color: var(--accent-color, #2563eb);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 8px 0;
  font-size: clamp(28px, 4vw, 42px);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(220px, 1fr)
  );
  gap: 24px;
}
</style>
