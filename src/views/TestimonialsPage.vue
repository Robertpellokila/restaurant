<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import TestimonialsCard from '@/components/TestimonialsCard.vue'

// 1. Mengakses Vuex Store
const store = useStore()

// 2. Mengambil daftar testimonial dari Vuex
const testimonials = computed(() => {
  return store.getters['testimonials/paginatedTestimonials']
})

// 3. Mengambil status loading
const loading = computed(() => {
  return store.getters['testimonials/isLoading']
})

// 4. Mengambil pesan error
const error = computed(() => {
  return store.getters['testimonials/getError']
})

// 5. Mengambil informasi pagination
const totalPages = computed(() => {
  return store.getters['testimonials/totalPages']
})

const currentPage = computed(() => {
  return store.state.testimonials.page
})

// 6. Memanggil API ketika halaman dibuka
async function loadTestimonials() {
  try {
    await store.dispatch('testimonials/fetchTestimonials')
  } catch {
    // The Vuex error is displayed in the page.
  }
}

function changePage(page) {
  store.dispatch('testimonials/setPage', page)
}

onMounted(loadTestimonials)
</script>


<template>
    <main class="testimonial-page">
        <div class="container">
            <header class="page-header">
                <span class="eyebrow">COMMUNITY REVIEWS</span>
                <h1>What Our Community Says</h1>
                <p>Temukan pengalaman dan cerita dari komunitas kami.</p>
            </header>

            <!-- Loading -->
            <div v-if="loading" class="status-message" role="status">Memuat testimoni...</div>

            <!-- Error -->
            <div v-else-if="error" class="status-message" role="alert">
                <p>{{ error }}</p>
                <button type="button" @click="loadTestimonials">Coba lagi</button>
            </div>

            <!-- Testimonial List -->
            <section v-else-if="testimonials.length" class="testimonial-grid">
                <TestimonialsCard
                    v-for="testimonial in testimonials"
                    :key="testimonial.id"
                    :testimonial="testimonial"
                />
            </section>

            <!-- Empty State -->
            <div v-else class="status-message">Belum ada testimoni.</div>

            <nav v-if="!loading && !error && totalPages > 1" class="pagination" aria-label="Halaman testimoni">
                <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                    Sebelumnya
                </button>
                <span aria-live="polite">Halaman {{ currentPage }} dari {{ totalPages }}</span>
                <button type="button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                    Selanjutnya
                </button>
            </nav>
        </div>
    </main>
</template>

<style scoped>
.testimonial-page {
    min-height: 100vh;
    padding: 60px 24px;
    background: var(--background-color, #f8fafc);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 40px;
    text-align: center;
}

.eyebrow {
    color: var(--accent-color, #2563eb);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
}

.page-header h1 {
    margin: 12px 0;
    font-size: clamp(28px, 4vw, 42px);
}

.page-header p {
    color: #64748b;
    line-height: 1.7;
}

.testimonial-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
    gap: 24px;
}

.status-message {
    padding: 60px 20px;
    color: #64748b;
    text-align: center;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 32px;
}

.pagination button {
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: default;
}
</style>
